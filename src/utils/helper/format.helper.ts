import { utils, type BigNumber } from "ethers";

export const formatUnit = (value: BigNumber) =>
  parseFloat(utils.formatEther(value));

export const parseToEther = (value: number) =>
  utils.parseEther(value.toString());

export const covertToReadableDate = (value: number) => {
  if (!value) return;
  const _date = new Date(value * 1000).toDateString();
  return _date;
};

export const currentEpochTime = Math.floor(new Date().getTime() / 1000.0);

export const hasCampaignEnded = (endAt: BigNumber) =>{
  const _formattedValue =  formatUnit(endAt) * 10 ** 18
  return currentEpochTime > _formattedValue
}

