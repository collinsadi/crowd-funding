import Link from "next/link";
import { navlinks } from "@/utils/data";

const Footer = () => {
  return (
    <footer className="py-5 md:py-10">
      <div className="layout-container md:flex md:items-center md:justify-between">
        <Link
          href="/"
          className="font-space text-base font-bold leading-[41px] md:text-[32px] "
        >
          GivingChain
        </Link>
        <ul className="grid grid-cols-2 gap-y-2 md:flex md:gap-x-2 md:gap-y-0 lg:gap-x-8">
          {navlinks.map((item, index) => (
            <li key={`navlinks-${index}`}>
              <Link href={item.to} className="text-base font-normal capitalize">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
