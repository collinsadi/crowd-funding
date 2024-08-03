import { type Metadata } from "next";
import CampaignPageClient from "./components/campaign-page-client";

export const metadata: Metadata = {
  title: "Campaigns",
};

const CampaignPage = () => {
  return <CampaignPageClient />;
};

export default CampaignPage;
