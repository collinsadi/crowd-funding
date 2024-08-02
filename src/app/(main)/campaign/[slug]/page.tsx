import CampaignIdPageClient from "./components/campaign-id-page-client"

const CampaignIdPage = ({ params }: { params: { slug: string } }) => {
  return (
    <CampaignIdPageClient slug={params.slug} />
  )
}

export default CampaignIdPage