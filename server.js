const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

mongoose.connect(process.env.MONGO_URI).then(() => console.log("✅ DB Connected"));

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
        rooms[code] = { code: code, gameId: data.gameId, players: {}, votes: {} };
        join(socket, code, data.username);
    });

    socket.on('join_room', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        // On ne crée le profil joueur que s'il n'existe pas déjà dans la room
        if (!rooms[code].players[socket.id]) {
            rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        }
        io.to(code).emit('room_update', { 
            code: code, 
            gameId: rooms[code].gameId, 
            players: Object.values(rooms[code].players) 
        });
    }

    socket.on('game_action', (data) => {
        const room = rooms[socket.roomCode];
        if (!room || !room.players[socket.id] || !room.players[socket.id].alive) return;
        
        room.votes[socket.id] = data.value;
        room.players[socket.id].status = 'A voté';

        const alivePlayers = Object.values(room.players).filter(p => p.alive);
        if (Object.keys(room.votes).length >= alivePlayers.length) {
            io.to(socket.roomCode).emit('process_results', { votes: room.votes, players: room.players });
        } else {
            io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, gameId: room.gameId, players: Object.values(room.players) });
        }
    });

    socket.on('sync_game_state', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        
        data.players.forEach(updatedP => {
            if (room.players[updatedP.id]) {
                room.players[updatedP.id].score = updatedP.score;
                room.players[updatedP.id].alive = updatedP.alive;
                room.players[updatedP.id].status = 'Prêt';
            }
        });
        room.votes = {}; 
        io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, gameId: room.gameId, players: Object.values(room.players) });
    });

    socket.on('reward_xp', async (data) => {
        if (data.username && !data.username.includes("_Guest")) {
            await User.findOneAndUpdate({ username: data.username }, { $inc: { xp: data.amount } });
        }
    });

    socket.on('disconnect', () => {
        const r = rooms[socket.roomCode];
        if (r && r.players[socket.id]) {
            delete r.players[socket.id];
            io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, gameId: r.gameId, players: Object.values(r.players) });
        }
    });
});

server.listen(process.env.PORT || 3000);
