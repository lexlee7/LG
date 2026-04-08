function renderDisplay(step, resumeStepId = null) {
    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');
    let isGameOver = false;

    // 1. Application des stats
    if (step.onEnter) {
        for (let s in step.onEnter) {
            if (s === "getItem") player.inventory.push(step.onEnter[s]);
            else if (player.stats.hasOwnProperty(s)) player.stats[s] += step.onEnter[s];
        }
    }

    // 2. Vérification de la Mort
    for (let s in player.stats) {
        if (player.stats[s] <= 0) {
            textElement.innerHTML = `
                <div class="end-screen">
                    <h2 class="end-title death">ÉCHEC</h2>
                    <p class="story-text">${scenario._config.deathMessage || "Votre aventure s'arrête ici..."}</p>
                </div>`;
            isGameOver = true;
            break;
        }
    }

    // 3. Vérification de la Victoire (plus de choix dans le JSON et pas mort)
    if (!isGameOver && !resumeStepId && (!step.choices || step.choices.length === 0)) {
        textElement.innerHTML = `
            <div class="end-screen">
                <h2 class="end-title victory">SUCCÈS</h2>
                <p class="story-text">${step.text.replace(/\[NAME\]/g, player.name)}</p>
                <div class="end-stats">Félicitations, vous avez survécu à l'impossible.</div>
            </div>`;
        isGameOver = true;
    }

    // 4. Affichage Standard si le jeu continue
    if (!isGameOver) {
        let statusUI = `<div style="display:flex; gap:15px; font-size:0.8rem; color:var(--accent); margin-bottom:20px; font-weight:bold; border-bottom:1px solid #333; padding-bottom:10px;">`;
        for (let s in player.stats) {
            statusUI += `<span>${scenario._config.statLabels[s] || s} : ${player.stats[s]}%</span> `;
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
    } else {
        // Bouton unique pour TOUTES les fins (Mort ou Victoire)
        choiceContainer.innerHTML = `<button class="launch-btn" onclick="location.reload()" style="margin-top:20px;">RETOURNER À L'ACCUEIL</button>`;
    }
    window.scrollTo(0, 0);
}
