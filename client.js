const socket = io('https://lg-3f7p.onrender.com');

import { OxygenZero } from './games/oxygen-zero.js';

const Portal = {
    mount: document.getElementById('game-mount'),

    showView(id) {
        document.querySelectorAll('main section').forEach(s => s.classList.add('hidden'));
        document.getElementById(`view-${id}`).classList.remove('hidden');
    },

    selectGame(id) {
        if (id === 'oxygen-zero') {
            this.showView('game');
            OxygenZero.init(socket, this.mount);
        }
    }
};

// Écouteur pour les nouveaux événements
socket.on('v4_event_data', (data) => {
    OxygenZero.render(data);
});

// Écouteur pour les conséquences littéraires
socket.on('v4_event_outcome', (data) => {
    OxygenZero.renderOutcome(data.outcome, data.nextEvent);
});

window.Portal = Portal;
window.OxygenZero = OxygenZero;
