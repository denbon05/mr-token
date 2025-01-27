import moment from "moment";

export const getMSLeft = (interval: number) => {
  const nowMs = moment().valueOf();
  const intervalMs = interval * 60 * 1000;
  const remainder = nowMs % intervalMs;

  return remainder === 0 ? 0 : intervalMs - remainder;
};
