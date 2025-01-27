import type { FetchPricesParam } from "./FetchPrices";
import type { WatchZScoreParam } from "./WatchPrices";

export type FetchStoredPricesParam = WatchZScoreParam &
  Pick<FetchPricesParam, "symbol">;

// TODO: inferred types from fetched stored entities
export type StoredPriceData = {
  price: number;
  timestamp: number;
};
