import moment from "moment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as constants from "~src/constants";
import { computeMissedRanges } from "~src/price/";
import type { ComputedPriceRanges } from "~src/types/prices/ComputePrices";

describe("Missed range computation", () => {
  const mockNow = moment("2024-10-01T00:00:00Z");
  /** Takes into account ByBit limitation for fetched items by one request
   * for 5M interval */

  beforeEach(() => {
    vi.useFakeTimers();
    vi.useFakeTimers().setSystemTime(mockNow.toDate());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should compute missed last price range without specified start time", async () => {
    const interval = 5; // minutes
    const ranges = computeMissedRanges({
      interval,
    });

    // just one range expected
    expect(ranges).toEqual([
      {
        start: mockNow
          .clone()
          .subtract(constants.EXCHANGE_MAX_LIST_LENGTH * interval, "minutes")
          .valueOf(),
        end: mockNow.clone().valueOf(),
      },
    ]);
  });

  it.each([
    // Expectations:
    // - We expect 3 ranges if we're fetching 200 items per request for 5-minute intervals
    // - Each range should cover 200 * 5 minutes = 1000 minutes or 16 hours 40 minutes
    // 3 ranges for 2 days of 5-minute data
    { interval: 5, missedDays: 2, length: 3 },
    // the same logic for the following
    { interval: 15, missedDays: 3, length: 2 },
  ])(
    "should calculate correct ranges for $missedDays missed days",
    async ({ interval, missedDays, length }) => {
      const twoDaysAgo = mockNow.clone().subtract(missedDays, "days");

      const ranges = computeMissedRanges({
        interval,
        from: twoDaysAgo.valueOf(),
      });

      const missedMinutes = constants.EXCHANGE_MAX_LIST_LENGTH * interval;
      expect(ranges).toHaveLength(length);

      const expectedRanges: ComputedPriceRanges = [];

      for (let i = 0; i < length; i += 1) {
        if (i === 0) {
          // start of the range
          expectedRanges.push({
            start: mockNow.clone().subtract(missedDays, "days").valueOf(),
            end: mockNow
              .clone()
              .subtract(missedDays, "days")
              .add(missedMinutes, "minutes")
              .valueOf(),
          });
          continue;
        }

        // for the rest just add needed minutes to the previous values
        const previousRange = expectedRanges[i - 1];
        expectedRanges.push({
          start: previousRange.end,
          end: moment(previousRange.end)
            .add(missedMinutes, "minutes")
            .valueOf(),
        });
      }

      expect(ranges).toEqual(expectedRanges);
    }
  );
});
