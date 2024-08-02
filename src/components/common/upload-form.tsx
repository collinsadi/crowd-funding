"use client"

import { UploadOutlined } from "@ant-design/icons";
import { Button, Spin, Upload } from "antd";
import { useState } from "react";
import { type UploadChangeParam } from "antd/lib/upload/interface";


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
  onChange:(data:string) => void
}

const UploadForm = ({onChange}: Props) => {
  const [file, setFile] = useState<UploadFile | File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
  )
}

export default UploadForm