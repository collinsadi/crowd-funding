/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import {
  crowdFundContract,
  crowdFundTokenABI,
  crowdFundTokenContract,
  crowdFundTokenContractAddress,
} from "@/utils/data";
import {
  covertToReadableDate,
  formatUnit,
  hasCampaignEnded,
} from "@/utils/helper";
import { TagOutlined } from "@ant-design/icons";
import {
  useAccount,
  useBlockNumber,
  useReadContract,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import pic from "@/public/assets/campaign/chains.jpeg";
import Image from "next/image";
import { Button } from "antd";
import toast from "react-hot-toast";
import { type FormEvent, useEffect, useState } from "react";
import Organisers from "./organisers";
import Goals from "./goals";
import { useQueryClient } from "@tanstack/react-query";
import DonateModel from "./donate-modal";

import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import ru from "javascript-time-ago/locale/ru";
import ReactTimeAgo from "react-time-ago";
import WordsOfSupport from "./words-of-support";

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

type Props = {
  slug: string;
};

const CampaignIdPageClient = ({ slug }: Props) => {
  // @ts-expect-error unknown error
  let notification, campaignUpdateNotification, withdrawNotification;
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
  const [campaignUpdateText, setCampaignUpdateText] = useState("");

  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data, queryKey } = useReadContracts({
    contracts: [
      {
        abi: crowdFundTokenABI,
        address: crowdFundTokenContractAddress,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...crowdFundContract,
        functionName: "campaigns",
        args: [slug],
      },
      {
        ...crowdFundContract,
        functionName: "getCampaignUpdate",
        args: [slug],
      },
    ],
  });
  const [balanceOf, campaigns, getCampaignUpdate] = data ?? [];
  console.log("getCampaignUpdate", getCampaignUpdate?.result);
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

  const {
    data: campaignUpdateHash,
    writeContract: writeCampaignUpdateContract,
    error: campaignUpdateError,
    isPending: isCampaignUpdatePending,
  } = useWriteContract();

  const {
    data: withdrawalHash,
    writeContract: writeWithdrawalContract,
    error: withdrawalError,
    isPending: isWithdrawalPending,
  } = useWriteContract();

  const handleMint = async () => {
    notification = toast.loading("Minting testnet USDC");
    writeMintContract({
      ...crowdFundTokenContract,
      functionName: "mint",
    });
    if (mintHash) {
      toast.dismiss(notification);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    campaignUpdateNotification = toast.loading("Updating...");
    writeCampaignUpdateContract({
      ...crowdFundContract,
      functionName: "createCampaignUpdate",
      args: [slug, campaignUpdateText],
    });
    if (campaignUpdateHash) {
      toast.dismiss(campaignUpdateNotification);
    }
  };

  const handleWithdrawal = async () => {
    withdrawNotification = toast.loading("Withdrawing Funds");
    writeWithdrawalContract({
      ...crowdFundContract,
      functionName: "claim",
      args: [slug],
    });
  };

  const { isLoading: isMintConfirming, isSuccess: isMintConfirmed } =
    useWaitForTransactionReceipt({
      hash: mintHash,
    });

  const {
    isLoading: isCampaignConfirming,
    isSuccess: isCampaignConfirmed,
    error: campaignUpdateContractError,
  } = useWaitForTransactionReceipt({
    hash: campaignUpdateHash,
  });

  const {
    isLoading: isWithdrawalConfirming,
    isSuccess: isWithdrawalConfirmed,
    error: withdrawalUpdateContractError,
  } = useWaitForTransactionReceipt({
    hash: withdrawalHash,
  });

  useEffect(() => {
    if (isMintConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.success("Campaign was created successfully");
    }

    if (isCampaignConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(campaignUpdateNotification);
      toast.success("Campaign update was created successfully");
    }

    if (isWithdrawalConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(withdrawNotification);
      toast.success("Withdrawal was successfully");
    }

    if (mintError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      console.log(mintError);
      toast.error("Something went wrong");
    }

    if (campaignUpdateError ?? campaignUpdateContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(campaignUpdateNotification);
      console.log(campaignUpdateError);
      console.log(campaignUpdateContractError);
      toast.error("Something went wrong");
    }

    if (withdrawalError ?? withdrawalUpdateContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(withdrawNotification);
      console.log(withdrawalError);
      console.log(withdrawalUpdateContractError);
      toast.error("Something went wrong with the withdrawal");
    }
  }, [
    campaignUpdateContractError,
    campaignUpdateError,
    campaignUpdateNotification,
    isCampaignConfirmed,
    isMintConfirmed,
    isWithdrawalConfirmed,
    mintError,
    notification,
    withdrawNotification,
    withdrawalError,
    withdrawalUpdateContractError,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  console.log("data", campaign);

  return campaign ? (
    <main className="bg-[#FCFCFC]">
      <div className="layout-container py-10">
        <h1 className="mb-6 text-xl font-bold capitalize md:text-2xl lg:text-3xl">
          {/* @ts-expect-error unknown error */}
          {campaign?.[0]}
        </h1>
        <div className="w-full items-start justify-between md:flex">
          <div className="w-full md:w-[62%]">
            <div className="relative mb-5 h-[50vh] w-full lg:h-[70vh]">
              <Image
                //  @ts-expect-error unknown error 
                src={campaign?.[11] ?? pic}
                alt="campaign"
                sizes="100%"
                fill
              />
            </div>
            <div className="flex items-center justify-between border-b border-[#D0D5DD] pb-4">
              <p className="text-base font-normal">
                Created{" "}
                {/* @ts-expect-error unknown error */}
                {covertToReadableDate(formatUnit(campaign?.[2]) * 10 ** 18)}
              </p>
              <div className="flex items-center justify-between">
                <TagOutlined className="mr-2" />
                <p className="text-base font-normal capitalize">
                  {/* @ts-expect-error unknown error */}
                  {campaign?.[4]}
                </p>
              </div>
            </div>
            <p className="whitespace-pre-wrap py-6 text-base font-normal">
              {/* @ts-expect-error unknown error */}
              {campaign?.[9]}
            </p>

            <div className="mb-4 block md:hidden">
              {/* @ts-expect-error unknown error */}
              <Goals campaignId={slug} {...{ campaign }} />
            </div>

            <div className="donate-btn-container flex w-full items-center justify-between border-b border-[#D0D5DD] pb-10">
              {/* @ts-expect-error unknown error */}
              {campaign?.[5]?.toLowerCase() === address?.toLowerCase() ? (
                <Button
                  className="!disabled:bg-gray-700 !h-[50px] w-[47%] !border-none !bg-[#FF6B00] text-base !text-white"
                  disabled={
                    //  @ts-expect-error unknown error 
                    (!hasCampaignEnded(campaign?.[3]) && !campaign?.[8]) ||
                    isWithdrawalConfirming ||
                    isWithdrawalPending
                  }
                  onClick={handleWithdrawal}
                  loading={isWithdrawalConfirming || isWithdrawalPending}
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
                Get USDC
              </Button>
            </div>
            {/* @ts-expect-error unknown error */}
            <Organisers fundraiser={campaign?.[5]} location={campaign?.[10]} />
            <>
              {/* @ts-expect-error unknown error */}

              {!hasCampaignEnded(campaign?.[3]) && !campaign?.[8] ? (
                <>
                  {/* @ts-expect-error unknown error */}

                  {campaign?.[5].toLowerCase() === address?.toLowerCase() ? (
                    <div className="mt-5 font-bold">
                      <h1>Share Updates about the campaign</h1>
                      <form onSubmit={handleSubmit} className="mt-5">
                        <textarea
                          name="campaignUpdate"
                          placeholder="Share Updates about the campaign"
                          required
                          className="mt-4 w-full"
                          onChange={(e) =>
                            setCampaignUpdateText(e.target.value)
                          }
                        />
                        <button
                          type="submit"
                          disabled={
                            isCampaignUpdatePending || isCampaignConfirming
                          }
                          className="mt-5 h-[50px] w-full border-none !bg-[#FF6B00] !text-base !text-white"
                        >
                          Submit
                        </button>
                      </form>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>

            {/* getCampaignUpdate?.result */}
            {/* @ts-expect-error unknown error */}
            {getCampaignUpdate?.result?.length > 0 ? (
              <div className="mt-5">
                <h1 className="mb-3 text-xl font-bold">
                  {/* @ts-expect-error unknown error */}
                  Updates ({getCampaignUpdate?.result?.length})
                </h1>
                <div className="space-y-5">
                  {/* @ts-expect-error unknown error */}
                  {getCampaignUpdate?.result?.map((item, index) => (
                    <div key={`campaign-updates-${index}`}>
                      <div className="mb-3 flex items-center gap-x-2">
                        <p className="font-bold">
                          {covertToReadableDate(
                            // @ts-expect-error unknown error 
                            formatUnit(item?.timestamp) * 10 ** 18,
                          ) ? (
                            <ReactTimeAgo
                              date={
                                // @ts-expect-error unknown error 
                                formatUnit(item?.timestamp) * 10 ** 18 * 1000
                              }
                            />
                          ) : null}{" "}
                        </p>
                        {/* @ts-expect-error unknown error  */}
                        <p>by {campaign?.[5]}</p>
                      </div>
                      <p className="whitespace-pre-wrap">{item?.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <WordsOfSupport campaignId={slug} />
          </div>
          <div className="donation-goals-con hidden md:block md:w-[35%]">
            {/* @ts-expect-error unknown error */}
            <Goals campaignId={slug} {...{ campaign }} />
          </div>
        </div>
      </div>

      <DonateModel
        showDonateModal={showDonateModal}
        onComplete={() => setShowDonateModal(!showDonateModal)}
        // @ts-expect-error unknown error 
        fundraiser={campaign?.[5]}
        campaignId={slug}
      />
    </main>
  ) : null;
};

export default CampaignIdPageClient;
