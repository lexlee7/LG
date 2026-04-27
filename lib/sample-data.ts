import type { FactSeed, PersonalitySeed } from "@/lib/types";

export const personalitySeeds: PersonalitySeed[] = [
  {
    slug: "claire-durand",
    name: "Claire Durand",
    role: "Ministre de la transition publique",
    country: "France",
    party: "Alliance citoyenne",
    bio: "Connue pour ses annonces chiffrees sur l'emploi vert et la renovation des batiments publics.",
    avatarGradient: "linear-gradient(135deg, #22c55e 0%, #0f172a 100%)",
    isFeatured: true,
  },
  {
    slug: "julien-morel",
    name: "Julien Morel",
    role: "Depute et porte-parole reformiste",
    country: "France",
    party: "Bloc reformateur",
    bio: "Intervient souvent sur la fiscalite des PME et la simplification administrative.",
    avatarGradient: "linear-gradient(135deg, #38bdf8 0%, #312e81 100%)",
  },
  {
    slug: "sarah-benkacem",
    name: "Sarah Benkacem",
    role: "Maire d'une grande metropole",
    country: "France",
    party: "Independante",
    bio: "Tres suivie sur les sujets de securite urbaine, transport et services municipaux.",
    avatarGradient: "linear-gradient(135deg, #f97316 0%, #7c2d12 100%)",
  },
  {
    slug: "marc-lefevre",
    name: "Marc Lefevre",
    role: "Senateur et essayiste economique",
    country: "France",
    party: "Republique active",
    bio: "Occupe le terrain mediatique avec des comparaisons budgetaires et des promesses de reindustrialisation.",
    avatarGradient: "linear-gradient(135deg, #a855f7 0%, #1e1b4b 100%)",
  },
];

export const factSeeds: FactSeed[] = [
  {
    slug: "renovation-500000-logements",
    personalitySlug: "claire-durand",
    title: "Nous avons renove 500 000 logements en deux ans",
    statement:
      "Affirmation repetee lors de plusieurs interviews sur le bilan ecologique du gouvernement.",
    context:
      "Les rapports publics convergent vers un volume compris entre 490 000 et 510 000 logements renoves.",
    sourceLabel: "Interview France 24",
    sourceUrl: "https://www.france24.com/",
    happenedAt: "2026-02-18",
    tags: ["logement", "transition"],
    seedVotes: { true: 82, false: 11, unverifiable: 7 },
    isFeatured: true,
  },
  {
    slug: "baisse-prix-electricite-30",
    personalitySlug: "claire-durand",
    title: "Le prix de l'electricite va baisser de 30% cet hiver",
    statement:
      "Promesse prospective prononcee avant l'adoption complete du budget energie.",
    context:
      "La baisse n'est pas encore constatable et depend de plusieurs decrets non publies.",
    sourceLabel: "Meeting a Lyon",
    sourceUrl: "https://www.youtube.com/",
    happenedAt: "2026-03-04",
    tags: ["energie", "prospective"],
    adminVerdict: "unverifiable",
    seedVotes: { true: 18, false: 26, unverifiable: 56 },
  },
  {
    slug: "deficit-divise-par-deux",
    personalitySlug: "claire-durand",
    title: "Nous avons divise le deficit public par deux",
    statement:
      "Formule tres relayee dans les medias, contestee sur la methode de calcul retenue.",
    context:
      "Les comptes publies montrent une reduction partielle, mais pas un facteur deux sur la periode annoncee.",
    sourceLabel: "Debat de l'Assemblee",
    sourceUrl: "https://www.assemblee-nationale.fr/",
    happenedAt: "2026-01-22",
    tags: ["economie", "budget"],
    seedVotes: { true: 13, false: 76, unverifiable: 11 },
  },
  {
    slug: "creation-200000-emplois",
    personalitySlug: "julien-morel",
    title: "La reforme fiscale a cree 200 000 emplois",
    statement:
      "Annonce construite a partir d'une extrapolation macroeconomique contestee.",
    context:
      "Les donnees economiques disponibles n'isolent pas clairement l'effet propre de la reforme.",
    sourceLabel: "Plateau TV",
    sourceUrl: "https://www.tf1info.fr/",
    happenedAt: "2026-02-08",
    tags: ["emploi", "fiscalite"],
    seedVotes: { true: 21, false: 33, unverifiable: 46 },
  },
  {
    slug: "demarches-divisees-par-trois",
    personalitySlug: "julien-morel",
    title: "Les demarches pour creer une entreprise ont ete divisees par trois",
    statement:
      "Chiffre issu d'une communication ministerielle sur la numerisation des formalites.",
    context:
      "Le nombre moyen d'etapes administratives a bien chute, meme si certaines professions restent hors perimetre.",
    sourceLabel: "Communique",
    sourceUrl: "https://www.service-public.fr/",
    happenedAt: "2026-01-30",
    tags: ["administration", "entreprises"],
    seedVotes: { true: 73, false: 17, unverifiable: 10 },
  },
  {
    slug: "hausse-prelevements-zero",
    personalitySlug: "julien-morel",
    title: "Aucun prelevement obligatoire n'a augmente depuis notre arrivee",
    statement:
      "Affirmation globale qui se heurte a plusieurs augmentations locales et sectorielles.",
    context:
      "Plusieurs taxes et contributions ont augmente, meme si l'impot central principal est reste stable.",
    sourceLabel: "Conference de presse",
    sourceUrl: "https://www.publicsenat.fr/",
    happenedAt: "2026-03-16",
    tags: ["fiscalite", "impots"],
    seedVotes: { true: 8, false: 86, unverifiable: 6 },
  },
  {
    slug: "crimes-baisse-40",
    personalitySlug: "sarah-benkacem",
    title: "La criminalite a baisse de 40% dans la ville",
    statement:
      "Formulation globale alors que les categories d'infractions evoluent de maniere heterogene.",
    context:
      "Les violences sur la voie publique ont baisse, mais d'autres categories sont en hausse ou stables.",
    sourceLabel: "Conseil municipal",
    sourceUrl: "https://www.interieur.gouv.fr/",
    happenedAt: "2026-02-14",
    tags: ["securite", "ville"],
    seedVotes: { true: 12, false: 80, unverifiable: 8 },
  },
  {
    slug: "bus-gratuits-etudiants",
    personalitySlug: "sarah-benkacem",
    title: "Tous les etudiants ont desormais acces a des bus gratuits",
    statement:
      "Mesure mise en avant comme universelle alors qu'elle depend de conditions d'age et de revenus.",
    context:
      "L'universalite de la mesure reste discutable selon les criteres d'eligibilite finaux.",
    sourceLabel: "Campagne municipale",
    sourceUrl: "https://www.francebleu.fr/",
    happenedAt: "2026-03-01",
    tags: ["transport", "jeunesse"],
    seedVotes: { true: 26, false: 19, unverifiable: 55 },
  },
  {
    slug: "espaces-verts-double",
    personalitySlug: "sarah-benkacem",
    title: "La surface d'espaces verts a double en un mandat",
    statement:
      "Annonce appuyee sur plusieurs projets de reconversion de friches urbaines.",
    context:
      "Les amenagements livres et ceux acquis par la ville permettent bien d'approcher un doublement par rapport au point de depart.",
    sourceLabel: "Site de campagne",
    sourceUrl: "https://www.ecologie.gouv.fr/",
    happenedAt: "2026-01-09",
    tags: ["environnement", "urbanisme"],
    adminVerdict: "true",
    isFeatured: true,
    seedVotes: { true: 69, false: 12, unverifiable: 19 },
  },
  {
    slug: "reindustrialisation-300-usines",
    personalitySlug: "marc-lefevre",
    title: "Trois cents usines ont rouvert grace a notre politique",
    statement:
      "Chiffre central de plusieurs interventions sur la reindustrialisation.",
    context:
      "Les comptages agregent parfois extensions, reprises partielles et veritables reouvertures.",
    sourceLabel: "Emission economique",
    sourceUrl: "https://www.franceinfo.fr/",
    happenedAt: "2026-02-28",
    tags: ["industrie", "emploi"],
    seedVotes: { true: 24, false: 51, unverifiable: 25 },
  },
  {
    slug: "dette-stable-depuis-2-ans",
    personalitySlug: "marc-lefevre",
    title: "La dette publique est stable depuis deux ans",
    statement:
      "Affirmation utilisee pour defendre la trajectoire budgetaire de son camp.",
    context:
      "Selon l'indicateur retenu, la dette nominale continue d'evoluer alors que certains ratios se stabilisent.",
    sourceLabel: "Tribune nationale",
    sourceUrl: "https://www.lesechos.fr/",
    happenedAt: "2026-04-10",
    tags: ["budget", "dette"],
    seedVotes: { true: 17, false: 42, unverifiable: 41 },
  },
];
