import type { GetMarkPriceKlineParamsV5 } from "bybit-api";

export type FetchPricesParam = GetMarkPriceKlineParamsV5;

export type FetchPricesRange = Pick<FetchPricesParam, "start" | "end">;
