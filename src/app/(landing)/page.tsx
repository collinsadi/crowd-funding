import Image from "next/image";
import hero from "@/public/assets/home/hero.png";
import { generalRoutes } from "@/utils/data";
import { Button } from "antd";
import pic1 from "@/public/assets/home/pic1.png";
import pic2 from "@/public/assets/home/pic2.png";
import pic3 from "@/public/assets/home/pic3.png";
import Link from "next/link";
import CrowdfundCampaigns from "./components/crowd-fund-campaigns";

const LandingPage = () => {
  return (
    <div>
      {/* hero */}
      <section className="min-h-[93vh] bg-[#190E0A] lg:min-h-[88vh]">
        <div className="flex flex-col items-center text-white lg:flex-row lg:justify-between">
          <div className="mt-10 w-full pl-[4.1%] lg:w-[60%]">
            <h1 className="mb-4 text-4xl font-bold capitalize leading-[50px] md:text-5xl lg:mb-2 lg:text-[64px] lg:leading-[82px]">
              Help Us change Lives Today
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl lg:leading-[36px]">
              Support Our Charity Crowdfunding Campaign
            </p>
            <div className="mb-6 mt-4 flex justify-start text-white lg:mb-0 lg:mt-12">
              {/* <ConnectButton /> */}
            </div>
          </div>
          <div className="relative h-[50vh] w-[90%] md:w-[60%] lg:h-[88vh] lg:w-[40%]">
            <Image src={hero} alt="children" sizes="100%" fill />
          </div>
        </div>
      </section>

      <section className="layout-container items-center justify-between py-[60px] md:flex md:py-[96px]">
        <div className="w-full md:w-[50%]">
          <h2 className="text-3xl font-bold text-[#1B1C1E] lg:text-4xl lg:leading-[46px]">
            We are raising funds to support our mission of changing lives in our
            community.
          </h2>
        </div>
        <div className="mt-5 w-full md:mt-0 md:w-[50%]">
          <p className="text-base md:pl-4 md:text-xl md:leading-[30px]">
            Donate now to To make a positive impact on the lives of vulnerable
            individuals, families, and communities. Together, we can change
            lives today.
          </p>
        </div>
      </section>
      <CrowdfundCampaigns />
      <section className="layout-container">
        <div className="flex flex-col-reverse items-center justify-between py-[30px] md:py-[50px] lg:flex-row lg:py-[70px]">
          <div className="relative h-[50vh] w-[90%] md:w-[60%] lg:h-[70vh] lg:w-[40%]">
            <Image src={pic1} alt="children" sizes="100%" fill />
          </div>
          <div className="w-full lg:w-[57%]">
            <p className="mb-4 text-[14px] uppercase tracking-wider text-[#101828] md:text-base">
              crowdfunding
            </p>
            <h3 className="mb-2 text-2xl font-semibold capitalize text-[#101828] md:text-3xl lg:text-4xl lg:leading-[46px]">
              do something great to help others
            </h3>
            <p className="text-lg text-[#4D5159] md:text-xl lg:text-2xl lg:leading-[36px]">
              With your support, we can continue to provide these and other
              essential services to those who need it most. We believe that by
              investing in the future of our community, we can create a brighter
              tomorrow for all.
            </p>
            <Link href={generalRoutes.createCampaign}>
              <Button className="mb-6 mt-6 !h-[50px] !w-[151px] !border-none !bg-[#FF6B00] !text-base !text-white lg:mb-0 lg:mt-6">
                Create campaign
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between py-[40px] md:py-[60px] lg:flex-row lg:py-[80px]">
          <div className="w-full lg:w-[57%]">
            <h3 className="mb-2 text-2xl font-semibold capitalize text-[#101828] md:text-3xl lg:text-4xl lg:leading-[46px]">
              do something great to help others
            </h3>
            <p className="text-lg text-[#4D5159] md:text-xl lg:text-2xl lg:leading-[36px]">
              With your support, we can continue to provide these and other
              essential services to those who need it most. We believe that by
              investing in the future of our community, we can create a brighter
              tomorrow for all.
            </p>
          </div>
          <div className="relative h-[50vh] w-[90%] md:w-[60%] lg:h-[70vh] lg:w-[40%]">
            <Image src={pic2} alt="children" sizes="100%" fill />
          </div>
        </div>
        <div className="flex flex-col-reverse items-center justify-between py-[40px] md:py-[60px] lg:flex-row lg:py-[80px]">
          <div className="relative h-[50vh] w-[90%] md:w-[60%] lg:h-[70vh] lg:w-[40%]">
            <Image src={pic3} alt="children" sizes="100%" fill />
          </div>
          <div className="w-full lg:w-[57%]">
            <p className="mb-4 text-[14px] uppercase tracking-wider text-[#101828] md:text-base">
              Contact us
            </p>
            <h3 className="mb-2 text-2xl font-semibold capitalize text-[#101828] md:text-3xl lg:text-4xl lg:leading-[46px]">
              do something great to help others
            </h3>
            <p className="text-lg text-[#4D5159] md:text-xl lg:text-2xl lg:leading-[36px]">
              With your support, we can continue to provide these and other
              essential services to those who need it most. We believe that by
              investing in the future of our community, we can create a brighter
              tomorrow for all.
            </p>
            <Button className="mb-6 mt-6 !h-[50px] !w-[151px] !border-none !bg-[#FF6B00] !text-base !text-white lg:mb-0 lg:mt-6">
              Contact us
            </Button>
          </div>
        </div>
      </section>

      {/* join us */}
      <section className="join-us-bg flex items-center justify-center">
        <div className="layout-container flex justify-center">
          <div className="flex w-full flex-col items-center justify-center md:w-[80%]">
            <h1 className="text-center text-2xl font-[500] text-white md:text-3xl lg:text-[40px] lg:leading-[48px]">
              Join us in making a difference today by donating to our
              crowdfunding campaign.
            </h1>

            <Button className="mt-6 !h-[50px] !w-[151px] border-none !bg-[#FF6B00] !text-base !text-white">
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
