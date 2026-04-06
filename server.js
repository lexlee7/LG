// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let rooms = {}; // Stockage des parties en cours

io.on('connection', (socket) => {
    console.log('Joueur connecté:', socket.id);

    socket.on('join_game', ({ username, roomCode }) => {
        socket.join(roomCode);
        if (!rooms[roomCode]) {
            rooms[roomCode] = { players: [], votes: {}, status: 'LOBBY' };
        }
        
        const player = { id: socket.id, username, score: 1000, debt: 0 };
        rooms[roomCode].players.push(player);
        
        io.to(roomCode).emit('update_players', rooms[roomCode].players);
    });

    socket.on('submit_action', ({ roomCode, action }) => {
        const room = rooms[roomCode];
        room.votes[socket.id] = action; // 'cooperate' ou 'betray'

        if (Object.keys(room.votes).length === room.players.length) {
            calculateResults(roomCode);
        }
    });
});

function calculateResults(roomCode) {
    const room = rooms[roomCode];
    const votes = Object.values(room.votes);
    const betrayers = votes.filter(v => v === 'betray').length;
    
    room.players.forEach(p => {
        const myVote = room.votes[p.id];
        if (betrayers === 0) p.score += 200; // Tout le monde coopère
        else if (myVote === 'betray' && betrayers === 1) p.score += 500; // Seul traître gagne gros
        else if (myVote === 'cooperate' && betrayers > 0) p.score -= 300; // Les dupes perdent
        else if (myVote === 'betray' && betrayers > 1) p.score -= 100; // Trop de traîtres, chaos
    });

    io.to(roomCode).emit('results', { players: room.players, votes: room.votes });
    room.votes = {}; // Reset pour la manche suivante
}

server.listen(3000, () => console.log('Liar Game Engine démarré sur le port 3000'));