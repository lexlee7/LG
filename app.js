const socket = io('https://lg-3f7p.onrender.com'); 
let me = null;
let currentId = null;

// NAVIGATION
function showPage(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('p-' + id).classList.add('active');
}

// AUTHENTIFICATION
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

// GESTION DES SALONS
function openLobby(gameId) {
    if(!me) return openAuthModal();
    currentId = gameId;
    document.getElementById('lobby-title').innerText = "Lobby : " + gameId;
    showPage('lobby');
}

function createRoom() { socket.emit('create_room', { gameId: currentId, username: me }); }
function joinRoom() { 
    const code = document.getElementById('room-code').value.toUpperCase();
    if(code) socket.emit('join_room', { code, username: me }); 
}

// LOGIQUE DE MISE À JOUR (DÉLÉGUÉE)
socket.on('room_update', (data) => {
    showPage('game');
    const container = document.getElementById('game-container');

    // Vérification : est-ce qu'on est dans le bon jeu ?
    if (data.gameId === 'liar') {
        // On n'injecte le HTML que si la zone est vide
        if (!document.getElementById('liar-ui')) {
            container.innerHTML = LiarGame.render(data);
        }
    }

    // Mise à jour de la liste des joueurs (indispensable pour voir qui est là)
    const list = document.getElementById('player-list');
    if(list) {
        list.innerHTML = data.players.map(p => `
            <div class="flex justify-between items-center p-3 rounded-xl bg-slate-800/50 text-[10px] font-bold ${p.alive ? '' : 'opacity-20'}">
                <span class="flex flex-col">${p.name} <span class="text-blue-500 uppercase">${p.status}</span></span>
                <span class="text-blue-400 text-sm">${p.score}¥</span>
            </div>`).join('');
    }
});

// ADMINISTRATION (STATS ET GESTION)
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
            <tr class="hover:bg-slate-800/30">
                <td class="p-5 font-bold">${u.username}</td>
                <td class="p-5 text-slate-400">${u.xp} XP</td>
                <td class="p-5 text-xs text-blue-400 uppercase font-black">${u.role}</td>
                <td class="p-5"><button onclick="adminAction('${u.username}','ban',${!u.isBanned})" class="text-[10px] font-bold text-red-500">${u.isBanned ? 'UNBAN' : 'BAN'}</button></td>
            </tr>`).join('');
    }
});

function adminAction(username, action, value) {
    if(confirm(`Confirmer l'action sur ${username} ?`)) {
        socket.emit('admin_update_user', { username, action, value });
    }
}
