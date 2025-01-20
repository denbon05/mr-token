import type { FetchPricesParam } from "./FetchPrices";

export type CollectPricesParam = Required<Pick<FetchPricesParam, "symbol">> &
  Partial<Pick<FetchPricesParam, "category" | "interval">>;
