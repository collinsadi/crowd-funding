/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */


"use client";

import {
    crowdFundABI,
    crowdFundContractAddress,
    generalRoutes,
} from "@/utils/data";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import back from "@/public/assets/campaign/back.svg";
import Dropdown, { OptionsInterface } from "@/components/common/select";
import { Button, DatePicker, Form } from "antd";
import TextInput from "@/components/common/text-input";
import TextArea from "@/components/common/text-area";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import UploadForm from "@/components/common/upload-form";
import toast from "react-hot-toast";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { useRouter } from "next/navigation";

interface IInitialFormData {
    title: string;
    goal: number;
    description: string;
    location: string;
    category: null | string;
    endAt: number;
    campaignImageUrl: string;
}

export const categoryOption: OptionsInterface[] = [
    { name: "Medical", value: "medical", id: 1 },
    { name: "Emergency", value: "emergency", id: 2 },
    { name: "Education", value: "education", id: 3 },
    { name: "Nonprofit", value: "nonprofit", id: 4 },
    { name: "Crisis Relief", value: "crisis relief", id: 5 },
];

const CampaignForm = () => {
    const router = useRouter()
    const [form] = Form.useForm();
    const [uploadUrl, setUploadUrl] = useState<string>("");
    const { data: hash, writeContract, error, isPending } = useWriteContract();
    // @ts-expect-error unknown error
    let notification;
    const initialFormData: IInitialFormData = {
        title: "",
        goal: 0,
        description: "",
        location: "",
        category: null,
        endAt: 0,
        // campaignImageUrl: uploadUrl,
        campaignImageUrl: "https://ipfs.filebase.io/ipfs/QmV5MZGiVZ9WsjsRpT96dWrywVv2K8gt2zGnQyoSfx6rNy",
    };

    const handleCreateCampaign = async () => {
        const {
            campaignImageUrl,
            category,
            description,
            endAt,
            goal,
            location,
            title,
        } = (await form.validateFields()) as IInitialFormData;
        notification = toast.loading(
            "Creating Campaign.(Don't leave this page)",
        );
        writeContract({
            address: crowdFundContractAddress,
            abi: crowdFundABI,
            functionName: "createCampaign",
            args: [
                category,
                BigInt(goal),
                description,
                title,
                // @ts-expect-error endAt type from antdesign datepicker
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                Math.round(endAt.$d.getTime() / 1000),
                location,
                campaignImageUrl,
            ],
        });
        if(hash){
            toast.dismiss(notification)
        }
    };

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    useEffect(() => {
        if (isConfirmed) {
            toast.success("Campaign was created successfully", {
                // @ts-expect-error unknown error
                id: notification,
            });
            router.push("/campaign");
        }

        if (error) {
            console.log(error);
            toast.error("Something went wrong", {
                // @ts-expect-error unknown error
                id: notification,
            });
        }
    }, [error, isConfirmed, notification, router]);
    return (
        <main className="bg-[#F5F5F5]">
            <div className="layout-container flex justify-center py-[40px] md:py-[50px] lg:py-[76px]">
                <div className="w-full md:w-[80%] lg:w-[60%]">
                    <Link href={generalRoutes.campaign} className="">
                        <Image src={back as StaticImageData} alt="back" />
                    </Link>

                    <div
                        className="mt-[48px] bg-white p-5 md:px-[32px] md:py-[40px]"
                        style={{ border: "1px solid #D0D5DD", borderRadius: "8px" }}
                    >
                        <h1 className="text-2xl font-bold text-[#1F1F1F] md:mb-3 md:text-[32px] md:leading-[36px]">
                            Create campaign
                        </h1>
                        <p className="mb-3 text-base font-normal text-[#727581]">
                            Give details of what you want
                        </p>
                        <Form autoComplete="on" form={form}>
                            <Form.Item
                                initialValue={initialFormData.title}
                                name="title"
                                rules={[
                                    {
                                        required: true,
                                        message: "Title is required.",
                                    },
                                ]}
                            >
                                <TextInput
                                    label="Campaign Title"
                                    placeholder="Enter campaign title"
                                    id="title"
                                    name="title"
                                    type="string"
                                />
                            </Form.Item>
                            <Form.Item
                                initialValue={initialFormData.goal}
                                name="goal"
                                rules={[
                                    {
                                        required: true,
                                        message: "Amount is required.",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (value !== 0 || getFieldValue("goal") !== 0) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Amount is required."));
                                        },
                                    }),
                                ]}
                            >
                                <TextInput
                                    label="How much would you like to raise?"
                                    placeholder="USDC 0"
                                    id="goal"
                                    name="goal"
                                    type="number"
                                />
                            </Form.Item>
                            <Form.Item
                                initialValue={initialFormData.description}
                                name="description"
                                rules={[
                                    {
                                        required: true,
                                        message: "Description is required.",
                                    },
                                ]}
                            >
                                <TextArea
                                    label="Purpose of campaign"
                                    placeholder="Enter description"
                                    id="description"
                                    name="description"
                                />
                            </Form.Item>
                            <Form.Item
                                initialValue={initialFormData.location}
                                name="location"
                                rules={[
                                    {
                                        required: true,
                                        message: "Location is required.",
                                    },
                                ]}
                            >
                                <TextInput
                                    label="Location"
                                    placeholder="Enter the your location"
                                    id="location"
                                    name="location"
                                />
                            </Form.Item>
                            <Form.Item
                                initialValue={initialFormData.category}
                                name="category"
                                rules={[
                                    {
                                        required: true,
                                        message: "Category is required.",
                                    },
                                ]}
                            >
                                <Dropdown
                                    options={categoryOption}
                                    label="Category"
                                    id="category"
                                    placeHolder="Select Category"
                                />
                            </Form.Item>
                            <div>
                                <p className="text-sm font-semibold text-[#1F1F1F]">
                                    Campaign ends
                                </p>
                            </div>
                            <Form.Item
                                initialValue={initialFormData.endAt}
                                name="endAt"
                                rules={[
                                    {
                                        required: true,
                                        message: "Duration is required.",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (value !== 0 || getFieldValue("endAt") !== 0) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("Duration is required."));
                                        },
                                    }),
                                ]}
                            >
                                <DatePicker
                                    name="endAt"
                                    id="endAt"
                                    disabledDate={(current) => current < dayjs()}
                                    inputReadOnly={true}
                                />
                            </Form.Item>
                            <div>
                                <p className="text-sm font-semibold text-[#1F1F1F]">
                                    Upload Photo
                                </p>
                            </div>
                            {/* <Form.Item
                                name="campaignImageUrl"
                                initialValue={initialFormData.campaignImageUrl}
                                rules={[
                                    {
                                        required: true,
                                        message: "Upload is required.",
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (
                                                value !== "" ||
                                                getFieldValue("campaignImageUrl") !== ""
                                            ) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject("");
                                        },
                                    }),
                                ]}
                            >
                                <UploadForm
                                    onChange={(data) => {
                                        setUploadUrl(data);
                                    }}
                                />
                            </Form.Item> */}

                            <div className="flex w-full justify-end">
                                <Button
                                    disabled={isPending || isConfirming}
                                    onClick={handleCreateCampaign}
                                    className="mt-4 h-[43px] border-none bg-[#FF6B00] px-5 text-base text-white md:mt-6"
                                >
                                    Create campaign
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CampaignForm;
