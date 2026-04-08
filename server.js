const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer();
const io = new Server(server, { 
    cors: { origin: "*" } // Autorise ton site Vercel à se connecter
});

// Base de données des scénarios (Tu pourras plus tard les mettre dans des fichiers séparés aussi)
const gamesData = {
    'oxygen-zero': [
        {
            title: "Alerte Décompression",
            description: "Une micro-météorite a percé le dôme bioclimatique. L'alarme hurle.",
            options: [{ text: "Sceller le secteur" }, { text: "Utiliser le kit de réparation" }]
        },
        {
            title: "Tempête de Sable",
            description: "La visibilité est nulle. Vos panneaux solaires sont recouverts.",
            options: [{ text: "Sortir les nettoyer" }, { text: "Attendre l'accalmie" }]
        }
    ]
};

io.on('connection', (socket) => {
    console.log('Un éclaireur s\'est connecté');

    // Quand un jeu demande un événement
    socket.on('v4_get_event', (payload) => {
        // On récupère les événements du jeu demandé (par défaut oxygen-zero)
        const events = gamesData['oxygen-zero'];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        
        // On renvoie l'événement au client
        socket.emit('v4_event_data', randomEvent);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur Emerald Engine actif sur le port ${PORT}`);
});
