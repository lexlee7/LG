const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ DB Connectée"));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true },
    password: { type: String },
    xp: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    isBanned: { type: Boolean, default: false }
}));

let rooms = {};

io.on('connection', (socket) => {
    socket.on('auth_submit', async (data) => {
        if (data.type === 'guest') return socket.emit('auth_res', { success: true, user: data.user + "_Guest", xp: 0, role: 'guest' });
        const user = await User.findOne({ username: data.user });
        if (user && !user.isBanned && await bcrypt.compare(data.pass, user.password)) {
            socket.emit('auth_res', { success: true, user: user.username, xp: user.xp, role: user.role });
        } else socket.emit('auth_res', { success: false });
    });

    socket.on('create_room', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { gameId: data.gameId, players: {}, votes: {} };
        join(socket, code, data.username);
    });

    socket.on('join_room', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.to(code).emit('room_update', { code, gameId: rooms[code].gameId, players: Object.values(rooms[code].players) });
    }

    socket.on('liar_vote', (choice) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        room.votes[socket.id] = choice;
        room.players[socket.id].status = 'A voté';
        const alivePlayers = Object.values(room.players).filter(p => p.alive);
        io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, gameId: room.gameId, players: Object.values(room.players) });
        if (Object.keys(room.votes).length >= alivePlayers.length) resolveLiar(socket.roomCode);
    });

    socket.on('disconnect', () => {
        const r = rooms[socket.roomCode];
        if (r) {
            delete r.players[socket.id];
            io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, gameId: r.gameId, players: Object.values(r.players) });
        }
    });
});

async function resolveLiar(code) {
    const r = rooms[code];
    if (!r) return;
    const betrayers = Object.values(r.votes).filter(v => v === 'betray').length;
    for (let id in r.votes) {
        let diff = (betrayers === 0) ? 200 : (r.votes[id] === 'betray' && betrayers === 1) ? 1000 : (r.votes[id] === 'cooperate') ? -400 : -300;
        r.players[id].score += diff;
        r.players[id].status = 'Prêt';
        if(r.players[id].score <= 0) {
            r.players[id].score = 0;
            r.players[id].alive = false;
        }
    }
    io.to(code).emit('liar_results', { players: Object.values(r.players) });
    io.to(code).emit('room_update', { code, gameId: r.gameId, players: Object.values(r.players) });
    r.votes = {};
}

server.listen(process.env.PORT || 3000);
