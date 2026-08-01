#!/bin/bash
# deploy/setup.sh — Oracle Free Tier Automated Setup Script
set -e

echo "🚀 Setting up Monopoly Revolution Server on Oracle Free Tier VM..."

# 1. Update package list & system dependencies
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential nginx ufw

# 2. Install Node.js 20.x LTS
echo "📦 Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2 globally
echo "⚙️ Installing PM2 process manager..."
sudo npm install -g pm2

# 4. Configure Firewall (Oracle IPTables + UFW)
echo "🛡️ Configuring Firewall ports (80, 443, 22)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Oracle Cloud Ubuntu instances use iptables rules by default that block HTTP:
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

# 5. Configure Nginx Reverse Proxy
echo "🌐 Configuring Nginx..."
sudo cp deploy/nginx.conf /etc/nginx/sites-available/monopoly
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/monopoly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. Start Application with PM2
echo "🎲 Starting Monopoly Revolution Application with PM2..."
npm install
pm2 start server/index.js --name "monopoly-revolution"
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

echo "✅ Setup Complete! Your Monopoly Revolution clone is live on port 80!"
