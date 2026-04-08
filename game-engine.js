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
        document.getElementById('game-internal-title').innerText = gameId.replace('-', ' ').toUpperCase();
    } catch (e) { alert("Erreur de chargement."); location.reload(); }
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
    const chance = scenario._config.randomChance || 0;
    if (stepId !== scenario._config.startStep && Math.random() < chance && scenario._events) {
        const keys = Object.keys(scenario._events);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        renderDisplay(scenario._events[randomKey], stepId);
    } else {
        renderDisplay(scenario[stepId]);
    }
}

function renderDisplay(step, resumeStepId = null) {
    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');
    let isGameOver = false;

    if (step.onEnter) {
        for (let s in step.onEnter) {
            if (s === "getItem") player.inventory.push(step.onEnter[s]);
            else if (player.stats.hasOwnProperty(s)) player.stats[s] += step.onEnter[s];
        }
    }

    for (let s in player.stats) {
        if (player.stats[s] <= 0) {
            textElement.innerHTML = `<div class="end-screen"><h2 class="end-title death">ÉCHEC</h2><p>${scenario._config.deathMessage}</p></div>`;
            isGameOver = true; break;
        }
    }

    if (!isGameOver && !resumeStepId && (!step.choices || step.choices.length === 0)) {
        textElement.innerHTML = `<div class="end-screen"><h2 class="end-title victory">SUCCÈS</h2><p>${step.text.replace(/\[NAME\]/g, player.name)}</p></div>`;
        isGameOver = true;
    }

    if (!isGameOver) {
        let statusUI = `<div style="display:flex; gap:15px; font-size:0.8rem; color:var(--accent); margin-bottom:20px; font-weight:bold; border-bottom:1px solid #333; padding-bottom:10px;">`;
        for (let s in player.stats) { statusUI += `<span>${scenario._config.statLabels[s] || s} : ${player.stats[s]}%</span> `; }
        statusUI += `</div>`;
        textElement.innerHTML = statusUI + step.text.replace(/\[NAME\]/g, player.name);
        choiceContainer.innerHTML = '';
        if (resumeStepId) {
            const btn = document.createElement('button'); btn.className = 'choice-btn'; btn.innerText = "Continuer...";
            btn.onclick = () => renderDisplay(scenario[resumeStepId]); choiceContainer.appendChild(btn);
        } else {
            step.choices.forEach(c => {
                if (!c.require || player.inventory.includes(c.require)) {
                    const btn = document.createElement('button'); btn.className = 'choice-btn'; btn.innerText = c.text;
                    btn.onclick = () => loadStep(c.next); choiceContainer.appendChild(btn);
                }
            });
        }
    } else {
        choiceContainer.innerHTML = `<button class="launch-btn" onclick="location.reload()">RETOURNER À L'ACCUEIL</button>`;
    }
    window.scrollTo(0, 0);
}
