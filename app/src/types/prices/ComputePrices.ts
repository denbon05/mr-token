import type { CollectPricesParam } from "./CollectPrices";
import type { FetchPricesRange } from "./FetchPrices";

export type ComputedPriceRanges = FetchPricesRange[];

export type ComputePriceRangesParam = Required<
  Pick<CollectPricesParam, "symbol"> & {
    interval: number;
  }
>;

export type ComputeMissedRangesParam = Omit<
  ComputePriceRangesParam,
  "symbol"
> & {
  from?: number;
};
