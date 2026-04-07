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
// On utilise la variable d'environnement MONGO_URI configurée sur Render
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connecté à MongoDB Atlas avec succès"))
    .catch(err => console.error("❌ Erreur de connexion MongoDB:", err));

// --- MODÈLE UTILISATEUR (La structure du compte) ---
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// --- VARIABLES DE JEU (En mémoire vive pour la session) ---
let activePlayers = {}; 
let votes = {};

io.on('connection', (socket) => {
    console.log('Nouveau visiteur:', socket.id);

    // 🔐 GESTION AUTHENTIFICATION (Inscription / Connexion)
    socket.on('auth_submit', async (data) => {
        const { user, pass, type } = data;
        try {
            if (type === 'signup') {
                // Inscription : On crypte le mot de passe avant de l'enregistrer
                const hashedPassword = await bcrypt.hash(pass, 10);
                const newUser = new User({ username: user, password: hashedPassword });
                await newUser.save();
                socket.emit('auth_res', { success: true, user: newUser.username, xp: 0 });
            } else {
                // Connexion : On cherche l'utilisateur et on compare les hashs
                const foundUser = await User.findOne({ username: user });
                if (foundUser && await bcrypt.compare(pass, foundUser.password)) {
                    socket.emit('auth_res', { success: true, user: foundUser.username, xp: foundUser.xp });
                } else {
                    socket.emit('auth_res', { success: false, msg: "Pseudo ou mot de passe incorrect." });
                }
            }
        } catch (err) {
            console.error(err);
            socket.emit('auth_res', { success: false, msg: "Ce pseudo est déjà utilisé." });
        }
    });

    // 🎭 LOGIQUE LIAR GAME
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

    socket.on('disconnect', () => {
        delete activePlayers[socket.id];
        delete votes[socket.id];
        io.emit('liar_update', Object.values(activePlayers));
    });
});

async function resolveLiarRound() {
    const ids = Object.keys(votes);
    const betrayers = ids.filter(id => votes[id] === 'betray');
    let winnerFound = null;

    for (let id of ids) {
        let diff = (betrayers.length === 0) ? 200 : 
                   (votes[id] === 'betray' && betrayers.length === 1) ? 1000 : 
                   (votes[id] === 'cooperate') ? -400 : -300;

        activePlayers[id].score += diff;
        if (activePlayers[id].score <= 0) {
            activePlayers[id].score = 0;
            activePlayers[id].alive = false;
        }
        activePlayers[id].status = 'Prêt';
        
        if (activePlayers[id].score >= 5000) winnerFound = activePlayers[id];
    }

    // Si on a un gagnant, on lui donne de l'XP en base de données !
    if (winnerFound) {
        try {
            await User.findOneAndUpdate({ username: winnerFound.name }, { $inc: { xp: 50 } });
        } catch (err) { console.error("Erreur XP:", err); }
    }

    io.emit('liar_results', { 
        players: Object.values(activePlayers), 
        winner: winnerFound ? winnerFound.name : null 
    });
    votes = {};
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Engine online sur port ${PORT}`));
