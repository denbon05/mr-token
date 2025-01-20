import { RestClientV5 } from "bybit-api";
import * as constants from "~src/constants";

// ? ByBit API limitation is 200 items in the list per query
// ? 16H for 5M interval able to fetch 192 items

// const wsConfig: WSClientConfigurableOptions = {
//   market: "v5",
//   key: constants.BY_BIT_API_KEY,
//   secret: constants.BYBIT_SECRET_KEY,
// };

// const ws = new WebsocketClient(wsConfig);

export default new RestClientV5({
  key: constants.BY_BIT_API_KEY,
  secret: constants.BYBIT_SECRET_KEY,
});
