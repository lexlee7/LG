/* VERSION 2.0.0 - HUB DE NAVIGATION */
const socket = io('https://lg-3f7p.onrender.com'); 
let me = null;
const VERSION = "2.0.0";

function showPage(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('p-' + id).classList.add('active');
}

// Auth
function auth(type) {
    const user = document.getElementById('a-user').value;
    const pass = document.getElementById('a-pass').value;
    socket.emit('auth_submit', { user, pass, type });
}

socket.on('auth_res', (res) => {
    if(res.success) {
        me = res.user;
        document.getElementById('user-info').innerText = `${res.user} | ${res.xp} XP | v${VERSION}`;
        document.getElementById('auth-modal').classList.add('hidden');
    }
});

// Rooms
function createRoom() { socket.emit('create_room', { gameId: 'liar', username: me }); }
function joinRoom() {
    const code = document.getElementById('room-code').value.toUpperCase().trim();
    if(code) socket.emit('join_room', { code, username: me });
}

// Mise à jour universelle
socket.on('room_update', (data) => {
    showPage('game');
    const container = document.getElementById('game-container');
    
    // Chargement dynamique du module
    if (data.gameId === 'liar') {
        if (!document.getElementById('liar-wrapper')) {
            container.innerHTML = LiarGame.render(data);
            LiarGame.init();
        }
        LiarGame.updateUI(data);
    }
});
