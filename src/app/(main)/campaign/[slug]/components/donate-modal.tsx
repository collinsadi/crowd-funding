/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  crowdFundContractAddress,
  crowdFundTokenABI,
  crowdFundTokenContractAddress,
} from "@/utils/data";
import { parseToEther } from "@/utils/helper";
import {
  type AddressType,
  type ICampaigns,
  type IDonors,
} from "@/utils/interface/contract.interface";
import { Button, Form, Input, Modal } from "antd";
import numeral from "numeral";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

type Props = {
  showDonateModal: boolean;
  onComplete: () => void;
  fundraiser: AddressType;
  campaignId: number;
  setDonors: Dispatch<SetStateAction<IDonors[]>>;
  setPercent: Dispatch<SetStateAction<number | undefined>>;
  campaign: ICampaigns | undefined;
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
  setDonors,
  campaign,
  setPercent,
}: Props) => {
  // @ts-expect-error unknown error
  let notification;
  const [isCheckingAllowance, setIsCheckingAllowance] = useState(false);
  const [allowanceBalance, setAllowanceBalance] = useState<number>();
  const [isDonating, setIsDonating] = useState(false);

  const [form] = Form.useForm();

  const {
    data: approveHash,
    writeContract: writeApproveContract,
    error: approveContractError,
    isPending: isApprovePending,
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

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed, error: approveError } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

    useEffect(() => {
      if (isApproveConfirmed) {
          // @ts-expect-error unknown error
          toast.dismiss(notification);
          toast.success("Token approval was a success");
      }

      if (approveContractError ?? approveError) {
          // @ts-expect-error unknown error
          toast.dismiss(notification);
          console.log("mintError", approveContractError);
          console.log("mintContractError", approveError);
          toast.error("Something went wrong");
      }
  }, [approveContractError, approveError, isApproveConfirmed, notification]);
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
          {isCheckingAllowance ? null : (
            <>
              {handleApproval() ? (
                <Button
                  onClick={handleDonate}
                  loading={isDonating}
                  disabled={isDonating}
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
      {isCheckingAllowance ? (
        <p className="text-center">Checking for Approval...</p>
      ) : (
        <>
          {!handleApproval() ? (
            <Button
              disabled={isApproveConfirming || isApprovePending}
              loading={isApproveConfirming || isApprovePending}
              onClick={handleApproveTransaction}
              className="mt-5 h-[50px] w-full !border-none !bg-[#FF6B00] !text-base !text-white !disabled:bg-gray-500"
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
