const LiarGame = {
    localPlayers: [],

    render: (data) => {
        const meInGame = data.players.find(p => p.name === me);
        if (meInGame && !meInGame.alive) return LiarGame.renderGameOver();

        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10 italic uppercase">Liar Game</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4">Participants</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },

    renderGameOver: () => `
        <div class="max-w-md mx-auto card p-12 text-center border-red-500/50">
            <div class="text-6xl mb-6">💀</div>
            <h2 class="text-4xl font-black text-red-500 mb-2 uppercase italic">Game Over</h2>
            <button onclick="showPage('home')" class="w-full bg-slate-800 py-4 rounded-2xl font-bold mt-8">Retour au Hub</button>
        </div>`,

    renderVictory: () => `
        <div class="max-w-md mx-auto card p-12 text-center border-green-500/50">
            <div class="text-6xl mb-6">🏆</div>
            <h2 class="text-4xl font-black text-green-500 mb-2 uppercase italic">Victoire !</h2>
            <p class="text-xs text-slate-500 mb-8">+100 XP ajoutés</p>
            <button onclick="showPage('home')" class="w-full bg-green-600 py-4 rounded-2xl font-bold">Retour au Hub</button>
        </div>`,

    init: () => {
        socket.off('game_results');
        socket.on('game_results', (data) => {
            // LOGIQUE DE CALCUL PROPRE AU LIAR GAME
            const votes = Object.values(data.votes);
            const betrayers = votes.filter(v => v === 'betray').length;
            
            // On met à jour les scores localement avant de les ré-afficher
            for (let id in data.players) {
                let player = data.players[id];
                if (!player.alive) continue;

                let myVote = data.votes[id];
                let diff = (betrayers === 0) ? 200 : (myVote === 'betray' && betrayers === 1) ? 1000 : (myVote === 'cooperate') ? -400 : -300;
                
                player.score += diff;
                player.status = 'Prêt';
                if (player.score <= 0) { player.score = 0; player.alive = false; }
            }

            // Vérification Victoire / Défaite
            const alivePlayers = Object.values(data.players).filter(p => p.alive);
            const meInGame = Object.values(data.players).find(p => p.name === me);

            const container = document.getElementById('game-container');
            
            if (alivePlayers.length === 1 && Object.values(data.players).length > 1) {
                if (alivePlayers[0].name === me) {
                    socket.emit('reward_xp', { username: me, amount: 100 });
                    container.innerHTML = LiarGame.renderVictory();
                    return;
                }
            }

            if (meInGame && !meInGame.alive) {
                container.innerHTML = LiarGame.renderGameOver();
            } else {
                const ui = document.getElementById('liar-ui');
                if(ui) { ui.style.opacity = '1'; ui.style.pointerEvents = 'auto'; }
            }
        });
    },

    vote: (type) => {
        socket.emit('game_action', { value: type });
        const ui = document.getElementById('liar-ui');
        if(ui) { ui.style.opacity = '0.4'; ui.style.pointerEvents = 'none'; }
    }
};
