/* VERSION 2.0.2 - MODULE LIAR GAME */
let localVotes = {}; // Stockage persistant des votes du tour en cours

const LiarGame = {
    render: (data) => {
        const meInGame = data.players.find(p => p.name === me);
        if (meInGame && !meInGame.alive) return LiarGame.renderGameOver();

        return `
            <div id="liar-wrapper" class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div id="liar-main-content" class="lg:col-span-3 card p-12 text-center min-h-[450px] flex flex-col justify-center border border-slate-800">
                    <div id="liar-ui-core">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase tracking-widest">
                            SALON : <span id="display-code">${data.code}</span>
                        </span>
                        <h2 class="text-3xl font-black mb-10 italic uppercase">Liar Game</h2>
                        <div id="liar-actions" class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.sendVote('cooperate')" class="lg-btn flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:bg-green-500 transition-all">COOPÉRER</button>
                            <button onclick="LiarGame.sendVote('betray')" class="lg-btn flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:bg-red-500 transition-all">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6 border border-slate-800">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest text-center">Participants</h4>
                    <div id="liar-player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },

    init: () => {
        socket.off('module_event');
        localVotes = {}; 
        console.log("[v2.0.2] LiarGame Initialisé");

        socket.on('module_event', (event) => {
            if (event.type === 'ACTION') {
                localVotes[event.from] = event.value;
                const alivePlayers = event.players.filter(p => p.alive);
                
                console.log(`[Vote] ${Object.keys(localVotes).length}/${alivePlayers.length} joueurs ont voté.`);

                // Si tout le monde a voté
                if (Object.keys(localVotes).length >= alivePlayers.length) {
                    LiarGame.runLogic(event.players);
                }
            }
        });
    },

    sendVote: (val) => {
        console.log("[Action] Envoi du vote :", val);
        socket.emit('game_action', { value: val });
        document.querySelectorAll('.lg-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = "0.3";
            btn.style.pointerEvents = "none";
        });
    },

    runLogic: (players) => {
        const alivePlayers = players.filter(p => p.alive);
        // Le premier joueur VIVANT de la liste devient le "Calculateur"
        if (alivePlayers[0] && alivePlayers[0].name !== me) return;

        console.log("[Logic] Calcul des résultats en cours...");
        const betrayers = Object.values(localVotes).filter(v => v === 'betray').length;

        players.forEach(p => {
            if (!p.alive) return;
            const vote = localVotes[p.id];
            let diff = (betrayers === 0) ? 200 : (vote === 'betray' && betrayers === 1) ? 1000 : (vote === 'cooperate') ? -400 : -300;
            p.score = Math.max(0, p.score + diff);
            if (p.score <= 0) p.alive = false;
            p.status = "Prêt";
        });

        localVotes = {}; // Reset local
        socket.emit('update_server_state', { players });
    },

    updateUI: (data) => {
        // ... (Le code de updateUI v2.0.1 reste identique et fonctionnel)
    }
};
