const socket = io('TON_URL_RENDER'); // À remplacer par ton URL Render
let myName = "";

function createRoom() {
    myName = document.getElementById('name-input').value;
    socket.emit('create_room', { username: myName });
}

socket.on('update', (room) => {
    console.log("Salon mis à jour :", room);
    // Ici on affichera la liste des joueurs
});
