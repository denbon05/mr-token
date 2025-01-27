import type { FetchPricesParam } from "./FetchPrices";

export type CollectPricesParam = Required<
  Pick<FetchPricesParam, "symbol" | "interval">
> &
  Partial<Pick<FetchPricesParam, "category">>;
