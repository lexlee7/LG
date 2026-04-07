const LiarGame = {
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
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:bg-green-500 transition-all">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:bg-red-500 transition-all">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Participants</h4>
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
            <p class="text-xs text-slate-500 mb-8 uppercase tracking-widest">+100 XP ajoutés</p>
            <button onclick="showPage('home')" class="w-full bg-green-600 py-4 rounded-2xl font-bold">Retour au Hub</button>
        </div>`,

    init: () => {
        socket.off('game_results');
        socket.on('game_results', (data) => {
            const playersArr = Object.values(data.players);
            const betrayers = Object.values(data.votes).filter(v => v === 'betray').length;
            
            // Calcul et mise à jour locale
            playersArr.forEach(p => {
                if (!p.alive) return;
                let myVote = data.votes[p.id];
                let diff = (betrayers === 0) ? 200 : (myVote === 'betray' && betrayers === 1) ? 1000 : (myVote === 'cooperate') ? -400 : -300;
                p.score += diff;
                p.status = 'Prêt';
                if (p.score <= 0) { p.score = 0; p.alive = false; }
            });

            // Affichage
            const container = document.getElementById('game-container');
            const alivePlayers = playersArr.filter(p => p.alive);
            const meInGame = playersArr.find(p => p.name === me);

            if (alivePlayers.length === 1 && playersArr.length > 1) {
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
                
                // Forcer la mise à jour de la liste latérale
                const list = document.getElementById('player-list');
                if(list) {
                    list.innerHTML = playersArr.map(p => `
                        <div class="flex justify-between p-3 rounded-xl bg-slate-800/50 text-[10px] font-bold ${p.alive ? '' : 'opacity-20'}">
                            <span>${p.name} <span class="block text-blue-500 uppercase">${p.status}</span></span>
                            <span class="text-blue-400">${p.score}¥</span>
                        </div>`).join('');
                }
            }
        });
    },

    vote: (type) => {
        socket.emit('game_action', { value: type });
        const ui = document.getElementById('liar-ui');
        if(ui) { ui.style.opacity = '0.4'; ui.style.pointerEvents = 'none'; }
    }
};
