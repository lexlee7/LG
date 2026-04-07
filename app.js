/* VERSION 2.0.1 - HUB DE NAVIGATION */
const socket = io('https://lg-3f7p.onrender.com'); 
let me = null;
const VERSION = "2.0.1";

function showPage(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById('p-' + id);
    if(target) target.classList.add('active');
}

// Authentification
function auth(type) {
    const user = document.getElementById('a-user').value;
    const pass = document.getElementById('a-pass').value;
    if(!user) return alert("Nom d'utilisateur requis");
    socket.emit('auth_submit', { user, pass, type });
}

socket.on('auth_res', (res) => {
    if(res.success) {
        me = res.user;
        const info = document.getElementById('user-info');
        if(info) info.innerText = `${res.user} | ${res.xp} XP | v${VERSION}`;
        document.getElementById('auth-modal').classList.add('hidden');
    } else {
        alert("Échec de connexion");
    }
});

// Navigation et Salons
function openLobby(gameId) {
    if(!me) return document.getElementById('auth-modal').classList.remove('hidden');
    currentId = gameId;
    showPage('lobby');
}

function createRoom() { 
    if(!me) return;
    socket.emit('create_room', { gameId: 'liar', username: me }); 
}

function joinRoom() {
    const input = document.getElementById('room-code');
    const code = input ? input.value.toUpperCase().trim() : "";
    if(code && me) {
        socket.emit('join_room', { code, username: me });
    } else {
        alert("Veuillez entrer un code de salon");
    }
}

// Réception des mises à jour du serveur
socket.on('room_update', (data) => {
    // On change de page seulement si on n'est pas déjà sur la page de jeu
    if (!document.getElementById('p-game').classList.contains('active')) {
        showPage('game');
    }

    const container = document.getElementById('game-container');
    
    // Initialisation du module de jeu
    if (data.gameId === 'liar') {
        if (!document.getElementById('liar-wrapper')) {
            container.innerHTML = LiarGame.render(data);
            LiarGame.init();
        }
        LiarGame.updateUI(data);
    }
});

socket.on('room_error', (msg) => alert(msg));
