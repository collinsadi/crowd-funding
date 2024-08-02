import { type Metadata } from "next";
import CampaignForm from "./components/campaign-form";

export const metadata: Metadata = {
    title: "Create Campaign",
};
const CreateCampaignPage = () => {
    return (
        <CampaignForm />
    )
}

export default CreateCampaignPage