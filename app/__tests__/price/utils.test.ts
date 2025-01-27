import moment from "moment";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as constants from "~src/constants";
import { computeMissedRanges } from "~src/price/collect-prices";
import type { ComputedPriceRanges } from "~src/types/prices/ComputePrices";

describe.todo("Time utils", () => {
  describe("Get milliseconds left", () => {
    //
  });
});

describe("Missed range computation", () => {
  const mockNow = moment("2024-01-10T01:00:00Z");
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
          .subtract(constants.BYBIT_MAX_LIST_LENGTH * interval, "minutes")
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
    { interval: 5, missedDays: 2, rangesNum: 3 },
    // the same logic for the following
    { interval: 15, missedDays: 3, rangesNum: 2 },
  ])(
    "should calculate correct ranges for $missedDays missed days",
    async ({ interval, missedDays, rangesNum }) => {
      // specify the start point from which ranges should be computed
      const from = mockNow.clone().subtract(missedDays, "days").valueOf();

      const ranges = computeMissedRanges({
        interval,
        from,
      });

      expect(ranges).toHaveLength(rangesNum);

      const missedMinutes = constants.BYBIT_MAX_LIST_LENGTH * interval;
      const expectedRanges: ComputedPriceRanges = [];

      for (let i = 0; i < rangesNum; i += 1) {
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

        // for the rest just add missed minutes to the previous values
        const previousRange = expectedRanges[i - 1];
        let rangeEnd = moment(previousRange.end).add(missedMinutes, "minutes");

        if (rangeEnd.isAfter(mockNow)) {
          // range can't go beyond now
          rangeEnd = mockNow.clone().subtract(interval, "minutes");
        }

        expectedRanges.push({
          start: previousRange.end,
          end: rangeEnd.valueOf(),
        });
      }

      expect(ranges).toEqual(expectedRanges);
    }
  );
});
