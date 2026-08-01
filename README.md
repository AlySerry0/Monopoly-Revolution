# 🎲 Monopoly Revolution Online

A real-time multiplayer **Monopoly Revolution** clone built with Node.js, Express, Socket.IO, and HTML5 Canvas. Featuring the iconic **circular radial board**, electronic banking, speed die, property trading, auctions, and custom Web Audio API sound synthesis.

---

## 🌟 Key Features

- **Signature Circular Board**: 40 radial property sectors rendered on canvas with house/hotel indicators and glowing owner rings.
- **Electronic Banking**: Starting balance of $1,500 with instant real-time transfers.
- **Speed Die Mechanics**: Includes standard dice plus Speed Die (`1`, `2`, `3`, `Mr. Monopoly`, `Bus Move`).
- **Real-Time Multiplayer**: 2–6 players per room using 6-character room codes (`REV88X`).
- **Auctions & Trading**: Live property bidding timer and interactive trade proposal modal between players.
- **Houses & Hotels**: Equal building rule across color-complete property sets.
- **Mortgage & Bankruptcy**: Full asset liquidation, mortgaging, and automated winner detection.
- **Aesthetics & Audio**: Dark neon theme, Orbitron font, glassmorphism UI, Web Audio API sound synthesis.

---

## 🚀 Quick Start (Local Run)

1. Clone or navigate to the repository:
   ```bash
   cd Monopoly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## ☁️ Deploying to Oracle Cloud Free Tier

### 1. Oracle VM Instance Requirements (Always Free)
- **Shape**: `VM.Standard.A1.Flex` (ARM Ampere) or `VM.Standard.E2.1.Micro` (AMD)
- **OS**: Ubuntu 22.04 LTS / 24.04 LTS
- **Networking**: Ingress rule allowing TCP traffic on port `80` (HTTP) and `443` (HTTPS) in your VCN Ingress Rules.

### 2. Deployment via SSH / CLI

Connect to your Oracle instance via SSH:
```bash
ssh -i /path/to/your-key.key ubuntu@<YOUR_ORACLE_PUBLIC_IP>
```

Clone this repository and run the setup script:
```bash
git clone <YOUR_GIT_REPO_URL> Monopoly
cd Monopoly
chmod +x deploy/setup.sh deploy/deploy.sh
./deploy/setup.sh
```

The setup script automatically:
1. Installs Node.js 20 LTS, Nginx, UFW, and PM2.
2. Configures Nginx reverse proxy on port 80 to proxy to Node.js on port 3000.
3. Opens Oracle Linux firewall ports (`iptables` & `ufw`).
4. Launches the server using PM2 with auto-restart on boot.

### 3. Future Updates
To update your server with new changes:
```bash
./deploy/deploy.sh
```

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript (ES6+), HTML5 Canvas, CSS Glassmorphism
- **Audio**: Web Audio API (Synthesizer)
- **Deployment**: Nginx, PM2, Oracle Cloud Infrastructure (OCI) Always Free Tier
