/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  crowdFundContract,
  crowdFundTokenABI,
  crowdFundTokenContract,
  crowdFundTokenContractAddress,
} from "@/utils/data";
import { covertToReadableDate, formatUnit } from "@/utils/helper";
import { IDonors, type ICampaigns } from "@/utils/interface/contract.interface";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Progress } from "antd";
import numeral from "numeral";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import DonateModel from "./donate-modal";
import ReactTimeAgo from "react-time-ago";

type Props = {
  campaign: ICampaigns | undefined;
  campaignId: string | number;
};

const Goals = ({ campaign, campaignId }: Props) => {
  // @ts-expect-error unknown error
  let notification;
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
  const [donors, setDonors] = useState<IDonors[]>([]);
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  // const { data: tokenBalance, queryKey } = useReadContract({
  //     abi: crowdFundTokenABI,
  //     address: crowdFundTokenContractAddress,
  //     functionName: "balanceOf",
  //     args: [address],
  // });

  const { data, queryKey } = useReadContracts({
    contracts: [
      {
        ...crowdFundTokenContract,
        functionName: "balanceOf",
        args: [address],
      },
      {
        ...crowdFundContract,
        functionName: "getDonors",
        args: [campaignId],
      },
    ],
  });
  const [balanceOf, getDonors] = data ?? [];
  const {
    data: mintHash,
    writeContract: writeMintContract,
    error: mintContractError,
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

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
    error: mintError,
  } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  useEffect(() => {
    if (isMintConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.success("Minted testnet USDC");
    }

    if (mintError ?? mintContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      console.log("mintError", mintError);
      console.log("mintContractError", mintContractError);
      toast.error("Something went wrong");
    }
  }, [isMintConfirmed, mintContractError, mintError, notification]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  const percentValue = useMemo(() => {
    return Math.round(
      (formatUnit(campaign?.[7]) / (formatUnit(campaign?.[6]) * 10 ** 18)) *
        100,
    );
  }, [campaign]);

  return campaign ? (
    <div className="donation-goals">
      <div className="hidden md:block">
        <div className="mb-4">
          <p className="mb-2 text-[14px]">
            <span className="text-xl font-semibold md:text-2xl">
              {numeral(formatUnit(campaign?.[7]))?.format(",")}
            </span>{" "}
            USDC raised of{" "}
            {numeral(formatUnit(campaign?.[6]) * 10 ** 18)?.format(",")} USDC
            goal
          </p>
          <Progress
            percent={percentValue}
            showInfo={false}
            strokeColor="#51AA5D"
          />
          <p className="text-[14px]">{getDonors?.result?.length} donations</p>
          {/* @ts-expect-error unknown error */}
          <p>
            Your USDC balance:{" "}
            {numeral(formatUnit(balanceOf?.result))?.format(",")}
          </p>
        </div>
        <div className="donate-btn-container border-b border-gray-500 pb-5">
          {/* @ts-expect-error unknown error */}
          {campaign?.[5]?.toLowerCase() === address?.toLowerCase() ? (
            <Button
              className="!disabled:cursor-not-allowed !disabled:bg-gray-600 mb-4 h-[50px] w-full border-none !bg-[#FF6B00] !text-base !text-white"
              //   disabled={!hasCampaignEnded(endAt) && campaign?.claimed}
              //   onClick={handleWithdrawal}
            >
              Withdraw
            </Button>
          ) : (
            <Button
              className="mb-4 !h-[50px] w-full !border-none !bg-[#FF6B00] !text-base !text-white"
              onClick={() => setShowDonateModal(true)}
            >
              Donate
            </Button>
          )}

          <Button
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            disabled={isMintPending || isMintConfirming}
            onClick={handleMint}
            className="mint-btn !h-[50px] w-full !border-2 !border-[#FF6B00] !text-base !text-[black]"
          >
            Get USDC
          </Button>
        </div>

        <div className="h-[300px] space-y-4 overflow-y-auto pt-5">
          {getDonors?.result?.map((item, index) => (
            <div key={`donors-${index}`}>
              <p className="">{item?.donorAddress}</p>
              <div className="flex items-center">
                <p className="font-bold">
                  {numeral(formatUnit(item?.amount)).format(",")} USDC
                </p>
                *
                <p className="">
                  {covertToReadableDate(
                    formatUnit(item?.timestamp) * 10 ** 18,
                  ) ? (
                    <ReactTimeAgo
                      date={formatUnit(item?.timestamp) * 10 ** 18 * 1000}
                    />
                  ) : null}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DonateModel
        showDonateModal={showDonateModal}
        onComplete={() => setShowDonateModal(!showDonateModal)}
        fundraiser={campaign?.[5]}
        campaignId={campaignId}
      />
    </div>
  ) : null;
};

export default Goals;
