const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*", methods: ["GET", "POST"] } 
});

let rooms = {};

io.on('connection', (socket) => {
    console.log(`[CONN] Nouvel utilisateur : ${socket.id}`);

    socket.on('v4_create', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { code, players: {} };
        console.log(`[ROOM] Salon créé : ${code} par ${data.username}`);
        joinUser(socket, code, data.username);
    });

    socket.on('v4_join', (data) => {
        if (rooms[data.code]) {
            joinUser(socket, data.code, data.username);
        } else {
            socket.emit('v4_error', "Salon introuvable !");
        }
    });

    function joinUser(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = {
            id: socket.id,
            name: username,
            score: 1000,
            status: "En attente",
            alive: true
        };
        io.to(code).emit('v4_update', rooms[code]);
    }

    socket.on('disconnect', () => {
        const code = socket.roomCode;
        if (rooms[code] && rooms[code].players[socket.id]) {
            console.log(`[EXIT] ${rooms[code].players[socket.id].name} a quitté.`);
            delete rooms[code].players[socket.id];
            
            // Si le salon est vide, on le supprime pour économiser la RAM
            if (Object.keys(rooms[code].players).length === 0) {
                delete rooms[code];
            } else {
                io.to(code).emit('v4_update', rooms[code]);
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Serveur v4.0.0 actif sur le port ${PORT}`));
