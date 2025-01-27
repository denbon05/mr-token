import moment from "moment";
import { clickhouseClient } from "~src/clients";
import type {
  FetchStoredPricesParam,
  StoredPriceData,
} from "~src/types/prices/StoredPrices";

export const fetchStoredPrices = async ({
  startingPoint,
  symbol,
}: FetchStoredPricesParam): Promise<StoredPriceData[]> => {
  const unixTimestamp = moment(startingPoint).unix();

  const result = await clickhouseClient.query({
    query: `SELECT close_price AS price,
            toUnixTimestamp(td.timestamp) AS timestamp
            FROM mr_token.token_prices td
            LEFT JOIN mr_token.token_pairs tp
            ON td.symbol = tp.symbol
            WHERE td.symbol = '${symbol}'
            AND timestamp > ${unixTimestamp};`,
    format: "JSONEachRow",
  });

  return result.json<StoredPriceData>();
};
