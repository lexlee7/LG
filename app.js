const socket = io('https://lg-3f7p.onrender.com'); 
let me = null;
let currentId = null;

function showPage(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('p-' + id).classList.add('active');
}

function openAuthModal() { document.getElementById('auth-modal').classList.remove('hidden'); }
function closeAuthModal() { document.getElementById('auth-modal').classList.add('hidden'); }

function auth(type) {
    const user = document.getElementById('a-user').value;
    const pass = document.getElementById('a-pass').value;
    socket.emit('auth_submit', { user, pass, type });
}

socket.on('auth_res', (res) => {
    if(res.success) {
        me = res.user;
        document.getElementById('user-info').innerText = `${res.user} | ${res.xp} XP`;
        if(res.role === 'admin') document.getElementById('admin-nav').classList.remove('hidden');
        closeAuthModal();
    }
});

function openLobby(gameId) {
    if(!me) return openAuthModal();
    currentId = gameId;
    showPage('lobby');
}

function createRoom() { socket.emit('create_room', { gameId: currentId, username: me }); }
function joinRoom() { 
    const code = document.getElementById('room-code').value.toUpperCase();
    socket.emit('join_room', { code, username: me }); 
}

socket.on('room_update', (data) => {
    showPage('game');
    const container = document.getElementById('game-container');
    if (data.gameId === 'liar' && !document.getElementById('liar-ui')) {
        container.innerHTML = LiarGame.render(data);
    }
    if (data.gameId === 'liar') LiarGame.init();

    const list = document.getElementById('player-list');
    if(list) {
        list.innerHTML = data.players.map(p => `
            <div class="flex justify-between p-3 rounded-xl bg-slate-800/50 text-[10px] font-bold ${p.alive ? '' : 'opacity-20'}">
                <span>${p.name} <span class="block text-blue-500 uppercase">${p.status}</span></span>
                <span class="text-blue-400 font-mono">${p.score}¥</span>
            </div>`).join('');
    }
});
