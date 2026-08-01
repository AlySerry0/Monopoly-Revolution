// client/js/board-renderer.js — Monopoly Revolution Official Gameboard Renderer

class BoardRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameState = null;
        this.tokenPositions = {}; // playerId -> animated angle/position
        
        // Preload assets
        this.podImage = new Image();
        this.podImage.src = 'assets/pod.jpg';
        this.podImage.onload = () => this.draw();

        this.bgImage = new Image();
        this.bgImage.src = 'assets/board_bg.jpg';
        this.bgImage.onload = () => this.draw();

        this.initResize();
    }

    initResize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            const size = Math.min(container.clientWidth, container.clientHeight, 950) || 750;
            this.canvas.width = size;
            this.canvas.height = size;
            this.draw();
        };
        window.addEventListener('resize', resize);
        setTimeout(resize, 80);
    }

    updateState(gameState) {
        this.gameState = gameState;
        if (gameState && gameState.players) {
            gameState.players.forEach(p => {
                if (this.tokenPositions[p.id] === undefined) {
                    this.tokenPositions[p.id] = p.position;
                } else {
                    this.animateTokenTo(p.id, p.position);
                }
            });
        }
        this.draw();
    }

    animateTokenTo(playerId, targetPos) {
        let currentPos = this.tokenPositions[playerId];
        let diff = targetPos - currentPos;
        if (diff < 0) diff += 40;

        const steps = 18;
        let stepCount = 0;

        const animInterval = setInterval(() => {
            stepCount++;
            this.tokenPositions[playerId] = (currentPos + (diff * (stepCount / steps))) % 40;
            this.draw();

            if (stepCount >= steps) {
                this.tokenPositions[playerId] = targetPos;
                clearInterval(animInterval);
                this.draw();
            }
        }, 18);
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = width * 0.485;
        const zoneRingRadius = width * 0.445;
        const colorRingRadius = width * 0.405;
        const innerRadius = width * 0.285;
        const hubRadius = width * 0.195;

        // 1. Dark Futuristic Board Base
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.clip();

        if (this.bgImage.complete && this.bgImage.naturalWidth !== 0) {
            ctx.globalAlpha = 0.35;
            ctx.drawImage(this.bgImage, centerX - outerRadius, centerY - outerRadius, outerRadius * 2, outerRadius * 2);
            ctx.globalAlpha = 1.0;
        }

        const bgGradient = ctx.createRadialGradient(centerX, centerY, hubRadius, centerX, centerY, outerRadius);
        bgGradient.addColorStop(0, 'rgba(15, 15, 35, 0.95)');
        bgGradient.addColorStop(0.7, 'rgba(8, 8, 20, 0.92)');
        bgGradient.addColorStop(1, 'rgba(3, 3, 8, 0.98)');
        ctx.fillStyle = bgGradient;
        ctx.fill();
        ctx.restore();

        // 2. Outer Transport Zone Arcs (Walking, Cycle, Car, Rocket)
        const sectorAngle = (Math.PI * 2) / 40;
        const angleOffset = -Math.PI / 2; // Position 0 (GO) at Top 12 o'clock

        const zoneColors = {
            WALKING: '#00D4FF',
            CYCLE: '#00E87B',
            CAR: '#FFD700',
            ROCKET: '#FF2D7B'
        };

        Object.entries(ZONES).forEach(([key, zone]) => {
            const startA = angleOffset + zone.start * sectorAngle;
            const endA = angleOffset + (zone.end + 1) * sectorAngle;

            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startA, endA);
            ctx.arc(centerX, centerY, zoneRingRadius, endA, startA, true);
            ctx.closePath();

            ctx.fillStyle = zoneColors[key] || '#FFF';
            ctx.globalAlpha = 0.88;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#05050A';
            ctx.stroke();

            // Render Zone Label text along arc
            ctx.save();
            const midA = (startA + endA) / 2;
            const labelRadius = outerRadius - 9;
            ctx.translate(centerX + Math.cos(midA) * labelRadius, centerY + Math.sin(midA) * labelRadius);
            ctx.rotate(midA + Math.PI / 2);

            ctx.font = '900 10px Orbitron';
            ctx.fillStyle = '#05050A';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${zone.icon}  ${zone.name}`, 0, 0);
            ctx.restore();
        });

        // 3. Render 40 Radial Sectors (Properties & Special Spaces)
        for (let i = 0; i < 40; i++) {
            const space = BOARD_SPACES[i];
            const startAngle = angleOffset + i * sectorAngle;
            const endAngle = startAngle + sectorAngle;
            const midAngle = startAngle + sectorAngle / 2;

            // Wedge Container Background
            ctx.beginPath();
            ctx.arc(centerX, centerY, zoneRingRadius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            ctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.stroke();

            // Special Corner Tile Rendering (GO, Jail, Free Parking, Go To Jail)
            if (space.type === 'CORNER') {
                ctx.beginPath();
                ctx.arc(centerX, centerY, zoneRingRadius, startAngle, endAngle);
                ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
                ctx.closePath();

                if (space.id === 0) ctx.fillStyle = 'rgba(255, 215, 0, 0.25)'; // GO Gold
                else if (space.id === 10) ctx.fillStyle = 'rgba(255, 45, 123, 0.25)'; // Jail Red
                else if (space.id === 20) ctx.fillStyle = 'rgba(0, 212, 255, 0.25)'; // Free Parking
                else if (space.id === 30) ctx.fillStyle = 'rgba(155, 81, 224, 0.25)'; // Go To Jail
                ctx.fill();
            }

            // Property Color Arc Band
            if (space.color) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, zoneRingRadius, startAngle, endAngle);
                ctx.arc(centerX, centerY, colorRingRadius, endAngle, startAngle, true);
                ctx.closePath();

                ctx.fillStyle = space.color;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.stroke();
            }

            // Owner Indicator Arc & Mortgaged Overlay
            if (this.gameState) {
                const owner = this.gameState.players.find(p => p.properties.includes(space.id));
                if (owner) {
                    const tokenMeta = TOKENS.find(t => t.id === owner.token) || TOKENS[0];
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius + 6, startAngle + 0.01, endAngle - 0.01);
                    ctx.lineWidth = 7;
                    ctx.strokeStyle = tokenMeta.color;
                    ctx.stroke();

                    // Mortgaged Hatch Overlay
                    if (owner.mortgaged && owner.mortgaged[space.id]) {
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, (zoneRingRadius + innerRadius) / 2, startAngle, endAngle);
                        ctx.lineWidth = 14;
                        ctx.strokeStyle = 'rgba(255, 45, 123, 0.65)';
                        ctx.stroke();
                    }
                }

                // Render Houses & Hotels
                const houseOwner = this.gameState.players.find(p => p.houses && p.houses[space.id] > 0);
                if (houseOwner) {
                    const houseCount = houseOwner.houses[space.id];
                    const hRadius = colorRingRadius - 8;
                    if (houseCount === 5) { // Hotel
                        const hX = centerX + Math.cos(midAngle) * hRadius;
                        const hY = centerY + Math.sin(midAngle) * hRadius;
                        ctx.fillStyle = '#FF2D7B';
                        ctx.beginPath();
                        ctx.arc(hX, hY, 7, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 1.8;
                        ctx.stroke();
                    } else { // Houses
                        for (let h = 0; h < houseCount; h++) {
                            const offsetAngle = startAngle + (sectorAngle * (h + 1)) / (houseCount + 1);
                            const hX = centerX + Math.cos(offsetAngle) * hRadius;
                            const hY = centerY + Math.sin(offsetAngle) * hRadius;
                            ctx.fillStyle = '#00E87B';
                            ctx.beginPath();
                            ctx.arc(hX, hY, 4.5, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            // Radial Text Labels
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(midAngle);

            const textRadius = (colorRingRadius + innerRadius) / 2;
            ctx.translate(textRadius, 0);

            if (midAngle > Math.PI / 2 && midAngle < (Math.PI * 3) / 2) {
                ctx.rotate(Math.PI);
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            if (space.type === 'CORNER') {
                ctx.font = '900 11px Orbitron';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(space.name, 0, 0);
            } else if (space.type === 'ZONE_SPACE') {
                ctx.font = '900 10px Orbitron';
                ctx.fillStyle = space.color || '#00D4FF';
                ctx.fillText('ZONE POD', 0, -4);
                ctx.font = '700 8px Inter';
                ctx.fillStyle = '#FFF';
                ctx.fillText('EVENT', 0, 6);
            } else {
                ctx.font = '600 10px Inter';
                ctx.fillStyle = '#FFFFFF';

                let shortName = space.name;
                if (shortName.length > 13) shortName = shortName.substring(0, 11) + '..';

                ctx.fillText(shortName, 0, -4);

                if (space.price > 0) {
                    ctx.font = '700 9px Orbitron';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fillText(`$${space.price}`, 0, 8);
                } else if (space.type === 'TAX') {
                    ctx.font = '700 9px Orbitron';
                    ctx.fillStyle = '#FF2D7B';
                    ctx.fillText(`-$${space.amount}`, 0, 8);
                }
            }

            ctx.restore();
        }

        // 4. Center Electronic Banker Pod Unit
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
        ctx.clip();

        if (this.podImage.complete && this.podImage.naturalWidth !== 0) {
            ctx.drawImage(this.podImage, centerX - hubRadius, centerY - hubRadius, hubRadius * 2, hubRadius * 2);
        } else {
            ctx.fillStyle = '#0c0c1e';
            ctx.fill();
        }
        ctx.restore();

        // Pod Metallic Outer Rim & LED Glow Ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#00D4FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pod LCD Display Screen Overlay
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 8, 22, 0.82)';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.stroke();

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.gameState && this.gameState.lastRoll) {
            const { d1, d2, speedDie } = this.gameState.lastRoll;
            ctx.font = '900 24px Orbitron';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`🎲 ${d1} + ${d2}`, centerX, centerY - 10);

            ctx.font = '700 11px Orbitron';
            ctx.fillStyle = '#00D4FF';
            ctx.fillText(`SPEED DIE: [ ${speedDie} ]`, centerX, centerY + 14);
        } else {
            ctx.font = '900 15px Orbitron';
            ctx.fillStyle = '#00D4FF';
            ctx.fillText('ELECTRONIC', centerX, centerY - 10);

            ctx.font = '700 11px Orbitron';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('BANK POD', centerX, centerY + 10);
        }

        // 5. Draw Animated Player Tokens
        if (this.gameState && this.gameState.players) {
            this.gameState.players.forEach(p => {
                if (p.bankrupt) return;
                const pos = this.tokenPositions[p.id] !== undefined ? this.tokenPositions[p.id] : p.position;
                const tokenAngle = angleOffset + pos * sectorAngle + sectorAngle / 2;

                const pIdx = this.gameState.players.indexOf(p);
                const radialOffset = innerRadius + 18 + (pIdx * 10);

                const tX = centerX + Math.cos(tokenAngle) * radialOffset;
                const tY = centerY + Math.sin(tokenAngle) * radialOffset;

                const tokenMeta = TOKENS.find(t => t.id === p.token) || TOKENS[0];

                // Glowing Token Pin
                ctx.beginPath();
                ctx.arc(tX, tY, 15, 0, Math.PI * 2);
                ctx.fillStyle = tokenMeta.color;
                ctx.shadowColor = tokenMeta.color;
                ctx.shadowBlur = 14;
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#FFFFFF';
                ctx.stroke();

                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tokenMeta.icon, tX, tY);
            });
        }
    }
}

window.BoardRenderer = BoardRenderer;
