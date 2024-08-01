/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import CampaignCard from "@/components/common/campaign-card";
import {
  crowdFundABI,
  crowdFundContractAddress,
  generalRoutes,
} from "@/utils/data";
import { hasCampaignEnded } from "@/utils/helper";
import { Button, Carousel } from "antd";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";

const CrowdfundCampaigns = () => {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    abi: crowdFundABI,
    address: crowdFundContractAddress,
    functionName: "getCampaigns",
  });

  //   @ts-expect-error unknown error
  const reversedCampaign = data?.reverse();
  const activeCampaigns = reversedCampaign?.filter(
      //   @ts-expect-error unknown error
    (item) =>
      item?.fundraiser?.toLowerCase() !== address?.toLowerCase() &&
      !hasCampaignEnded(item?.endAt),
  );


  const carouselCount = useMemo(() => {
    if (window.innerWidth <= 600) {
      return 1;
    }
    if (window.innerWidth >= 600 && window.innerWidth < 992) {
      return 2;
    }
    if (window.innerWidth >= 992 && window.innerWidth < 1500) {
      return 3;
    }
    return 4;
  }, []);
  if (isLoading) <div className="layout-container">Loading...</div>;

  return activeCampaigns?.length > 3 ? (
    <section className="layout-container">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Support a campaign</h1>
        <Link href={generalRoutes.campaign}>
          <Button className="h-[40px] w-[100px] border-none bg-[#FF6B00] text-base text-white lg:mb-0 lg:mt-6">
            See More
          </Button>
        </Link>
      </div>

      <Carousel slidesToShow={carouselCount} autoplay dots={false}>
        {activeCampaigns
          ?.reverse()
            //   @ts-expect-error unknown error
          ?.map((item, index: number) => (
            <CampaignCard key={`campaigns-${index}`} campaign={item} />
          ))}
      </Carousel>
    </section>
  ) : null;
};

export default CrowdfundCampaigns;
