const socket = io('https://lg-3f7p.onrender.com');

const Portal = {
    showView(id) {
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`view-${id}`).classList.remove('hidden');
    },

    selectGame(id) {
        if (id === 'oxygen-zero') {
            this.showView('game');
            OxygenZero.init();
        }
    }
};

const OxygenZero = {
    day: 1,
    init() {
        this.day = 1;
        socket.emit('v4_get_event', { day: this.day });
    },
    render(event) {
        const mount = document.getElementById('game-mount');
        mount.innerHTML = `
            <div class="flex justify-between items-center mb-10 border-b border-white/5 pb-8">
                <div>
                    <h2 class="text-4xl font-black italic uppercase tracking-tighter text-emerald-500">SOL ${this.day}</h2>
                    <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1">Séquence de survie active</p>
                </div>
                <button onclick="Portal.showView('browser')" class="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Quitter ×</button>
            </div>
            
            <div class="mb-12">
                <h3 class="text-2xl font-bold mb-5 text-white uppercase tracking-tight">${event.title}</h3>
                <p class="text-slate-400 text-xl leading-relaxed font-medium">${event.description}</p>
            </div>
            
            <div class="grid grid-cols-1 gap-4">
                ${event.options.map((opt, i) => `
                    <button onclick="OxygenZero.next()" class="group relative p-6 bg-slate-900/50 hover:bg-emerald-600 rounded-2xl text-left transition-all border border-white/5 overflow-hidden">
                        <div class="relative z-10 flex justify-between items-center">
                            <span class="font-bold text-lg group-hover:text-white transition-colors">${opt.text}</span>
                            <span class="text-[10px] font-black opacity-30 group-hover:opacity-100 uppercase tracking-tighter">Action ${i+1}</span>
                        </div>
                    </button>
                `).join('')}
            </div>
        `;
    },
    next() {
        this.day++;
        socket.emit('v4_get_event', { day: this.day });
    }
};

socket.on('v4_event_data', (data) => OxygenZero.render(data));
