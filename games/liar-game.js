const LiarGame = {
    render: (data) => {
        const meInGame = data.players.find(p => p.name === me);
        if (meInGame && !meInGame.alive) return LiarGame.renderGameOver();

        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase">SALON</span>
                        <h2 class="text-3xl font-black mb-10 italic uppercase">Liar Game</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Participants</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },

    renderGameOver: () => `<div class="max-w-md mx-auto card p-12 text-center border-red-500/50">
        <div class="text-6xl mb-6">💀</div><h2 class="text-4xl font-black text-red-500 mb-2 italic">GAME OVER</h2>
        <button onclick="showPage('home')" class="w-full bg-slate-800 py-4 rounded-2xl font-bold mt-8">RETOUR HUB</button></div>`,

    renderVictory: () => `<div class="max-w-md mx-auto card p-12 text-center border-green-500/50">
        <div class="text-6xl mb-6">🏆</div><h2 class="text-4xl font-black text-green-500 mb-2 italic">VICTOIRE</h2>
        <button onclick="showPage('home')" class="w-full bg-green-600 py-4 rounded-2xl font-bold mt-8">RETOUR HUB</button></div>`,

    init: () => {
        socket.off('process_results');
        socket.on('process_results', (data) => {
            const playersArr = Object.values(data.players);
            const alivePlayers = playersArr.filter(p => p.alive);
            
            // Seul le premier joueur vivant fait le calcul pour tout le monde (évite les bugs)
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

                // On vérifie s'il y a un gagnant final
                const stillAlive = playersArr.filter(p => p.alive);
                if (stillAlive.length === 1 && playersArr.length > 1) {
                    socket.emit('reward_xp', { username: stillAlive[0].name, amount: 100 });
                }

                // On renvoie l'état calculé au serveur
                socket.emit('sync_game_state', { players: playersArr });
            }

            // Interface locale
            const ui = document.getElementById('liar-ui');
            if(ui) { ui.style.opacity = '1'; ui.style.pointerEvents = 'auto'; }
            
            // Vérification immédiate du Game Over/Victoire pour l'affichage
            setTimeout(() => {
                const meNow = playersArr.find(p => p.name === me);
                if (meNow && !meNow.alive) document.getElementById('game-container').innerHTML = LiarGame.renderGameOver();
                const currentAlive = playersArr.filter(p => p.alive);
                if (currentAlive.length === 1 && playersArr.length > 1 && currentAlive[0].name === me) {
                    document.getElementById('game-container').innerHTML = LiarGame.renderVictory();
                }
            }, 100);
        });
    },

    vote: (type) => {
        socket.emit('game_action', { value: type });
        const ui = document.getElementById('liar-ui');
        if(ui) { ui.style.opacity = '0.4'; ui.style.pointerEvents = 'none'; }
    }
};
