/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import CampaignCard from "@/components/common/campaign-card";
import {
  crowdFundABI,
  crowdFundContractAddress,
  generalRoutes,
} from "@/utils/data";
import { hasCampaignEnded } from "@/utils/helper";
import { Button, List, Tabs, type TabsProps } from "antd";
import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";

const CampaignPageClient = () => {
  const { address } = useAccount();

  const { data } = useReadContract({
    abi: crowdFundABI,
    address: crowdFundContractAddress,
    functionName: "getCampaigns",
  });
  //   @ts-expect-error unknown error
  const reversedCampaign = data?.reverse();

  const otherCampaigns = reversedCampaign?.filter(
    //   @ts-expect-error unknown error
    (item) =>
      item?.fundraiser?.toLowerCase() !== address?.toLowerCase() &&
      !hasCampaignEnded(item?.endAt),
  );

  const myActiveCampaigns = reversedCampaign?.filter(
    //   @ts-expect-error unknown error
    (item) =>
      item?.fundraiser.toLowerCase() === address?.toLowerCase() &&
      !hasCampaignEnded(item?.endAt),
  );

  const myEndedCampaign = reversedCampaign?.filter(
    //   @ts-expect-error unknown error
    (item) =>
      item?.fundraiser.toLowerCase() === address?.toLowerCase() &&
      hasCampaignEnded(item?.endAt),
  );

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "All Campaigns",
      children: (
        <List
          grid={{
            gutter: 20,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={otherCampaigns}
          renderItem={(item) => (
            <List.Item className="">
              {/* @ts-expect-error unknown error */}
              <CampaignCard campaign={item} />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "2",
      label: "My active Campaigns",
      children: (
        <List
          grid={{
            gutter: 20,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={myActiveCampaigns}
          renderItem={(item) => (
            <List.Item className="">
              {/* @ts-expect-error unknown error */}
              <CampaignCard campaign={item} />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: "3",
      label: "My  ended Campaigns",
      children: (
        <List
          grid={{
            gutter: 20,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3,
            xxl: 4,
          }}
          dataSource={myEndedCampaign}
          renderItem={(item) => (
            <List.Item className="">
              {/* @ts-expect-error unknown error */}
              <CampaignCard campaign={item} />
            </List.Item>
          )}
        />
      ),
    },
  ];

  return (
    <main className="bg-[#FCFCFC]">
      <div className="layout-container campaigns">
        <div className="flex w-full items-center justify-between py-10">
          <Link href={generalRoutes.createCampaign} className="ml-auto">
            <Button className="grid-cols mb-6 mt-6 !h-[50px] !w-[151px] !border-none !bg-[#FF6B00] !text-base !text-white lg:mb-0 lg:mt-6">
              Create campaign
            </Button>
          </Link>
        </div>

        <Tabs defaultActiveKey="1" items={items} />
      </div>
    </main>
  );
};

export default CampaignPageClient;
