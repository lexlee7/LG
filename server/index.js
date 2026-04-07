const io = require('socket.io')(process.env.PORT || 3000, { cors: { origin: "*" } });
let rooms = {};

io.on('connection', (socket) => {
    
    socket.on('v3_create', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { code, gameId: data.gameId, players: {} };
        join(socket, code, data.username);
    });

    socket.on('v3_join', (data) => {
        if (rooms[data.code]) join(socket, data.code, data.username);
    });

    function join(socket, code, username) {
        socket.join(code);
        socket.roomCode = code;
        rooms[code].players[socket.id] = { id: socket.id, name: username, score: 1000, status: 'Prêt', alive: true };
        sendUpdate(code);
    }

    socket.on('v3_action', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        room.players[socket.id].status = "A voté";
        // On renvoie l'action à tout le monde
        io.to(socket.roomCode).emit('v3_action_sync', { 
            from: socket.id, 
            value: data.value, 
            allPlayers: Object.values(room.players) 
        });
        sendUpdate(socket.roomCode);
    });

    socket.on('v3_sync_state', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        data.players.forEach(p => {
            if (room.players[p.id]) {
                room.players[p.id].score = p.score;
                room.players[p.id].alive = p.alive;
                room.players[p.id].status = "Prêt";
            }
        });
        sendUpdate(socket.roomCode);
    });

    function sendUpdate(code) {
        io.to(code).emit('room_update', { 
            code: code, 
            gameId: rooms[code].gameId, 
            players: Object.values(rooms[code].players) 
        });
    }

    socket.on('disconnect', () => {
        const r = rooms[socket.roomCode];
        if (r) { delete r.players[socket.id]; sendUpdate(socket.roomCode); }
    });
});
