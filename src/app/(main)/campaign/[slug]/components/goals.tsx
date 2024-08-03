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
import {
  covertToReadableDate,
  formatUnit,
  hasCampaignEnded,
} from "@/utils/helper";
import { type ICampaigns } from "@/utils/interface/contract.interface";
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
  let notification, withdrawNotification;
  const [showDonateModal, setShowDonateModal] = useState<boolean>(false);
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

  const {
    data: withdrawalHash,
    writeContract: writeWithdrawalContract,
    error: withdrawalError,
    isPending: isWithdrawalPending,
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

  const handleWithdrawal = async () => {
    withdrawNotification = toast.loading("Withdrawing Funds");
    writeWithdrawalContract({
      ...crowdFundContract,
      functionName: "claim",
      args: [campaignId],
    });
  };

  const {
    isLoading: isMintConfirming,
    isSuccess: isMintConfirmed,
    error: mintError,
  } = useWaitForTransactionReceipt({
    hash: mintHash,
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
      toast.success("Minted testnet USDC");
    }

    if (isWithdrawalConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(withdrawNotification);
      toast.success("Withdrawal was successfully");

      if (withdrawalError ?? withdrawalUpdateContractError) {
        // @ts-expect-error unknown error
        toast.dismiss(withdrawNotification);
        console.log(withdrawalError);
        console.log(withdrawalUpdateContractError);
        toast.error("Something went wrong with the withdrawal");
      }
    }

    if (mintError ?? mintContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      console.log("mintError", mintError);
      console.log("mintContractError", mintContractError);
      toast.error("Something went wrong");
    }
  }, [isMintConfirmed, isWithdrawalConfirmed, mintContractError, mintError, notification, withdrawNotification, withdrawalError, withdrawalUpdateContractError]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  const percentValue = useMemo(() => {
    return Math.round(
      // @ts-expect-error unknown error 
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
              {/* @ts-expect-error unknown error  */}
              {numeral(formatUnit(campaign?.[7]))?.format(",")}
            </span>{" "}
            USDC raised of{" "}
            {/* @ts-expect-error unknown error  */}
            {numeral(formatUnit(campaign?.[6]) * 10 ** 18)?.format(",")} USDC
            goal
          </p>
          <Progress
            percent={percentValue}
            showInfo={false}
            strokeColor="#51AA5D"
          />
          {/* @ts-expect-error unknown error  */}
          <p className="text-[14px]">{getDonors?.result?.length} donations</p>
          <p>
            Your USDC balance:{" "}
            {/* @ts-expect-error unknown error */}
            {numeral(formatUnit(balanceOf?.result))?.format(",")}
          </p>
        </div>
        <div className="donate-btn-container border-b border-gray-500 pb-5">
          {/* @ts-expect-error unknown error */}
          {campaign?.[5]?.toLowerCase() === address?.toLowerCase() ? (
            <Button
              className="!disabled:cursor-not-allowed !disabled:bg-gray-600 mb-4 !h-[50px] w-full border-none !bg-[#FF6B00] !text-base !text-white"
              disabled={
                // @ts-expect-error unknown error
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
          {/* @ts-expect-error unknown error  */}
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
                    // @ts-expect-error unknown error  
                    formatUnit(item?.timestamp) * 10 ** 18,
                  ) ? (
                    <ReactTimeAgo
                      //  @ts-expect-error unknown error 
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
        // @ts-expect-error unknown error 
        fundraiser={campaign?.[5]}
        campaignId={campaignId}
      />
    </div>
  ) : null;
};

export default Goals;
