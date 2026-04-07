const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(() => console.log("✅ BDD Connectée")).catch(err => console.log(err));

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String },
    xp: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    isBanned: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

// --- GESTION DES SALONS ---
let rooms = {}; 

io.on('connection', (socket) => {
    
    // AUTH & GUEST
    socket.on('auth_submit', async (data) => {
        const { user, pass, type } = data;
        try {
            if (type === 'guest') {
                socket.emit('auth_res', { success: true, user: user + "_Guest", xp: 0, role: 'guest' });
            } else if (type === 'signup') {
                const hashedPassword = await bcrypt.hash(pass, 10);
                const newUser = new User({ username: user, password: hashedPassword });
                await newUser.save();
                socket.emit('auth_res', { success: true, user: newUser.username, xp: 0, role: 'user' });
            } else {
                const foundUser = await User.findOne({ username: user });
                if (foundUser && !foundUser.isBanned && await bcrypt.compare(pass, foundUser.password)) {
                    socket.emit('auth_res', { success: true, user: foundUser.username, xp: foundUser.xp, role: foundUser.role });
                } else {
                    socket.emit('auth_res', { success: false, msg: "Erreur d'accès." });
                }
            }
        } catch (e) { socket.emit('auth_res', { success: false, msg: "Pseudo indisponible." }); }
    });

    // LOGIQUE DES SALONS (ROOMS)
    socket.on('create_room', (username) => {
        const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[roomCode] = { players: {}, votes: {}, winner: null };
        joinRoom(socket, roomCode, username);
    });

    socket.on('join_room', (data) => {
        if (rooms[data.code]) {
            joinRoom(socket, data.code, data.username);
        } else {
            socket.emit('room_error', "Salon introuvable.");
        }
    });

    function joinRoom(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.to(code).emit('room_update', { code, players: Object.values(rooms[code].players) });
    }

    socket.on('liar_vote', (choice) => {
        const code = socket.roomCode;
        const room = rooms[code];
        if (!room || !room.players[socket.id] || !room.players[socket.id].alive) return;

        room.votes[socket.id] = choice;
        room.players[socket.id].status = 'A voté';
        
        const alivePlayers = Object.values(room.players).filter(p => p.alive);
        io.to(code).emit('room_update', { code, players: Object.values(room.players) });

        if (Object.keys(room.votes).length >= alivePlayers.length && alivePlayers.length >= 2) {
            resolveRoomRound(code);
        }
    });

    // ADMIN DATA
    socket.on('admin_get_data', async () => {
        const users = await User.find().sort({ createdAt: -1 });
        const stats = { totalUsers: users.length, totalXP: users.reduce((acc, u) => acc + u.xp, 0) };
        socket.emit('admin_data_res', { users, stats });
    });

    socket.on('disconnect', () => {
        const code = socket.roomCode;
        if (code && rooms[code]) {
            delete rooms[code].players[socket.id];
            if (Object.keys(rooms[code].players).length === 0) delete rooms[code];
            else io.to(code).emit('room_update', { code, players: Object.values(rooms[code].players) });
        }
    });
});

async function resolveRoomRound(code) {
    const room = rooms[code];
    const ids = Object.keys(room.votes);
    const betrayers = ids.filter(id => room.votes[id] === 'betray');

    for (let id of ids) {
        let diff = (betrayers.length === 0) ? 200 : (room.votes[id] === 'betray' && betrayers.length === 1) ? 1000 : (room.votes[id] === 'cooperate') ? -400 : -300;
        room.players[id].score += diff;
        if (room.players[id].score <= 0) { room.players[id].score = 0; room.players[id].alive = false; }
        room.players[id].status = 'Prêt';
        if (room.players[id].score >= 5000) room.winner = room.players[id].name;
    }

    if (room.winner && !room.winner.includes("_Guest")) {
        await User.findOneAndUpdate({ username: room.winner }, { $inc: { xp: 50 } });
    }

    io.to(code).emit('liar_results', { players: Object.values(room.players), winner: room.winner });
    room.votes = {};
}

server.listen(process.env.PORT || 3000);
