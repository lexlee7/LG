const LiarGame = {
    render: (data) => {
        const meInGame = data.players.find(p => p.name === me);
        if (meInGame && !meInGame.alive) return LiarGame.renderGameOver();

        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase tracking-widest">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10 uppercase italic">Décision Stratégique</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:bg-green-500 transition-all">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:bg-red-500 transition-all">TRAHIR</button>
                        </div>
                    </div>
                    <div id="liar-res" class="hidden text-center">
                        <h2 id="res-title" class="text-4xl font-black mb-4 uppercase italic text-blue-500"></h2>
                        <p id="res-msg" class="text-slate-400 mb-8 text-lg"></p>
                        <button onclick="showPage('home')" class="bg-slate-700 px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest">Quitter</button>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Participants</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },

    renderGameOver: () => {
        return `
            <div class="max-w-md mx-auto card p-12 text-center border-red-500/50 shadow-2xl">
                <div class="text-6xl mb-6">💀</div>
                <h2 class="text-4xl font-black text-red-500 mb-2 uppercase italic">Game Over</h2>
                <p class="text-slate-400 mb-8">Votre solde est vide. Vous êtes éliminé.</p>
                <button onclick="showPage('home')" class="w-full bg-slate-800 py-4 rounded-2xl font-bold uppercase tracking-widest">Retour au Hub</button>
            </div>`;
    },

    init: () => {
        socket.off('liar_results');
        socket.on('liar_results', (data) => {
            const container = document.getElementById('game-container');
            const meInGame = data.players.find(p => p.name === me);
            
            if (meInGame && !meInGame.alive) {
                container.innerHTML = LiarGame.renderGameOver();
                return;
            }

            const ui = document.getElementById('liar-ui');
            if(ui) {
                ui.style.opacity = '1';
                ui.style.pointerEvents = 'auto';
            }
        });
    },

    vote: (type) => {
        socket.emit('liar_vote', type);
        const ui = document.getElementById('liar-ui');
        if(ui) {
            ui.style.opacity = '0.4';
            ui.style.pointerEvents = 'none';
        }
    }
};
