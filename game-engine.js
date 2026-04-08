let scenario = null;
let player = { name: "", sex: "", stats: {}, inventory: [] };

async function loadGame(id) {
    document.getElementById('home-view').style.display = 'none';
    document.getElementById('game-view').style.display = 'block';
    
    try {
        const res = await fetch(`${id}.json`);
        scenario = await res.json();
        player.stats = { ...scenario._config.initialStats };
        player.inventory = [];
        document.getElementById('game-title').innerText = id.replace('-', ' ').toUpperCase();
        document.getElementById('setup').style.display = 'block';
        document.getElementById('display').style.display = 'none';
    } catch (e) { 
        window.location.reload(); 
    }
}

function startGame() {
    const n = document.getElementById('pName').value;
    if(!n) return alert("Identifiant requis.");
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
    } else { render(scenario[id]); }
}

function render(step, resumeId = null) {
    const textEl = document.getElementById('text');
    const choiceEl = document.getElementById('choices');
    let dead = false;

    if (step.onEnter) {
        for (let s in step.onEnter) {
            if (s === "getItem") player.inventory.push(step.onEnter[s]);
            else if (player.stats.hasOwnProperty(s)) player.stats[s] += step.onEnter[s];
        }
    }

    for (let s in player.stats) { if (player.stats[s] <= 0) dead = true; }

    if (dead) {
        textEl.innerHTML = `
            <div class="end-screen">
                <h1 class="end-title death-title">ÉCHEC</h1>
                <p style="font-size:1.2rem; color:#8b949e;">${scenario._config.deathMessage}</p>
            </div>`;
        choiceEl.innerHTML = `<button class="launch-btn" onclick="window.location.reload()">RETOURNER À L'ACCUEIL</button>`;
    } else if (!resumeId && (!step.choices || step.choices.length === 0)) {
        textEl.innerHTML = `
            <div class="end-screen">
                <h1 class="end-title victory-title">SUCCÈS</h1>
                <p style="font-size:1.2rem; color:#8b949e;">${step.text.replace(/\[NAME\]/g, player.name)}</p>
            </div>`;
        choiceEl.innerHTML = `<button class="launch-btn" onclick="window.location.reload()">RETOURNER À L'ACCUEIL</button>`;
    } else {
        // Barre de stats moderne
        let ui = `<div class="stats-bar">`;
        for (let s in player.stats) { 
            ui += `<div class="stat-pill">${scenario._config.statLabels[s] || s}: <span>${player.stats[s]}%</span></div>`; 
        }
        ui += `</div>`;

        // Conteneur de texte avec lettrine
        textEl.innerHTML = ui + `
            <div class="story-box">
                <div class="story-text">${step.text.replace(/\[NAME\]/g, player.name)}</div>
            </div>`;
        
        choiceEl.innerHTML = '';
        if (resumeId) {
            const b = document.createElement('button'); b.className='choice-btn'; b.innerText="CONTINUER LA SÉQUENCE...";
            b.onclick = () => render(scenario[resumeId]); choiceEl.appendChild(b);
        } else {
            step.choices.forEach(c => {
                if(!c.require || player.inventory.includes(c.require)) {
                    const b = document.createElement('button'); b.className='choice-btn'; b.innerText = c.text;
                    b.onclick = () => loadStep(c.next); choiceEl.appendChild(b);
                }
            });
        }
    }
    document.querySelector('.content').scrollTop = 0;
}
