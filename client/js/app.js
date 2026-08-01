// client/js/app.js

class App {
    constructor() {
        this.currentScreen = 'landing';
        this.init();
    }

    init() {
        // Initialize socket connection
        window.socketClient.connect();

        // Instantiate UIs
        window.landingUI = new LandingUI();
        window.lobbyUI = new LobbyUI();
        window.gameUI = new GameUI();

        console.log('Monopoly Revolution App Initialized.');
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => {
            s.classList.remove('active');
        });

        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;

        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) toast.parentElement.removeChild(toast);
        }, 4000);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
