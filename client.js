const socket = io('https://lg-3f7p.onrender.com');
let myName = "";
let currentRoom = null;

// Vérification de connexion
socket.on('connect', () => console.log("✅ Connecté au serveur Render v4"));
socket.on('connect_error', (err) => console.error("❌ Erreur de connexion:", err.message));

function createRoom() {
    const user = document.getElementById('username').value.trim();
    if (!user) return alert("Choisis un pseudo !");
    myName = user;
    socket.emit('v4_create', { username: myName });
}

function joinRoom() {
    const user = document.getElementById('username').value.trim();
    const code = document.getElementById('room-code').value.trim().toUpperCase();
    if (!user || !code) return alert("Pseudo et Code requis !");
    myName = user;
    socket.emit('v4_join', { code, username: myName });
}

socket.on('v4_update', (room) => {
    currentRoom = room;
    document.getElementById('setup').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('display-room').innerText = `Salon: ${room.code}`;
    
    const list = document.getElementById('player-list');
    const players = Object.values(room.players);
    document.getElementById('player-count').innerText = `${players.length} Joueurs`;

    list.innerHTML = players.map(p => `
        <div class="p-4 bg-slate-900 border border-white/5 rounded-2xl flex justify-between items-center ${p.name === myName ? 'border-blue-500/50' : ''}">
            <span class="font-bold tracking-tight">${p.name} ${p.name === myName ? '(Moi)' : ''}</span>
            <span class="font-mono text-blue-400 font-bold">${p.score}¥</span>
        </div>
    `).join('');
});

socket.on('v4_error', (msg) => alert(msg));
