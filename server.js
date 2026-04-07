// ... (garder la base express/socket.io v4.0.0)

const events = [
    {
        title: "Le Rationnement",
        description: "Les réserves s'épuisent. Voulez-vous sauter un repas pour économiser ?",
        options: [
            { text: "Sauter le repas (-20 Santé)", effect: { health: -20, water: 1 } },
            { text: "Boire normalement (-1 Eau)", effect: { health: 0, water: -1 } }
        ]
    },
    {
        title: "Le Signal Radio",
        description: "Vous captez une fréquence militaire. Ils demandent votre position.",
        options: [
            { text: "Répondre (Risqué)", effect: { health: -10, water: 0 } },
            { text: "Ignorer", effect: { health: 0, water: 0 } }
        ]
    }
];

io.on('connection', (socket) => {
    socket.on('get_event', (data) => {
        // Sélectionne un événement aléatoire
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        socket.emit('receive_event', randomEvent);
    });
});
