const Core = {
    socket: io('https://lg-3f7p.onrender.com'),
    user: null,
    gameId: null,
    version: "3.0.0",

    init() {
        this.socket.on('room_update', (data) => this.onRoomUpdate(data));
        this.socket.on('connect_error', () => console.error("Erreur serveur"));
        console.log(`Core v${this.version} ready.`);
    },

    showPage(id) {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-' + id).classList.add('active');
    },

    login() {
        const name = document.getElementById('auth-user').value;
        if(!name) return;
        this.user = { name: name };
        document.getElementById('user-display').innerText = `${name} | v${this.version}`;
        document.getElementById('auth-modal').classList.add('hidden');
    },

    openLobby(gid) {
        if(!this.user) return document.getElementById('auth-modal').classList.remove('hidden');
        this.gameId = gid;
        this.showPage('lobby');
    },

    createRoom() {
        this.socket.emit('v3_create', { gameId: this.gameId, username: this.user.name });
    },

    joinRoom() {
        const code = document.getElementById('room-input').value.toUpperCase().trim();
        if(code) this.socket.emit('v3_join', { code, username: this.user.name });
    },

    onRoomUpdate(data) {
        this.showPage('game');
        const mount = document.getElementById('game-mount-point');
        
        // Délégation au module de jeu (ex: LiarModule)
        if (data.gameId === 'liar') {
            if (!document.getElementById('liar-root')) {
                mount.innerHTML = LiarModule.render(data);
                LiarModule.init(this.socket, this.user.name);
            }
            LiarModule.update(data);
        }
    }
};

Core.init();
