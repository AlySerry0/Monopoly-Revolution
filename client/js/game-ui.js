// client/js/game-ui.js

class GameUI {
    constructor() {
        this.boardRenderer = new BoardRenderer('monopoly-canvas');
        this.gameState = null;
        this.selectedPropForModal = null;
        this.initListeners();
    }

    initListeners() {
        // Control bar buttons
        document.getElementById('btn-roll-dice').onclick = () => {
            window.soundManager.playDiceRoll();
            window.socketClient.rollDice();
        };

        document.getElementById('btn-buy-prop').onclick = () => {
            window.soundManager.playCashChime();
            window.socketClient.buyProperty();
        };

        document.getElementById('btn-start-auction').onclick = () => {
            if (!this.gameState) return;
            const me = this.getMe();
            if (me) {
                const space = BOARD_SPACES[me.position];
                window.socketClient.startAuction(space.id);
            }
        };

        document.getElementById('btn-end-turn').onclick = () => {
            window.soundManager.playClick();
            window.socketClient.endTurn();
        };

        document.getElementById('btn-open-trade').onclick = () => {
            window.soundManager.playClick();
            this.openTradeModal();
        };

        // Sound toggle
        document.getElementById('btn-toggle-sound').onclick = (e) => {
            const enabled = window.soundManager.toggleSound();
            e.target.innerText = enabled ? '🔊' : '🔇';
        };

        // Modals close buttons
        document.querySelectorAll('.close-modal-btn').forEach(btn => {
            btn.onclick = () => {
                btn.closest('.modal-overlay').classList.remove('active');
            };
        });

        // Auction bids
        document.getElementById('btn-bid-10').onclick = () => this.placeBidOffset(10);
        document.getElementById('btn-bid-50').onclick = () => this.placeBidOffset(50);
        document.getElementById('btn-bid-100').onclick = () => this.placeBidOffset(100);
        document.getElementById('btn-withdraw-bid').onclick = () => {
            window.socketClient.withdrawBid();
        };

        // Trade Modal buttons
        document.getElementById('btn-send-trade').onclick = () => this.sendTradeProposal();
        document.getElementById('btn-accept-trade').onclick = () => {
            if (this.gameState && this.gameState.activeTrade) {
                window.soundManager.playCashChime();
                window.socketClient.respondTrade(this.gameState.activeTrade.id, true);
                document.getElementById('modal-trade-response').classList.remove('active');
            }
        };
        document.getElementById('btn-decline-trade').onclick = () => {
            if (this.gameState && this.gameState.activeTrade) {
                window.socketClient.respondTrade(this.gameState.activeTrade.id, false);
                document.getElementById('modal-trade-response').classList.remove('active');
            }
        };

        // Game Chat
        const sendGameChat = () => {
            const input = document.getElementById('game-chat-input');
            const text = input.value.trim();
            if (text) {
                window.socketClient.sendChat(text);
                input.value = '';
            }
        };
        document.getElementById('btn-send-game-chat').onclick = sendGameChat;
        document.getElementById('game-chat-input').onkeypress = (e) => {
            if (e.key === 'Enter') sendGameChat();
        };

        document.getElementById('btn-return-lobby').onclick = () => {
            location.reload();
        };
    }

    getMe() {
        if (!this.gameState || !window.socketClient.socket) return null;
        const myId = window.socketClient.socket.id;
        return this.gameState.players.find(p => p.id === myId);
    }

    updateGameState(gameState) {
        this.gameState = gameState;
        this.boardRenderer.updateState(gameState);

        const myId = window.socketClient.socket ? window.socketClient.socket.id : null;
        const me = this.getMe();
        const currPlayer = gameState.players[gameState.currentPlayerIndex];
        const isMyTurn = currPlayer && currPlayer.id === myId;

        // Top bar turn indicator
        const turnInd = document.getElementById('turn-indicator');
        if (isMyTurn) {
            turnInd.innerText = "⭐ YOUR TURN";
            turnInd.style.color = "var(--color-emerald)";
        } else {
            turnInd.innerText = `${currPlayer ? currPlayer.name.toUpperCase() : ''}'S TURN`;
            turnInd.style.color = "var(--color-cyan)";
        }

        document.getElementById('game-room-code').innerText = gameState.roomId;

        // Update Cash
        if (me) {
            document.getElementById('player-cash').innerText = me.cash;
        }

        // Update Controls
        const btnRoll = document.getElementById('btn-roll-dice');
        const btnBuy = document.getElementById('btn-buy-prop');
        const btnAuction = document.getElementById('btn-start-auction');
        const btnEnd = document.getElementById('btn-end-turn');

        btnRoll.disabled = !isMyTurn || gameState.turnPhase !== 'ROLL';
        btnEnd.disabled = !isMyTurn || (gameState.turnPhase !== 'END_TURN' && gameState.turnPhase !== 'LANDED');

        if (isMyTurn && gameState.turnPhase === 'LANDED' && me) {
            const currentSpace = BOARD_SPACES[me.position];
            const isUnowned = ['PROPERTY', 'RAILROAD', 'UTILITY'].includes(currentSpace.type) && 
                              !gameState.players.some(p => p.properties.includes(currentSpace.id));
            btnBuy.disabled = !isUnowned || me.cash < currentSpace.price;
            btnAuction.disabled = !isUnowned;
        } else {
            btnBuy.disabled = true;
            btnAuction.disabled = true;
        }

        // Bus Choice Modal trigger
        const busModal = document.getElementById('modal-bus-choice');
        if (isMyTurn && gameState.turnPhase === 'BUS_CHOICE') {
            this.renderBusOptions(gameState.lastRoll);
            busModal.classList.add('active');
        } else {
            busModal.classList.remove('active');
        }

        // Auction Modal trigger
        const auctionModal = document.getElementById('modal-auction');
        if (gameState.activeAuction) {
            this.renderAuction(gameState.activeAuction);
            auctionModal.classList.add('active');
        } else {
            auctionModal.classList.remove('active');
        }

        // Trade Proposal incoming trigger
        const tradeRespModal = document.getElementById('modal-trade-response');
        if (gameState.activeTrade && gameState.activeTrade.toId === myId) {
            this.renderTradeResponse(gameState.activeTrade);
            tradeRespModal.classList.add('active');
        } else {
            tradeRespModal.classList.remove('active');
        }

        // Game Over Trigger
        if (gameState.winner) {
            window.soundManager.playVictoryFanfare();
            document.getElementById('winner-name-display').innerText = `${gameState.winner.name} Wins!`;
            document.getElementById('modal-game-over').classList.add('active');
        }

        // Render Portfolio & Leaderboard
        this.renderPortfolio();
        this.renderLeaderboard();
        this.renderLogs();
    }

    renderBusOptions(lastRoll) {
        const container = document.getElementById('bus-options-container');
        container.innerHTML = '';

        const choices = [
            { label: `Die 1 (${lastRoll.d1})`, val: 'D1' },
            { label: `Die 2 (${lastRoll.d2})`, val: 'D2' },
            { label: `Sum (${lastRoll.d1 + lastRoll.d2})`, val: 'SUM' }
        ];

        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary btn-glow';
            btn.innerText = c.label;
            btn.onclick = () => {
                window.soundManager.playClick();
                window.socketClient.makeBusChoice(c.val);
                document.getElementById('modal-bus-choice').classList.remove('active');
            };
            container.appendChild(btn);
        });
    }

    renderPortfolio() {
        const list = document.getElementById('portfolio-list');
        const me = this.getMe();
        if (!me || !me.properties || me.properties.length === 0) {
            list.innerHTML = `<div class="empty-state">No properties owned yet.</div>`;
            return;
        }

        list.innerHTML = '';
        me.properties.forEach(spId => {
            const space = BOARD_SPACES[spId];
            const houseCount = me.houses[spId] || 0;
            const isMortgaged = me.mortgaged[spId];

            const card = document.createElement('div');
            card.className = 'portfolio-card';
            card.style.borderLeftColor = space.color || '#A0A0A0';

            let houseStr = houseCount > 0 ? (houseCount === 5 ? ' 🏨 Hotel' : ` 🏠 x${houseCount}`) : '';
            if (isMortgaged) houseStr += ' (MORTGAGED)';

            card.innerHTML = `
                <div class="portfolio-card-title">
                    <span>${space.name}</span>
                    <span>${houseStr}</span>
                </div>
                <div class="portfolio-card-actions">
                    ${space.type === 'PROPERTY' ? `<button class="btn btn-small btn-primary build-btn">Build ($${space.houseCost})</button>` : ''}
                    ${space.type === 'PROPERTY' && houseCount > 0 ? `<button class="btn btn-small btn-secondary sell-btn">Sell</button>` : ''}
                    <button class="btn btn-small ${isMortgaged ? 'btn-primary' : 'btn-danger'} mtg-btn">
                        ${isMortgaged ? 'Unmortgage' : 'Mortgage'}
                    </button>
                </div>
            `;

            // Action triggers
            const buildBtn = card.querySelector('.build-btn');
            if (buildBtn) {
                buildBtn.onclick = () => window.socketClient.buildHouse(spId);
            }
            const sellBtn = card.querySelector('.sell-btn');
            if (sellBtn) {
                sellBtn.onclick = () => window.socketClient.sellHouse(spId);
            }
            const mtgBtn = card.querySelector('.mtg-btn');
            if (mtgBtn) {
                mtgBtn.onclick = () => {
                    if (isMortgaged) window.socketClient.unmortgage(spId);
                    else window.socketClient.mortgage(spId);
                };
            }

            list.appendChild(card);
        });
    }

    renderLeaderboard() {
        const board = document.getElementById('players-leaderboard');
        board.innerHTML = '';

        const currIdx = this.gameState.currentPlayerIndex;
        this.gameState.players.forEach((p, idx) => {
            const tokenMeta = TOKENS.find(t => t.id === p.token) || TOKENS[0];
            const isTurn = idx === currIdx;

            const item = document.createElement('div');
            item.className = `leaderboard-item ${isTurn ? 'active-turn' : ''} ${p.bankrupt ? 'bankrupt' : ''}`;
            item.innerHTML = `
                <span>${tokenMeta.icon} ${p.name} ${p.inJail ? '🔒' : ''}</span>
                <span style="color:var(--color-emerald);font-weight:700;">$${p.cash}</span>
            `;
            board.appendChild(item);
        });
    }

    renderLogs() {
        const logBox = document.getElementById('activity-log');
        logBox.innerHTML = '';
        this.gameState.logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            entry.innerHTML = `${log.text} <span class="time">${log.time}</span>`;
            logBox.appendChild(entry);
        });
        logBox.scrollTop = logBox.scrollHeight;
    }

    renderAuction(auction) {
        document.getElementById('auction-target-name').innerText = auction.spaceName;
        document.getElementById('auction-current-bid').innerText = auction.currentBid;

        const highestP = this.gameState.players.find(p => p.id === auction.highestBidder);
        document.getElementById('auction-highest-bidder').innerText = highestP ? `Highest bidder: ${highestP.name}` : 'No bids yet';
    }

    placeBidOffset(offset) {
        if (this.gameState && this.gameState.activeAuction) {
            const newBid = this.gameState.activeAuction.currentBid + offset;
            window.socketClient.placeBid(newBid);
        }
    }

    openTradeModal() {
        const me = this.getMe();
        if (!me) return;

        const partnerSelect = document.getElementById('trade-partner-select');
        partnerSelect.innerHTML = '';
        this.gameState.players.forEach(p => {
            if (p.id !== me.id && !p.bankrupt) {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.innerText = p.name;
                partnerSelect.appendChild(opt);
            }
        });

        // Offer props checkboxes
        const offerPropsBox = document.getElementById('trade-offer-props');
        offerPropsBox.innerHTML = '<h4>Your Properties</h4>';
        me.properties.forEach(spId => {
            const s = BOARD_SPACES[spId];
            offerPropsBox.innerHTML += `
                <label style="font-size:0.8rem;"><input type="checkbox" class="offer-prop-chk" value="${spId}"> ${s.name}</label>
            `;
        });

        // Update partner requested props on change
        const updatePartnerProps = () => {
            const partnerId = partnerSelect.value;
            const partner = this.gameState.players.find(p => p.id === partnerId);
            const reqPropsBox = document.getElementById('trade-req-props');
            reqPropsBox.innerHTML = `<h4>${partner ? partner.name : ''}'s Properties</h4>`;
            if (partner) {
                partner.properties.forEach(spId => {
                    const s = BOARD_SPACES[spId];
                    reqPropsBox.innerHTML += `
                        <label style="font-size:0.8rem;"><input type="checkbox" class="req-prop-chk" value="${spId}"> ${s.name}</label>
                    `;
                });
            }
        };

        partnerSelect.onchange = updatePartnerProps;
        updatePartnerProps();

        document.getElementById('modal-trade').classList.add('active');
    }

    sendTradeProposal() {
        const partnerSelect = document.getElementById('trade-partner-select');
        const toId = partnerSelect.value;
        const offerCash = parseInt(document.getElementById('trade-offer-cash').value) || 0;
        const reqCash = parseInt(document.getElementById('trade-req-cash').value) || 0;

        const offerProps = Array.from(document.querySelectorAll('.offer-prop-chk:checked')).map(el => parseInt(el.value));
        const reqProps = Array.from(document.querySelectorAll('.req-prop-chk:checked')).map(el => parseInt(el.value));

        window.socketClient.proposeTrade(toId, offerCash, offerProps, reqCash, reqProps);
        document.getElementById('modal-trade').classList.remove('active');
    }

    renderTradeResponse(trade) {
        const summary = document.getElementById('trade-offer-summary');
        const offerPropsStr = trade.offerProps.map(id => BOARD_SPACES[id].name).join(', ') || 'None';
        const reqPropsStr = trade.reqProps.map(id => BOARD_SPACES[id].name).join(', ') || 'None';

        summary.innerHTML = `
            <p><strong>${trade.fromName}</strong> proposes:</p>
            <p><strong>Offers:</strong> $${trade.offerCash} + Properties: [${offerPropsStr}]</p>
            <p><strong>Requests from you:</strong> $${trade.reqCash} + Properties: [${reqPropsStr}]</p>
        `;
    }

    addChatMessage(msg) {
        const box = document.getElementById('game-chat-messages');
        if (!box) return;

        const el = document.createElement('div');
        el.className = 'chat-msg';
        const tokenMeta = TOKENS.find(t => t.id === msg.token) || TOKENS[0];
        el.innerHTML = `<span class="sender">${tokenMeta.icon} ${msg.sender}:</span> ${msg.text}`;
        box.appendChild(el);
        box.scrollTop = box.scrollHeight;
    }
}

window.GameUI = GameUI;
