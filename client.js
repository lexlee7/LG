const socket = io('https://lg-3f7p.onrender.com');

const Portal = {
    user: null,
    selectedGameId: null,

    init() {
        // Gestion globale de la touche Entrée
        window.addEventListener('keydown', (e) => {
            if (e.key === "Enter") {
                const activeView = document.querySelector('section:not(.hidden)');
                if (activeView.id === "view-auth") this.confirmAuth();
            }
        });
    },

    showView(id) {
        document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
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
        if (val.length < 2) return alert("Pseudo trop court");
        this.user = val;
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

// --- MODULE DU PREMIER JEU: 60 SECONDES ---
const SurvivalGame = {
    day: 1,
    stats: { health: 100, water: 5 },

    init() {
        this.day = 1;
        this.stats = { health: 100, water: 5 };
        this.getNewEvent();
    },

    getNewEvent() {
        socket.emit('v4_get_event', { day: this.day });
    },

    render(event) {
        const mount = document.getElementById('game-mount');
        mount.innerHTML = `
            <div class="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
                <div>
                    <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Expérience 60s</span>
                    <h2 class="text-3xl font-black italic uppercase">Jour ${this.day}</h2>
                </div>
                <div class="text-right">
                    <span class="block text-[10px] text-slate-500 font-bold uppercase mb-2">État Vital</span>
                    <div class="flex gap-1">
                        ${this.renderBars()}
                    </div>
                </div>
            </div>
            
            <div class="mb-12">
                <h3 class="text-2xl font-bold mb-4 text-emerald-500 tracking-tight">${event.title}</h3>
                <p class="text-slate-300 text-lg leading-relaxed">${event.description}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${event.options.map((opt, i) => `
                    <button onclick="SurvivalGame.handleChoice(${i})" 
                            class="p-6 bg-slate-800/50 hover:bg-emerald-600 rounded-2xl text-left font-bold transition-all border border-white/5 group">
                        <span class="block text-[10px] text-emerald-500 group-hover:text-emerald-200 mb-1">OPTION ${i+1}</span>
                        ${opt.text}
                    </button>
                `).join('')}
            </div>
        `;
    },

    renderBars() {
        // Barre de santé
        const hp = `<div class="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-emerald-500" style="width:${this.stats.health}%"></div></div>`;
        const water = `<div class="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-cyan-500" style="width:${this.stats.water*20}%"></div></div>`;
        return hp + water;
    },

    handleChoice(index) {
        // Simulation d'effet pour l'instant (le serveur pourra le faire plus tard)
        // Dans une version finale, on envoie le choix au serveur pour validation
        this.day++;
        this.getNewEvent();
    }
};

socket.on('v4_event_data', (data) => SurvivalGame.render(data));
Portal.init();
