"use client";

import ConnectButton from "@/components/common/connect-button";
import { type PropsWithChildren } from "react";
import { useAccount } from "wagmi";

const Wrapper = ({ children }: PropsWithChildren) => {
  const { isConnected } = useAccount();
  if (!isConnected) {
    return(
        <div className="grid h-screen w-full place-items-center">
        <ConnectButton />
      </div>
    )
  
  }
  return <div>{children}</div>;
};

export default Wrapper;
