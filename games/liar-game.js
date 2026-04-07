const LiarGame = {
    render: (data) => {
        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase tracking-widest">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10">DÉCISION STRATÉGIQUE</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold hover:scale-105 hover:bg-green-500 transition-all shadow-lg shadow-green-900/20">COOPÉRER</button>
                            <button onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold hover:scale-105 hover:bg-red-500 transition-all shadow-lg shadow-red-900/20">TRAHIR</button>
                        </div>
                    </div>
                    <div id="liar-res" class="hidden text-center">
                        <h2 id="res-title" class="text-4xl font-black mb-4 uppercase italic"></h2>
                        <p id="res-msg" class="text-slate-400 mb-8 text-lg"></p>
                        <button onclick="showPage('home')" class="bg-blue-600 px-10 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest">Retourner au Hub</button>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Membres connectés</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },
    vote: (type) => {
        socket.emit('liar_vote', type);
        const ui = document.getElementById('liar-ui');
        if(ui) {
            ui.style.opacity = '0.3';
            ui.style.pointerEvents = 'none';
        }
    }
};

// Écouteur global pour les résultats du jeu
socket.on('liar_results', (data) => {
    const ui = document.getElementById('liar-ui');
    const res = document.getElementById('liar-res');
    if(ui && res) {
        ui.classList.add('hidden');
        res.classList.remove('hidden');
        document.getElementById('res-title').innerText = data.winner ? "FIN DE PARTIE" : "RÉSULTATS DE LA MANCHE";
        document.getElementById('res-msg').innerText = data.winner ? `Vainqueur : ${data.winner}` : "Les scores ont été mis à jour.";
    }
});
