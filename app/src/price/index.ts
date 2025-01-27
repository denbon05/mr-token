import moment from "moment";
import * as constants from "~src/constants";
import type { WatchZScoreParam } from "~src/types/prices/WatchPrices";
import { collectPrices } from "./collect-prices";
import { fetchStoredPrices } from "./fetch-prices";
import { computeZScore, getZScoreDeviation } from "./z-score";
import * as utils from "~src/utils";
import { ZScoreDeviation } from "~src/types/prices/PriceZScore";

// TODO: get data as an input
// TODO: determine client interface

const PAIR_SYMBOL = "BTCUSDT";

export const watchZScore = async (param: WatchZScoreParam) => {
  await collectPrices({
    interval: constants.BASE_INTERVAL,
    symbol: PAIR_SYMBOL,
  });

  const priceData = await fetchStoredPrices({
    symbol: PAIR_SYMBOL,
    startingPoint: param.startingPoint,
  });

  const zScore = computeZScore({
    priceData,
  });

  const zScoreDeviation = getZScoreDeviation({
    zScore,
  });

  // TODO: notify client if there is a deviation of the last price
  if (zScoreDeviation !== ZScoreDeviation.NORMAL) {
    // eslint-disable-next-line no-console
    console.warn(`There is abnormal price z-score '${zScoreDeviation}'`);
  }

  const interval = parseInt(constants.BASE_INTERVAL);
  const timeoutMs = utils.getMSLeft(interval);

  setTimeout(async () => {
    // shift starting point
    const shiftedStartingPoint = moment(param.startingPoint)
      .add(constants.BASE_INTERVAL, "minutes")
      .valueOf();

    await watchZScore({
      startingPoint: shiftedStartingPoint,
    });
  }, timeoutMs);
};
