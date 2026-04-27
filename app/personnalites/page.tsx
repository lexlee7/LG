import { PersonalityDirectory } from "@/components/ui";
import { getPersonalitiesListingData, recordPageView } from "@/lib/store";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param;
}

export default async function PersonalitiesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  await recordPageView("/personnalites");

  const data = await getPersonalitiesListingData({
    query: first(params.query),
    country: first(params.country),
    party: first(params.party),
    sort:
      first(params.sort) === "votes" || first(params.sort) === "name"
        ? (first(params.sort) as "votes" | "name")
        : "reliable",
  });

  return (
    <main className="page-shell stack-2xl">
      <section className="section-intro page-banner">
        <p className="eyebrow">Panorama public</p>
        <h1>Comparez les personnalites selon leur fiabilite</h1>
        <p className="muted lead">
          Filtrez par pays, parti ou recherche plein texte, puis ouvrez les fiches pour
          suivre les faits associes.
        </p>
      </section>

      <PersonalityDirectory data={data} />

      <section className="section-block">
        <div className="ad-slot ad-slot--horizontal">
          <span className="eyebrow">Espace publicitaire</span>
          <strong>Zone prete pour un encart publicitaire responsive</strong>
          <p className="muted">Format horizontal compatible bannieres et futur bloc AdSense.</p>
        </div>
      </section>
    </main>
  );
}
