import { ContributionHub } from "@/components/ui";
import { getPublicContributionPageData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContribuerPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await recordPageView("/contribuer");
  const data = await getPublicContributionPageData();
  const success = pickSingle(params.success);
  const error = pickSingle(params.error);

  return (
    <main className="page-shell stack-2xl">
      <ContributionHub data={data} success={success} error={error} />
    </main>
  );
}
