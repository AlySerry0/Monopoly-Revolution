// client/js/socket.js

class SocketClient {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.currentGameState = null;
    }

    connect() {
        if (this.socket) return;

        this.socket = io({
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 20,
            reconnectionDelay: 1000,
            timeout: 20000
        });

        this.socket.on('connect', () => {
            console.log('Connected to server. Socket ID:', this.socket.id);
            if (this.roomId && window.app) {
                window.app.showToast('Reconnected to server!', 'success');
            }
        });

        this.socket.on('room-updated', (room) => {
            this.roomId = room.id;
            if (window.lobbyUI) window.lobbyUI.updateLobby(room);
        });

        this.socket.on('game-started', (gameState) => {
            this.currentGameState = gameState;
            if (window.app) window.app.showScreen('game');
            if (window.gameUI) window.gameUI.updateGameState(gameState);
        });

        this.socket.on('game-state-updated', (gameState) => {
            this.currentGameState = gameState;
            if (window.gameUI) window.gameUI.updateGameState(gameState);
        });

        this.socket.on('chat-message', (msg) => {
            if (window.lobbyUI) window.lobbyUI.addChatMessage(msg);
            if (window.gameUI) window.gameUI.addChatMessage(msg);
        });

        this.socket.on('error-msg', (errMsg) => {
            if (window.app) window.app.showToast(errMsg, 'error');
        });

        this.socket.on('connect_error', (err) => {
            console.warn('Socket connection error:', err.message);
        });

        this.socket.on('disconnect', (reason) => {
            console.warn('Socket disconnected. Reason:', reason);
            if (reason === 'io server disconnect') {
                this.socket.connect();
            }
        });
    }

    // Room Actions
    createRoom(playerName, token) {
        this.socket.emit('create-room', { playerName, token });
    }

    joinRoom(roomId, playerName, token) {
        this.socket.emit('join-room', { roomId, playerName, token });
    }

    toggleReady() {
        if (this.roomId) this.socket.emit('toggle-ready', { roomId: this.roomId });
    }

    selectToken(tokenId) {
        if (this.roomId) this.socket.emit('select-token', { roomId: this.roomId, tokenId });
    }

    startGame() {
        if (this.roomId) this.socket.emit('start-game', { roomId: this.roomId });
    }

    sendChat(text) {
        if (this.roomId) this.socket.emit('send-chat', { roomId: this.roomId, text });
    }

    // Game Actions
    rollDice() {
        if (this.roomId) this.socket.emit('roll-dice', { roomId: this.roomId });
    }

    makeBusChoice(choice) {
        if (this.roomId) this.socket.emit('bus-choice', { roomId: this.roomId, choice });
    }

    buyProperty() {
        if (this.roomId) this.socket.emit('buy-property', { roomId: this.roomId });
    }

    startAuction(spaceId) {
        if (this.roomId) this.socket.emit('start-auction', { roomId: this.roomId, spaceId });
    }

    placeBid(amount) {
        if (this.roomId) this.socket.emit('place-bid', { roomId: this.roomId, amount });
    }

    withdrawBid() {
        if (this.roomId) this.socket.emit('withdraw-bid', { roomId: this.roomId });
    }

    buildHouse(spaceId) {
        if (this.roomId) this.socket.emit('build-house', { roomId: this.roomId, spaceId });
    }

    sellHouse(spaceId) {
        if (this.roomId) this.socket.emit('sell-house', { roomId: this.roomId, spaceId });
    }

    mortgage(spaceId) {
        if (this.roomId) this.socket.emit('mortgage', { roomId: this.roomId, spaceId });
    }

    unmortgage(spaceId) {
        if (this.roomId) this.socket.emit('unmortgage', { roomId: this.roomId, spaceId });
    }

    payJail() {
        if (this.roomId) this.socket.emit('pay-jail', { roomId: this.roomId });
    }

    useJailCard() {
        if (this.roomId) this.socket.emit('use-jail-card', { roomId: this.roomId });
    }

    proposeTrade(toId, offerCash, offerProps, reqCash, reqProps) {
        if (this.roomId) {
            this.socket.emit('propose-trade', {
                roomId: this.roomId,
                toId,
                offerCash,
                offerProps,
                reqCash,
                reqProps
            });
        }
    }

    respondTrade(tradeId, accept) {
        if (this.roomId) this.socket.emit('respond-trade', { roomId: this.roomId, tradeId, accept });
    }

    endTurn() {
        if (this.roomId) this.socket.emit('end-turn', { roomId: this.roomId });
    }
}

window.socketClient = new SocketClient();
