/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { crowdFundContract } from "@/utils/data";
import { covertToReadableDate, formatUnit } from "@/utils/helper";
import { UserOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactTimeAgo from "react-time-ago";
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type Props = {
  campaignId: string | number;
};

const WordsOfSupport = ({ campaignId }: Props) => {
    // @ts-expect-error unknown error
  let notification;
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const [supportWord, setSupportWord] = useState("");
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data, queryKey } = useReadContracts({
    contracts: [
      {
        ...crowdFundContract,
        functionName: "getWordsOfSupport",
        args: [campaignId],
      },
      {
        ...crowdFundContract,
        functionName: "getDonors",
        args: [campaignId],
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getWordsOfSupport, getDonors] = data ?? [];


    // @ts-expect-error unknown error
  const isDonor = getDonors?.result?.filter(
    // @ts-expect-error unknown error
    (item) => item?.donorAddress?.toLowerCase() === address?.toLowerCase(),
  );

    // @ts-expect-error unknown erro
  const reversedwordsOfSupport = getWordsOfSupport?.result?.reverse();

  const {
    data: wordsOfSupportHash,
    writeContract,
    error: wordsOfSupportContractError,
    isPending: wordsOfSupportPending,
  } = useWriteContract();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    notification = toast.loading("Submitting words of support");
    writeContract({
      ...crowdFundContract,
      functionName: "createWordOfSupport",
      args: [campaignId, supportWord],
    });

    if (wordsOfSupportHash) {
      toast.dismiss(notification);
    }
  };

  const {
    isLoading,
    isSuccess,
    error: wordsOfSupportError,
  } = useWaitForTransactionReceipt({
    hash: wordsOfSupportHash,
  });

  useEffect(() => {
    if (isSuccess) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.success("Post was successful");
    }

    if (wordsOfSupportError ?? wordsOfSupportContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.error("Something went wrong");
    }
  }, [
    isSuccess,
    notification,
    wordsOfSupportContractError,
    wordsOfSupportError,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);

  return (
    <div className="w-full border-b border-[#D0D5DD] py-10">
      <h1 className="mb-4 text-xl font-bold md:text-2xl">
        Words of support ({reversedwordsOfSupport?.length})
      </h1>

      <p>Please donate to share words of support.</p>
      {isDonor?.length > 0 ? (
        <form onSubmit={handleSubmit}>
          <textarea
            name="supportWord"
            placeholder="Share some words of encouragement"
            required
            className="mt-4 w-full"
            onChange={(e) => setSupportWord(e.target.value)}
          />
          <button
            type="submit"
            disabled={wordsOfSupportPending || isLoading}
            className="mt-5 h-[50px] w-full border-none bg-[#FF6B00] text-base text-white"
          >
            Submit
          </button>
        </form>
      ) : null}

      <div className="mt-5 space-y-5">
       {/* @ts-expect-error unknown error */}
        {reversedwordsOfSupport?.map((item, index) => (
          <div key={`words-of-support-${index}`} className="flex gap-x-5">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[50%] bg-[#E6F6EF]">
              <UserOutlined className="text-[25px] text-[#458E52]" />
            </div>
            <div className="w-full">
              <h3 className="mb-[6px] text-base font-bold">{item?.donor}</h3>
              <div>
                <div className="mb-[6px] flex w-[full] items-center justify-start text-[14px]">
                  <div className="mx-5 h-[5px] w-[5px] rounded-[50%] bg-[#D0D5DD]" />
                  <p className="">
                    {covertToReadableDate(
                        // @ts-expect-error unknown error
                      formatUnit(item?.timestamp) * 10 ** 18,
                    ) ? (
                      <ReactTimeAgo
                        // @ts-expect-error unknown error
                        date={formatUnit(item?.timestamp) * 10 ** 18 * 1000}
                      />
                    ) : null}
                  </p>
                </div>
                <p className="text-[14px]">{item?.supportWord}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WordsOfSupport;
