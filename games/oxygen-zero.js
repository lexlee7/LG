export const OxygenZero = {
    stats: { o2: 100, integrity: 100, sol: 1 },
    mount: null,
    socket: null,

    init(socket, mount) {
        if(socket) this.socket = socket;
        this.mount = mount;
        this.stats = { o2: 100, integrity: 100, sol: 1 };
        this.renderIntro();
    },

    renderIntro() {
        this.mount.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-12 animate-narrative text-center">
                <h2 class="text-5xl font-black italic uppercase tracking-tighter text-white">L'Étranger d'Arsia</h2>
                <div class="prose prose-invert text-slate-400 leading-relaxed italic font-serif text-2xl space-y-8">
                    <p>"Mars n'est pas une destination. C'est une épreuve de patience que l'univers impose à ceux qui ont l'audace de s'évader. Ici, le ciel a la couleur du sang séché et l'air se mérite."</p>
                    <p>La capsule de survie est devenue votre monde entier. Six mètres carrés de métal hurlant, isolés dans le vide. Le silence est votre seul compagnon, jusqu'à ce que la première alerte ne brise cette harmonie funèbre.</p>
                </div>
                <button onclick="OxygenZero.start()" class="mt-10 px-16 py-6 bg-emerald-600 text-white rounded-full font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-700">
                    Ouvrir le premier chapitre
                </button>
            </div>
        `;
    },

    start() { this.requestEvent(); },

    requestEvent() {
        this.socket.emit('v4_get_event', { stats: this.stats });
    },

    renderOutcome(outcome, nextEvent) {
        this.mount.innerHTML = `
            <div class="animate-narrative space-y-12 max-w-3xl mx-auto">
                <div class="prose prose-invert text-emerald-400 text-3xl leading-relaxed italic font-serif border-l-8 border-emerald-900 pl-12 py-6 bg-emerald-950/5">
                    ${outcome}
                </div>
                <div class="flex justify-center pt-10">
                    <button id="btn-continue" class="group flex flex-col items-center gap-4 text-slate-600 hover:text-white transition-all">
                        <span class="text-[10px] font-black uppercase tracking-[0.6em]">Poursuivre le récit</span>
                        <div class="w-1 h-16 bg-slate-900 group-hover:bg-emerald-500 transition-all"></div>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('btn-continue').onclick = () => this.render(nextEvent);
    },

    render(event) {
        if (this.stats.o2 <= 0) return this.endGame("L'Asphyxie", "L'air devient une denrée mythique. Vos yeux se ferment sur un monde ocre, alors que votre dernier souffle se cristallise dans le froid.");
        if (this.stats.integrity <= 0) return this.endGame("Le Vide", "Le métal cède. Mars s'engouffre dans vos poumons avec la violence d'un météore. Tout s'efface.");
        if (this.stats.sol >= 15) return this.endGame("Le Retour", "Une ombre fend les nuages de poussière. La navette de secours. Vous avez survécu à l'impossible.", true);

        this.mount.innerHTML = `
            <div class="animate-narrative space-y-16 max-w-4xl mx-auto">
                <div class="flex justify-between items-center border-b border-white/5 pb-10">
                    <h2 class="text-8xl font-black italic text-white uppercase tracking-tighter">SOL ${this.stats.sol}</h2>
                    <div class="space-y-4 font-mono text-[10px] tracking-[0.3em] uppercase">
                        <div class="flex items-center gap-4 justify-end">
                            <span class="text-slate-500 text-right">Réserve O2</span>
                            <span class="${this.stats.o2 < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-500'} font-black">${this.stats.o2}%</span>
                        </div>
                        <div class="flex items-center gap-4 justify-end">
                            <span class="text-slate-500">Structure</span>
                            <span class="text-blue-400 font-black">${this.stats.integrity}%</span>
                        </div>
                    </div>
                </div>
                
                <div class="prose prose-invert text-slate-200 text-4xl leading-snug italic font-serif">
                    ${event.description}
                </div>
                
                <div class="grid grid-cols-1 gap-6 pt-12" id="options-list"></div>
            </div>
        `;

        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "group p-10 bg-slate-900/20 hover:bg-emerald-950/30 rounded-[3rem] text-left border border-white/5 transition-all duration-700 hover:border-emerald-500/40";
            btn.innerHTML = `
                <div class="space-y-4">
                    <div class="text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] opacity-0 group-hover:opacity-100 transition-all duration-500">Affronter les conséquences</div>
                    <div class="text-white text-2xl font-medium italic font-serif leading-tight group-hover:translate-x-2 transition-transform">${opt.text}</div>
                </div>
            `;
            btn.onclick = () => {
                this.stats.o2 += (opt.o2 || 0);
                this.stats.integrity += (opt.integrity || 0);
                this.stats.sol++;
                this.socket.emit('v4_get_event', { stats: this.stats, lastAction: opt.text });
            };
            this.mount.querySelector('#options-list').appendChild(btn);
        });
    },

    endGame(titre, texte, isWin = false) {
        this.mount.innerHTML = `
            <div class="text-center space-y-12 animate-narrative">
                <h2 class="text-9xl font-black italic uppercase tracking-tighter ${isWin ? 'text-emerald-500' : 'text-red-600'}">${titre}</h2>
                <p class="text-3xl text-slate-400 italic font-serif max-w-3xl mx-auto leading-relaxed px-10">${texte}</p>
                <button onclick="OxygenZero.init(null, document.getElementById('game-mount'))" class="mt-16 px-20 py-8 bg-white text-black font-black uppercase tracking-[0.5em] rounded-full hover:scale-105 transition-all">
                    Recommencer le cycle
                </button>
            </div>
        `;
    }
};
