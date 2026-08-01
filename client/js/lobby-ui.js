// client/js/lobby-ui.js

class LobbyUI {
    constructor() {
        this.room = null;
        this.initListeners();
    }

    initListeners() {
        document.getElementById('btn-copy-code').onclick = () => {
            if (this.room) {
                navigator.clipboard.writeText(this.room.id);
                window.app.showToast('Room code copied to clipboard!', 'success');
            }
        };

        document.getElementById('btn-toggle-ready').onclick = () => {
            window.soundManager.playClick();
            window.socketClient.toggleReady();
        };

        document.getElementById('btn-start-game').onclick = () => {
            window.soundManager.playClick();
            window.socketClient.startGame();
        };

        document.getElementById('btn-leave-lobby').onclick = () => {
            window.soundManager.playClick();
            location.reload();
        };

        // Lobby chat
        const sendChat = () => {
            const input = document.getElementById('lobby-chat-input');
            const text = input.value.trim();
            if (text) {
                window.socketClient.sendChat(text);
                input.value = '';
            }
        };

        document.getElementById('btn-send-lobby-chat').onclick = sendChat;
        document.getElementById('lobby-chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') sendChat();
        };
    }

    updateLobby(room) {
        this.room = room;
        window.app.showScreen('lobby');

        document.getElementById('lobby-room-code').innerText = room.id;
        document.getElementById('lobby-player-count').innerText = room.players.length;

        const myId = window.socketClient.socket ? window.socketClient.socket.id : null;
        const me = room.players.find(p => p.id === myId);

        // Update player cards
        const list = document.getElementById('lobby-player-list');
        list.innerHTML = '';
        room.players.forEach(p => {
            const tokenMeta = TOKENS.find(t => t.id === p.token) || TOKENS[0];
            const isYou = p.id === myId;
            const card = document.createElement('div');
            card.className = `player-card ${isYou ? 'is-you' : ''}`;
            card.innerHTML = `
                <div class="player-token-icon" style="border-color:${tokenMeta.color}">${tokenMeta.icon}</div>
                <div class="player-info">
                    <div class="player-name">
                        ${p.name} ${p.isHost ? '<span class="host-badge">HOST</span>' : ''}
                    </div>
                    <div class="ready-status ${p.ready ? 'is-ready' : ''}">
                        ${p.ready ? '✓ READY' : '• NOT READY'}
                    </div>
                </div>
            `;
            list.appendChild(card);
        });

        // Update token selector grid in lobby
        const picker = document.getElementById('lobby-token-picker');
        picker.innerHTML = '';
        TOKENS.forEach(t => {
            const takenBy = room.players.find(p => p.token === t.id && p.id !== myId);
            const isMine = me && me.token === t.id;

            const item = document.createElement('div');
            item.className = `token-item ${isMine ? 'selected' : ''} ${takenBy ? 'taken' : ''}`;
            item.title = takenBy ? `Taken by ${takenBy.name}` : t.name;
            item.innerHTML = t.icon;

            if (!takenBy) {
                item.onclick = () => {
                    window.soundManager.playClick();
                    window.socketClient.selectToken(t.id);
                };
            }
            picker.appendChild(item);
        });

        // Enable start game button for host if >= 2 players
        const btnStart = document.getElementById('btn-start-game');
        if (me && me.isHost) {
            btnStart.style.display = 'inline-flex';
            btnStart.disabled = room.players.length < 2;
        } else {
            btnStart.style.display = 'none';
        }
    }

    addChatMessage(msg) {
        const box = document.getElementById('lobby-chat-messages');
        if (!box) return;

        const el = document.createElement('div');
        el.className = 'chat-msg';
        const tokenMeta = TOKENS.find(t => t.id === msg.token) || TOKENS[0];
        el.innerHTML = `<span class="sender">${tokenMeta.icon} ${msg.sender}:</span> ${msg.text} <span class="time">${msg.time}</span>`;
        box.appendChild(el);
        box.scrollTop = box.scrollHeight;
    }
}

window.LobbyUI = LobbyUI;
