const LiarGame = {
    render: (data) => {
        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10 uppercase italic">Décision</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:bg-green-500 transition-all">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:bg-red-500 transition-all">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Joueurs</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },

    // Initialisation des écouteurs spécifiques à ce jeu
    init: () => {
        // On supprime d'éventuels anciens écouteurs pour éviter les doublons
        socket.off('liar_results');
        
        socket.on('liar_results', (data) => {
            const ui = document.getElementById('liar-ui');
            if(ui) {
                ui.style.opacity = '1';
                ui.style.pointerEvents = 'auto';
                console.log("Résultats reçus, interface débloquée.");
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
