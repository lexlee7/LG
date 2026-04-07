/* VERSION 2.0.0 - MODULE LIAR GAME */
const LiarGame = {
    votes: {},

    render: (data) => `
        <div id="liar-wrapper" class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div id="main-area" class="lg:col-span-3 card p-12 text-center min-h-[450px] flex flex-col justify-center">
                <div id="liar-controls">
                    <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block">SALON : ${data.code}</span>
                    <h2 class="text-3xl font-black mb-10 italic uppercase">Liar Game</h2>
                    <div class="flex gap-4 max-w-sm mx-auto">
                        <button onclick="LiarGame.sendVote('cooperate')" class="btn-vote flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:bg-green-500">COOPÉRER</button>
                        <button onclick="LiarGame.sendVote('betray')" class="btn-vote flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:bg-red-500">TRAHIR</button>
                    </div>
                </div>
            </div>
            <div class="card p-6">
                <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Joueurs</h4>
                <div id="player-list-game" class="space-y-2"></div>
            </div>
        </div>`,

    init: () => {
        socket.off('module_event');
        LiarGame.votes = {};

        socket.on('module_event', (event) => {
            if (event.type === 'ACTION') {
                LiarGame.votes[event.from] = event.value;
                
                // Calculer si tout le monde a voté
                const alivePlayers = event.players.filter(p => p.alive);
                if (Object.keys(LiarGame.votes).length >= alivePlayers.length) {
                    LiarGame.processLogic(event.players);
                }
            }
        });
    },

    sendVote: (val) => {
        socket.emit('game_action', { value: val });
        // Feedback visuel immédiat
        document.querySelectorAll('.btn-vote').forEach(b => {
            b.disabled = true;
            b.style.opacity = "0.5";
        });
    },

    processLogic: (players) => {
        // Uniquement le premier joueur vivant calcule pour éviter les doublons
        const alivePlayers = players.filter(p => p.alive);
        if (alivePlayers[0].name !== me) return;

        const betrayers = Object.values(LiarGame.votes).filter(v => v === 'betray').length;

        players.forEach(p => {
            if (!p.alive) return;
            const v = LiarGame.votes[p.id];
            let diff = (betrayers === 0) ? 200 : (v === 'betray' && betrayers === 1) ? 1000 : (v === 'cooperate') ? -400 : -300;
            p.score = Math.max(0, p.score + diff);
            if (p.score <= 0) p.alive = false;
            p.status = "Prêt";
        });

        // Check Victoire
        const winners = players.filter(p => p.alive);
        if (winners.length === 1 && players.length > 1) {
            socket.emit('reward_xp', { username: winners[0].name, amount: 100 });
        }

        LiarGame.votes = {};
        socket.emit('update_server_state', { players });
    },

    updateUI: (data) => {
        const meObj = data.players.find(p => p.name === me);
        const container = document.getElementById('main-area');

        // 1. Check Mort/Victoire
        const alive = data.players.filter(p => p.alive);
        if (meObj && !meObj.alive) {
            container.innerHTML = `<h2 class="text-4xl font-black text-red-500 uppercase italic">Game Over</h2><button onclick="location.reload()" class="mt-8 bg-slate-800 px-8 py-3 rounded-xl">Quitter</button>`;
            return;
        }
        if (alive.length === 1 && data.players.length > 1 && alive[0].name === me) {
            container.innerHTML = `<h2 class="text-4xl font-black text-green-500 uppercase italic">Victoire !</h2><button onclick="location.reload()" class="mt-8 bg-green-600 px-8 py-3 rounded-xl">Récupérer XP</button>`;
            return;
        }

        // 2. Refresh Liste
        const list = document.getElementById('player-list-game');
        if (list) {
            list.innerHTML = data.players.map(p => `
                <div class="flex justify-between p-3 rounded-xl bg-slate-800/50 text-[10px] font-bold ${p.alive ? '' : 'opacity-20'}">
                    <span>${p.name}</span>
                    <span class="text-blue-400 font-mono">${p.score}¥</span>
                </div>`).join('');
        }

        // 3. Reset boutons si nouveau tour
        if (meObj && meObj.status === "Prêt") {
            document.querySelectorAll('.btn-vote').forEach(b => {
                b.disabled = false;
                b.style.opacity = "1";
            });
        }
    }
};
