#!/usr/bin/env bun

import { migration } from "clickhouse-migrations";
import path from "path";

import * as constants from "~src/constants";

const migrationHomeDir = path.join(__dirname, "..", "migrations");

// Migrate db programmatically
migration(
  migrationHomeDir,
  constants.CLICKHOUSE_HOST,
  constants.CLICKHOUSE_USERNAME,
  constants.CLICKHOUSE_PASSWORD,
  constants.CLICKHOUSE_DB_NAME
);
