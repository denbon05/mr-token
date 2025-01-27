import gaussian from "gaussian";
import {
  ZScoreDeviation,
  type ComputeZScoreParam,
  type IsExtremeZScoreParam,
} from "~src/types/prices/PriceZScore";
import debug from "debug";

const log = debug("mr-token:price:z-score");

/** Function to compute the z-score threshold for a given percentage
 *
 * Example:
 *
 * ```
 * console.log(computeZScoreThreshold(0.9)); // 1.28155
 * console.log(computeZScoreThreshold(0.1)); // -1.28155
 * ```
 */
export const computeZScoreThreshold = (probability: number): number => {
  if (probability <= 0 || probability >= 1) {
    throw new Error("Probability must be between 0 and 1 (exclusive).");
  }

  // Mean = 0, Standard Deviation = 1
  const normalDistribution = gaussian(0, 1);

  return normalDistribution.ppf(probability);
};

export const computeZScore = ({ priceData }: ComputeZScoreParam) => {
  const currentPrice = priceData.at(-1)!.price;

  // Compute mean
  const mean =
    priceData.reduce((sum, point) => sum + point.price, 0) / priceData.length;

  // Compute standard deviation
  const variance =
    priceData.reduce((sum, point) => sum + Math.pow(point.price - mean, 2), 0) /
    priceData.length;
  const stdDev = Math.sqrt(variance);

  // Compute z-score for the current price
  const zScore = (currentPrice - mean) / stdDev;

  return zScore;
};

export const getZScoreDeviation = ({
  zScore,
  percentage = 0.1,
}: IsExtremeZScoreParam): ZScoreDeviation => {
  const aboveThreshold = computeZScoreThreshold(1 - percentage);
  const belowThreshold = computeZScoreThreshold(percentage);

  log("z-score deviation %O", {
    aboveThreshold,
    belowThreshold,
    zScore,
    percentage,
  });

  if (zScore > aboveThreshold) {
    return ZScoreDeviation.ABOVE;
  }

  if (zScore < belowThreshold) {
    return ZScoreDeviation.BELOW;
  }

  return ZScoreDeviation.NORMAL;
};
