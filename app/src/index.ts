import { collectPrices } from "~src/price";

// TODO: get data as an input

const PAIR_SYMBOL = "BTCUSDT";

export default async () => {
  await collectPrices({
    symbol: PAIR_SYMBOL,
  });
};
