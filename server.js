const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

let users = {}; // Stockage temporaire des comptes
let activePlayers = {}; // Joueurs actuellement en partie de Liar Game
let votes = {};

io.on('connection', (socket) => {
    // AUTHENTIFICATION
    socket.on('auth_submit', (data) => {
        const { user, pass, type } = data;
        if (type === 'signup') {
            if (users[user]) return socket.emit('auth_res', { success: false, msg: "Pseudo déjà pris" });
            users[user] = { pass, xp: 0, games: 0 };
        }
        if (users[user] && users[user].pass === pass) {
            socket.emit('auth_res', { success: true, user, xp: users[user].xp });
        } else {
            socket.emit('auth_res', { success: false, msg: "Identifiants incorrects" });
        }
    });

    // LOGIQUE DU JEU (LIAR GAME)
    socket.on('liar_join', (username) => {
        activePlayers[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.emit('liar_update', Object.values(activePlayers));
    });

    socket.on('liar_vote', (choice) => {
        if (!activePlayers[socket.id]) return;
        votes[socket.id] = choice;
        activePlayers[socket.id].status = 'A voté';
        io.emit('liar_update', Object.values(activePlayers));

        const alive = Object.values(activePlayers).filter(p => p.alive);
        if (Object.keys(votes).length >= alive.length && alive.length >= 2) {
            resolveLiarRound();
        }
    });

    socket.on('disconnect', () => {
        delete activePlayers[socket.id];
        delete votes[socket.id];
        io.emit('liar_update', Object.values(activePlayers));
    });
});

function resolveLiarRound() {
    const ids = Object.keys(votes);
    const betrayers = ids.filter(id => votes[id] === 'betray');
    ids.forEach(id => {
        let diff = (betrayers.length === 0) ? 200 : (votes[id] === 'betray' && betrayers.length === 1) ? 1000 : (votes[id] === 'cooperate') ? -400 : -300;
        activePlayers[id].score += diff;
        if (activePlayers[id].score <= 0) { activePlayers[id].score = 0; activePlayers[id].alive = false; }
        activePlayers[id].status = 'Prêt';
    });
    io.emit('liar_results', { players: Object.values(activePlayers), winner: Object.values(activePlayers).find(p => p.score >= 5000)?.name });
    votes = {};
}

server.listen(process.env.PORT || 3000);
