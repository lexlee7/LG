// MODULE LIAR GAME
const LiarGame = {
    render: (data) => {
        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase tracking-widest">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10">DÉCISION STRATÉGIQUE</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:scale-105 transition-all">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:scale-105 transition-all">TRAHIR</button>
                        </div>
                    </div>
                    <div id="liar-res" class="hidden">
                        <h2 id="res-title" class="text-4xl font-black mb-4 uppercase"></h2>
                        <p id="res-msg" class="text-slate-400 mb-8"></p>
                        <button onclick="showPage('home')" class="bg-blue-600 px-8 py-3 rounded-xl font-bold">RETOUR</button>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4">Participants</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },
    vote: (type) => {
        socket.emit('liar_vote', type);
        document.getElementById('liar-ui').style.opacity = '0.3';
        document.getElementById('liar-ui').style.pointerEvents = 'none';
    }
};

// --- MOTEUR APP (LA GLUE) ---
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
    if(!user) return;
    socket.emit('auth_submit', { user, pass, type });
}

socket.on('auth_res', (res) => {
    if(res.success) {
        me = res.user;
        document.getElementById('user-info').innerText = `${res.user} | ${res.xp} XP`;
        if(res.role === 'admin') document.getElementById('admin-nav').classList.remove('hidden');
        closeAuthModal();
    } else alert(res.msg);
});

function openLobby(gameId) {
    if(!me) return openAuthModal();
    currentId = gameId;
    document.getElementById('lobby-title').innerText = "Lobby : " + gameId;
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
    const list = document.getElementById('player-list');
    if(list) {
        list.innerHTML = data.players.map(p => `
            <div class="flex justify-between p-3 rounded-xl bg-slate-800/50 text-[10px] font-bold ${p.alive ? '' : 'opacity-20'}">
                <span>${p.name} <span class="block text-slate-500">${p.status}</span></span>
                <span class="text-blue-500">${p.score}¥</span>
            </div>`).join('');
    }
});

socket.on('liar_results', (data) => {
    const ui = document.getElementById('liar-ui');
    const res = document.getElementById('liar-res');
    if(ui && res) {
        ui.classList.add('hidden');
        res.classList.remove('hidden');
        document.getElementById('res-title').innerText = data.winner ? "VICTOIRE" : "RÉSULTATS";
        document.getElementById('res-msg').innerText = data.winner ? `Le gagnant est ${data.winner}` : "La manche est finie.";
    }
});

function openAdmin() {
    showPage('admin');
    socket.emit('admin_get_data');
}

socket.on('admin_data_res', (data) => {
    if(data.stats) {
        document.getElementById('stats-grid').innerHTML = `
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800"><p class="text-slate-500 text-[10px] font-bold uppercase">Joueurs</p><p class="text-2xl font-black">${data.stats.total}</p></div>
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800"><p class="text-slate-500 text-[10px] font-bold uppercase">XP Moyenne</p><p class="text-2xl font-black text-blue-400">${data.stats.avg}</p></div>
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800"><p class="text-slate-500 text-[10px] font-bold uppercase">XP Totale</p><p class="text-2xl font-black text-green-400">${data.stats.xp}</p></div>
            <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800"><p class="text-slate-500 text-[10px] font-bold uppercase">Bannis</p><p class="text-2xl font-black text-red-500">${data.stats.banned}</p></div>`;
    }
    if(data.users) {
        document.getElementById('admin-table').innerHTML = data.users.map(u => `
            <tr>
                <td class="p-5 font-bold">${u.username}</td>
                <td class="p-5">${u.xp} XP</td>
                <td class="p-5 text-xs text-blue-400 uppercase font-black">${u.role}</td>
                <td class="p-5"><button onclick="adminAction('${u.username}','ban',${!u.isBanned})" class="text-[10px] font-bold text-red-500">${u.isBanned ? 'UNBAN' : 'BAN'}</button></td>
            </tr>`).join('');
    }
});

function adminAction(username, action, value) {
    if(confirm(`Action sur ${username} ?`)) socket.emit('admin_update_user', { username, action, value });
}
