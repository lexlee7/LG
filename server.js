const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// CONNEXION BDD
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Serveur Stratego Connecté"))
    .catch(err => console.error(err));

// MODÈLE UTILISATEUR
const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String },
    xp: { type: Number, default: 0 },
    role: { type: String, default: 'user' },
    isBanned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
}));

let rooms = {};

io.on('connection', (socket) => {
    
    // --- AUTHENTIFICATION ---
    socket.on('auth_submit', async (data) => {
        try {
            if (data.type === 'guest') {
                socket.emit('auth_res', { success: true, user: data.user + "_Guest", xp: 0, role: 'guest' });
            } else if (data.type === 'signup') {
                const hashed = await bcrypt.hash(data.pass, 10);
                const newUser = new User({ username: data.user, password: hashed });
                await newUser.save();
                socket.emit('auth_res', { success: true, user: newUser.username, xp: 0, role: 'user' });
            } else {
                const user = await User.findOne({ username: data.user });
                if (user && !user.isBanned && await bcrypt.compare(data.pass, user.password)) {
                    socket.emit('auth_res', { success: true, user: user.username, xp: user.xp, role: user.role });
                } else {
                    socket.emit('auth_res', { success: false, msg: "Accès refusé." });
                }
            }
        } catch (e) { socket.emit('auth_res', { success: false, msg: "Erreur pseudo." }); }
    });

    // --- SYSTÈME DE SALONS ---
    socket.on('create_room', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { gameId: data.gameId, players: {}, votes: {}, status: 'waiting' };
        join(socket, code, data.username);
    });

    socket.on('join_room', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
        else socket.emit('room_error', "Code invalide.");
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.to(code).emit('room_update', { code, gameId: rooms[code].gameId, players: Object.values(rooms[code].players) });
    }

    // --- LOGIQUE LIAR GAME ---
    socket.on('liar_vote', (choice) => {
        const room = rooms[socket.roomCode];
        if (!room || !room.players[socket.id].alive) return;
        room.votes[socket.id] = choice;
        room.players[socket.id].status = 'A voté';
        const alive = Object.values(room.players).filter(p => p.alive);
        io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, players: Object.values(room.players) });

        if (Object.keys(room.votes).length >= alive.length && alive.length >= 2) {
            resolveLiar(socket.roomCode);
        }
    });

    // --- ADMINISTRATION & STATISTIQUES ---
    socket.on('admin_get_data', async () => {
        const users = await User.find().sort({ createdAt: -1 });
        const stats = {
            total: users.length,
            xp: users.reduce((acc, u) => acc + u.xp, 0),
            avg: users.length > 0 ? (users.reduce((acc, u) => acc + u.xp, 0) / users.length).toFixed(1) : 0,
            banned: users.filter(u => u.isBanned).length
        };
        socket.emit('admin_data_res', { users, stats });
    });

    socket.on('admin_update_user', async (d) => {
        if (d.action === 'ban') await User.findOneAndUpdate({ username: d.username }, { isBanned: d.value });
        if (d.action === 'delete') await User.findOneAndDelete({ username: d.username });
        const users = await User.find().sort({ createdAt: -1 });
        socket.emit('admin_data_res', { users });
    });

    socket.on('disconnect', () => {
        const r = rooms[socket.roomCode];
        if (r) {
            delete r.players[socket.id];
            if (Object.keys(r.players).length === 0) delete rooms[socket.roomCode];
            else io.to(socket.roomCode).emit('room_update', { code: socket.roomCode, players: Object.values(r.players) });
        }
    });
});

async function resolveLiar(code) {
    const r = rooms[code];
    const betrayers = Object.values(r.votes).filter(v => v === 'betray').length;
    let winner = null;
    for (let id in r.votes) {
        let diff = (betrayers === 0) ? 200 : (r.votes[id] === 'betray' && betrayers === 1) ? 1000 : (r.votes[id] === 'cooperate') ? -400 : -300;
        r.players[id].score += diff;
        if (r.players[id].score <= 0) { r.players[id].score = 0; r.players[id].alive = false; }
        r.players[id].status = 'Prêt';
        if (r.players[id].score >= 5000) winner = r.players[id].name;
    }
    if (winner && !winner.includes("_Guest")) await User.findOneAndUpdate({ username: winner }, { $inc: { xp: 50 } });
    io.to(code).emit('liar_results', { players: Object.values(r.players), winner });
    r.votes = {};
}

server.listen(process.env.PORT || 3000);
