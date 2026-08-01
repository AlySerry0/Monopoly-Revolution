// client/js/board-renderer.js

class BoardRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameState = null;
        this.tokenPositions = {}; // playerId -> animated angle/position
        this.animating = false;

        this.initResize();
    }

    initResize() {
        const resize = () => {
            const container = this.canvas.parentElement;
            const size = Math.min(container.clientWidth, container.clientHeight, 900);
            this.canvas.width = size;
            this.canvas.height = size;
            this.draw();
        };
        window.addEventListener('resize', resize);
        setTimeout(resize, 100);
    }

    updateState(gameState) {
        this.gameState = gameState;
        if (gameState && gameState.players) {
            gameState.players.forEach(p => {
                if (this.tokenPositions[p.id] === undefined) {
                    this.tokenPositions[p.id] = p.position;
                } else {
                    // Smooth transition target
                    this.animateTokenTo(p.id, p.position);
                }
            });
        }
        this.draw();
    }

    animateTokenTo(playerId, targetPos) {
        let currentPos = this.tokenPositions[playerId];
        let diff = targetPos - currentPos;
        if (diff < 0) diff += 40; // Forward movement

        const steps = 15;
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
        }, 20);
    }

    draw() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const ctx = this.ctx;

        ctx.clearRect(0, 0, width, height);

        const centerX = width / 2;
        const centerY = height / 2;
        const outerRadius = width * 0.48;
        const colorRingRadius = width * 0.43;
        const innerRadius = width * 0.32;
        const hubRadius = width * 0.20;

        // Background dark glow
        const bgGradient = ctx.createRadialGradient(centerX, centerY, hubRadius, centerX, centerY, outerRadius);
        bgGradient.addColorStop(0, '#0c0c1e');
        bgGradient.addColorStop(1, '#05050b');
        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
        ctx.fill();

        // Draw Outer Rim Glow
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00D4FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        // Draw 40 Radial Sectors
        const sectorAngle = (Math.PI * 2) / 40;
        const angleOffset = -Math.PI / 2; // Position 0 (GO) at top center

        for (let i = 0; i < 40; i++) {
            const space = BOARD_SPACES[i];
            const startAngle = angleOffset + i * sectorAngle;
            const endAngle = startAngle + sectorAngle;
            const midAngle = startAngle + sectorAngle / 2;

            // Sector Wedge Background
            ctx.beginPath();
            ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
            ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
            ctx.closePath();

            ctx.fillStyle = (i % 2 === 0) ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.015)';
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.stroke();

            // Draw Property Color Arc Rim
            if (space.color) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
                ctx.arc(centerX, centerY, colorRingRadius, endAngle, startAngle, true);
                ctx.closePath();

                ctx.fillStyle = space.color;
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                ctx.stroke();
            }

            // Draw Owner Ring Indicator
            if (this.gameState) {
                const owner = this.gameState.players.find(p => p.properties.includes(space.id));
                if (owner) {
                    const tokenMeta = TOKENS.find(t => t.id === owner.token) || TOKENS[0];
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, innerRadius + 6, startAngle + 0.01, endAngle - 0.01);
                    ctx.lineWidth = 6;
                    ctx.strokeStyle = tokenMeta.color;
                    ctx.stroke();

                    // Mortgaged overlay
                    if (owner.mortgaged && owner.mortgaged[space.id]) {
                        ctx.beginPath();
                        ctx.arc(centerX, centerY, (outerRadius + innerRadius) / 2, startAngle, endAngle);
                        ctx.lineWidth = 12;
                        ctx.strokeStyle = 'rgba(255, 45, 123, 0.6)';
                        ctx.stroke();
                    }
                }

                // Draw Houses / Hotel
                const houseOwner = this.gameState.players.find(p => p.houses && p.houses[space.id] > 0);
                if (houseOwner) {
                    const houseCount = houseOwner.houses[space.id];
                    const hRadius = outerRadius - 10;
                    if (houseCount === 5) { // Hotel
                        const hX = centerX + Math.cos(midAngle) * hRadius;
                        const hY = centerY + Math.sin(midAngle) * hRadius;
                        ctx.fillStyle = '#FF2D7B'; // Hotel red/pink
                        ctx.beginPath();
                        ctx.arc(hX, hY, 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#FFF';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    } else { // 1-4 Houses
                        for (let h = 0; h < houseCount; h++) {
                            const offsetAngle = startAngle + (sectorAngle * (h + 1)) / (houseCount + 1);
                            const hX = centerX + Math.cos(offsetAngle) * hRadius;
                            const hY = centerY + Math.sin(offsetAngle) * hRadius;
                            ctx.fillStyle = '#00E87B'; // House emerald green
                            ctx.beginPath();
                            ctx.arc(hX, hY, 4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                }
            }

            // Draw Sector Label (Text along radial line)
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(midAngle);

            const textRadius = (colorRingRadius + innerRadius) / 2;
            ctx.translate(textRadius, 0);

            // Rotate text to face center
            if (midAngle > Math.PI / 2 && midAngle < (Math.PI * 3) / 2) {
                ctx.rotate(Math.PI);
            }

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '600 10px Inter';
            ctx.fillStyle = space.type === 'CORNER' ? '#FFD700' : '#FFFFFF';

            // Shorten name if needed
            let shortName = space.name;
            if (shortName.length > 12) shortName = shortName.substring(0, 10) + '..';

            ctx.fillText(shortName, 0, -4);

            if (space.price > 0) {
                ctx.font = '700 9px Orbitron';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.fillText(`$${space.price}`, 0, 8);
            } else if (space.type === 'TAX') {
                ctx.font = '700 9px Orbitron';
                ctx.fillStyle = '#FF2D7B';
                ctx.fillText(`-$${space.amount}`, 0, 8);
            }

            ctx.restore();
        }

        // Draw Center Hub Wheel (Revolution Central Zone)
        ctx.beginPath();
        ctx.arc(centerX, centerY, hubRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(12, 12, 30, 0.95)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00D4FF';
        ctx.shadowColor = '#00D4FF';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw Center Hub Text & Dice Display
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (this.gameState && this.gameState.lastRoll) {
            const { d1, d2, speedDie } = this.gameState.lastRoll;
            ctx.font = '700 28px Orbitron';
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`🎲 ${d1}  +  ${d2}`, centerX, centerY - 14);

            ctx.font = '600 13px Orbitron';
            ctx.fillStyle = '#00D4FF';
            ctx.fillText(`SPEED DIE: [ ${speedDie} ]`, centerX, centerY + 18);
        } else {
            ctx.font = '900 18px Orbitron';
            ctx.fillStyle = '#00D4FF';
            ctx.fillText('MONOPOLY', centerX, centerY - 10);

            ctx.font = '700 12px Orbitron';
            ctx.fillStyle = '#FFD700';
            ctx.fillText('REVOLUTION', centerX, centerY + 12);
        }

        // Draw Player Tokens
        if (this.gameState && this.gameState.players) {
            this.gameState.players.forEach(p => {
                if (p.bankrupt) return;
                const pos = this.tokenPositions[p.id] !== undefined ? this.tokenPositions[p.id] : p.position;
                const tokenAngle = angleOffset + pos * sectorAngle + sectorAngle / 2;

                // Stagger overlapping tokens slightly
                const pIdx = this.gameState.players.indexOf(p);
                const radialOffset = innerRadius + 18 + (pIdx * 10);

                const tX = centerX + Math.cos(tokenAngle) * radialOffset;
                const tY = centerY + Math.sin(tokenAngle) * radialOffset;

                const tokenMeta = TOKENS.find(t => t.id === p.token) || TOKENS[0];

                // Glow ring around token
                ctx.beginPath();
                ctx.arc(tX, tY, 14, 0, Math.PI * 2);
                ctx.fillStyle = tokenMeta.color;
                ctx.shadowColor = tokenMeta.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(tokenMeta.icon, tX, tY);
            });
        }
    }
}

window.BoardRenderer = BoardRenderer;
