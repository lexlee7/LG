import { recordPageView } from "@/lib/store";

export default async function QuiSommesNousPage() {
  await recordPageView("/qui-sommes-nous");

  return (
    <main className="page-shell stack-2xl">
      <section className="page-hero compact-hero">
        <div className="page-hero__copy">
          <p className="eyebrow">Présentation</p>
          <h1>Qui sommes-nous&nbsp;?</h1>
          <p className="muted">
            Veridicte est un portail civique qui cherche à rendre la lecture des déclarations
            publiques plus lisible, plus collective et plus documentée.
          </p>
        </div>
      </section>
      <section className="content-card stack-lg">
        <h2>Notre mission</h2>
        <p>
          Le site vise à montrer comment des visiteurs, des sources publiques et une modération
          éditoriale peuvent coexister pour qualifier des faits avancés par des personnalités.
        </p>
        <h2>Notre méthode</h2>
        <p>
          Chaque fait peut recevoir des votes, une modération et, si besoin, un véto
          administrateur. L’objectif n’est pas de remplacer le travail journalistique, mais de
          rendre le débat public plus compréhensible.
        </p>
      </section>
    </main>
  );
}
