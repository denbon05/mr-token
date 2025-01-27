import moment from "moment";
import { watchZScore as watchPriceZScore } from "./price";

/** Only interval in minutes is accepted */
export default async () => {
  await watchPriceZScore({
    startingPoint: moment().subtract(14, "days").valueOf(),
  });
};
