const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    transports: ['websocket', 'polling'] 
});

let players = {};
let votes = {};

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'En attente' };
        io.emit('update_players', Object.values(players));
    });

    socket.on('vote', (choice) => {
        if (!players[socket.id]) return;
        
        votes[socket.id] = choice;
        players[socket.id].status = 'A VOTÉ';
        
        io.emit('update_players', Object.values(players));

        // Vérification : on compte les joueurs réellement présents
        const connectedIds = Object.keys(players);
        const voteIds = Object.keys(votes);

        if (voteIds.length >= connectedIds.length && connectedIds.length >= 2) {
            resolveRound();
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        delete votes[socket.id];
        io.emit('update_players', Object.values(players));
    });
});

function resolveRound() {
    const ids = Object.keys(votes);
    const betrayers = ids.filter(id => votes[id] === 'betray');
    let roundReport = [];

    ids.forEach(id => {
        const myVote = votes[id];
        let diff = 0;

        if (betrayers.length === 0) {
            diff = 200; // Tout le monde coopère
        } else if (myVote === 'betray' && betrayers.length === 1) {
            diff = 1000; // Le seul traître
        } else if (myVote === 'cooperate' && betrayers.length > 0) {
            diff = -400; // Victime
        } else if (myVote === 'betray' && betrayers.length > 1) {
            diff = -100; // Trop de traîtres
        }

        players[id].score += diff;
        players[id].status = 'Prêt';
        roundReport.push({ name: players[id].name, vote: myVote, diff: diff });
    });

    // Envoi des résultats détaillés
    io.emit('results', { 
        players: Object.values(players), 
        report: roundReport 
    });
    
    votes = {}; // Reset des votes pour la manche suivante
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur prêt sur port ${PORT}`));
