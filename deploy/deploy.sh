#!/bin/bash
# deploy/deploy.sh — One-click update script for Oracle Free Tier
set -e

echo "🔄 Pulling latest Monopoly Revolution code..."
git pull origin main || true

echo "📦 Installing dependencies..."
npm install --production

echo "♻️ Restarting application process..."
pm2 restart monopoly-revolution || pm2 start server/index.js --name "monopoly-revolution"

echo "🎉 Deployment successful!"
