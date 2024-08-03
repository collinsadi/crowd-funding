import { Space_Grotesk } from "next/font/google";

import { type Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@/styles/globals.css";
import Web3ModalProvider from "@/context";
import { cookieToInitialState } from "wagmi";
import { headers } from "next/headers";
import { config } from "@/config";


export const metadata: Metadata = {
  title: {
    default: "Crowd Fund",
    template: "%s | Crowd Fund",
  },
  description: "Help Us Change Lives Today",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));

  return (
    <html lang="en" className={`${space.className}`}>
      <body>
        <AntdRegistry>
          <Web3ModalProvider initialState={initialState}>
            {children}
          </Web3ModalProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
