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
let users = {}; // Simulation de base de données utilisateurs

io.on('connection', (socket) => {
    // Gestion de l'inscription / Connexion simple
    socket.on('auth_request', (data) => {
        const { username, password } = data;
        if (!users[username]) {
            users[username] = { password, stats: { wins: 0, games: 0 } };
        }
        
        if (users[username].password === password) {
            socket.emit('auth_success', { username, stats: users[username].stats });
        } else {
            socket.emit('auth_error', "Identifiants invalides.");
        }
    });

    // Entrée dans le salon Liar Game
    socket.on('join_game', (username) => {
        players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.emit('update_players', Object.values(players));
    });

    socket.on('vote', (choice) => {
        if (!players[socket.id] || !players[socket.id].alive) return;
        votes[socket.id] = choice;
        players[socket.id].status = 'A voté';
        io.emit('update_players', Object.values(players));

        const alivePlayers = Object.values(players).filter(p => p.alive);
        if (Object.keys(votes).length >= alivePlayers.length && alivePlayers.length >= 2) {
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
    let report = [];
    let winnerFound = null;

    ids.forEach(id => {
        const myVote = votes[id];
        let diff = (betrayers.length === 0) ? 200 : 
                   (myVote === 'betray' && betrayers.length === 1) ? 1000 : 
                   (myVote === 'cooperate') ? -400 : -300;

        players[id].score += diff;
        if (players[id].score <= 0) { players[id].score = 0; players[id].alive = false; players[id].status = 'Éliminé'; }
        else { players[id].status = 'Prêt'; }
        if (players[id].score >= 5000) winnerFound = players[id].name;
        report.push({ name: players[id].name, vote: myVote, diff: diff });
    });

    io.emit('results', { players: Object.values(players).sort((a,b)=>b.score-a.score), report, winner: winnerFound });
    votes = {};
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Liar Platform Engine: Active`));
