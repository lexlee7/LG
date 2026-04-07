const socket = io('https://lg-3f7p.onrender.com');

const Portal = {
    user: null,
    selectedGameId: null,

    init() {
        // Validation par touche Entrée
        window.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                const authView = document.getElementById('view-auth');
                if (!authView.classList.contains('hidden')) {
                    this.confirmAuth();
                }
            }
        });
        console.log("Portal v4.2 Ready");
    },

    showView(id) {
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`view-${id}`).classList.remove('hidden');
    },

    selectGame(id) {
        this.selectedGameId = id;
        if (!this.user) {
            this.showView('auth');
            document.getElementById('in-user').focus();
        } else {
            this.launchGame();
        }
    },

    confirmAuth() {
        const val = document.getElementById('in-user').value.trim();
        if (val.length < 2) return;
        this.user = val;
        
        // UI Update
        document.getElementById('user-pill').classList.remove('hidden');
        document.getElementById('nav-user').innerText = this.user;
        this.launchGame();
    },

    launchGame() {
        this.showView('game');
        if (this.selectedGameId === '60s') {
            SurvivalGame.init();
        }
    }
};

// Logique simplifiée pour le jeu 60s
const SurvivalGame = {
    day: 1,
    init() {
        this.day = 1;
        socket.emit('v4_get_event', { day: this.day });
    },
    render(event) {
        const mount = document.getElementById('game-mount');
        mount.innerHTML = `
            <div class="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <h2 class="text-3xl font-black italic uppercase tracking-tighter text-emerald-500">JOUR ${this.day}</h2>
                <div class="text-[10px] bg-white/5 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-slate-500">Survie Alpha</div>
            </div>
            <div class="mb-10">
                <h3 class="text-2xl font-bold mb-4 tracking-tight">${event.title}</h3>
                <p class="text-slate-400 text-lg leading-relaxed">${event.description}</p>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${event.options.map((opt, i) => `
                    <button onclick="SurvivalGame.next()" class="p-6 bg-slate-900/50 hover:bg-emerald-600 rounded-2xl text-left font-bold transition-all border border-white/5 group">
                        <span class="block text-[10px] text-emerald-500 group-hover:text-white mb-2 uppercase tracking-widest">Choix ${i+1}</span>
                        ${opt.text}
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

socket.on('v4_event_data', (data) => SurvivalGame.render(data));
Portal.init();
