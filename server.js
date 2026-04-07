const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connecté"))
    .catch(err => console.error("❌ Erreur DB:", err));

let rooms = {};

io.on('connection', (socket) => {
    // Créer un salon
    socket.on('create_room', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { code, players: {} };
        join(socket, code, data.username);
    });

    // Rejoindre un salon
    socket.on('join_room', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
        else socket.emit('error', "Code invalide");
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = { 
            id: socket.id, 
            name: username, 
            score: 1000, 
            alive: true 
        };
        io.to(code).emit('update', rooms[code]);
    }

    // Action générique (pour le Liar Game ou autre)
    socket.on('action', (data) => {
        const room = rooms[socket.roomCode];
        if (room) io.to(socket.roomCode).emit('sync_action', { from: socket.id, ...data });
    });

    socket.on('disconnect', () => {
        const room = rooms[socket.roomCode];
        if (room) {
            delete room.players[socket.id];
            io.to(socket.roomCode).emit('update', room);
        }
    });
});

server.listen(process.env.PORT || 3000, () => console.log("🚀 Serveur prêt"));
