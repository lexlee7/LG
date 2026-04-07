const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { cors: { origin: "*" } });

const marsEvents = [
    {
        title: "La Fuite de Pression",
        description: "Une alarme stridente retentit. Le joint du sas principal cède sous la poussière martienne. L'air s'échappe !",
        options: [
            { text: "Boucher avec de la résine (Risqué)", effect: { hp: -10 } },
            { text: "Inonder le sas d'azote pour sceller", effect: { hp: 0 } }
        ]
    },
    {
        title: "Tempête Électrostatique",
        description: "Le ciel devient violet. Une tempête arrive et va griller vos batteries solaires.",
        options: [
            { text: "Désactiver le chauffage", effect: { hp: -20 } },
            { text: "Déployer le paratonnerre manuel", effect: { hp: -5 } }
        ]
    },
    {
        title: "Signal de Détresse",
        description: "Votre radio capte un signal à 2km. C'est peut-être un autre survivant... ou une interférence.",
        options: [
            { text: "Sortir explorer (Perte d'O2)", effect: { hp: -30 } },
            { text: "Ignorer et rester à l'abri", effect: { hp: 0 } }
        ]
    }
];

io.on('connection', (socket) => {
    socket.on('v4_get_event', () => {
        const ev = marsEvents[Math.floor(Math.random() * marsEvents.length)];
        socket.emit('v4_event_data', ev);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 OxygenZero Server Ready on ${PORT}`));
