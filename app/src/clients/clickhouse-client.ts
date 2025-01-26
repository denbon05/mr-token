import { createClient } from "@clickhouse/client";
import * as constants from "~src/constants";

export default createClient({
  clickhouse_settings: { max_partitions_per_insert_block: "200" },
  database: constants.CLICKHOUSE_DB_NAME,
  username: constants.CLICKHOUSE_USERNAME,
  password: constants.CLICKHOUSE_PASSWORD,
});
