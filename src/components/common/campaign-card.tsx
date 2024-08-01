/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { type ICampaigns } from "@/utils/interface/contract.interface";
import Link from "next/link";
import pic from "@/public/assets/campaign/chains.jpeg";
import Image from "next/image";
import { formatUnit } from "@/utils/helper";
import { useReadContract } from "wagmi";
import { crowdFundABI, crowdFundContractAddress } from "@/utils/data";
import numeral from "numeral";

type Props = {
  campaign: ICampaigns;
};

const CampaignCard = ({ campaign }: Props) => {
  const campaignId = formatUnit(campaign.campaignId) * 10 ** 18;
  const { data } = useReadContract({
    abi: crowdFundABI,
    address: crowdFundContractAddress,
    functionName: "getDonors",
    args: [campaignId],
  });
  return (
    <Link href={`/campaign/${campaignId}`} className="campaign-card text-black">
      <Image
        src={
          campaign?.campaignImageUrl.includes("undefined")
            ? pic
            : campaign?.campaignImageUrl
        }
        alt=""
        width={413}
        height={227}
        className="h-[227px] w-full object-cover md:h-[300px]"
      />
      <h1 className="mt-2 font-bold">{campaign?.title}</h1>
      <p className="mb-4 mt-2 line-clamp-3">{campaign?.description}</p>
      <p className="mb-10 text-base font-bold">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
        {numeral(formatUnit(campaign?.amountRaised)).format(",")} USDC raised -{" "}
        {/* @ts-expect-error unknown error */}
        {data?.length} donations
      </p>
    </Link>
  );
};

export default CampaignCard;
