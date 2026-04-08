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
            <div class="max-w-3xl mx-auto space-y-8 animate-fade-in bg-slate-900/60 p-16 rounded-[4rem] border border-white/5 shadow-2xl">
                <h2 class="text-4xl font-black italic uppercase tracking-tighter text-emerald-500">Le Chant des Poussières</h2>
                <div class="prose prose-invert text-slate-300 leading-relaxed italic font-serif text-xl space-y-6">
                    <p>"L'espace n'est pas vide. Il est rempli d'une indifférence glaciale qui finit par vous dévorer, millimètre par millimètre. Ici, sur Arsia Mons, l'oxygène n'est pas un gaz, c'est une monnaie que l'on dépense avec la peur au ventre."</p>
                    <p>Le module de survie gémit sous l'assaut du vent martien. Une alarme lointaine, presque timide, signale une chute de pression. Votre main tremble sur le levier de secours. L'aventure ne commence pas par un exploit, mais par un souffle que l'on retient.</p>
                </div>
                <button onclick="OxygenZero.start()" class="w-full py-6 bg-white text-black rounded-2xl font-black uppercase tracking-[0.4em] hover:bg-emerald-500 hover:text-white transition-all duration-500">
                    S'abandonner au destin
                </button>
            </div>
        `;
    },

    start() { this.requestEvent(); },

    requestEvent() {
        this.socket.emit('v4_get_event', { stats: this.stats });
    },

    // Affiche les conséquences littéraires d'un choix
    renderOutcome(outcome, nextEvent) {
        this.mount.innerHTML = `
            <div class="animate-fade-in space-y-10 max-w-3xl mx-auto">
                <div class="prose prose-invert text-emerald-400 text-2xl leading-relaxed italic font-serif border-l-4 border-emerald-500 pl-8 py-4">
                    ${outcome}
                </div>
                <div class="flex justify-center">
                    <button id="btn-continue" class="group flex items-center gap-4 text-slate-500 hover:text-white transition-colors">
                        <span class="text-[10px] font-black uppercase tracking-[0.5em]">Laisser le temps s'écouler</span>
                        <div class="w-12 h-px bg-slate-800 group-hover:w-20 group-hover:bg-emerald-500 transition-all"></div>
                    </button>
                </div>
            </div>
        `;
        document.getElementById('btn-continue').onclick = () => this.render(nextEvent);
    },

    render(event) {
        if (this.stats.o2 <= 0) return this.endGame("L'Oubli", "Vos poumons s'immobilisent, vaincus. Mars vous accueille dans sa poussière ocre. Vous n'êtes plus qu'une ombre parmi les cratères.");
        if (this.stats.integrity <= 0) return this.endGame("Déflagration", "La cloison cède dans un cri de métal déchiré. Le vide vous réclame avec une violence absolue.");
        if (this.stats.sol >= 15) return this.endGame("L'Aurore", "Un signal. Une ombre dans le ciel. La Terre a fini par se souvenir de ses enfants égarés.", true);

        this.mount.innerHTML = `
            <div class="animate-fade-in space-y-12 max-w-4xl mx-auto">
                <div class="flex justify-between items-center border-b border-white/5 pb-8">
                    <h2 class="text-7xl font-black italic text-white uppercase tracking-tighter">SOL ${this.stats.sol}</h2>
                    <div class="flex gap-8 text-right font-mono text-[10px] tracking-widest uppercase">
                        <div class="${this.stats.o2 < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-500'}">O2 // ${this.stats.o2}%</div>
                        <div class="text-blue-400">COQUE // ${this.stats.integrity}%</div>
                    </div>
                </div>
                
                <div class="prose prose-invert text-slate-300 text-3xl leading-snug italic font-serif">
                    ${event.description}
                </div>
                
                <div class="grid grid-cols-1 gap-6 pt-10" id="options-list"></div>
            </div>
        `;

        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "group p-8 bg-slate-900/30 hover:bg-emerald-950/40 rounded-[2rem] text-left border border-white/5 transition-all duration-700 hover:border-emerald-500/50";
            btn.innerHTML = `
                <div class="space-y-2">
                    <div class="text-emerald-500 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Engager l'action</div>
                    <div class="text-white text-xl font-bold italic font-serif leading-tight">${opt.text}</div>
                </div>
            `;
            btn.onclick = () => {
                this.stats.o2 += (opt.o2 || 0);
                this.stats.integrity += (opt.integrity || 0);
                this.stats.sol++;
                // On simule la récupération du prochain événement via le serveur
                this.socket.emit('v4_get_event', { stats: this.stats, lastAction: opt.text });
            };
            this.mount.querySelector('#options-list').appendChild(btn);
        });
    },

    endGame(titre, texte, isWin = false) {
        this.mount.innerHTML = `
            <div class="text-center space-y-12 animate-fade-in">
                <h2 class="text-8xl font-black italic uppercase tracking-tighter ${isWin ? 'text-emerald-500' : 'text-red-600'}">${titre}</h2>
                <p class="text-3xl text-slate-400 italic font-serif max-w-2xl mx-auto leading-relaxed">${texte}</p>
                <button onclick="OxygenZero.init(null, document.getElementById('game-mount'))" class="mt-12 px-16 py-6 bg-white text-black font-black uppercase tracking-[0.4em] rounded-full hover:scale-105 transition-transform">
                    Recommencer le cycle
                </button>
            </div>
        `;
    }
};
