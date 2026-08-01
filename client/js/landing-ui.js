// client/js/landing-ui.js

class LandingUI {
    constructor() {
        this.selectedToken = TOKENS[0].id;
        this.initTokens();
        this.initParticles();
        this.initListeners();
    }

    initTokens() {
        const picker = document.getElementById('landing-token-picker');
        if (!picker) return;

        picker.innerHTML = '';
        TOKENS.forEach(t => {
            const item = document.createElement('div');
            item.className = `token-item ${t.id === this.selectedToken ? 'selected' : ''}`;
            item.title = t.name;
            item.innerHTML = t.icon;
            item.onclick = () => {
                window.soundManager.playClick();
                this.selectedToken = t.id;
                document.querySelectorAll('#landing-token-picker .token-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
            };
            picker.appendChild(item);
        });
    }

    initListeners() {
        const btnDemo = document.getElementById('btn-demo-game');
        const btnCreate = document.getElementById('btn-create-game');
        const btnJoin = document.getElementById('btn-join-game');
        const nameInput = document.getElementById('player-name-input');
        const roomInput = document.getElementById('room-code-input');

        btnDemo.onclick = () => {
            const name = nameInput.value.trim() || 'Player 1';
            window.soundManager.playClick();

            // Set auto-start flag on room creation
            this.autoStartDemo = true;
            window.socketClient.createRoom(name, this.selectedToken);
        };

        btnCreate.onclick = () => {
            const name = nameInput.value.trim() || 'Player 1';
            window.soundManager.playClick();
            this.autoStartDemo = false;
            window.socketClient.createRoom(name, this.selectedToken);
        };

        btnJoin.onclick = () => {
            const name = nameInput.value.trim() || 'Player 2';
            const roomCode = roomInput.value.trim();
            if (!roomCode || roomCode.length !== 6) {
                window.app.showToast('Please enter a valid 6-letter room code', 'error');
                return;
            }
            window.soundManager.playClick();
            window.socketClient.joinRoom(roomCode, name, this.selectedToken);
        };
    }

    initParticles() {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let particles = [];
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = Array.from({ length: 40 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: Math.random() > 0.5 ? '#00D4FF' : '#FF2D7B'
            }));
        };

        window.addEventListener('resize', resize);
        resize();

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.4;
                ctx.fill();
            });
            ctx.globalAlpha = 1.0;
            requestAnimationFrame(loop);
        };
        loop();
    }
}

window.LandingUI = LandingUI;
