const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configuration robuste pour Render et Vercel
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] 
});

let players = {};
let votes = {};

io.on('connection', (socket) => {
    console.log('Nouvelle connexion détectée ID:', socket.id);

    // Quand un joueur clique sur "S'ENREGISTRER"
    socket.on('join', (username) => {
        players[socket.id] = { 
            id: socket.id, 
            name: username, 
            score: 1000, 
            status: 'En attente' 
        };
        console.log(`${username} a rejoint l'arène.`);
        
        // On diffuse la liste mise à jour à TOUT LE MONDE immédiatement
        io.emit('update_players', Object.values(players));
    });

    // Gestion du vote
    socket.on('vote', (choice) => {
        if (!players[socket.id]) return;
        
        votes[socket.id] = choice;
        players[socket.id].status = 'A Voté';
        
        // On informe tout le monde qu'un joueur a voté (sans dire quoi)
        io.emit('update_players', Object.values(players));

        const totalPlayers = Object.keys(players).length;
        if (Object.keys(votes).length === totalPlayers && totalPlayers >= 2) {
            resolveRound();
        }
    });

    socket.on('disconnect', () => {
        if (players[socket.id]) {
            console.log(`${players[socket.id].name} a quitté.`);
            delete players[socket.id];
            delete votes[socket.id];
            io.emit('update_players', Object.values(players));
        }
    });
});

function resolveRound() {
    const ids = Object.keys(votes);
    const betrayers = ids.filter(id => votes[id] === 'betray');
    
    ids.forEach(id => {
        const myVote = votes[id];
        if (betrayers.length === 0) {
            players[id].score += 200; 
        } else if (myVote === 'betray' && betrayers.length === 1) {
            players[id].score += 1000; 
        } else if (myVote === 'cooperate' && betrayers.length > 0) {
            players[id].score -= 400; 
        } else if (myVote === 'betray' && betrayers.length > 1) {
            players[id].score -= 100; 
        }
        players[id].status = 'Prêt';
    });

    io.emit('results', { players: Object.values(players), lastVotes: votes });
    votes = {}; 
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Moteur Liar Game actif sur port ${PORT}`));
