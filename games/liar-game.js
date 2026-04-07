const LiarGame = {
    render: (data) => {
        return `
            <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 card p-12 text-center flex flex-col justify-center min-h-[450px]">
                    <div id="liar-ui">
                        <span class="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-bold mb-4 inline-block uppercase">SALON : ${data.code}</span>
                        <h2 class="text-3xl font-black mb-10 uppercase italic">Décision</h2>
                        <div class="flex gap-4 max-w-sm mx-auto">
                            <button id="btn-c" onclick="LiarGame.vote('cooperate')" class="flex-1 bg-green-600 py-6 rounded-2xl font-bold">COOPÉRER</button>
                            <button id="btn-b" onclick="LiarGame.vote('betray')" class="flex-1 bg-red-600 py-6 rounded-2xl font-bold">TRAHIR</button>
                        </div>
                    </div>
                </div>
                <div class="card p-6">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase mb-4">Joueurs</h4>
                    <div id="player-list" class="space-y-2"></div>
                </div>
            </div>`;
    },
    vote: (type) => {
        socket.emit('liar_vote', type);
        const ui = document.getElementById('liar-ui');
        if(ui) {
            ui.style.opacity = '0.4';
            ui.style.pointerEvents = 'none'; // On bloque pendant le calcul
        }
    },
    handleResults: (data) => {
        const ui = document.getElementById('liar-ui');
        if(ui) {
            ui.style.opacity = '1';
            ui.style.pointerEvents = 'auto'; // ON RÉACTIVE ICI
            console.log("Interface réactivée !");
        }
    }
};
