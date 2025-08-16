const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { PlayerManager } = require('./src/PlayerManager');
const { CommandHandler } = require('./src/CommandHandler');
const { VoiceManager } = require('./src/VoiceManager');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Initialize managers
client.playerManager = new PlayerManager();
client.voiceManager = new VoiceManager(client);
client.commandHandler = new CommandHandler(client);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.commandHandler.registerCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  
  try {
    await client.commandHandler.handleCommand(interaction);
  } catch (error) {
    console.error('Error handling command:', error);
    await interaction.reply({ 
      content: 'There was an error executing this command!', 
      ephemeral: true 
    });
  }
});

client.login(config.token); 