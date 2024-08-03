import SupportCard from "@/components/common/support-card";
import { type AddressType } from "@/utils/interface/contract.interface";

type Props = {
    fundraiser: AddressType;
    location: string;
};

const Organisers = ({ fundraiser, location }: Props) => {
    return (
        <div className="w-full border-b border-[#D0D5DD] py-10">
            <h1 className="mb-4 text-xl font-bold md:text-2xl">Organizer</h1>
            <SupportCard name={fundraiser} location={location} />
        </div>
    );
};

export default Organisers;
