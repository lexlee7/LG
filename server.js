const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
    transports: ['websocket', 'polling']
});

// --- CONNEXION À LA BASE DE DONNÉES ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB Atlas"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// --- MODÈLE UTILISATEUR ---
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    role: { type: String, default: 'user' }, // 'user' ou 'admin'
    isBanned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- VARIABLES DE JEU (SESSION) ---
let activePlayers = {}; 
let votes = {};

io.on('connection', (socket) => {
    
    // AUTHENTIFICATION
    socket.on('auth_submit', async (data) => {
        const { user, pass, type } = data;
        try {
            if (type === 'signup') {
                const hashedPassword = await bcrypt.hash(pass, 10);
                const newUser = new User({ username: user, password: hashedPassword });
                await newUser.save();
                socket.emit('auth_res', { success: true, user: newUser.username, xp: 0, role: 'user' });
            } else {
                const foundUser = await User.findOne({ username: user });
                if (foundUser && !foundUser.isBanned && await bcrypt.compare(pass, foundUser.password)) {
                    socket.emit('auth_res', { 
                        success: true, 
                        user: foundUser.username, 
                        xp: foundUser.xp,
                        role: foundUser.role 
                    });
                } else if (foundUser && foundUser.isBanned) {
                    socket.emit('auth_res', { success: false, msg: "Ce compte a été suspendu." });
                } else {
                    socket.emit('auth_res', { success: false, msg: "Identifiants incorrects." });
                }
            }
        } catch (err) {
            socket.emit('auth_res', { success: false, msg: "Erreur lors de l'authentification." });
        }
    });

    // LOGIQUE JEU : LIAR GAME
    socket.on('liar_join', (username) => {
        activePlayers[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        io.emit('liar_update', Object.values(activePlayers));
    });

    socket.on('liar_vote', (choice) => {
        if (!activePlayers[socket.id] || !activePlayers[socket.id].alive) return;
        votes[socket.id] = choice;
        activePlayers[socket.id].status = 'A voté';
        io.emit('liar_update', Object.values(activePlayers));

        const alivePlayers = Object.values(activePlayers).filter(p => p.alive);
        if (Object.keys(votes).length >= alivePlayers.length && alivePlayers.length >= 2) {
            resolveLiarRound();
        }
    });

    // LOGIQUE ADMIN
    socket.on('admin_get_users', async () => {
        const users = await User.find({}, 'username xp role isBanned createdAt').sort({ createdAt: -1 });
        socket.emit('admin_user_list', users);
    });

    socket.on('admin_update_user', async (data) => {
        const { username, action, value } = data;
        if (action === 'ban') {
            await
