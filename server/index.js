// server/index.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const roomManager = require('./room-manager');
const { BOARD_SPACES, TOKENS } = require('./board-data');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

// Serve static frontend files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// REST endpoints
app.get('/api/board-info', (req, res) => {
    res.json({ spaces: BOARD_SPACES, tokens: TOKENS });
});

// Socket.IO real-time handlers
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Room Management
    socket.on('create-room', ({ playerName, token }) => {
        const room = roomManager.createRoom(socket.id, playerName, token);
        socket.join(room.id);
        socket.emit('room-updated', room);
    });

    socket.on('join-room', ({ roomId, playerName, token }) => {
        const result = roomManager.joinRoom(roomId, socket.id, playerName, token);
        if (result.error) {
            socket.emit('error-msg', result.error);
            return;
        }

        socket.join(result.room.id);
        io.to(result.room.id).emit('room-updated', result.room);

        if (result.isReconnect && result.room.game) {
            socket.emit('game-state-updated', result.room.game.getState());
        }
    });

    socket.on('toggle-ready', ({ roomId }) => {
        const room = roomManager.toggleReady(roomId, socket.id);
        if (room) {
            io.to(roomId).emit('room-updated', room);
        }
    });

    socket.on('select-token', ({ roomId, tokenId }) => {
        const result = roomManager.selectToken(roomId, socket.id, tokenId);
        if (result.error) {
            socket.emit('error-msg', result.error);
        } else {
            io.to(roomId).emit('room-updated', result.room);
        }
    });

    socket.on('start-game', ({ roomId }) => {
        const result = roomManager.startGame(roomId, socket.id);
        if (result.error) {
            socket.emit('error-msg', result.error);
            return;
        }
        io.to(roomId).emit('game-started', result.room.game.getState());
    });

    // Helper to broadcast game updates
    const emitGameState = (roomId, game) => {
        io.to(roomId).emit('game-state-updated', game.getState());
    };

    // Game Actions
    socket.on('roll-dice', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.rollDice(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('bus-choice', ({ roomId, choice }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.makeBusChoice(socket.id, choice);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('buy-property', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.buyProperty(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('start-auction', ({ roomId, spaceId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.startAuction(spaceId);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('place-bid', ({ roomId, amount }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.placeBid(socket.id, amount);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('withdraw-bid', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.withdrawFromAuction(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('build-house', ({ roomId, spaceId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.buildHouse(socket.id, spaceId);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('sell-house', ({ roomId, spaceId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.sellHouse(socket.id, spaceId);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('mortgage', ({ roomId, spaceId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.mortgageProperty(socket.id, spaceId);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('unmortgage', ({ roomId, spaceId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.unmortgageProperty(socket.id, spaceId);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('pay-jail', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.payJailFine(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('use-jail-card', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.useJailCard(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('propose-trade', ({ roomId, toId, offerCash, offerProps, reqCash, reqProps }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.proposeTrade(socket.id, toId, offerCash, offerProps, reqCash, reqProps);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('respond-trade', ({ roomId, tradeId, accept }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.respondTrade(socket.id, tradeId, accept);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    socket.on('end-turn', ({ roomId }) => {
        const room = roomManager.getRoom(roomId);
        if (!room || !room.game) return;

        const res = room.game.endTurn(socket.id);
        if (res.error) socket.emit('error-msg', res.error);
        else emitGameState(roomId, room.game);
    });

    // In-game Chat
    socket.on('send-chat', ({ roomId, text }) => {
        const room = roomManager.getRoom(roomId);
        if (!room) return;

        const sender = room.players.find(p => p.id === socket.id);
        if (sender && text.trim()) {
            const chatMsg = {
                sender: sender.name,
                token: sender.token,
                text: text.trim(),
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            io.to(roomId).emit('chat-message', chatMsg);
        }
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        const result = roomManager.leaveRoom(socket.id);
        if (result) {
            io.to(result.roomId).emit('room-updated', result.room);
            if (result.room.game) {
                emitGameState(result.roomId, result.room.game);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`🎲 Monopoly Revolution Server running on http://localhost:${PORT}`);
});
