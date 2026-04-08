let scenario = null;
let player = { 
    name: "", 
    sex: "", 
    stats: { oxy: 100, health: 100 },
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
    } catch (e) {
        alert("Erreur de chargement du jeu.");
        location.reload();
    }
}

function startGame() {
    const nameInput = document.getElementById('playerName').value;
    if (!nameInput) return alert("Nom requis.");

    player.name = nameInput;
    player.sex = document.getElementById('playerSex').value;
    player.stats = { oxy: 100, health: 100 };
    player.inventory = [];

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('story-display').style.display = 'block';
    
    loadStep('reveil');
}

function loadStep(stepId) {
    const step = scenario[stepId];
    if (!step) return console.error("Étape manquante : " + stepId);

    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');

    // Appliquer les conséquences (si elles existent dans le JSON)
    if (step.onEnter) {
        if (step.onEnter.oxy) player.stats.oxy += step.onEnter.oxy;
        if (step.onEnter.health) player.stats.health += step.onEnter.health;
        if (step.onEnter.getItem) player.inventory.push(step.onEnter.getItem);
    }

    // Mort si stats à zéro
    if (player.stats.oxy <= 0 || player.stats.health <= 0) {
        textElement.innerHTML = "L'obscurité vous submerge. Vos forces vous lâchent définitivement au milieu du vide sidéral... <br><br><b>FIN : ÉCHEC DES SYSTÈMES VITAUX</b>";
        choiceContainer.innerHTML = '<button class="choice-btn" onclick="location.reload()">Retour au Menu</button>';
        return;
    }

    // Affichage des stats
    let statusUI = `<div style="font-size:0.9rem; color:var(--accent); margin-bottom:20px; font-family:'Inter'">
        🚀 ${player.name.toUpperCase()} | 🫁 OXYGÈNE : ${player.stats.oxy}% | ❤️ SANTÉ : ${player.stats.health}%
    </div>`;

    let text = step.text.replace(/\[NAME\]/g, player.name).replace(/\[SEX\]/g, player.sex);
    textElement.innerHTML = statusUI + text;
    choiceContainer.innerHTML = '';

    step.choices.forEach(choice => {
        // Vérification si le choix nécessite un objet spécial
        let canShow = true;
        if (choice.require && !player.inventory.includes(choice.require)) {
            canShow = false; 
        }

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
