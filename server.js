const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['websocket', 'polling']
});

let players = {};
let votes = {};

io.on('connection', (socket) => {
    console.log('Nouveau terminal connecté:', socket.id);

    socket.on('join', (username) => {
        players[socket.id] = { id: socket.id, name: username.toUpperCase(), score: 1000, status: 'EN ATTENTE' };
        console.log(`${username} a rejoint.`);
        io.emit('update_players', Object.values(players));
    });

    socket.on('vote', (choice) => {
        if (!players[socket.id]) return;
        votes[socket.id] = choice;
        players[socket.id].status = 'A VOTÉ';
        io.emit('update_players', Object.values(players));

        const activeIds = Object.keys(players);
        if (Object.keys(votes).length >= activeIds.length && activeIds.length >= 2) {
            resolveRound();
        }
    });

    socket.on('disconnect', () => {
        if (players[socket.id]) {
            console.log(`${players[socket.id].name} déconnecté.`);
            delete players[socket.id];
            delete votes[socket.id];
            io.emit('update_players', Object.values(players));
        }
    });
});

function resolveRound() {
    const ids = Object.keys(votes);
    const betrayers = ids.filter(id => votes[id] === 'betray');
    let report = [];

    ids.forEach(id => {
        const myVote = votes[id];
        let diff = 0;
        if (betrayers.length === 0) diff = 200;
        else if (myVote === 'betray' && betrayers.length === 1) diff = 1000;
        else if (myVote === 'cooperate' && betrayers.length > 0) diff = -400;
        else if (myVote === 'betray' && betrayers.length > 1) diff = -100;

        players[id].score += diff;
        players[id].status = 'PRÊT';
        report.push({ name: players[id].name, vote: myVote, diff: diff });
    });

    io.emit('results', { players: Object.values(players), report: report });
    votes = {};
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Liar Game Engine: PORT ${PORT}`));
