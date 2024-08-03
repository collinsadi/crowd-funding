/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Upload } from "antd";
import { useEffect, useState } from "react";
import { type UploadChangeParam } from "antd/lib/upload/interface";
import toast from "react-hot-toast";
import { env } from "@/env";

interface UploadFile {
  uid: string;
  name: string;
  status?: string;
  url?: string;
  thumbUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;
}

type Props = {
  onChange: (data: string) => void;
};

const UploadForm = ({ onChange }: Props) => {
  const [file, setFile] = useState<UploadFile | File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (file) {
      if (file.size / 1024 ** 2 > 100) {
        toast.error("File Size too large, minimum is 100mb");
        return;
      } else {
        setLoading(true);
        const form2 = new FormData();
        form2.append("file", file as File);
        try {
          const request = await fetch("/api/upload", {
            method: "POST",
            body: form2,
          });
          const response = await request.json();
          console.log('response',response)
          onChange(
            `https://${env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${response?.IpfsHash}`,
          );

          // console.log("response", response);
          // console.log("response.IpfsHash", response?.IpfsHash);

          setLoading(false);
        } catch (error) {
          console.log("err", error);
          toast.error("Error uploading file");
          setLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (file) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    setFile(info.file.originFileObj);
  };

  return (
    <Spin spinning={loading}>
      <Upload
        name="campaignImageUrl"
        accept=".jpg,.jpeg,.png"
        maxCount={1}
        onChange={handleFileChange}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </Spin>
  );
};

export default UploadForm;
