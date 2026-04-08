let scenario = null;
let player = { name: "", sex: "" };

async function startGame() {
    const nameInput = document.getElementById('playerName').value;
    if (!nameInput) return alert("Veuillez entrer un pseudo");

    player.name = nameInput;
    player.sex = document.getElementById('playerSex').value;

    // Chargement du fichier JSON d'Oxygen-Zero
    try {
        const response = await fetch('oxygen-zero.json');
        scenario = await response.json();
        
        document.getElementById('setup').style.display = 'none';
        document.getElementById('story-display').style.display = 'block';
        
        loadStep('intro');
    } catch (e) {
        console.error("Erreur de chargement du scénario", e);
    }
}

function loadStep(stepId) {
    const step = scenario[stepId];
    const textElement = document.getElementById('text-content');
    const choiceContainer = document.getElementById('choices');

    // Personnalisation du texte avec le pseudo (on remplace [NAME] dans le JSON)
    let processedText = step.text.replace(/\[NAME\]/g, player.name);
    
    // On efface le contenu précédent
    textElement.innerHTML = processedText;
    choiceContainer.innerHTML = '';

    // Création des boutons de choix
    step.choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerText = choice.text;
        btn.onclick = () => loadStep(choice.next);
        choiceContainer.appendChild(btn);
    });
}
