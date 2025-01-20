import type { CategorySymbolListV5, OHLCKlineV5 } from "bybit-api";
import type { ComputePriceRangesOpts } from "./ComputePrices";

export type StorePriceParam = CategorySymbolListV5<
  OHLCKlineV5[],
  "linear" | "inverse"
>;

export type StorePriceOpts = Pick<ComputePriceRangesOpts, "interval">;
