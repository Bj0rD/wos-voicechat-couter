#!/bin/bash

# CounterBot VC Docker Deployment Script
echo "🚀 CounterBot VC Docker Deployment"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p config
mkdir -p temp

# Check if config.json exists
if [ ! -f "config/config.json" ]; then
    echo "⚠️  No config.json found in config directory."
    echo "Please create config/config.json with your Discord bot credentials:"
    echo "{"
    echo "  \"token\": \"YOUR_DISCORD_BOT_TOKEN\","
    echo "  \"clientId\": \"YOUR_CLIENT_ID\","
    echo "  \"guildId\": \"YOUR_GUILD_ID\""
    echo "}"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"

# Start the container
echo "🚀 Starting CounterBot VC..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start container!"
    exit 1
fi

echo "✅ CounterBot VC is now running!"
echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop bot: docker-compose down"
echo "  Restart bot: docker-compose restart"
echo "  Update bot: ./deploy.sh"
echo ""
echo "🎉 Your Discord bot should now be online!" 