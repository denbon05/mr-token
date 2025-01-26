import { collectPrices } from "~src/price";

// TODO: get data as an input

const PAIR_SYMBOL = "BTCUSDT";

/** Only interval in minutes is accepted */
export default async () => {
  await collectPrices({
    symbol: PAIR_SYMBOL,
  });
};
