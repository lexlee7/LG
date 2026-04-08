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
            <div class="max-w-2xl mx-auto space-y-8 animate-fade-in bg-slate-900/40 p-12 rounded-[3rem] border border-white/5">
                <h2 class="text-4xl font-black italic uppercase tracking-tighter text-white">Le Silence d'Arsia</h2>
                <div class="prose prose-invert text-slate-400 leading-relaxed italic font-serif text-xl space-y-6">
                    <p>"Mars n'est pas une planète, c'est un tombeau qui attend qu'on y fasse une erreur."</p>
                    <p>Le craquement du métal a été suivi d'un sifflement aigu, celui de votre vie qui s'échappe par une fissure invisible. Les voyants de bord clignotent comme des yeux fatigués. Vous êtes seul, et l'oxygène devient un luxe que vous ne pouvez plus vous offrir.</p>
                </div>
                <button onclick="OxygenZero.start()" class="w-full py-6 emerald-gradient rounded-2xl font-black uppercase tracking-[0.3em] shadow-2xl hover:brightness-110 transition-all">
                    Entrer dans la capsule
                </button>
            </div>
        `;
    },

    start() { this.requestEvent(); },

    requestEvent() {
        this.socket.emit('v4_get_event', { stats: this.stats });
    },

    render(event) {
        if (this.stats.o2 <= 0) return this.endGame("L'Oubli", "Vos poumons cherchent une substance qui n'existe plus. Mars vous absorbe dans son froid millénaire.");
        if (this.stats.integrity <= 0) return this.endGame("Déflagration", "La coque cède. En une fraction de seconde, vous ne faites plus qu'un avec le vide sidéral.");
        if (this.stats.sol >= 12) return this.endGame("Délivrance", "Une lueur fend le ciel ocre. La navette de secours. Vous avez survécu là où tout est mort.", true);

        this.mount.innerHTML = `
            <div class="animate-fade-in space-y-10">
                <div class="flex justify-between items-end border-b border-white/5 pb-8">
                    <div>
                        <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Séquence Chronologique</span>
                        <h2 class="text-6xl font-black italic text-white uppercase tracking-tighter">SOL ${this.stats.sol}</h2>
                    </div>
                    <div class="flex gap-10">
                        <div class="text-right">
                            <p class="text-[10px] font-bold text-slate-500 uppercase mb-2">Oxygène</p>
                            <div class="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-emerald-500 transition-all duration-1000" style="width: ${this.stats.o2}%"></div>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] font-bold text-slate-500 uppercase mb-2">Intégrité</p>
                            <div class="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-blue-500 transition-all duration-1000" style="width: ${this.stats.integrity}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="prose prose-invert text-slate-300 text-2xl leading-relaxed italic font-serif">
                    ${event.description}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4" id="options-list"></div>
            </div>
        `;

        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "group p-6 bg-slate-900/40 hover:bg-white hover:text-black rounded-3xl text-left border border-white/5 transition-all duration-500";
            btn.innerHTML = `<span class="font-bold uppercase tracking-tight">${opt.text}</span>`;
            btn.onclick = () => {
                this.stats.o2 += (opt.o2 || 0);
                this.stats.integrity += (opt.integrity || 0);
                this.stats.sol++;
                this.requestEvent();
            };
            this.mount.querySelector('#options-list').appendChild(btn);
        });
    },

    endGame(titre, texte, isWin = false) {
        this.mount.innerHTML = `
            <div class="text-center space-y-8 animate-fade-in">
                <h2 class="text-7xl font-black italic uppercase tracking-tighter ${isWin ? 'text-emerald-500' : 'text-red-600'}">${titre}</h2>
                <p class="text-2xl text-slate-400 italic font-serif max-w-xl mx-auto leading-relaxed">${texte}</p>
                <button onclick="OxygenZero.init(null, document.getElementById('game-mount'))" class="mt-8 px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-full hover:scale-110 transition-transform">
                    Recommencer l'histoire
                </button>
            </div>
        `;
    }
};
