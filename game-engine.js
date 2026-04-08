let scenario = null;
let player = { name: "", sex: "" };

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
    
    // On charge le fichier correspondant au jeu
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
    if (!nameInput) {
        alert("Le commandant doit avoir un nom.");
        return;
    }

    player.name = nameInput;
    player.sex = document.getElementById('playerSex').value;

    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('story-display').style.display = 'block';
    
    loadStep('intro');
}

function loadStep(stepId) {
    const step = scenario[stepId];
    if (!step) return;

    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');

    // On remplace les balises de personnalisation
    let text = step.text.replace(/\[NAME\]/g, player.name);
    text = text.replace(/\[SEX\]/g, player.sex);
    
    textElement.innerHTML = text;
    choiceContainer.innerHTML = '';

    step.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.text;
        btn.onclick = () => loadStep(choice.next);
        choiceContainer.appendChild(btn);
    });

    // Remonter en haut de page pour la lecture
    window.scrollTo(0, 0);
}
