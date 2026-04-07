const socket = io('https://lg-3f7p.onrender.com');

const Game = {
    state: { health: 100, water: 5, day: 1, name: "" },

    start() {
        const name = document.getElementById('player-name').value;
        if(!name) return alert("ENTREZ UN NOM VALIDE");
        this.state.name = name;
        
        document.getElementById('view-start').classList.add('hidden');
        document.getElementById('view-play').classList.remove('hidden');
        this.fetchEvent();
    },

    fetchEvent() {
        socket.emit('v4_get_event', { day: this.state.day });
    },

    updateUI(event) {
        document.getElementById('ui-day').innerText = this.state.day < 10 ? `0${this.state.day}` : this.state.day;
        document.getElementById('ui-title').innerText = event.title;
        document.getElementById('ui-desc').innerText = event.description;
        
        const container = document.getElementById('ui-choices');
        container.innerHTML = "";

        event.options.forEach(opt => {
            const b = document.createElement('button');
            b.className = "btn-action glass p-6 rounded-2xl text-left text-sm font-bold hover:text-white";
            b.innerText = opt.text;
            b.onclick = () => this.applyChoice(opt.effect);
            container.appendChild(b);
        });

        // Update bars
        document.getElementById('hp-bar').style.width = `${this.state.health}%`;
        document.getElementById('water-bar').style.width = `${this.state.water * 20}%`;
    },

    applyChoice(effect) {
        this.state.health += (effect.health || 0);
        this.state.water += (effect.water || 0);
        
        if(this.state.health <= 0 || this.state.water <= 0) {
            alert(`SÉQUENCE TERMINÉE. Survie : ${this.state.day} jours.`);
            location.reload();
        } else {
            this.state.day++;
            this.fetchEvent();
        }
    }
};

socket.on('v4_event_data', (data) => Game.updateUI(data));
