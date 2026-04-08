// ... (gardez le début identique jusqu'à la fonction render)

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
        choiceEl.innerHTML = `<button class="launch-btn" onclick="location.reload()">RETOUR AU HUB CENTRAL</button>`;
    } else if (!resumeId && (!step.choices || step.choices.length === 0)) {
        textEl.innerHTML = `
            <div class="end-screen">
                <h1 class="end-title victory-title">SUCCÈS</h1>
                <p style="font-size:1.2rem; color:#8b949e;">${step.text.replace(/\[NAME\]/g, player.name)}</p>
            </div>`;
        choiceEl.innerHTML = `<button class="launch-btn" onclick="location.reload()">RETOUR AU HUB CENTRAL</button>`;
    } else {
        let ui = `<div style="display:flex; gap:20px; color:var(--accent); font-weight:bold; margin-bottom:30px; font-size:0.9rem; letter-spacing:1px;">`;
        for (let s in player.stats) { ui += `<span>● ${scenario._config.statLabels[s] || s}: ${player.stats[s]}%</span>`; }
        textEl.innerHTML = ui + "</div>" + `<div class="story-text">${step.text.replace(/\[NAME\]/g, player.name)}</div>`;
        choiceEl.innerHTML = '';
        if (resumeId) {
            const b = document.createElement('button'); b.className='choice-btn'; b.innerText="SÉQUENCE SUIVANTE...";
            b.onclick=()=>render(scenario[resumeId]); choiceEl.appendChild(b);
        } else {
            step.choices.forEach(c => {
                if(!c.require || player.inventory.includes(c.require)) {
                    const b = document.createElement('button'); b.className='choice-btn'; b.innerText=c.text;
                    b.onclick=()=>loadStep(c.next); choiceEl.appendChild(b);
                }
            });
        }
    }
}
