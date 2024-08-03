"use client";

import ConnectButton from "@/components/common/connect-button";
import { navlinks } from "@/utils/data";
import { MenuOutlined, CloseOutlined } from "@ant-design/icons";
import { Drawer } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };
  return (
    <nav
      className={`font-space ${
        pathname === "/"
          ? "bg-[#190E0A]"
          : pathname.includes("/campaign")
            ? "bg-[#FCFCFC]"
            : "bg-[#F5F5F5]"
      }`}
    >
      <div className="layout-container flex h-12 items-center justify-between md:h-20">
        <Link
          href="/"
          className={`font-space text-base font-bold leading-[41px] md:text-[32px] ${
            pathname === "/" ? "text-white" : "text-black"
          }`}
        >
          GivingChain
        </Link>
        <div className="hidden items-center gap-x-4 lg:flex xl:gap-x-8">
          <ul className="flex items-center gap-x-4 xl:gap-x-8">
            {navlinks.map((item, index) => (
              <li key={`navlinks-${index}`}>
                <Link
                  href={item.to}
                  className={`text-base font-normal capitalize ${
                    pathname === "/" ? "text-white" : "text-black"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
          <ConnectButton />
        </div>
        <MenuOutlined
          onClick={showDrawer}
          className="!text-white lg:!hidden"
          //   style={{color:"white"}}
        />
      </div>
      {/* ------------------  mobile side bar -----------------------  */}
      <Drawer
        placement="left"
        {...{ onClose, open }}
        styles={{
          header: {
            background: "#0E0916",
          },
          body: {
            background: "#0E0916",
          },
        }}
        closable={false}
        title={
          <div className="flex justify-end">
            <CloseOutlined onClick={onClose} className="text-white" />
          </div>
        }
      >
        <ul className="mb-10 flex flex-col gap-y-10 font-space text-base font-normal capitalize leading-[19px] text-white">
          {navlinks.map((item, index) => (
            <li key={`mobile-navline-${index}`}>
              <Link href={item.to}>{item.name}</Link>
            </li>
          ))}
        </ul>
        <ConnectButton />
      </Drawer>
    </nav>
  );
};

export default Navbar;
