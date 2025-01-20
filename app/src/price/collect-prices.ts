import moment from "moment";
import { bybitClient, clickhouseClient } from "~src/clients";
import * as constants from "~src/constants";
import { Tables } from "~src/types/Clickhouse";
import type { CollectPricesParam } from "~src/types/prices/CollectPrices";
import type {
  ComputedPriceRanges,
  ComputeMissedRangesParam,
  ComputePriceRangesParam,
} from "~src/types/prices/ComputePrices";
import type { FetchPricesParam } from "~src/types/prices/FetchPrices";
import type {
  StorePriceOpts,
  StorePriceParam,
} from "~src/types/prices/StorePrices";

// TODO: compute it in the function

// const MAX_HOURS_RANGE = 16;

export const computeMissedRanges = ({
  interval,
  from: startTime,
}: ComputeMissedRangesParam): ComputedPriceRanges => {
  const endTime = moment();

  if (!startTime) {
    // Without specified start time the function returns last available range
    return [
      {
        start: endTime
          .clone()
          .subtract(constants.EXCHANGE_MAX_LIST_LENGTH * interval, "minutes")
          .valueOf(),
        end: endTime.valueOf(),
      },
    ];
  }

  const missedRanges: ComputedPriceRanges = [];

  const isUpToDate = endTime.subtract(interval, "minutes").isBefore(startTime);

  if (isUpToDate) {
    // We are good for now, there are no missed ranges
    return missedRanges;
  }

  // Due to exchange API limitation request/sec
  // ranges collected as separate tuples
  let currentStartTime = startTime;

  // Collect ranges
  while (moment(currentStartTime).isBefore(endTime)) {
    const minutesToAdd = constants.EXCHANGE_MAX_LIST_LENGTH * interval;
    const currentEndTime = moment(currentStartTime)
      .clone()
      .add(minutesToAdd, "minutes")
      .valueOf();

    missedRanges.push({
      start: currentStartTime,
      end: currentEndTime,
    });

    // Increase start time
    currentStartTime = moment(currentStartTime)
      .add(minutesToAdd, "minutes")
      .valueOf();
  }

  return missedRanges;
};

/** Handles time ranges which has to be fulfilled in case there are some missed data */
const getMissedDataRanges = async ({
  interval,
  symbol,
}: ComputePriceRangesParam): Promise<ComputedPriceRanges> => {
  const res = await clickhouseClient.query({
    query: `SELECT toUnixTimestamp(max(td.timestamp)) AS last_timestamp
            FROM mr_token.token_prices td
            LEFT JOIN mr_token.token_pairs tp
            ON td.symbol = tp.symbol
            WHERE td.symbol = '${symbol}';`,
    format: "JSON",
  });

  const data = await res.json<Record<string, any>>();
  console.log("last known data from DB", data);
  const {
    data: [item],
  } = data;

  if (!item) {
    // There is no data stored for this pair
    return computeMissedRanges({ interval });
  }

  // TODO: don't forget to use client local time
  const lastUTC = moment.unix(item.last_timestamp).valueOf();

  return computeMissedRanges({ from: lastUTC, interval });
};

const fetchPrices = async (opts: FetchPricesParam) => {
  const bybitResponse = await bybitClient.getMarkPriceKline(opts);

  console.log("ByBit response", bybitResponse);

  return bybitResponse.result;
};

const storePrices = async (data: StorePriceParam, opts: StorePriceOpts) => {
  const preparedPrices = data.list.map(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([startTime, openPrice, highPrice, lowPrice, closePrice]) => ({
      symbol: data.symbol,
      close_price: parseFloat(closePrice),
      timestamp: moment(Number(startTime)).add(opts.interval, "minutes").unix(),
    })
  );
  console.log("preapared db datga:", preparedPrices.slice(0, 5));
  await clickhouseClient.insert({
    table: Tables.TokenPrices,
    values: preparedPrices,
    format: "JSONEachRow",
  });
};

/** Collects prices per specified interval during requested time diapason */
export const collectPrices = async ({
  symbol,
  interval = constants.BASE_INTERVAL,
  category = "linear",
}: CollectPricesParam) => {
  // Compute ranges and collect them separately
  // to overcome exchange's rate limit
  const rangesToFetch = await getMissedDataRanges({
    interval: parseInt(interval),
    symbol,
  });

  // Takes into account exchange request limitations
  for (const range of rangesToFetch) {
    const bybitResult = await fetchPrices({
      symbol,
      interval,
      category,
      ...range,
    });
    // TODO: make a pause between requests according to the rate limit
    await storePrices(bybitResult, {
      interval,
    });
  }
};
