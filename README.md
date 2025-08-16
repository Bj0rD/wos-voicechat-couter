# CounterBot VC - Discord Synchronized Attack Bot

A Discord bot that coordinates synchronized attacks by calculating optimal timing for multiple players based on their distance to target. The bot provides voice countdowns to ensure all players launch their attacks at the perfect moment for synchronized arrival.

## Features

- **Player Management**: Register, update, and remove players with their time-to-destination
- **Synchronization Logic**: Automatically calculates when each player should start their attack
- **Voice Countdowns**: Provides voice announcements and countdowns in Discord voice channels
- **Real-time Coordination**: Ensures all attacks arrive at the target simultaneously
- **Easy Commands**: Simple slash commands for all operations

## Commands

### Player Management
- `/register <playername> <seconds> [group]` - Register a new player with their time to destination and attack group (default: 1)
- `/update <playername> <seconds> [group]` - Update a player's time to destination and/or attack group
- `/remove <playername>` - Remove a specific player
- `/clear` - Remove all registered players
- `/cleargroup <group>` - Remove all players from a specific attack group
- `/list` - Show all registered players with their groups

### Voice Channel
- `/join` - Bot joins your current voice channel
- `/leave` - Bot leaves the voice channel

### Attack Coordination
- `/preview [group]` - Preview the attack sequence without launching (optional: specific group)
- `/launch [group]` - Start the synchronized attack sequence (optional: specific group)
- `/stop` - Stop the current attack countdown
- `/status` - Show current bot status and player count

## How It Works

1. **Register Players**: Add players with their time to reach the target and attack group
2. **Organize Groups**: Players can be assigned to different attack groups for multiple coordinated attacks
3. **Join Voice Channel**: Bot joins your voice channel for announcements
4. **Preview/Launch**: Preview the plan or launch the sequence for specific groups or all groups
5. **Synchronized Attack**: Each group's players get synchronized countdowns ensuring perfect timing
6. **Emergency Stop**: Use `/stop` if players miss timing to reset and restart the sequence

### Example Scenario

**Attack Group 1:**
- **Player A**: 10 seconds to target
- **Player B**: 15 seconds to target  
- **Player C**: 20 seconds to target

**Attack Group 2:**
- **Player D**: 8 seconds to target
- **Player E**: 12 seconds to target

**Result**: 
- **Group 1**: All attacks arrive at 20s
  - Player A starts at 10 seconds (arrives at 20s)
  - Player B starts at 5 seconds (arrives at 20s)
  - Player C starts at 0 seconds (arrives at 20s)
- **Group 2**: All attacks arrive at 12s
  - Player D starts at 4 seconds (arrives at 12s)
  - Player E starts at 0 seconds (arrives at 12s)

Each group's attacks arrive simultaneously at their respective target times!

## Setup Instructions

### 1. Prerequisites
- Node.js 16.9.0 or higher
- Discord Bot Token
- Discord Application with proper permissions

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure the Bot
1. Edit `config.json` with your bot credentials:
```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN_HERE",
  "clientId": "YOUR_CLIENT_ID_HERE",
  "guildId": "YOUR_GUILD_ID_HERE"
}
```

2. Ensure your bot has these permissions:
   - Send Messages
   - Use Slash Commands
   - Connect to Voice Channels
   - Speak in Voice Channels
   - Use Voice Activity

### 4. Run the Bot
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Voice Features

The bot now provides **actual voice announcements** in Discord voice channels using:

- **Local TTS (Default)** - Uses macOS `say` command for immediate voice output
- **Google Cloud Text-to-Speech** - For cloud-based voice synthesis
- **Amazon Polly** - AWS-powered voice generation
- **Microsoft Azure Speech Services** - Enterprise-grade TTS
- **Console Logging** - Fallback for debugging

### Voice Output
- ✅ **Real-time voice countdowns** in Discord voice channels
- ✅ **Player-specific announcements** with timing information
- ✅ **Synchronized countdown sequences** (3, 2, 1, Go!)
- ✅ **Automatic audio file management** with cleanup

The bot will now speak the countdowns instead of just logging them to console!

## Technical Details

- **Framework**: Discord.js v14
- **Voice Support**: @discordjs/voice
- **Architecture**: Modular design with separate managers for different concerns
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Real-time**: Uses Discord's real-time APIs for instant coordination

## Troubleshooting

### Common Issues

1. **Bot won't join voice channel**
   - Ensure bot has voice permissions
   - Check if you're in a voice channel
   - Verify bot is online

2. **Commands not working**
   - Check if slash commands are registered
   - Verify bot has proper permissions
   - Ensure bot is in the correct guild

3. **Voice not working**
   - Check voice permissions
   - Verify bot is connected to voice channel
   - Check console for error messages

### Permissions Checklist

- [ ] Bot has `Send Messages` permission
- [ ] Bot has `Use Slash Commands` permission  
- [ ] Bot has `Connect` permission for voice channels
- [ ] Bot has `Speak` permission in voice channels
- [ ] Bot has `Use Voice Activity` permission

## Contributing

Feel free to submit issues and enhancement requests!
If you like the project you can buy me a coffee :P
https://buymeacoffee.com/bj0rd

## License

MIT License - see LICENSE file for details. 