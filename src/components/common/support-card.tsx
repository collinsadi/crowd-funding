import { UserOutlined } from "@ant-design/icons";
import numeral from "numeral";
import { useAccount } from "wagmi";

type Props = {
    name: string;
    amount?: number;
    date?: string;
    location?: string;
    description?: string;
}

const SupportCard = (props: Props) => {
    const { name, amount, date, location, description } = props;
    const { address } = useAccount();

  return (
    <section className="mt-7 flex w-full items-start justify-start ">
    <div
      className={`h-[40px] w-[40px] rounded-[50%] ${
        location ? "bg-[#F1F1F1]" : "bg-[#E6F6EF]"
      } flex items-center justify-center`}
    >
      <UserOutlined
        className={`text-[25px] ${
          location ? "text-[#6E6E6E]" : "text-[#458E52]"
        }`}
      />
    </div>
    <div className="ml-5 w-full">
      <h3 className="mb-[6px] text-base font-bold">
        {name?.toLowerCase() === address?.toLowerCase() ? "You" : name}
      </h3>
      {amount && (
        <div>
          <div className="mb-[6px] flex w-[full] items-center justify-start text-[14px]">
            {/* <p>{numeral(formatUnit(amount)).format(",")} USDC</p> */}
            <span className="flex justify-start py-0">
              <p>{numeral(amount).format(",")}</p>
              <p className="ml-[2px]"> USDC</p>
            </span>
            <div className="mx-5 h-[5px] w-[5px] rounded-[50%] bg-[#D0D5DD]" />
            <p>{date}</p>
          </div>
          <p className="text-[14px]">{description}</p>
        </div>
      )}

      {location && (
        <>
          <p className="mb-[6px] text-[14px]">Organizer</p>
          <p className="text-[14px]">{location}</p>
        </>
      )}
    </div>
  </section>
  )
}

export default SupportCard