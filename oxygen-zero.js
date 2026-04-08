{
  "intro": {
    "text": "Le silence n'est jamais vraiment vide dans l'espace. Il possède une texture, une lourdeur qui pèse sur vos tympans. Vous reprenez conscience, [NAME], la joue collée contre le métal froid de la console de navigation. \n\nUne odeur de plastique brûlé et d'ozone flotte dans l'habitacle exigu de la navette 'Icare-7'. Vous relevez la tête. Vos yeux brûlent. À travers le hublot renforcé, la Terre n'est plus qu'une bille bleue lointaine, inaccessible. Le panneau de contrôle est un cimetière de diodes éteintes. \n\nVous êtes [SEX] seul(e) face au vide. Le journal de bord indique une collision avec un débris orbital. Les communications sont mortes. L'ordinateur de secours affiche un chiffre qui vous glace le sang : 08% d'oxygène. Vous avez trente minutes avant que vos poumons ne luttent pour une dernière bouffée de néant.",
    "choices": [
      { "text": "Forcer l'ouverture du sas vers la salle des machines", "next": "machines" },
      { "text": "Tenter une réparation d'urgence du transmetteur radio", "next": "radio" }
    ]
  },
  "machines": {
    "text": "Vous rampez dans le couloir de transfert. L'absence de gravité vous donne la nausée. En atteignant la salle des machines, vous découvrez l'horreur : une brèche de la taille d'un poing déchire la coque. L'air s'échappe dans un sifflement sinistre. \n\nJuste à côté du trou, la réserve d'oxygène de secours est intacte, mais le levier de scellement est coincé. Si vous l'actionnez manuellement, vous risquez d'y laisser vos doigts gelés par le vide spatial.",
    "choices": [
      { "text": "Sceller la brèche à mains nues, quel qu'en soit le prix", "next": "sacrifice_doigts" },
      { "text": "Utiliser votre combinaison pour boucher le trou temporairement", "next": "combinaison_trouee" }
    ]
  },
  "radio": {
    "text": "Vous ouvrez le ventre de la console radio. Des centaines de fils multicolores pendent comme les entrailles d'une bête mécanique. Votre formation de pilote est lointaine, mais vous reconnaissez le module de fréquence. \n\nSoudain, un grésillement. Une voix. Une voix de femme, distordue par des années-lumière de vide : '...Icare-7... ici Station Aurora... Nous captons votre balise... Quel est votre état ?'\n\nLe signal faiblit. Pour répondre, vous devez rediriger l'énergie du chauffage de la cabine. La température chutera à -40°C en quelques minutes.",
    "choices": [
      { "text": "Geler sur place pour maintenir le contact", "next": "froid_radio" },
      { "text": "Couper la radio et chercher une autre solution", "next": "intro" }
    ]
  },
  "sacrifice_doigts": {
    "text": "La douleur est instantanée. Un froid absolu mord votre chair alors que vous plaquez le levier. Vous entendez le métal se verrouiller. La brèche est scellée. Vous avez sauvé votre oxygène, mais votre main gauche est désormais inutile, noircie par le gel. \n\nAlors que vous reprenez votre souffle, une secousse ébranle le vaisseau. Quelqu'un vient d'amarrer un module à votre sas de secours. Mais ce n'est pas une navette de secours de la Terre. Le design est anguleux, sombre... inconnu.",
    "choices": [
      { "text": "Ouvrir le sas avec prudence", "next": "fin_alien" },
      { "text": "S'armer d'un tournevis et se cacher", "next": "fin_cache" }
    ]
  },
  "froid_radio": {
    "text": "Vos dents s'entrechoquent. Votre souffle forme des cristaux de glace devant vos yeux. 'Ici [NAME]... Icare-7... brèche scellée mais air critique...'\n\n'Tenez bon, [NAME],' répond la voix. 'Nous envoyons un drone de récupération. Temps estimé : 20 minutes.' \n\n20 minutes. Votre indicateur d'oxygène chute à 2%. Vos paupières deviennent lourdes. Le sommeil vous appelle, un sommeil éternel dans une cabine de glace.",
    "choices": [
      { "text": "Lutter contre le sommeil en se griffant les bras", "next": "fin_sauve" },
      { "text": "S'endormir doucement en écoutant la voix à la radio", "next": "fin_mort_douce" }
    ]
  },
  "fin_sauve": {
    "text": "La douleur vous garde éveillé(e). Chaque seconde est un calvaire. Puis, un choc métallique. Des lumières blanches inondent le cockpit. Des silhouettes en combinaison pressurisée déchirent le sas. Vous êtes sauvé(e). \n\nDes mois plus tard, sur Terre, vous regardez les étoiles. Vous savez que vous avez laissé une part de votre âme là-haut, mais vous êtes en vie. \n\nFÉLICITATIONS : Vous avez survécu (Fin : Le Miracle).",
    "choices": [ { "text": "Retourner au menu", "next": "intro" } ]
  },
  "fin_mort_douce": {
    "text": "Le froid n'est plus une souffrance, c'est une couverture de velours. La voix à la radio devient une berceuse. Vous fermez les yeux, un sourire aux lèvres. Vous ne sentirez jamais le drone s'amarrer. Vous resterez à jamais une légende parmi les étoiles. \n\nFIN : Le Grand Sommeil.",
    "choices": [ { "text": "Réessayer", "next": "intro" } ]
  }
}
