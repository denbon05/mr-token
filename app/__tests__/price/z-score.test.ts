import { beforeEach, describe, expect, it } from "vitest";
import {
  computeZScore,
  computeZScoreThreshold,
  getZScoreDeviation,
} from "~src/price/z-score";
import { ZScoreDeviation } from "~src/types/prices/PriceZScore";
import * as helpers from "../helpers";

describe("Price z-score", () => {
  describe("Threshold computation", () => {
    it("should compute right z-score for threshold price in the upper price range", () => {
      const threshold = computeZScoreThreshold(0.9);

      expect(threshold).closeTo(1.28, 0.01);
    });

    it("should compute right z-score for threshold price in the lower price range", () => {
      const threshold = computeZScoreThreshold(0.1);

      expect(threshold).closeTo(-1.28, 0.01);
    });

    it("should compute right z-score for threshold price in the average price range", () => {
      const threshold = computeZScoreThreshold(0.5);

      expect(threshold).closeTo(0, 0.01);
    });
  });

  describe("Current deviation computation", () => {
    let priceData: ReturnType<typeof helpers.getFixture>;

    beforeEach(() => {
      // reset fixtures
      priceData = helpers.getFixture("price", "btc_price_data");
    });

    it("shouldn't find any abnormal deviation", () => {
      // for default fixtures dataset the deviation is low
      const belowDeviationNum = 0.8;
      const actual = computeZScore({
        priceData,
      });

      expect(actual).below(belowDeviationNum);
    });

    it("shouldn't find extreme deviation with big deviation at the beginning", () => {
      // extract the first price
      const [{ price: firstPrice }] = priceData;
      // increase first price for 10%
      priceData[0].price = firstPrice + firstPrice * 0.1;
      const belowDeviationNum = 0.5; // innocent deviation
      const actual = computeZScore({
        priceData,
      });

      expect(actual).below(belowDeviationNum);
    });

    it("shouldn't find extreme deviation with big deviation in the middle", () => {
      // extract the mid price
      const midIdx = Math.round(priceData.length / 2);
      const { price: midPrice } = priceData.at(midIdx);
      // increase price for 10%
      priceData[midIdx].price = midPrice + midPrice * 0.1;
      const belowDeviationNum = 0.5; // innocent deviation
      const actual = computeZScore({
        priceData,
      });

      expect(actual).below(belowDeviationNum);
    });

    it("should find extreme deviation", () => {
      // extract the latest price
      const { price: lastPrice } = priceData.at(-1);
      // increase last price for 5%
      priceData.at(-1).price = lastPrice + lastPrice * 0.05;
      const aboveDeviationNum = 2.5; // hight deviation
      const actual = computeZScore({
        priceData,
      });

      expect(actual).above(aboveDeviationNum);
    });
  });

  describe("z-score deviation direction", () => {
    it.each([
      // Normal deviations within threshold (percentage defines the threshold)
      { zScore: 0.5, percentage: 0.05, deviation: ZScoreDeviation.NORMAL },
      { zScore: 1.2, percentage: 0.1, deviation: ZScoreDeviation.NORMAL },
      { zScore: -0.8, percentage: 0.05, deviation: ZScoreDeviation.NORMAL },

      // Just above the threshold (should be ABOVE)
      { zScore: 2.1, percentage: 0.05, deviation: ZScoreDeviation.ABOVE },
      { zScore: 3.0, percentage: 0.1, deviation: ZScoreDeviation.ABOVE },
      { zScore: 1.96, percentage: 0.05, deviation: ZScoreDeviation.ABOVE }, // Exactly at the upper threshold

      // Just below the threshold (should be BELOW)
      { zScore: -2.1, percentage: 0.05, deviation: ZScoreDeviation.BELOW },
      { zScore: -3.0, percentage: 0.1, deviation: ZScoreDeviation.BELOW },
      { zScore: -1.96, percentage: 0.05, deviation: ZScoreDeviation.BELOW }, // Exactly at the lower threshold

      // Extreme values
      { zScore: 4.5, percentage: 0.01, deviation: ZScoreDeviation.ABOVE },
      { zScore: -4.5, percentage: 0.01, deviation: ZScoreDeviation.BELOW },

      // In a broader range (middle values should stay normal)
      { zScore: 0.0, percentage: 0.2, deviation: ZScoreDeviation.NORMAL },
      { zScore: 0.8, percentage: 0.2, deviation: ZScoreDeviation.NORMAL },

      // Testing z-scores just outside the normal threshold range for higher percentages
      { zScore: 2.5, percentage: 0.3, deviation: ZScoreDeviation.ABOVE },
      { zScore: -2.5, percentage: 0.3, deviation: ZScoreDeviation.BELOW },
    ])(
      "should identify deviation $deviation for z-score '$zScore' and percentage '$percentage'",
      ({ percentage, zScore, deviation }) => {
        expect(getZScoreDeviation({ percentage, zScore })).toBe(deviation);
      }
    );
  });
});
