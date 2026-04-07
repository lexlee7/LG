const io = require('socket.io')(process.env.PORT || 3000, { cors: { origin: "*" } });

const scenarioDB = [
    {
        title: "L'Ombre derrière la vitre",
        description: "Une silhouette immense passe devant le hublot du bunker. Elle semble chercher une entrée. Les capteurs de pression s'affolent.",
        options: [
            { text: "Éteindre tous les systèmes (Risque froid)", effect: { health: -10, water: 0 } },
            { text: "Activer les tourelles de défense (-1 Eau pour refroidissement)", effect: { health: 0, water: -1 } }
        ]
    },
    {
        title: "Fuite suspecte",
        description: "Un tuyau de condensation a éclaté dans la salle des machines. Le sol est inondé.",
        options: [
            { text: "Réparer à mains nues (Blessure)", effect: { health: -20, water: 1 } },
            { text: "Laisser couler (Perte d'eau)", effect: { health: 0, water: -2 } }
        ]
    }
];

io.on('connection', (socket) => {
    socket.on('v4_get_event', () => {
        const ev = scenarioDB[Math.floor(Math.random() * scenarioDB.length)];
        socket.emit('v4_event_data', ev);
    });
});
