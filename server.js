const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose'); // IMPORT MONGOOSE
const bcrypt = require('bcryptjs'); // Pour sécuriser les mots de passe

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// --- CONNEXION BDD ---
// Remplace par TA connection string. Sur Render, utilise une variable d'environnement (Secret)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://lealexandre1988_db_user:FazzJ5TIvFN35vzD@cluster0.ehqerzd.mongodb.net/?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("Connecté à MongoDB Atlas"))
    .catch(err => console.error("Erreur de connexion BDD:", err));

// --- MODÈLE UTILISATEUR ---
const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    xp: { type: Number, default: 0 },
    balance: { type: Number, default: 1000 }
});
const User = mongoose.model('User', UserSchema);

// --- LOGIQUE SERVER ---
io.on('connection', (socket) => {

    socket.on('auth_submit', async (data) => {
        const { user, pass, type } = data;

        try {
            if (type === 'signup') {
                const hashedPassword = await bcrypt.hash(pass, 10);
                const newUser = new User({ username: user, password: hashedPassword });
                await newUser.save();
                socket.emit('auth_res', { success: true, user: newUser.username, xp: 0 });
            } else {
                const foundUser = await User.findOne({ username: user });
                if (foundUser && await bcrypt.compare(pass, foundUser.password)) {
                    socket.emit('auth_res', { success: true, user: foundUser.username, xp: foundUser.xp });
                } else {
                    socket.emit('auth_res', { success: false, msg: "Identifiants invalides" });
                }
            }
        } catch (err) {
            socket.emit('auth_res', { success: false, msg: "Erreur (Pseudo déjà pris ?)" });
        }
    });

    // ... Reste de ta logique Liar Game (liar_join, liar_vote, etc.) ...
});

server.listen(process.env.PORT || 3000);
