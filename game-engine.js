let scenario = null;
let player = { name: "", sex: "", stats: {}, inventory: [] };

async function loadGame(id) {
    const home = document.getElementById('home-view');
    const game = document.getElementById('game-view');
    home.style.display = 'none';
    game.style.display = 'block';
    
    try {
        const res = await fetch(`${id}.json`);
        scenario = await res.json();
        player.stats = { ...scenario._config.initialStats };
        player.inventory = [];
        document.getElementById('game-title').innerText = id.replace('-', ' ').toUpperCase();
        document.getElementById('setup').style.display = 'block';
        document.getElementById('display').style.display = 'none';
    } catch (e) { 
        console.error(e);
        window.location.reload(); 
    }
}

function startGame() {
    const n = document.getElementById('pName').value;
    if(!n) return alert("Veuillez entrer un nom.");
    player.name = n;
    player.sex = document.getElementById('pSex').value;
    document.getElementById('setup').style.display = 'none';
    document.getElementById('display').style.display = 'block';
    loadStep(scenario._config.startStep);
}

function loadStep(id) {
    const chance = scenario._config.randomChance || 0;
    if (id !== scenario._config.startStep && Math.random() < chance && scenario._events) {
        const keys = Object.keys(scenario._events);
        render(scenario._events[keys[Math.floor(Math.random() * keys.length)]], id);
    } else { 
        render(scenario[id]); 
    }
}

function render(step, resumeId = null) {
    const textEl = document.getElementById('text');
    const choiceEl = document.getElementById('choices');
    let isDead = false;

    // Gestion des modifications de stats et d'inventaire
    if (step.onEnter) {
        for (let s in step.onEnter) {
            if (s === "getItem") {
                player.inventory.push(step.onEnter[s]);
            } else if (player.stats.hasOwnProperty(s)) {
                player.stats[s] += step.onEnter[s];
            }
        }
    }

    // Vérification de la mort
    for (let s in player.stats) { 
        if (player.stats[s] <= 0) {
            isDead = true; 
            break;
        }
    }

    if (isDead) {
        textEl.innerHTML = `
            <div class="end-screen">
                <h1 class="end-title death-title">ÉCHEC</h1>
                <p style="font-size:1.1rem; color:#8b949e;">${scenario._config.deathMessage}</p>
            </div>`;
        // Bouton de sortie forcé
        choiceEl.innerHTML = `<button class="launch-btn" onclick="window.location.reload()">RETOURNER À L'ACCUEIL</button>`;
        return; // On arrête le rendu ici
    } 

    // Vérification de la victoire (plus de choix disponibles dans le JSON)
    if (!resumeId && (!step.choices || step.choices.length === 0)) {
        textEl.innerHTML = `
            <div class="end-screen">
                <h1 class="end-title victory-title">SUCCÈS</h1>
                <p style="font-size:1.1rem; color:#8b949e;">${step.text.replace(/\[NAME\]/g, player.name)}</p>
            </div>`;
        // Bouton de sortie forcé
        choiceEl.innerHTML = `<button class="launch-btn" onclick="window.location.reload()">RETOURNER À L'ACCUEIL</button>`;
        return;
    }

    // Rendu d'une étape normale
    let ui = `<div style="color:var(--accent); font-weight:bold; margin-bottom:20px; font-size:0.85rem; letter-spacing:1px; border-bottom:1px solid #333; padding-bottom:10px;">`;
    for (let s in player.stats) { 
        ui += `${scenario._config.statLabels[s] || s}: ${player.stats[s]}% | `; 
    }
    textEl.innerHTML = ui + "</div>" + `<div class="story-text">${step.text.replace(/\[NAME\]/g, player.name)}</div>`;
    
    choiceEl.innerHTML = '';
    if (resumeId) {
        const b = document.createElement('button'); 
        b.className = 'choice-btn'; 
        b.innerText = "CONTINUER...";
        b.onclick = () => render(scenario[resumeId]); 
        choiceEl.appendChild(b);
    } else {
        step.choices.forEach(c => {
            if(!c.require || player.inventory.includes(c.require)) {
                const b = document.createElement('button'); 
                b.className = 'choice-btn'; 
                b.innerText = c.text;
                b.onclick = () => loadStep(c.next); 
                choiceEl.appendChild(b);
            }
        });
    }
    // Scroll automatique vers le haut pour chaque nouvelle étape
    document.querySelector('.content').scrollTop = 0;
}
