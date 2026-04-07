const socket = io('https://lg-3f7p.onrender.com');
let gameState = { health: 100, water: 3, day: 1, inventory: [] };

function startGame() {
    const name = document.getElementById('username').value;
    if(!name) return alert("Nom requis !");
    
    document.getElementById('setup-view').classList.add('hidden');
    document.getElementById('event-view').classList.remove('hidden');
    document.getElementById('stats').classList.remove('hidden');
    
    nextDay();
}

function nextDay() {
    gameState.day++;
    // On demande un événement aléatoire au serveur
    socket.emit('get_event', { day: gameState.day });
}

socket.on('receive_event', (event) => {
    document.getElementById('event-title').innerText = event.title;
    document.getElementById('event-desc').innerText = event.description;
    document.getElementById('stat-day').innerText = gameState.day;
    
    const choiceContainer = document.getElementById('choices');
    choiceContainer.innerHTML = "";

    event.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "w-full p-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-left border border-white/5 transition-all";
        btn.innerText = opt.text;
        btn.onclick = () => makeChoice(opt.effect);
        choiceContainer.appendChild(btn);
    });
});

function makeChoice(effect) {
    // Appliquer les conséquences
    if(effect.health) gameState.health += effect.health;
    if(effect.water) gameState.water += effect.water;
    
    // Mise à jour UI
    document.getElementById('stat-health').innerText = gameState.health;
    document.getElementById('stat-water').innerText = gameState.water;

    if(gameState.health <= 0 || gameState.water < 0) {
        alert("Vous êtes mort au jour " + gameState.day);
        location.reload();
    } else {
        nextDay();
    }
}
