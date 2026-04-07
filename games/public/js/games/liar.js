const LiarModule = {
    socket: null,
    me: null,
    votes: {},

    init(socket, myName) {
        this.socket = socket;
        this.me = myName;
        this.votes = {};

        // On écoute les actions brutes du serveur
        this.socket.off('v3_action_sync');
        this.socket.on('v3_action_sync', (event) => {
            this.votes[event.from] = event.value;
            const alives = event.allPlayers.filter(p => p.alive);
            
            if (Object.keys(this.votes).length >= alives.length) {
                this.calculate(event.allPlayers);
            }
        });
    },

    render: (data) => `
        <div id="liar-root" class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 bg-slate-900 p-12 rounded-3xl border border-white/5 text-center">
                <div id="liar-code" class="text-blue-500 font-mono text-sm mb-4">SALON: ${data.code}</div>
                <h2 class="text-3xl font-black italic mb-8">LIAR GAME</h2>
                <div id="liar-ui" class="flex gap-4 justify-center">
                    <button onclick="LiarModule.vote('cooperate')" class="liar-btn bg-green-600 px-8 py-6 rounded-2xl font-bold">COOPÉRER</button>
                    <button onclick="LiarModule.vote('betray')" class="liar-btn bg-red-600 px-8 py-6 rounded-2xl font-bold">TRAHIR</button>
                </div>
            </div>
            <div class="bg-slate-900 p-6 rounded-3xl border border-white/5">
                <h3 class="text-xs font-bold text-slate-500 uppercase mb-4">Joueurs</h3>
                <div id="liar-players" class="space-y-3"></div>
            </div>
        </div>`,

    vote(val) {
        this.socket.emit('v3_action', { value: val });
        document.querySelectorAll('.liar-btn').forEach(b => b.style.display = 'none');
    },

    calculate(players) {
        // Seul le premier joueur de la liste fait le calcul
        const leader = players.filter(p => p.alive)[0];
        if (leader.name !== this.me) return;

        const betrayers = Object.values(this.votes).filter(v => v === 'betray').length;
        players.forEach(p => {
            if (!p.alive) return;
            const v = this.votes[p.id];
            let diff = (betrayers === 0) ? 200 : (v === 'betray' && betrayers === 1) ? 1000 : (v === 'cooperate') ? -400 : -300;
            p.score = Math.max(0, p.score + diff);
            if(p.score <= 0) p.alive = false;
            p.status = "Prêt";
        });

        this.votes = {};
        this.socket.emit('v3_sync_state', { players });
    },

    update(data) {
        // Liste des joueurs
        const list = document.getElementById('liar-players');
        if(list) {
            list.innerHTML = data.players.map(p => `
                <div class="flex justify-between p-3 bg-slate-800 rounded-xl ${p.alive ? '' : 'opacity-20'}">
                    <span class="font-bold text-xs">${p.name} <br><small class="text-blue-500">${p.status}</small></span>
                    <span class="font-mono text-blue-400">${p.score}¥</span>
                </div>`).join('');
        }

        // Réactivation interface
        const meObj = data.players.find(p => p.name === this.me);
        if (meObj && meObj.status === "Prêt" && meObj.alive) {
            document.querySelectorAll('.liar-btn').forEach(b => b.style.display = 'block');
        }

        // Écran de fin
        if (meObj && !meObj.alive) {
            document.getElementById('liar-root').innerHTML = `<div class="text-center p-20 w-full"><h1 class="text-6xl font-black text-red-600">ÉLIMINÉ</h1><button onclick="location.reload()" class="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold">RETOUR</button></div>`;
        }
    }
};
