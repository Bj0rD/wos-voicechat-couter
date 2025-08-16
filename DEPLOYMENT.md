# Deployment Guide for CounterBot VC

This guide will walk you through setting up and deploying your CounterBot VC Discord bot.

## Prerequisites

- Node.js 16.9.0 or higher
- A Discord account
- Basic knowledge of Discord bot development

## Step 1: Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "CounterBot VC")
4. Click "Create"

## Step 2: Create a Bot

1. In your application, go to the "Bot" section
2. Click "Add Bot"
3. Under "Privileged Gateway Intents", enable:
   - Presence Intent
   - Server Members Intent
   - Message Content Intent
4. Save your changes

## Step 3: Get Bot Credentials

1. In the "Bot" section, click "Copy" under the token to copy your bot token
2. Go to the "General Information" section and copy your Application ID
3. Keep these safe - you'll need them for configuration

## Step 4: Invite Bot to Your Server

1. Go to the "OAuth2" → "URL Generator" section
2. Under "Scopes", select "bot"
3. Under "Bot Permissions", select:
   - Send Messages
   - Use Slash Commands
   - Connect
   - Speak
   - Use Voice Activity
4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Step 5: Get Server ID

1. In Discord, enable Developer Mode (User Settings → Advanced → Developer Mode)
2. Right-click on your server name and select "Copy Server ID"

## Step 6: Configure the Bot

### Option A: Use the Setup Wizard (Recommended)

```bash
node setup.js
```

Follow the prompts to enter your:
- Bot Token
- Client ID (Application ID)
- Guild ID (Server ID)

### Option B: Manual Configuration

1. Edit `config.json`:
```json
{
  "token": "YOUR_BOT_TOKEN_HERE",
  "clientId": "YOUR_APPLICATION_ID_HERE",
  "guildId": "YOUR_SERVER_ID_HERE"
}
```

2. Create `.env` file (optional, for TTS configuration):
```env
TTS_PROVIDER=console
```

## Step 7: Install Dependencies

```bash
npm install
```

## Step 8: Test the Bot

```bash
node test.js
```

This will test the core functionality without needing Discord.

## Step 9: Run the Bot

```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Step 10: Verify Bot is Working

1. Check your Discord server - the bot should appear online
2. Try using `/status` to see if the bot responds
3. Use `/join` to add the bot to a voice channel

## Troubleshooting

### Bot Not Responding to Commands

1. Check if the bot is online
2. Verify slash commands are registered:
   - Bot must be in the server for commands to work
   - Commands are registered when the bot starts
3. Check bot permissions in the server

### Voice Issues

1. Ensure bot has voice permissions
2. Check if you're in a voice channel
3. Verify bot is connected to voice

### Common Error Messages

- **"Missing Permissions"**: Bot needs more permissions in the server
- **"Unknown Interaction"**: Command not properly registered
- **"Voice Connection Failed"**: Check voice permissions and channel access

## Advanced Configuration

### TTS Integration

To use actual voice synthesis instead of console logging:

1. **Local TTS** (macOS):
   ```bash
   # macOS has built-in 'say' command
   npm install
   ```

2. **Google Cloud TTS**:
   ```bash
   npm install @google-cloud/text-to-speech
   # Set GOOGLE_APPLICATION_CREDENTIALS environment variable
   ```

3. **Azure Speech Services**:
   ```bash
   npm install microsoft-cognitiveservices-speech-sdk
   # Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION
   ```

4. **Amazon Polly**:
   ```bash
   npm install aws-sdk
   # Configure AWS credentials
   ```

### Environment Variables

You can use environment variables instead of config.json:

```bash
export DISCORD_TOKEN="your_token"
export DISCORD_CLIENT_ID="your_client_id"
export DISCORD_GUILD_ID="your_guild_id"
export TTS_PROVIDER="console"
```

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start index.js --name "counterbot-vc"
pm2 startup
pm2 save
```

### Using Docker

Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t counterbot-vc .
docker run -d --name counterbot-vc counterbot-vc
```

## Security Notes

- Never share your bot token publicly
- Use environment variables in production
- Regularly rotate your bot token
- Monitor bot permissions and access

## Support

If you encounter issues:

1. Check the console output for error messages
2. Verify all configuration values are correct
3. Ensure bot has proper permissions
4. Check Discord Developer Portal for any restrictions

## Next Steps

Once your bot is running:

1. Register players using `/register` (optionally specify attack group)
2. Join a voice channel with `/join`
3. Preview attacks using `/preview` to see the plan (optionally specify group)
4. Launch synchronized attacks with `/launch` (optionally specify group)
5. Use `/stop` to cancel countdowns if players miss timing
6. Manage multiple attack groups for complex coordination scenarios
7. Customize the TTS voice and timing as needed

Happy coordinating! 🚀 