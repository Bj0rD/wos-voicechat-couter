# CounterBot VC - Docker Deployment

This guide will help you deploy CounterBot VC using Docker, ensuring consistent operation across all platforms.

## 🐳 Quick Start

### Prerequisites
- Docker installed
- Docker Compose installed
- Discord bot credentials

### 1. Clone the Repository
```bash
git clone <repository-url>
cd counterbotVC
```

### 2. Configure Your Bot
Create `config/config.json` with your Discord bot credentials:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "clientId": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID"
}
```

### 3. Deploy with One Command
```bash
./deploy.sh
```

That's it! Your bot will be running in a Docker container.

## 📋 Manual Deployment

If you prefer manual deployment:

### Build the Image
```bash
docker-compose build
```

### Start the Container
```bash
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
```

## 🔧 Container Features

### Pre-installed Dependencies
- **Ubuntu 22.04** base image
- **Node.js 18.x** (LTS)
- **Festival TTS** - High-quality speech synthesis
- **eSpeak** - Fast speech synthesis
- **FFmpeg** - Audio processing
- **All required system libraries**

### Persistent Storage
- **`./config/`** - Bot configuration (mounted)
- **`./temp/`** - Audio cache and library (mounted)

### Security
- **Non-root user** (botuser)
- **Resource limits** (512MB memory)
- **Health checks** enabled

## 🎯 TTS Configuration

The container uses **Festival TTS** as the primary speech engine, which provides:
- ✅ **High-quality voice synthesis**
- ✅ **Consistent cross-platform operation**
- ✅ **No platform-specific voice issues**
- ✅ **Reliable performance**

## 📊 Management Commands

### View Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
```

### Stop the Bot
```bash
docker-compose down
```

### Restart the Bot
```bash
docker-compose restart
```

### Update the Bot
```bash
git pull
./deploy.sh
```

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs

# Check if config.json exists
ls -la config/
```

### Audio Issues
```bash
# Check if temp directory is writable
docker-compose exec counterbot-vc ls -la /app/temp

# Restart container
docker-compose restart
```

### Memory Issues
```bash
# Check container resource usage
docker stats counterbot-vc

# Increase memory limit in docker-compose.yml if needed
```

## 🌐 Environment Variables

You can customize the container behavior:

```yaml
environment:
  - NODE_ENV=production
  - TTS_PROVIDER=local
  - TZ=UTC
```

## 📁 Directory Structure

```
counterbotVC/
├── config/
│   └── config.json          # Bot credentials
├── temp/                    # Audio cache (auto-created)
├── Dockerfile              # Container definition
├── docker-compose.yml      # Orchestration
├── deploy.sh               # Deployment script
└── ...                     # Bot source code
```

## 🚀 Production Deployment

For production environments:

### 1. Use Docker Registry
```bash
# Build and tag
docker build -t your-registry/counterbot-vc:latest .

# Push to registry
docker push your-registry/counterbot-vc:latest
```

### 2. Use Docker Swarm or Kubernetes
```bash
# Deploy to swarm
docker stack deploy -c docker-compose.yml counterbot
```

### 3. Use Reverse Proxy
Add to your nginx/apache configuration to expose web interface (future feature).

## 🎉 Benefits

- ✅ **Zero setup** - Works out of the box
- ✅ **Cross-platform** - Same container runs everywhere
- ✅ **Consistent TTS** - Festival provides reliable voice synthesis
- ✅ **Easy updates** - Just rebuild and restart
- ✅ **Persistent data** - Config and cache survive restarts
- ✅ **Resource efficient** - Lightweight Ubuntu container

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify your config.json is correct
3. Ensure Docker has sufficient resources
4. Check Discord bot permissions

Happy coordinating! 🎤⚡ 