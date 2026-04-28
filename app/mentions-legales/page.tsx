export default function MentionsLegalesPage() {
  return (
    <main className="page-shell stack-2xl">
      <section className="section-intro page-banner">
        <p className="eyebrow">Informations légales</p>
        <h1>Mentions légales</h1>
        <p className="muted lead">
          Cette page est prête à être remplacée ou enrichie depuis le futur mini-CMS.
        </p>
      </section>
      <section className="content-card article-shell">
        <h2>Éditeur</h2>
        <p>Complétez ici l’identité légale de l’éditeur du site.</p>
        <h2>Hébergement</h2>
        <p>Le site est publié sur Vercel avec persistance PostgreSQL lorsque configurée.</p>
        <h2>Contact</h2>
        <p>Ajoutez ici les coordonnées légales et l’adresse de contact.</p>
      </section>
    </main>
  );
}
