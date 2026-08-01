// server/game-engine.js
const { BOARD_SPACES, CHANCE_CARDS, COMMUNITY_CHEST_CARDS } = require('./board-data');

class GameEngine {
    constructor(roomId, players) {
        this.roomId = roomId;
        this.players = players.map((p, idx) => ({
            id: p.id,
            name: p.name,
            token: p.token,
            isBot: p.isBot || false,
            cash: 1500, // Starting electronic balance
            position: 0, // GO
            inJail: false,
            jailTurns: 0,
            jailCards: 0,
            bankrupt: false,
            properties: [], // Array of space IDs owned
            houses: {}, // spaceId -> count (0 to 4 = houses, 5 = hotel)
            mortgaged: {} // spaceId -> boolean
        }));
        
        this.currentPlayerIndex = 0;
        this.turnPhase = 'ROLL'; // ROLL, BUS_CHOICE, LANDED, MR_MONOPOLY, AUCTION, END_TURN
        this.doublesCount = 0;
        this.lastRoll = null;
        this.chanceDeck = [...CHANCE_CARDS].sort(() => Math.random() - 0.5);
        this.communityDeck = [...COMMUNITY_CHEST_CARDS].sort(() => Math.random() - 0.5);
        this.activeAuction = null;
        this.activeTrade = null;
        this.logs = [];
        
        this.addLog(`Game started with ${this.players.length} players!`);
    }

    addLog(msg) {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.logs.push({ text: msg, time: timestamp });
        if (this.logs.length > 50) this.logs.shift();
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getPlayer(id) {
        return this.players.find(p => p.id === id);
    }

    getOwner(spaceId) {
        return this.players.find(p => p.properties.includes(spaceId));
    }

    // Helper to get total properties in color group
    getGroupSpaces(groupName) {
        return BOARD_SPACES.filter(s => s.group === groupName);
    }

    hasColorSet(playerId, groupName) {
        if (!groupName || groupName === 'RAILROAD' || groupName === 'UTILITY') return false;
        const groupSpaces = this.getGroupSpaces(groupName);
        const player = this.getPlayer(playerId);
        return groupSpaces.every(s => player.properties.includes(s.id));
    }

    rollDice(playerId) {
        const player = this.getCurrentPlayer();
        if (player.id !== playerId || this.turnPhase !== 'ROLL') {
            return { error: 'Not your turn to roll' };
        }

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const speedDieOptions = [1, 2, 3, 'BUS', 'MR_MONOPOLY', 'MR_MONOPOLY'];
        const speedDie = speedDieOptions[Math.floor(Math.random() * speedDieOptions.length)];

        const isDoubles = (d1 === d2);
        
        if (player.inJail) {
            if (isDoubles) {
                player.inJail = false;
                player.jailTurns = 0;
                this.addLog(`${player.name} rolled doubles (${d1}, ${d2}) and got out of Jail!`);
                const totalMove = d1 + d2 + (typeof speedDie === 'number' ? speedDie : 0);
                this.lastRoll = { d1, d2, speedDie, total: totalMove, isDoubles };
                this.movePlayer(player.id, totalMove, true);
                return { success: true, roll: this.lastRoll };
            } else {
                player.jailTurns++;
                this.addLog(`${player.name} failed to roll doubles in Jail (${d1}, ${d2}). Turn #${player.jailTurns}`);
                if (player.jailTurns >= 3) {
                    // Must pay $50 to leave
                    if (player.cash >= 50) {
                        player.cash -= 50;
                        player.inJail = false;
                        player.jailTurns = 0;
                        this.addLog(`${player.name} paid $50 mandatory fine after 3 turns in Jail.`);
                        const totalMove = d1 + d2 + (typeof speedDie === 'number' ? speedDie : 0);
                        this.lastRoll = { d1, d2, speedDie, total: totalMove, isDoubles };
                        this.movePlayer(player.id, totalMove, true);
                        return { success: true, roll: this.lastRoll };
                    } else {
                        this.addLog(`${player.name} has insufficient funds to pay $50 Jail fine.`);
                        this.turnPhase = 'END_TURN';
                        return { success: true, roll: { d1, d2, speedDie, total: d1 + d2, isDoubles } };
                    }
                }
                this.turnPhase = 'END_TURN';
                return { success: true, roll: { d1, d2, speedDie, total: d1 + d2, isDoubles } };
            }
        }

        if (isDoubles) {
            this.doublesCount++;
            if (this.doublesCount >= 3) {
                this.addLog(`${player.name} rolled 3 doubles in a row and was sent to JAIL!`);
                this.sendToJail(player.id);
                this.doublesCount = 0;
                this.turnPhase = 'END_TURN';
                return { success: true, roll: { d1, d2, speedDie, total: d1 + d2, isDoubles: true } };
            }
        } else {
            this.doublesCount = 0;
        }

        let totalMove = d1 + d2;
        if (typeof speedDie === 'number') {
            totalMove += speedDie;
        }

        this.lastRoll = { d1, d2, speedDie, total: totalMove, isDoubles };
        this.addLog(`${player.name} rolled ${d1} & ${d2} + Speed Die: [${speedDie}]`);

        if (speedDie === 'BUS') {
            this.turnPhase = 'BUS_CHOICE';
            return { success: true, roll: this.lastRoll, choiceRequired: true };
        }

        this.movePlayer(player.id, totalMove, true);
        return { success: true, roll: this.lastRoll };
    }

    makeBusChoice(playerId, choice) {
        // choice can be: 'D1' (use d1), 'D2' (use d2), 'SUM' (use d1+d2)
        const player = this.getCurrentPlayer();
        if (player.id !== playerId || this.turnPhase !== 'BUS_CHOICE') {
            return { error: 'Invalid state for bus choice' };
        }

        let steps = this.lastRoll.d1 + this.lastRoll.d2;
        if (choice === 'D1') steps = this.lastRoll.d1;
        if (choice === 'D2') steps = this.lastRoll.d2;

        this.addLog(`${player.name} selected Bus Move: ${steps} spaces`);
        this.movePlayer(player.id, steps, true);
        return { success: true };
    }

    movePlayer(playerId, steps, collectGo = true) {
        const player = this.getPlayer(playerId);
        const oldPos = player.position;
        let newPos = (oldPos + steps) % 40;
        if (newPos < 0) newPos += 40;

        if (collectGo && newPos < oldPos && steps > 0) {
            player.cash += 200;
            this.addLog(`${player.name} passed GO and collected $200! Balance: $${player.cash}`);
        }

        player.position = newPos;
        this.addLog(`${player.name} landed on ${BOARD_SPACES[newPos].name}`);
        this.handleLanding(player.id);
    }

    movePlayerTo(playerId, targetPos, collectGo = true) {
        const player = this.getPlayer(playerId);
        const oldPos = player.position;
        if (collectGo && targetPos < oldPos) {
            player.cash += 200;
            this.addLog(`${player.name} passed GO and collected $200! Balance: $${player.cash}`);
        }
        player.position = targetPos;
        this.addLog(`${player.name} moved to ${BOARD_SPACES[targetPos].name}`);
        this.handleLanding(player.id);
    }

    sendToJail(playerId) {
        const player = this.getPlayer(playerId);
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        this.turnPhase = 'END_TURN';
    }

    handleLanding(playerId) {
        const player = this.getPlayer(playerId);
        const space = BOARD_SPACES[player.position];

        if (space.type === 'CORNER') {
            if (space.id === 30) { // Go To Jail
                this.addLog(`${player.name} landed on Go To Jail!`);
                this.sendToJail(player.id);
                return;
            }
            this.turnPhase = 'LANDED';
            return;
        }

        if (space.type === 'TAX') {
            player.cash -= space.amount;
            this.addLog(`${player.name} paid $${space.amount} in ${space.name}. Balance: $${player.cash}`);
            this.checkBankruptcy(player.id);
            this.turnPhase = 'LANDED';
            return;
        }

        if (space.type === 'CHANCE') {
            this.drawCard(player.id, 'CHANCE');
            return;
        }

        if (space.type === 'ZONE_SPACE') {
            this.handleZoneSpaceLanding(player.id, space.zone);
            return;
        }

        if (['PROPERTY', 'RAILROAD', 'UTILITY'].includes(space.type)) {
            const owner = this.getOwner(space.id);
            if (!owner) {
                this.turnPhase = 'LANDED'; // Player can buy or auction
            } else if (owner.id !== player.id) {
                // Pay rent if not mortgaged
                if (player.mortgaged[space.id]) {
                    this.addLog(`${space.name} is mortgaged. No rent collected.`);
                } else {
                    const rent = this.calculateRent(space.id);
                    player.cash -= rent;
                    owner.cash += rent;
                    this.addLog(`${player.name} paid $${rent} rent to ${owner.name} for landing on ${space.name}`);
                    this.checkBankruptcy(player.id, owner.id);
                }
                this.turnPhase = 'LANDED';
            } else {
                this.addLog(`${player.name} landed on their own property ${space.name}`);
                this.turnPhase = 'LANDED';
            }
        }
    }

    handleZoneSpaceLanding(playerId, zoneName) {
        const player = this.getPlayer(playerId);
        const { ZONE_EVENTS, ZONES } = require('./board-data');
        const zoneInfo = ZONES[zoneName] || { name: zoneName, start: 0, end: 39 };

        // Select random Zone event
        const event = ZONE_EVENTS[Math.floor(Math.random() * ZONE_EVENTS.length)];
        this.addLog(`⚡ ${player.name} triggered ${zoneInfo.name} EVENT: "${event.text}"`);

        // Target all players currently in this zone
        const playersInZone = this.players.filter(p => !p.bankrupt && p.position >= zoneInfo.start && p.position <= zoneInfo.end);

        playersInZone.forEach(p => {
            if (event.action === 'ZONE_PAY') {
                p.cash -= event.amount;
                this.addLog(`${p.name} paid $${event.amount} Zone Inspection Fee.`);
                this.checkBankruptcy(p.id);
            } else if (event.action === 'ZONE_GAIN') {
                p.cash += event.amount;
                this.addLog(`${p.name} received $${event.amount} Zone Bonus!`);
            } else if (event.action === 'ZONE_JAIL') {
                this.sendToJail(p.id);
                this.addLog(`🚨 ${p.name} was sent to JAIL by Zone Lockdown!`);
            }
        });

        this.turnPhase = 'LANDED';
    }

    calculateRent(spaceId) {
        const space = BOARD_SPACES[spaceId];
        const owner = this.getOwner(spaceId);
        if (!owner || owner.mortgaged[spaceId]) return 0;

        if (space.type === 'PROPERTY') {
            const houseCount = owner.houses[spaceId] || 0;
            if (houseCount > 0) {
                return space.rent[houseCount];
            }
            // Base rent: doubles if owner holds complete color set
            let rent = space.rent[0];
            if (this.hasColorSet(owner.id, space.group)) {
                rent *= 2;
            }
            return rent;
        }

        if (space.type === 'RAILROAD') {
            const count = owner.properties.filter(id => BOARD_SPACES[id].type === 'RAILROAD').length;
            return space.rent[Math.min(count - 1, 3)];
        }

        if (space.type === 'UTILITY') {
            const count = owner.properties.filter(id => BOARD_SPACES[id].type === 'UTILITY').length;
            const multiplier = count === 2 ? 10 : 4;
            const diceTotal = this.lastRoll ? (this.lastRoll.d1 + this.lastRoll.d2) : 7;
            return diceTotal * multiplier;
        }

        return 0;
    }

    drawCard(playerId, deckType) {
        const player = this.getPlayer(playerId);
        const deck = deckType === 'CHANCE' ? this.chanceDeck : this.communityDeck;
        const card = deck.shift();
        deck.push(card); // Recycle card

        this.addLog(`${player.name} drew ${deckType} card: "${card.text}"`);

        switch (card.action) {
            case 'MOVE_TO':
                this.movePlayerTo(player.id, card.target, card.collectGo);
                break;
            case 'NEAREST_UTILITY': {
                const pos = player.position;
                const nextUtil = pos < 12 || pos >= 28 ? 12 : 28;
                this.movePlayerTo(player.id, nextUtil, true);
                break;
            }
            case 'NEAREST_RAILROAD': {
                const pos = player.position;
                let nextRr = 5;
                if (pos >= 5 && pos < 15) nextRr = 15;
                else if (pos >= 15 && pos < 25) nextRr = 25;
                else if (pos >= 25 && pos < 35) nextRr = 35;
                this.movePlayerTo(player.id, nextRr, true);
                break;
            }
            case 'GAIN_MONEY':
                player.cash += card.amount;
                this.turnPhase = 'LANDED';
                break;
            case 'PAY_MONEY':
                player.cash -= card.amount;
                this.checkBankruptcy(player.id);
                this.turnPhase = 'LANDED';
                break;
            case 'GET_JAIL_CARD':
                player.jailCards++;
                this.turnPhase = 'LANDED';
                break;
            case 'GO_TO_JAIL':
                this.sendToJail(player.id);
                break;
            case 'MOVE_RELATIVE':
                this.movePlayer(player.id, card.amount, false);
                break;
            case 'COLLECT_EACH':
                this.players.forEach(p => {
                    if (p.id !== player.id && !p.bankrupt) {
                        p.cash -= card.amount;
                        player.cash += card.amount;
                        this.checkBankruptcy(p.id, player.id);
                    }
                });
                this.turnPhase = 'LANDED';
                break;
            case 'PAY_EACH':
                this.players.forEach(p => {
                    if (p.id !== player.id && !p.bankrupt) {
                        player.cash -= card.amount;
                        p.cash += card.amount;
                    }
                });
                this.checkBankruptcy(player.id);
                this.turnPhase = 'LANDED';
                break;
            case 'REPAIRS': {
                let cost = 0;
                Object.entries(player.houses).forEach(([spId, count]) => {
                    if (count === 5) cost += card.hotel;
                    else cost += count * card.house;
                });
                player.cash -= cost;
                this.addLog(`${player.name} paid $${cost} for property repairs.`);
                this.checkBankruptcy(player.id);
                this.turnPhase = 'LANDED';
                break;
            }
            default:
                this.turnPhase = 'LANDED';
        }
    }

    buyProperty(playerId) {
        const player = this.getPlayer(playerId);
        if (player.id !== this.getCurrentPlayer().id) return { error: 'Not your turn' };
        
        const space = BOARD_SPACES[player.position];
        if (!['PROPERTY', 'RAILROAD', 'UTILITY'].includes(space.type)) return { error: 'Not a purchasable space' };
        if (this.getOwner(space.id)) return { error: 'Property is already owned' };

        if (player.cash < space.price) return { error: 'Insufficient funds' };

        player.cash -= space.price;
        player.properties.push(space.id);
        this.addLog(`${player.name} purchased ${space.name} for $${space.price}!`);
        
        this.checkMrMonopolyAfterLanding();
        return { success: true };
    }

    startAuction(spaceId) {
        const space = BOARD_SPACES[spaceId];
        if (this.getOwner(space.id)) return { error: 'Property already owned' };

        this.activeAuction = {
            spaceId: space.id,
            spaceName: space.name,
            currentBid: 10,
            highestBidder: null,
            activeBidders: this.players.filter(p => !p.bankrupt).map(p => p.id)
        };
        this.turnPhase = 'AUCTION';
        this.addLog(`Auction started for ${space.name}! Opening bid $10.`);
        return { success: true, auction: this.activeAuction };
    }

    placeBid(playerId, bidAmount) {
        if (!this.activeAuction) return { error: 'No active auction' };
        const player = this.getPlayer(playerId);

        if (bidAmount <= this.activeAuction.currentBid) return { error: 'Bid must be higher than current bid' };
        if (player.cash < bidAmount) return { error: 'Insufficient funds' };

        this.activeAuction.currentBid = bidAmount;
        this.activeAuction.highestBidder = player.id;
        this.addLog(`${player.name} bid $${bidAmount} for ${this.activeAuction.spaceName}`);
        return { success: true, auction: this.activeAuction };
    }

    withdrawFromAuction(playerId) {
        if (!this.activeAuction) return { error: 'No active auction' };
        this.activeAuction.activeBidders = this.activeAuction.activeBidders.filter(id => id !== playerId);
        const player = this.getPlayer(playerId);
        this.addLog(`${player.name} withdrew from the auction.`);

        if (this.activeAuction.activeBidders.length <= 1) {
            this.endAuction();
        }
        return { success: true, auction: this.activeAuction };
    }

    endAuction() {
        if (!this.activeAuction) return;
        const { spaceId, spaceName, currentBid, highestBidder } = this.activeAuction;

        if (highestBidder) {
            const winner = this.getPlayer(highestBidder);
            winner.cash -= currentBid;
            winner.properties.push(spaceId);
            this.addLog(`${winner.name} won the auction for ${spaceName} at $${currentBid}!`);
        } else {
            this.addLog(`Auction for ${spaceName} ended with no bids.`);
        }

        this.activeAuction = null;
        this.checkMrMonopolyAfterLanding();
    }

    checkMrMonopolyAfterLanding() {
        if (this.lastRoll && this.lastRoll.speedDie === 'MR_MONOPOLY') {
            const player = this.getCurrentPlayer();
            this.lastRoll.speedDie = null; // Execute Mr. Monopoly move once
            this.addLog(`Mr. Monopoly bonus triggers! ${player.name} advances to next unowned/rent property.`);
            this.executeMrMonopolyMove(player.id);
        } else {
            this.turnPhase = 'END_TURN';
        }
    }

    executeMrMonopolyMove(playerId) {
        const player = this.getPlayer(playerId);
        let pos = player.position;

        for (let i = 1; i <= 40; i++) {
            const nextPos = (pos + i) % 40;
            const space = BOARD_SPACES[nextPos];
            if (['PROPERTY', 'RAILROAD', 'UTILITY'].includes(space.type)) {
                const owner = this.getOwner(space.id);
                if (!owner || owner.id !== player.id) {
                    this.movePlayerTo(player.id, nextPos, true);
                    return;
                }
            }
        }
        this.turnPhase = 'END_TURN';
    }

    buildHouse(playerId, spaceId) {
        const player = this.getPlayer(playerId);
        const space = BOARD_SPACES[spaceId];

        if (!player.properties.includes(spaceId)) return { error: 'You do not own this property' };
        if (space.type !== 'PROPERTY') return { error: 'Cannot build on this space' };
        if (!this.hasColorSet(playerId, space.group)) return { error: 'You must own the full color group to build' };

        const currentHouses = player.houses[spaceId] || 0;
        if (currentHouses >= 5) return { error: 'Maximum buildings reached (Hotel)' };

        // Check even building rule across set
        const groupSpaces = this.getGroupSpaces(space.group);
        for (let s of groupSpaces) {
            const h = player.houses[s.id] || 0;
            if (h < currentHouses) return { error: 'You must build evenly across all properties in color set' };
        }

        if (player.cash < space.houseCost) return { error: 'Insufficient funds to build' };

        player.cash -= space.houseCost;
        player.houses[spaceId] = currentHouses + 1;
        const typeStr = player.houses[spaceId] === 5 ? 'Hotel' : `House #${player.houses[spaceId]}`;
        this.addLog(`${player.name} built a ${typeStr} on ${space.name} for $${space.houseCost}`);
        return { success: true };
    }

    sellHouse(playerId, spaceId) {
        const player = this.getPlayer(playerId);
        const space = BOARD_SPACES[spaceId];

        const currentHouses = player.houses[spaceId] || 0;
        if (currentHouses <= 0) return { error: 'No buildings to sell' };

        const groupSpaces = this.getGroupSpaces(space.group);
        for (let s of groupSpaces) {
            const h = player.houses[s.id] || 0;
            if (h > currentHouses) return { error: 'You must sell evenly across all properties in color set' };
        }

        const refund = Math.floor(space.houseCost / 2);
        player.cash += refund;
        player.houses[spaceId] = currentHouses - 1;
        this.addLog(`${player.name} sold a building on ${space.name} for $${refund}`);
        return { success: true };
    }

    mortgageProperty(playerId, spaceId) {
        const player = this.getPlayer(playerId);
        const space = BOARD_SPACES[spaceId];

        if (!player.properties.includes(spaceId)) return { error: 'You do not own this property' };
        if (player.mortgaged[spaceId]) return { error: 'Property is already mortgaged' };

        if (space.type === 'PROPERTY') {
            const groupSpaces = this.getGroupSpaces(space.group);
            if (groupSpaces.some(s => (player.houses[s.id] || 0) > 0)) {
                return { error: 'Must sell all buildings in color group before mortgaging' };
            }
        }

        player.mortgaged[spaceId] = true;
        player.cash += space.mortgage;
        this.addLog(`${player.name} mortgaged ${space.name} for $${space.mortgage}`);
        return { success: true };
    }

    unmortgageProperty(playerId, spaceId) {
        const player = this.getPlayer(playerId);
        const space = BOARD_SPACES[spaceId];

        if (!player.mortgaged[spaceId]) return { error: 'Property is not mortgaged' };

        const cost = Math.floor(space.mortgage * 1.1);
        if (player.cash < cost) return { error: `Insufficient funds to unmortgage ($${cost} needed)` };

        player.cash -= cost;
        player.mortgaged[spaceId] = false;
        this.addLog(`${player.name} unmortgaged ${space.name} for $${cost}`);
        return { success: true };
    }

    payJailFine(playerId) {
        const player = this.getPlayer(playerId);
        if (!player.inJail) return { error: 'Not in jail' };
        if (player.cash < 50) return { error: 'Insufficient funds' };

        player.cash -= 50;
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`${player.name} paid $50 to get out of Jail.`);
        return { success: true };
    }

    useJailCard(playerId) {
        const player = this.getPlayer(playerId);
        if (!player.inJail) return { error: 'Not in jail' };
        if (player.jailCards <= 0) return { error: 'No Get Out of Jail Free cards' };

        player.jailCards--;
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`${player.name} used a Get Out of Jail Free card!`);
        return { success: true };
    }

    proposeTrade(fromId, toId, offerCash, offerProps, reqCash, reqProps) {
        const fromPlayer = this.getPlayer(fromId);
        const toPlayer = this.getPlayer(toId);

        if (!fromPlayer || !toPlayer || fromPlayer.bankrupt || toPlayer.bankrupt) {
            return { error: 'Invalid players for trade' };
        }

        if (fromPlayer.cash < offerCash || toPlayer.cash < reqCash) {
            return { error: 'Insufficient funds offered or requested' };
        }

        this.activeTrade = {
            id: 'trade_' + Date.now(),
            fromId,
            toId,
            fromName: fromPlayer.name,
            toName: toPlayer.name,
            offerCash,
            offerProps,
            reqCash,
            reqProps
        };

        this.addLog(`${fromPlayer.name} proposed a trade to ${toPlayer.name}`);
        return { success: true, trade: this.activeTrade };
    }

    respondTrade(playerId, tradeId, accept) {
        if (!this.activeTrade || this.activeTrade.id !== tradeId) return { error: 'Trade expired or not found' };
        if (this.activeTrade.toId !== playerId) return { error: 'Not authorized to respond to this trade' };

        const { fromId, toId, offerCash, offerProps, reqCash, reqProps } = this.activeTrade;
        const fromP = this.getPlayer(fromId);
        const toP = this.getPlayer(toId);

        if (accept) {
            // Verify items still available
            if (fromP.cash < offerCash || toP.cash < reqCash) {
                this.activeTrade = null;
                return { error: 'Trade cancelled due to insufficient funds' };
            }

            fromP.cash -= offerCash;
            fromP.cash += reqCash;
            toP.cash -= reqCash;
            toP.cash += offerCash;

            // Transfer properties
            offerProps.forEach(spId => {
                fromP.properties = fromP.properties.filter(id => id !== spId);
                toP.properties.push(spId);
            });

            reqProps.forEach(spId => {
                toP.properties = toP.properties.filter(id => id !== spId);
                fromP.properties.push(spId);
            });

            this.addLog(`Trade accepted between ${fromP.name} and ${toP.name}!`);
        } else {
            this.addLog(`${toP.name} declined the trade offer from ${fromP.name}`);
        }

        this.activeTrade = null;
        return { success: true, accepted: accept };
    }

    checkBankruptcy(playerId, creditorId = null) {
        const player = this.getPlayer(playerId);
        if (player.cash >= 0) return false;

        // Check total net worth (cash + unmortgaged value + half building costs)
        let totalAssetValue = player.cash;
        player.properties.forEach(spId => {
            const space = BOARD_SPACES[spId];
            if (!player.mortgaged[spId]) totalAssetValue += space.mortgage;
            const h = player.houses[spId] || 0;
            totalAssetValue += h * (space.houseCost / 2);
        });

        if (totalAssetValue < 0) {
            player.bankrupt = true;
            this.addLog(`💀 ${player.name} went BANKRUPT!`);

            const creditor = creditorId ? this.getPlayer(creditorId) : null;
            player.properties.forEach(spId => {
                if (creditor) {
                    creditor.properties.push(spId);
                }
            });
            player.properties = [];

            // Check if game over (only 1 player remains)
            const activePlayers = this.players.filter(p => !p.bankrupt);
            if (activePlayers.length === 1) {
                this.addLog(`🏆 GAME OVER! ${activePlayers[0].name} IS THE MONOPOLY CHAMPION!`);
                this.turnPhase = 'GAME_OVER';
            }
            return true;
        }
        return false;
    }

    endTurn(playerId) {
        const player = this.getCurrentPlayer();
        if (player.id !== playerId && !player.isBot) return { error: 'Not your turn' };
        if (this.turnPhase !== 'END_TURN' && this.turnPhase !== 'LANDED') return { error: 'Cannot end turn yet' };

        // If rolled doubles and not in jail, player gets another roll
        if (this.lastRoll && this.lastRoll.isDoubles && !player.inJail && this.doublesCount > 0 && this.doublesCount < 3) {
            this.turnPhase = 'ROLL';
            this.addLog(`${player.name} gets to roll again for rolling doubles!`);
            this.checkBotTurn();
            return { success: true, extraTurn: true };
        }

        // Pass to next active player
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().bankrupt);

        this.turnPhase = 'ROLL';
        this.doublesCount = 0;
        this.lastRoll = null;
        this.addLog(`It is now ${this.getCurrentPlayer().name}'s turn!`);

        this.checkBotTurn();
        return { success: true };
    }

    checkBotTurn() {
        const curr = this.getCurrentPlayer();
        if (curr && curr.isBot && !curr.bankrupt && this.turnPhase !== 'GAME_OVER') {
            setTimeout(() => {
                this.executeBotTurn();
            }, 1000);
        }
    }

    executeBotTurn() {
        const bot = this.getCurrentPlayer();
        if (!bot || !bot.isBot || bot.bankrupt) return;

        if (this.turnPhase === 'ROLL') {
            this.rollDice(bot.id);
            setTimeout(() => this.executeBotTurn(), 1000);
            return;
        }

        if (this.turnPhase === 'BUS_CHOICE') {
            this.makeBusChoice(bot.id, 'SUM');
            setTimeout(() => this.executeBotTurn(), 1000);
            return;
        }

        if (this.turnPhase === 'LANDED') {
            const space = BOARD_SPACES[bot.position];
            if (['PROPERTY', 'RAILROAD', 'UTILITY'].includes(space.type) && !this.getOwner(space.id) && bot.cash >= space.price) {
                this.buyProperty(bot.id);
            }
            this.turnPhase = 'END_TURN';
            setTimeout(() => this.endTurn(bot.id), 1000);
            return;
        }

        if (this.turnPhase === 'END_TURN') {
            this.endTurn(bot.id);
        }
    }

    getState() {
        return {
            roomId: this.roomId,
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            turnPhase: this.turnPhase,
            lastRoll: this.lastRoll,
            activeAuction: this.activeAuction,
            activeTrade: this.activeTrade,
            logs: this.logs,
            winner: this.turnPhase === 'GAME_OVER' ? this.players.find(p => !p.bankrupt) : null
        };
    }
}

module.exports = GameEngine;
