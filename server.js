/* VERSION 2.0.2 - MOTEUR GÉNÉRIQUE */
// ... (garder le début identique : express, io, mongoose)

io.on('connection', (socket) => {
    // ... (garder auth_submit, create_room, join_room)

    socket.on('game_action', (data) => {
        const room = rooms[socket.roomCode];
        if (!room || !room.players[socket.id]) return;

        // On marque le joueur comme "A voté" sur le serveur immédiatement
        room.players[socket.id].status = "A voté";

        // IMPORTANT : On diffuse l'action à TOUT LE MONDE dans le salon
        io.to(socket.roomCode).emit('module_event', { 
            type: 'ACTION', 
            from: socket.id, 
            value: data.value, 
            players: Object.values(room.players) // Liste fraîche des joueurs
        });
    });

    socket.on('update_server_state', (data) => {
        const room = rooms[socket.roomCode];
        if (!room) return;
        
        // Mise à jour des scores et états depuis le module leader
        data.players.forEach(p => {
            if (room.players[p.id]) {
                room.players[p.id].score = p.score;
                room.players[p.id].alive = p.alive;
                room.players[p.id].status = "Prêt";
            }
        });
        
        console.log(`[v2.0.2] État synchronisé pour le salon ${socket.roomCode}`);
        broadcastUpdate(socket.roomCode);
    });

    // ... (garder le reste : reward_xp, broadcastUpdate, disconnect)
});
