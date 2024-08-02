/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { crowdFundTokenABI, crowdFundTokenContractAddress } from "@/utils/data";
import { formatUnit } from "@/utils/helper";
import { type ICampaigns } from "@/utils/interface/contract.interface";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "antd";
import numeral from "numeral";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useAccount, useBlockNumber, useReadContract, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

type Props = {
    campaign: ICampaigns | undefined;
    campaignId: string | number;
}

const Goals = ({ campaign, campaignId }: Props) => {
    const queryClient = useQueryClient()
    // @ts-expect-error unknown error
    let notification;
    const { address } = useAccount();
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const { data: tokenBalance, queryKey } = useReadContract({
        abi: crowdFundTokenABI,
        address: crowdFundTokenContractAddress,
        functionName: "balanceOf",
        args: [address],
    });
    const {
        data: mintHash,
        writeContract: writeMintContract,
        error: mintContractError,
        isPending: isMintPending,
    } = useWriteContract();

    const { data, error, isPending } = useReadContracts({
        contracts: [{
            abi: crowdFundTokenABI,
            address: crowdFundTokenContractAddress,
            functionName: "allowance",
            args: [address, crowdFundTokenContractAddress]
        }]
    })
    const [allowance] = data || []
    console.log("allowance",allowance)
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

    const { isLoading: isMintConfirming, isSuccess: isMintConfirmed, error: mintError } =
        useWaitForTransactionReceipt({
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
        queryClient.invalidateQueries({ queryKey })
    }, [blockNumber, queryClient, queryKey])

    return campaign ? (
        <div className="donation-goals">
            <div className="hidden md:block">
                <div className="mb-4">
                    <p className="mb-2 text-[14px]">
                        <span className="text-xl font-semibold md:text-2xl">
                            {numeral(formatUnit(campaign?.[7]) * 10 ** 18)?.format(",")}
                        </span>{" "}
                        USDC raised of{" "}
                        {numeral(formatUnit(campaign?.[6]) * 10 ** 18)?.format(",")} USDC
                        goal
                    </p>
                    {/* <Progress percent={percent} showInfo={false} strokeColor="#51AA5D" /> */}
                    {/* <p className="text-[14px]">{donors.length} donations</p> */}
                    {/* @ts-expect-error unknown error */}
                    <p>Your USDC balance: {numeral(formatUnit(tokenBalance))?.format(",")}</p>
                </div>
                <div className="donate-btn-container border-b border-gray-500 pb-5">
                    {/* @ts-expect-error unknown error */}
                    {campaign?.[5]?.toLowerCase() === address?.toLowerCase() ? (
                        <Button
                            className="mb-4 h-[50px] w-full border-none !bg-[#FF6B00] !text-base !text-white !disabled:cursor-not-allowed !disabled:bg-gray-600"
                        //   disabled={!hasCampaignEnded(endAt) && campaign?.claimed}
                        //   onClick={handleWithdrawal}
                        >
                            Withdraw
                        </Button>
                    ) : (
                        <Button
                            className="mb-4 !h-[50px] w-full !border-none !bg-[#FF6B00] !text-base !text-white"
                        //   onClick={() => setShowDonateModal(true)}
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
                        Mint
                    </Button>
                </div>

                {/* <div className="h-[300px] space-y-4 overflow-y-auto pt-5">
          {donors?.map((item, index) => (
            <div key={`donors-${index}`}>
              <p className="">{item?.donorAddress}</p>
              <div className="flex items-center">
                <p className="font-bold">
                  {numeral(formatUnit(item?.amount)).format(",")} USDC
                </p>
                *
                <p className="">
                  {covertToReadableDate(
                    formatUnit(item?.timestamp) * 10 ** 18
                  ) ? (
                    <ReactTimeAgo
                      date={formatUnit(item?.timestamp) * 10 ** 18 * 1000}
                    />
                  ) : null}
                </p>
              </div>
            </div>
          ))}
        </div> */}
            </div>

            {/* <DonateModal
        showDonateModal={showDonateModal}
        onComplete={() => setShowDonateModal(!showDonateModal)}
        fundraiser={campaign.fundraiser}
        campaignId={campaignId}
        setDonors={setDonors}
        campaign={campaign}
        setPercent={setPercent}
      /> */}
        </div>
    ) : null;
}

export default Goals