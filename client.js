const socket = io('https://lg-3f7p.onrender.com');

// Import des modules de jeux
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

// Écoute globale des événements socket pour les rediriger vers le jeu actif
socket.on('v4_event_data', (data) => {
    // On vérifie si le module OxygenZero est celui qui doit traiter la donnée
    OxygenZero.render(data);
});

// On expose Portal à la fenêtre globale pour les "onclick" du HTML
window.Portal = Portal;
