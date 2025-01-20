CREATE TABLE IF NOT EXISTS token_pairs (
    symbol String,
    INDEX idx_symbol symbol TYPE bloom_filter(0.01) GRANULARITY 1
) ENGINE = MergeTree
ORDER BY
    symbol;

CREATE TABLE IF NOT EXISTS token_prices (
    timestamp DateTime COMMENT 'Epoch time in seconds UTX',
    symbol VARCHAR,
    close_price Float64,
    INDEX idx_symbol_timestamp (symbol, timestamp) TYPE minmax GRANULARITY 1
) ENGINE = MergeTree PARTITION BY toYYYYMMDD(timestamp)
ORDER BY
    (symbol, timestamp) TTL timestamp + INTERVAL 1 MONTH;