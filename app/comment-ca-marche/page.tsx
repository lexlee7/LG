export default function CommentCaMarchePage() {
  return (
    <main className="page-shell stack-2xl">
      <section className="content-card page-copy">
        <p className="eyebrow">Méthode</p>
        <h1>Comment ça fonctionne ?</h1>
        <p>
          Veridicte agrège des faits associés à des personnalités publiques. Chaque fait
          reçoit des votes visiteurs et peut être arbitré par une modération admin.
        </p>
        <ul className="page-list">
          <li>les visiteurs peuvent voter vrai, faux ou invérifiable ;</li>
          <li>les visiteurs peuvent proposer de nouveaux faits ou personnalités ;</li>
          <li>les contributions entrent dans une file de validation ;</li>
          <li>la fiabilité d’une personnalité est calculée à partir de ses faits ;</li>
          <li>un véto admin peut fixer un verdict lorsqu’une preuve forte existe.</li>
        </ul>
      </section>
    </main>
  );
}
