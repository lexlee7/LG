const gamesData = {
    'oxygen-zero': [
        {
            description: "Le recycleur d'air numéro 4 émet un sifflement qui ressemble étrangement à un soupir humain. Dans la pénombre de la coursive, les capteurs de CO2 virent au cramoisi. Le système demande un sacrifice : couper l'air dans les serres pour préserver le cockpit.",
            options: [
                { 
                    text: "Condamner les serres et sacrifier les cultures.", 
                    outcome: "Le verrouillage des portes blindées résonne comme un couperet. En silence, les jeunes pousses de pommes de terre, votre seul espoir de nourriture fraîche, flétrissent sous l'effet du gel martien. L'air redevient pur dans le cockpit, mais il a désormais le goût amer de la défaite.",
                    o2: +20, integrity: -5 
                },
                { 
                    text: "Tenter de rerouter manuellement les conduits extérieurs.", 
                    outcome: "Vous luttez contre des vannes gelées par -80°C. Vos articulations hurlent de douleur. Vous parvenez à maintenir le flux, mais une micro-fissure s'est propagée dans la structure. L'air est sauvé, mais pour combien de temps ?",
                    o2: +5, integrity: -15 
                }
            ]
        },
        {
            description: "La radio capte un signal erratique, une voix hachée par la friture statique qui semble réciter des poèmes en vieux français. C'est impossible. Soit la fatigue vous joue des tours, soit Mars a décidé de vous parler à travers les ondes.",
            options: [
                { 
                    text: "S'abandonner à l'écoute et chercher un message caché.", 
                    outcome: "Vous restez immobile pendant des heures, fasciné par cette mélodie d'outre-tombe. Le temps s'évapore. Votre consommation d'oxygène est restée stable grâce à votre léthargie, mais vous avez négligé l'entretien des filtres.",
                    o2: -5, integrity: -5 
                },
                { 
                    text: "Couper brusquement la fréquence pour préserver votre santé mentale.", 
                    outcome: "Le silence qui suit le clic de l'interrupteur est plus terrifiant que la voix. Vous vous ruez sur vos tâches de maintenance avec une frénésie salvatrice, renforçant la coque par pur besoin de bouger.",
                    o2: -10, integrity: +10 
                }
            ]
        }
    ]
};

// ... Dans la gestion socket.on('v4_get_event') ...
socket.on('v4_get_event', (payload) => {
    const events = gamesData['oxygen-zero'];
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Si l'utilisateur vient de faire un choix, on envoie d'abord le résultat
    if (payload.lastAction) {
        // Logique pour trouver l'outcome correspondant au dernier choix (simplifié ici)
        socket.emit('v4_event_outcome', { 
            outcome: "Votre choix a eu des répercussions...", // Normalement lié à l'action
            nextEvent: event 
        });
    } else {
        socket.emit('v4_event_data', event);
    }
});
