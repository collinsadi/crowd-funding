/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  crowdFundABI,
  crowdFundContract,
  crowdFundContractAddress,
  crowdFundTokenABI,
  crowdFundTokenContractAddress,
} from "@/utils/data";
import { covertToReadableDate, hasCampaignEnded } from "@/utils/helper";
import { TagOutlined } from "@ant-design/icons";
import {
  useAccount,
  useBlockNumber,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import pic from "@/public/assets/campaign/chains.jpeg";
import Image from "next/image";
import { Button } from "antd";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import Organisers from "./organisers";
import Goals from "./goals";
import { useQueryClient } from "@tanstack/react-query";
import { IDonors } from "@/utils/interface/contract.interface";
import DonateModel from "./donate-modal";

type Props = {
  slug: string;
};

const CampaignIdPageClient = ({ slug }: Props) => {
  let notification;
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
  const [donors, setDonors] = useState<IDonors[]>([]);
  const [percent, setPercent] = useState<number>();
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { queryKey } = useReadContract({
    abi: crowdFundTokenABI,
    address: crowdFundTokenContractAddress,
    functionName: "balanceOf",
    args: [address],
  });
  const { data: campaign } = useReadContract({
    ...crowdFundContract,
    functionName: "campaigns",
    args: [slug],
  });

  const {
    data: mintHash,
    writeContract: writeMintContract,
    error: mintError,
    isPending: isMintPending,
  } = useWriteContract();

  const handleMint = async () => {
    notification = toast.loading("Minting testnet USDC");
    writeMintContract({
      address: crowdFundTokenContractAddress,
      abi: crowdFundTokenABI,
      functionName: "mint",
    });
    if (mintHash) {
      toast.dismiss(notification);
    }
  };

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  useEffect(() => {
    if (isMintConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.success("Campaign was created successfully");
    }

    if (mintError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      console.log(mintError);
      toast.error("Something went wrong");
    }
  }, [isMintConfirmed, mintError, notification]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  console.log("data", campaign);

  return campaign ? (
    <main className="bg-[#FCFCFC]">
      <div className="layout-container py-10">
        <h1 className="mb-6 text-xl font-bold capitalize md:text-2xl lg:text-3xl">
          {campaign?.[0]}
        </h1>
        <div className="w-full items-start justify-between md:flex">
          <div className="w-full md:w-[62%]">
            <div className="relative mb-5 h-[50vh] w-full lg:h-[70vh]">
              <Image
                src={campaign?.[11] ?? pic}
                alt="campaign"
                sizes="100%"
                fill
              />
            </div>
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-4">
              <p className="text-base font-normal">
                {/* Created {covertToReadableDate(campaign?.[2])} */}
              </p>
              <div className="flex items-center justify-between">
                <TagOutlined className="mr-2" />
                <p className="text-base font-normal capitalize">
                  {campaign?.[4]}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-wrap py-6 text-base font-normal">
              {campaign?.[9]}
            </p>

            <div className="mb-4 block md:hidden">
              <Goals campaignId={slug} {...{ campaign }} />
            </div>

            <div className="donate-btn-container flex w-full items-center justify-between border-b border-[#D0D5DD] pb-10">
              {campaign?.[5]?.toLowerCase() === address?.toLowerCase() ? (
                <Button
                  className="h-[50px] w-[47%] !border-none !bg-[#FF6B00] text-base !text-white"
                // disabled={!hasCampaignEnded(endAt) && campaign?.claimed}
                // onClick={handleWithdrawal as VoidFunction}
                >
                  Withdraw
                </Button>
              ) : (
                <Button
                  className="!h-[50px] !w-[47%] border-none !bg-[#FF6B00] !text-base !text-white"
                  onClick={() => setShowDonateModal(true)}
                >
                  Donate
                </Button>
              )}

              <Button
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                onClick={handleMint}
                disabled={isMintPending || isMintConfirming}
                className="mint-btn !h-[50px] !w-[47%] !border-2 !border-[#FF6B00] !bg-[#FCFCFC] !text-base !text-[black]"
              >
                Mint
              </Button>
            </div>
            <Organisers fundraiser={campaign?.[5]} location={campaign?.[10]} />
            {/* {campaign?.fundraiser.toLowerCase() === account?.toLowerCase() ? (
                <div className="mt-5 font-bold">
                  <h1>Share Updates about the campaign</h1>
                  {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}

            {/* {campaignUpdates.length > 0 ? (
                <div className="mt-5">
                  <h1 className="mb-3 text-xl font-bold">
                    Updates ({campaignUpdates.length})
                  </h1>
                  <div className="space-y-5">
                    {campaignUpdates?.map((item, index) => (
                      <div key={`campaign-updates-${index}`}>
                        <div className="mb-3 flex items-center gap-x-2">
                          <p className="font-bold">
                            {covertToReadableDate(
                              formatUnit(item?.timestamp) * 10 ** 18
                            ) ? (
                              <ReactTimeAgo
                                date={
                                  formatUnit(item?.timestamp) * 10 ** 18 * 1000
                                }
                              />
                            ) : null}{" "}
                          </p>
                          <p>by {campaign?.fundraiser}</p>
                        </div>
                        <p className="whitespace-pre-wrap">{item?.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <WordsOfSupport {...{ campaignId, campaign }} /> */}
          </div>
          <div className="donation-goals-con hidden md:block md:w-[35%]">
            <Goals campaignId={slug} {...{ campaign }} />
          </div>
        </div>
      </div>

      <DonateModel
        showDonateModal={showDonateModal}
        onComplete={() => setShowDonateModal(!showDonateModal)}
        fundraiser={campaign?.[5]}
        campaignId={slug}
        campaign={campaign}
        setDonors={setDonors}
        setPercent={setPercent}
      />
    </main>
  ) : null;
};

export default CampaignIdPageClient;
