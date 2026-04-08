const gamesData = {
    'oxygen-zero': [
        {
            description: "Le recycleur d'air émet un râle d'agonie. Une odeur de poussière brûlée sature l'habitacle. L'ordinateur de bord suggère, avec une courtoisie exaspérante, que vous devriez 'respirer avec modération'.",
            options: [
                { text: "Siphonner les réserves du Rover", o2: +15, integrity: -5 },
                { text: "Réparer les filtres au ruban adhésif", o2: -5, integrity: +5 }
            ]
        },
        {
            description: "Une tempête électrostatique danse sur le dôme. Les éclairs bleutés illuminent votre solitude. La paroi tremble, victime d'une fatigue des matériaux que même les ingénieurs sur Terre n'avaient pas prévue.",
            options: [
                { text: "Renforcer les joints de pression", o2: -10, integrity: +20 },
                { text: "Dévier l'énergie vers le bouclier", o2: -20, integrity: +10 }
            ]
        },
        {
            description: "Le silence est rompu par un bruit de métal froissé. Quelque chose, dehors, semble vouloir entrer. Probablement juste le vent, ou peut-être la folie qui commence à frapper poliment à votre porte.",
            options: [
                { text: "Vérifier les capteurs extérieurs", o2: -5, integrity: -10 },
                { text: "Augmenter la pression interne", o2: -15, integrity: +5 }
            ]
        }
    ]
};
// ... Reste du code server.js précédent
