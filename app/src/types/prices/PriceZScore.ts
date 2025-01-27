import type { StoredPriceData } from "./StoredPrices";

export type ComputeZScoreParam = {
  priceData: StoredPriceData[];
};

export type IsExtremeZScoreParam = {
  zScore: number;
  percentage?: number;
};

export enum ZScoreDeviation {
  BELOW = "below-threshold",
  ABOVE = "above-threshold",
  NORMAL = "normal",
}
