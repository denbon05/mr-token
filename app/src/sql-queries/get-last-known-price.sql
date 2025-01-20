SELECT td.timestamp,
        td.close_price
FROM mr_token.token_prices td
JOIN mr_token.token_pairs tp
ON td.pair = tp.pair
WHERE td.pair = 'BTCUSDT'
LIMIT 1;