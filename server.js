/* VERSION 2.0.0 - MOTEUR GÉNÉRIQUE */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ DB Connected v2.0.0"));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    xp: { type: Number, default: 0 },
    role: { type: String, default: 'user' }
}));

let rooms = {};

io.on('connection', (socket) => {
    // --- AUTHENTIFICATION ---
    socket.on('auth_submit', async (data) => {
        if (data.type === 'guest') return socket.emit('auth_res', { success: true, user: data.user + "_Guest", xp: 0 });
        const user = await User.findOne({ username: data.user });
        if (user && await bcrypt.compare(data.pass, user.password)) {
            socket.emit('auth_res', { success: true, user: user.username, xp: user.xp });
        } else socket.emit('auth_res', { success: false });
    });

    // --- LOGIQUE DE SALON (GÉNÉRIQUE) ---
    socket.on('create_room', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { code, gameId: data.gameId, players: {}, gameState: {} };
        join(socket, code, data.username);
    });

    socket.on('join_room', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        if (!rooms[code].players[socket.id]) {
            rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        }
        broadcastUpdate(code);
    }

    // --- COMMUNICATION INTER-MODULES ---
    socket.on('game_action', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        // On renvoie l'action à tout le monde pour que les modules traitent
        io.to(socket.roomCode).emit('module_event', { type: 'ACTION', from: socket.id, value: data.value, players: room.players });
    });

    socket.on('update_server_state', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        // Mise à jour de l'état maître par le module leader
        room.players = data.players;
        broadcastUpdate(socket.roomCode);
    });

    socket.on('reward_xp', async (data) => {
        if (!data.username.includes("_Guest")) {
            await User.findOneAndUpdate({ username: data.username }, { $inc: { xp: data.amount } });
        }
    });

    function broadcastUpdate(code) {
        io.to(code).emit('room_update', { 
            code: rooms[code].code, 
            gameId: rooms[code].gameId, 
            players: Object.values(rooms[code].players) 
        });
    }

    socket.on('disconnect', () => {
        const r = rooms[socket.roomCode];
        if (r && r.players[socket.id]) {
            delete r.players[socket.id];
            broadcastUpdate(socket.roomCode);
        }
    });
});

server.listen(process.env.PORT || 3000);
