import { FactsExplorer } from "@/components/ui";
import { getFactsListingData, recordPageView } from "@/lib/store";
import type { ModerationStatus } from "@/lib/types";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pickModeration(value: string | string[] | undefined): ModerationStatus | "" | undefined {
  const single = pickSingle(value);
  if (!single) return "";
  return ["pending", "approved", "rejected"].includes(single)
    ? (single as ModerationStatus)
    : "";
}

export default async function FactsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  await recordPageView("/faits");

  const data = await getFactsListingData({
    query: pickSingle(params.query),
    category: pickSingle(params.category),
    country: pickSingle(params.country),
    party: pickSingle(params.party),
    moderation: pickModeration(params.moderation),
    page: Number(pickSingle(params.page) ?? "1"),
  });
  const queryString = new URLSearchParams(
    Object.entries({
      query: data.filters.query,
      category: data.filters.category,
      country: data.filters.country,
      party: data.filters.party,
      moderation: data.filters.moderation,
      sort: data.filters.sort,
    }).filter(([, value]) => value),
  ).toString();

  return (
    <main className="page-shell stack-2xl">
      <section className="page-hero compact-hero">
        <div className="page-hero__copy">
          <p className="eyebrow">Base de faits</p>
          <h1>Tous les faits, filtres avancés et pagination.</h1>
          <p className="muted">
            Recherchez un fait, combinez thème, pays et parti, puis analysez les sujets
            les plus disputés ou les plus votés.
          </p>
        </div>
      </section>

      <FactsExplorer data={data} queryString={queryString} />
    </main>
  );
}
