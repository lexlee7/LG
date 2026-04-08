let scenario = null;
let player = { 
    name: "", 
    sex: "", 
    stats: {}, // Vide au départ, sera rempli par le JSON du jeu
    inventory: [] 
};

function searchGame() {
    let input = document.getElementById('gameSearch').value.toLowerCase();
    let cards = document.getElementsByClassName('game-card');
    for (let i = 0; i < cards.length; i++) {
        let title = cards[i].getAttribute('data-title').toLowerCase();
        cards[i].style.display = title.includes(input) ? "" : "none";
    }
}

async function loadGame(gameId) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'block';
    
    try {
        const response = await fetch(`${gameId}.json`);
        scenario = await response.json();
        document.getElementById('game-internal-title').innerText = gameId.replace('-', ' ').toUpperCase();
        
        // On prépare les stats définies dans le fichier du jeu
        player.stats = { ...scenario._config.initialStats };
        player.inventory = [];
    } catch (e) {
        alert("Erreur de chargement du jeu.");
        location.reload();
    }
}

function startGame() {
    const nameInput = document.getElementById('playerName').value;
    if (!nameInput) return alert("Veuillez entrer un nom.");

    player.name = nameInput;
    player.sex = document.getElementById('playerSex').value;

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('story-display').style.display = 'block';
    
    loadStep(scenario._config.startStep);
}

function loadStep(stepId) {
    const step = scenario[stepId];
    if (!step) return console.error("Étape manquante : " + stepId);

    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');

    // Appliquer les changements de stats (Oxygène, Santé, Froid, etc.)
    if (step.onEnter) {
        for (let stat in step.onEnter) {
            if (stat === "getItem") {
                player.inventory.push(step.onEnter[stat]);
            } else if (player.stats.hasOwnProperty(stat)) {
                player.stats[stat] += step.onEnter[stat];
            }
        }
    }

    // Vérifier si le joueur est mort (n'importe quelle stat tombe à 0)
    for (let stat in player.stats) {
        if (player.stats[stat] <= 0) {
            textElement.innerHTML = `<b style="color:var(--accent)">ÉCHEC :</b> Vos ressources sont épuisées. Votre aventure s'arrête ici...`;
            choiceContainer.innerHTML = '<button class="choice-btn" onclick="location.reload()">Retour au Menu</button>';
            return;
        }
    }

    // Afficher dynamiquement toutes les barres de stats du jeu actuel
    let statusUI = `<div style="display:flex; gap:20px; font-size:0.8rem; color:var(--accent); margin-bottom:20px; font-family:'Inter'; text-transform:uppercase; font-weight:bold;">`;
    statusUI += `<span>👤 ${player.name}</span>`;
    for (let stat in player.stats) {
        let label = scenario._config.statLabels[stat] || stat;
        statusUI += `<span>${label} : ${player.stats[stat]}%</span>`;
    }
    statusUI += `</div>`;

    let text = step.text.replace(/\[NAME\]/g, player.name).replace(/\[SEX\]/g, player.sex);
    textElement.innerHTML = statusUI + text;
    choiceContainer.innerHTML = '';

    // Afficher les choix
    step.choices.forEach(choice => {
        let canShow = true;
        if (choice.require && !player.inventory.includes(choice.require)) canShow = false;

        if (canShow) {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => loadStep(choice.next);
            choiceContainer.appendChild(btn);
        }
    });

    window.scrollTo(0, 0);
}
