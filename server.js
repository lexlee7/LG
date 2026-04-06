const express = require('express');
const http = require('http');
const { Server } = require('server.io'); // Note: Parfois "socket.io" selon l'install

const app = express();
const server = http.createServer(app);

// Configuration CORS pour autoriser ton URL Vercel
const io = new require('socket.io')(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

let players = {};
let votes = {};

io.on('connection', (socket) => {
    console.log('Connexion détectée:', socket.id);

    // Quand un joueur rejoint (ALEX ou MARC)
    socket.on('join', (username) => {
        players[socket.id] = { 
            id: socket.id, 
            name: username, 
            score: 1000, 
            status: 'En attente' 
        };
        console.log(`${username} a rejoint l'arène.`);
        // On renvoie la liste mise à jour à TOUT LE MONDE
        io.emit('update_players', Object.values(players));
    });

    // Gestion du vote (Dilemme)
    socket.on('vote', (choice) => {
        if (!players[socket.id]) return;
        
        votes[socket.id] = choice;
        players[socket.id].status = 'A Voté';
        
        io.emit('update_players', Object.values(players));

        // Si tout le monde a voté
