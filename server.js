const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } // Autorise Vercel à se connecter
});

let players = {};

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players[socket.id] = { name, score: 1000 };
        io.emit('update', Object.values(players));
    });

    socket.on('vote', (choice) => {
        // Logique de dilemme simplifiée ici
        console.log(`${players[socket.id]?.name} a choisi: ${choice}`);
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('update', Object.values(players));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serveur actif sur le port ${PORT}`));
