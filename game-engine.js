let scenario = null;
let player = { name: "", sex: "", stats: {}, inventory: [] };

async function loadGame(gameId) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'block';
    try {
        const response = await fetch(`${gameId}.json`);
        scenario = await response.json();
        player.stats = { ...scenario._config.initialStats };
        player.inventory = [];
        document.getElementById('game-internal-title').innerText = gameId.toUpperCase();
    } catch (e) { alert("Erreur."); location.reload(); }
}

function startGame() {
    const nameInput = document.getElementById('playerName').value;
    if (!nameInput) return alert("Nom requis.");
    player.name = nameInput;
    player.sex = document.getElementById('playerSex').value;
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('story-display').style.display = 'block';
    loadStep(scenario._config.startStep);
}

function loadStep(stepId) {
    const step = scenario[stepId];
    if (!step) return;

    // MÉCANIQUE ALÉATOIRE GÉNÉRIQUE
    // Si le JSON dit qu'il y a une chance d'événement, le moteur l'exécute sans savoir ce que c'est.
    if (scenario._config.randomChance && Math.random() < scenario._config.randomChance && scenario._events) {
        const eventKeys = Object.keys(scenario._events);
        const randomEvent = scenario._events[eventKeys[Math.floor(Math.random() * eventKeys.length)]];
        renderDisplay(randomEvent, stepId); 
    } else {
        renderDisplay(step);
    }
}

function renderDisplay(step, resumeStepId = null) {
    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');

    if (step.onEnter) {
        for (let s in step.onEnter) {
            if (s === "getItem") player.inventory.push(step.onEnter[s]);
            else if (player.stats.hasOwnProperty(s)) player.stats[s] += step.onEnter[s];
        }
    }

    // Vérification de défaite universelle (si une stat tombe à 0)
    for (let s in player.stats) {
        if (player.stats[s] <= 0) {
            textElement.innerHTML = `<b style="color:var(--accent)">TERMINÉ :</b> ${scenario._config.deathMessage || "Vous avez échoué."}`;
            choiceContainer.innerHTML = '<button class="choice-btn" onclick="location.reload()">Retour au Menu</button>';
            return;
        }
    }

    // Affichage des stats dynamique
    let statusUI = `<div style="display:flex; gap:15px; font-size:0.8rem; color:var(--accent); margin-bottom:20px; font-weight:bold; border-bottom:1px solid #333; padding-bottom:10px;">`;
    for (let s in player.stats) {
        let label = scenario._config.statLabels[s] || s;
        statusUI += `<span>${label} : ${player.stats[s]}%</span> `;
    }
    statusUI += `</div>`;

    textElement.innerHTML = statusUI + step.text.replace(/\[NAME\]/g, player.name);
    choiceContainer.innerHTML = '';

    if (resumeStepId) {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = "Continuer...";
        btn.onclick = () => renderDisplay(scenario[resumeStepId]);
        choiceContainer.appendChild(btn);
    } else {
        step.choices.forEach(choice => {
            if (!choice.require || player.inventory.includes(choice.require)) {
                const btn = document.createElement('button');
                btn.className = 'choice-btn';
                btn.innerText = choice.text;
                btn.onclick = () => loadStep(choice.next);
                choiceContainer.appendChild(btn);
            }
        });
    }
}
