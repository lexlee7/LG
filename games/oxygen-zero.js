export const OxygenZero = {
    day: 1,
    socket: null,
    mount: null,

    init(socket, mount) {
        this.socket = socket;
        this.mount = mount;
        this.day = 1;
        this.requestEvent();
    },

    requestEvent() {
        this.socket.emit('v4_get_event', { day: this.day });
    },

    render(event) {
        this.mount.innerHTML = `
            <div class="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
                <div>
                    <h2 class="text-4xl font-black italic uppercase tracking-tighter text-emerald-500">SOL ${this.day}</h2>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">O2 Status: Critique</p>
                </div>
                <button onclick="Portal.showView('browser')" class="text-xs font-bold text-slate-500 hover:text-white transition-colors">QUITTER ×</button>
            </div>
            
            <div class="mb-12">
                <h3 class="text-2xl font-bold mb-4 text-white uppercase">${event.title}</h3>
                <p class="text-slate-400 text-xl leading-relaxed font-medium">${event.description}</p>
            </div>
            
            <div class="grid grid-cols-1 gap-4" id="game-options"></div>
        `;

        // Injection propre des boutons avec écouteurs d'événements
        const container = this.mount.querySelector('#game-options');
        event.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = "w-full p-6 bg-slate-900/50 hover:bg-emerald-600 rounded-2xl text-left border border-white/5 transition-all font-bold group";
            btn.innerHTML = `
                <div class="flex justify-between items-center">
                    <span>${opt.text}</span>
                    <span class="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">EXÉCUTER →</span>
                </div>
            `;
            btn.onclick = () => this.next();
            container.appendChild(btn);
        });
    },

    next() {
        this.day++;
        this.requestEvent();
    }
};
