/* eslint-disable prefer-spread */
import { RestClientV5 } from "bybit-api";
import PQueue from "p-queue";
import * as constants from "~src/constants";

// const wsConfig: WSClientConfigurableOptions = {
//   market: "v5",
//   key: constants.BY_BIT_API_KEY,
//   secret: constants.BYBIT_SECRET_KEY,
// };

// const ws = new WebsocketClient(wsConfig);

// class RateLimitedClient {
//   private static instance: RateLimitedClient;
//   private client: RestClientV5;
//   private queue: PQueue;

//   private constructor() {
//     this.client = new RestClientV5({
//       key: constants.BY_BIT_API_KEY,
//       secret: constants.BYBIT_SECRET_KEY,
//     });

//     this.queue = new PQueue({});
//   }

//   public static getInstance = (): RateLimitedClient => {
//     if (!RateLimitedClient.instance) {
//       this.instance = new RateLimitedClient();
//     }
//     return this.instance;
//   };

//   // public getMarkPriceKline = asy
// }

// export default RateLimitedClient.getInstance();

const queue = new PQueue({
  concurrency: constants.BYBIT_MAX_HTTP_REQ_PER_SECOND,
  // make a pause between requests according to the rate limit
  interval: 1_000 / constants.BYBIT_MAX_HTTP_REQ_PER_SECOND,
});

const client = new RestClientV5({
  key: constants.BY_BIT_API_KEY,
  secret: constants.BYBIT_SECRET_KEY,
});

/** ByBit API limitation is 200 items in the list per query, o overcome
 * this p-queue is used and original client is wrapped in a proxy
 */
const rateLimitedClient = new Proxy(client, {
  get: function (target, prop, receiver) {
    if (typeof target[prop as keyof RestClientV5] === "function") {
      return async function (...args: unknown[]) {
        // Here, we're wrapping the original method call in queue.add
        // @ts-expect-error
        return queue.add(async () => target[prop].apply(target, args));
      };
    } else {
      // If the property isn't a function, just return it
      return Reflect.get(target, prop, receiver);
    }
  },
});

export default rateLimitedClient;
