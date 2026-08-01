// server/room-manager.js
const GameEngine = require('./game-engine');
const { TOKENS } = require('./board-data');

class RoomManager {
    constructor() {
        this.rooms = new Map(); // roomId -> Room object
    }

    generateRoomCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    createRoom(hostSocketId, hostName, selectedToken) {
        let roomId = this.generateRoomCode();
        while (this.rooms.has(roomId)) {
            roomId = this.generateRoomCode();
        }

        const room = {
            id: roomId,
            hostId: hostSocketId,
            players: [
                {
                    id: hostSocketId,
                    name: hostName || 'Player 1',
                    token: selectedToken || TOKENS[0].id,
                    ready: false,
                    isHost: true,
                    connected: true
                }
            ],
            game: null,
            createdTime: Date.now()
        };

        this.rooms.set(roomId, room);
        return room;
    }

    joinRoom(roomId, socketId, playerName, selectedToken) {
        const room = this.rooms.get(roomId.toUpperCase());
        if (!room) return { error: 'Room not found' };

        if (room.game) {
            // Check if reconnecting
            const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
            if (existingPlayer) {
                existingPlayer.id = socketId;
                existingPlayer.connected = true;
                return { success: true, room, isReconnect: true };
            }
            return { error: 'Game is already in progress' };
        }

        if (room.players.length >= 6) {
            return { error: 'Room is full (max 6 players)' };
        }

        // Ensure unique token
        const usedTokens = room.players.map(p => p.token);
        let tokenToAssign = selectedToken;
        if (!tokenToAssign || usedTokens.includes(tokenToAssign)) {
            const availableToken = TOKENS.find(t => !usedTokens.includes(t.id));
            tokenToAssign = availableToken ? availableToken.id : TOKENS[0].id;
        }

        const newPlayer = {
            id: socketId,
            name: playerName || `Player ${room.players.length + 1}`,
            token: tokenToAssign,
            ready: false,
            isHost: false,
            connected: true
        };

        room.players.push(newPlayer);
        return { success: true, room };
    }

    toggleReady(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        const player = room.players.find(p => p.id === socketId);
        if (player) {
            player.ready = !player.ready;
        }
        return room;
    }

    selectToken(roomId, socketId, tokenId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        const taken = room.players.some(p => p.id !== socketId && p.token === tokenId);
        if (taken) return { error: 'Token already taken' };

        const player = room.players.find(p => p.id === socketId);
        if (player) {
            player.token = tokenId;
        }
        return { success: true, room };
    }

    startGame(roomId, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) return { error: 'Room not found' };
        if (room.hostId !== socketId) return { error: 'Only the host can start the game' };

        // If only 1 player, add 2 AI Bot players so user can play solo!
        if (room.players.length === 1) {
            const botTokens = TOKENS.filter(t => t.id !== room.players[0].token);
            room.players.push({
                id: 'bot_1',
                name: 'Mr. Monopoly (Bot)',
                token: botTokens[0].id,
                ready: true,
                isHost: false,
                isBot: true,
                connected: true
            });
            room.players.push({
                id: 'bot_2',
                name: 'Revolution Bot',
                token: botTokens[1].id,
                ready: true,
                isHost: false,
                isBot: true,
                connected: true
            });
        }

        room.game = new GameEngine(roomId, room.players);
        return { success: true, room };
    }

    leaveRoom(socketId) {
        for (const [roomId, room] of this.rooms.entries()) {
            const pIdx = room.players.findIndex(p => p.id === socketId);
            if (pIdx !== -1) {
                const player = room.players[pIdx];
                if (room.game) {
                    player.connected = false;
                } else {
                    room.players.splice(pIdx, 1);
                    if (room.players.length === 0) {
                        this.rooms.delete(roomId);
                    } else if (player.isHost) {
                        room.players[0].isHost = true;
                        room.hostId = room.players[0].id;
                    }
                }
                return { roomId, room };
            }
        }
        return null;
    }

    getRoom(roomId) {
        return this.rooms.get(roomId ? roomId.toUpperCase() : '');
    }
}

module.exports = new RoomManager();
