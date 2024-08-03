/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { utils, type BigNumber } from "ethers";

export const formatUnit = (value: BigNumber) => {
  if (!value) return
  return parseFloat(utils.formatEther(value));
}

export const parseToEther = (value: number) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  utils.parseEther(value.toString());

export const covertToReadableDate = (value: number) => {
  if (!value) return;
  const _date = new Date(value * 1000).toDateString();
  return _date;
};

export const currentEpochTime = Math.floor(new Date().getTime() / 1000.0);

export const hasCampaignEnded = (endAt: BigNumber) => {
  if (!endAt) return ;
  const _formattedValue = formatUnit(endAt);
  if (_formattedValue === undefined) return ;
  return currentEpochTime > _formattedValue * 10 ** 18;
}
