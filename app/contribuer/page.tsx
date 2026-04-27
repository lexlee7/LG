import { ContributionHub } from "@/components/ui";
import { getPublicContributionPageData, recordPageView } from "@/lib/store";

export default async function ContribuerPage() {
  await recordPageView("/contribuer");
  const data = await getPublicContributionPageData();

  return (
    <main className="page-shell stack-2xl">
      <ContributionHub data={data} />
    </main>
  );
}
