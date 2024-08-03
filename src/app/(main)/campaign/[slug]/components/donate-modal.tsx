/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import {
  crowdFundContract,
  crowdFundContractAddress,
  crowdFundTokenABI,
  crowdFundTokenContract,
  crowdFundTokenContractAddress,
} from "@/utils/data";
import { formatUnit, parseToEther } from "@/utils/helper";
import {
  type AddressType,
} from "@/utils/interface/contract.interface";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal } from "antd";
import numeral from "numeral";
import {  useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useAccount,
  useBlockNumber,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

type Props = {
  showDonateModal: boolean;
  onComplete: () => void;
  fundraiser: AddressType;
  campaignId: number;
};

const initialFormData = {
  donationAmount: null,
  donationTipAmount: null,
};

const DonateModel = ({
  showDonateModal,
  onComplete,
  fundraiser,
  campaignId,
}: Props) => {
  // @ts-expect-error unknown error
  let notification, donateNotification;
  const queryClient = useQueryClient();
  const [donationAmount, setDonationAmount] = useState<number | undefined>();
  const [donationTipAmount, setDonationTipAmount] = useState<number | undefined>();
  const { address } = useAccount();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { data, isPending, queryKey } = useReadContracts({
    contracts: [
      {
        ...crowdFundTokenContract,
        functionName: "allowance",
        args: [address, crowdFundContractAddress],
      },
      {
        ...crowdFundContract,
        functionName: "campaigns",
        args: [campaignId],
      }
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allowance,campaigns] = data ?? [];

  const handleApproval = () => {
    // @ts-expect-error unknown error
    if (formatUnit(allowance?.result) && donationAmount && donationTipAmount) {
      if (
           // @ts-expect-error unknown error
        formatUnit(allowance?.result) >=
        +donationAmount + +donationTipAmount
      ) {
        return true;
      } else {
        return false;
      }
    }
  };

  const [form] = Form.useForm();

  const {
    data: approveHash,
    writeContract: writeApproveContract,
    error: approveContractError,
    isPending: isApprovePending,
  } = useWriteContract();

  const {
    data: donateHash,
    writeContract: writeDonateContract,
    error: donateContractError,
    isPending: isDonatePending,
  } = useWriteContract();

  const handleApproveTransaction = async () => {
    const values = (await form.validateFields()) as {
      donationAmount: number;
      donationTipAmount: number;
    };
    const amount = +values.donationAmount + +values.donationTipAmount;
    notification = toast.loading(
      "Approving transaction.(Don't leave this page)",
    );

    writeApproveContract({
      address: crowdFundTokenContractAddress,
      abi: crowdFundTokenABI,
      functionName: "approve",
      args: [crowdFundContractAddress, parseToEther(amount)],
    });

    if (approveHash) {
      toast.dismiss(notification);
    }
  };

  const {
    isLoading: isApproveConfirming,
    isSuccess: isApproveConfirmed,
    error: approveError,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const handleDonate = () => {
    donateNotification = toast.loading("Donating.(Don't leave this page)");
    writeDonateContract({
      ...crowdFundContract,
      functionName: "fundCampaign",
      args: [
        campaignId,
        parseToEther(donationAmount!),
        parseToEther(donationTipAmount!),
      ],
    });

    if (donateHash) {
      toast.dismiss(donateNotification);
    }
  };

  const {
    isLoading: isDonateConfirming,
    isSuccess: isDonateConfirmed,
    error: donateError,
  } = useWaitForTransactionReceipt({
    hash: donateHash,
  });

  useEffect(() => {
    if (isApproveConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      toast.success("Approval was successful");
    }
    if (isDonateConfirmed) {
      // @ts-expect-error unknown error
      toast.dismiss(donateNotification);
      toast.success("Donation was successful");
    }

    if (approveContractError ?? approveError) {
      // @ts-expect-error unknown error
      toast.dismiss(notification);
      console.log("mintError", approveContractError);
      console.log("mintContractError", approveError);
      toast.error("Something went wrong");
    }

    if (donateError ?? donateContractError) {
      // @ts-expect-error unknown error
      toast.dismiss(donateNotification);
      toast.success("Donation was successful");
    }
  }, [
    approveContractError,
    approveError,
    donateContractError,
    donateError,
    donateNotification,
    isApproveConfirmed,
    isDonateConfirmed,
    notification,
  ]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, queryKey]);
  return (
    <Modal
      title={`Donation for ${fundraiser}`}
      open={showDonateModal}
      onCancel={onComplete}
      footer={null}
    >
      <Form autoComplete="on" form={form}>
        <h1>Enter your donation</h1>
        <div>
          <Form.Item
            initialValue={initialFormData.donationAmount}
            name="donationAmount"
            rules={[
              {
                required: true,
                message: "Donation amount is required",
              },
            ]}
          >
            <Input
              placeholder="amount"
              addonBefore={<h3>USDC</h3>}
              className="input"
              type="number"
              name="donationAmount"
              step="1"
              id="donationAmount"
              onChange={(e) => setDonationAmount(e.target.valueAsNumber)}
            />
          </Form.Item>
        </div>
        <h1>Tip amount</h1>
        <div>
          <Form.Item
            initialValue={initialFormData.donationTipAmount}
            name="donationTipAmount"
            rules={[
              {
                required: true,
                message: "Donation tip is required.",
              },
            ]}
          >
            <Input
              placeholder="amount"
              addonBefore={<h3>USDC</h3>}
              className="input"
              type="number"
              name="donationTipAmount"
              id="donationTipAmount"
              onChange={(e) => setDonationTipAmount(e.target.valueAsNumber)}
            />
          </Form.Item>
        </div>

        <div>
          <h1 className="mb-3 text-base font-bold">Your donation</h1>
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p>Your donation</p>
              <p>{numeral(donationAmount).format(",")} &nbsp;USDC</p>
            </div>
            <div className="mb-3 flex items-center justify-between">
              <p>Tip</p>
              <p>{numeral(donationTipAmount).format(",")} &nbsp;USDC</p>
            </div>
            <div className="flex items-center justify-between border-t border-[#D0D5DD] py-5">
              <p>Total due today</p>
              {donationAmount && donationTipAmount ? (
                <p>
                  {numeral(+donationAmount + +donationTipAmount).format(",")}{" "}
                  &nbsp;USDC
                </p>
              ) : null}
            </div>
          </div>
        </div>
        <>
          {isPending ? null : (
            <>
              {handleApproval() ? (
                <Button
                  onClick={handleDonate}
                  disabled={isDonateConfirming || isDonatePending}
                  loading={isDonateConfirming || isDonatePending}
                  className="mt-5 !h-[50px] w-full border-none !bg-[#FF6B00] !text-base !text-white"
                >
                  Donate
                </Button>
              ) : null}
            </>
          )}
        </>
      </Form>
      <>
        {isPending ? (
          <p className="text-center">Checking for Approval...</p>
        ) : (
          <>
            {!handleApproval() ? (
              <Button
                disabled={isApproveConfirming || isApprovePending}
                loading={isApproveConfirming || isApprovePending}
                onClick={handleApproveTransaction}
                className="!disabled:bg-gray-500 mt-5 h-[50px] w-full !border-none !bg-[#FF6B00] !text-base !text-white"
              >
                Approve
              </Button>
            ) : null}
          </>
        )}
      </>
    </Modal>
  );
};

export default DonateModel;
