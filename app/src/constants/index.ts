import { config } from "dotenv";

config();

const { env } = process;

export const CLICKHOUSE_DB_NAME = env.CLICKHOUSE_DB_NAME;
export const CLICKHOUSE_HOST = env.CLICKHOUSE_HOST;
export const CLICKHOUSE_USERNAME = env.CLICKHOUSE_USERNAME!;
export const CLICKHOUSE_PASSWORD = env.CLICKHOUSE_PASSWORD!;

export const BY_BIT_API_KEY = env.BY_BIT_API_KEY;
export const BYBIT_SECRET_KEY = env.BYBIT_SECRET_KEY;

/** Min base interval to collect data */
export const BASE_INTERVAL = "5";
/** The max number of items which can be fetched by one request */
export const EXCHANGE_MAX_LIST_LENGTH = 200;