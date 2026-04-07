const LiarGame = {
    render: (data) => {
        const meInGame = data.players.find(p => p.name === me);
        if (meInGame && !meInGame.alive) return LiarGame.renderGameOver();

        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase tracking-widest">
                            SALON : <span id="room-display-code">${data.code || '...'}</span>
                        </span>
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
        <div class="max-w-md mx-auto card p-12 text-center border-red-500/50 shadow-2xl">
            <div class="text-6xl mb-6">💀</div>
            <h2 class="text-4xl font-black text-red-500 mb-2 italic uppercase">Game Over</h2>
            <p class="text-slate-400 mb-8">Votre solde est vide. Vous êtes éliminé.</p>
            <button onclick="showPage('home')" class="w-full bg-slate-800 py-4 rounded-2xl font-bold hover:bg-slate-700">Retour Hub</button>
        </div>`,

    renderVictory: () => `
        <div class="max-w-md mx-auto card p-12 text-center border-green-500/50 shadow-2xl">
            <div class="text-6xl mb-6">🏆</div>
            <h2 class="text-4xl font-black text-green-500 mb-2 italic uppercase">Victoire</h2>
            <p class="text-xs text-slate-500 uppercase mb-8">+100 XP ajoutés</p>
            <button onclick="showPage('home')" class="w-full bg-green-600 py-4 rounded-2xl font-bold hover:bg-green-500">Retour Hub</button>
        </div>`,

    init: () => {
        socket.off('process_results');
        socket.on('process_results', (data) => {
            const playersArr = Object.values(data.players);
            const alivePlayers = playersArr.filter(p => p.alive);
            
            if (alivePlayers[0] && alivePlayers[0].name === me) {
                const votes = data.votes;
                const betrayers = Object.values(votes).filter(v => v === 'betray').length;

                playersArr.forEach(p => {
                    if (!p.alive) return;
                    let myVote = votes[p.id];
                    let diff = (betrayers === 0) ? 200 : (myVote === 'betray' && betrayers === 1) ? 1000 : (myVote === 'cooperate') ? -400 : -300;
                    p.score += diff;
                    if (p.score <= 0) { p.score = 0; p.alive = false; }
                });

                const stillAlive = playersArr.filter(p => p.alive);
                if (stillAlive.length === 1 && playersArr.length > 1) {
                    socket.emit('reward_xp', { username: stillAlive[0].name, amount: 100 });
                }

                socket.emit('sync_game_state', { players: playersArr });
            }

            const ui = document.getElementById('liar-ui');
            if(ui) { ui.style.opacity = '1'; ui.style.pointerEvents = 'auto'; }
        });
    },

    vote: (type) => {
        socket.emit('game_action', { value: type });
        const ui = document.getElementById('liar-ui');
        if(ui) { ui.style.opacity = '0.4'; ui.style.pointerEvents = 'none'; }
    }
};
