const { 
  SlashCommandBuilder, 
  EmbedBuilder,
  PermissionFlagsBits 
} = require('discord.js');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.initializeCommands();
  }

  initializeCommands() {
    // Register player command
    this.commands.set('register', new SlashCommandBuilder()
      .setName('register')
      .setDescription('Register a player with their time to destination')
      .addStringOption(option =>
        option.setName('playername')
          .setDescription('Name of the player')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('seconds')
          .setDescription('Time in seconds to reach destination')
          .setRequired(true)
          .setMinValue(1))
      .addIntegerOption(option =>
        option.setName('group')
          .setDescription('Attack group number (default: 1)')
          .setRequired(false)
          .setMinValue(1))
      .toJSON());

    // Update player command
    this.commands.set('update', new SlashCommandBuilder()
      .setName('update')
      .setDescription('Update a player\'s time to destination and/or attack group')
      .addStringOption(option =>
        option.setName('playername')
          .setDescription('Name of the player to update')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('seconds')
          .setDescription('New time in seconds to reach destination')
          .setRequired(true)
          .setMinValue(1))
      .addIntegerOption(option =>
        option.setName('group')
          .setDescription('New attack group number (optional)')
          .setRequired(false)
          .setMinValue(1))
      .toJSON());

    // Remove player command
    this.commands.set('remove', new SlashCommandBuilder()
      .setName('remove')
      .setDescription('Remove a player from the list')
      .addStringOption(option =>
        option.setName('playername')
          .setDescription('Name of the player to remove')
          .setRequired(true))
      .toJSON());

    // Clear all players command
    this.commands.set('clear', new SlashCommandBuilder()
      .setName('clear')
      .setDescription('Remove all registered players')
      .toJSON());

    // Clear players by group command
    this.commands.set('cleargroup', new SlashCommandBuilder()
      .setName('cleargroup')
      .setDescription('Remove all players from a specific attack group')
      .addIntegerOption(option =>
        option.setName('group')
          .setDescription('Attack group number to clear')
          .setRequired(true)
          .setMinValue(1))
      .toJSON());

    // List players command
    this.commands.set('list', new SlashCommandBuilder()
      .setName('list')
      .setDescription('List all registered players')
      .toJSON());

    // Join voice channel command
    this.commands.set('join', new SlashCommandBuilder()
      .setName('join')
      .setDescription('Join the voice channel you are currently in')
      .toJSON());

    // Leave voice channel command
    this.commands.set('leave', new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leave the voice channel')
      .toJSON());

    // Launch attack command
    this.commands.set('launch', new SlashCommandBuilder()
      .setName('launch')
      .setDescription('Launch synchronized attack sequence')
      .addIntegerOption(option =>
        option.setName('group')
          .setDescription('Attack group to launch (default: all groups)')
          .setRequired(false)
          .setMinValue(1))
      .toJSON());

    // Preview attack command
    this.commands.set('preview', new SlashCommandBuilder()
      .setName('preview')
      .setDescription('Preview the attack sequence without launching')
      .addIntegerOption(option =>
        option.setName('group')
          .setDescription('Attack group to preview (default: all groups)')
          .setRequired(false)
          .setMinValue(1))
      .toJSON());

    // Stop attack command
    this.commands.set('stop', new SlashCommandBuilder()
      .setName('stop')
      .setDescription('Stop the current attack countdown')
      .toJSON());

    // Status command
    this.commands.set('status', new SlashCommandBuilder()
      .setName('status')
      .setDescription('Show current bot status and player count')
      .toJSON());
  }

  async registerCommands() {
    try {
      const { REST, Routes } = require('discord.js');
      const path = require('path');
      const config = require(path.join(__dirname, '../config.json'));
      
      const rest = new REST({ version: '10' }).setToken(config.token);
      
      console.log('Started refreshing application (/) commands.');
      
      await rest.put(
        Routes.applicationGuildCommands(config.clientId, config.guildId),
        { body: Array.from(this.commands.values()) }
      );
      
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

  async handleCommand(interaction) {
    const commandName = interaction.commandName;
    
    switch (commandName) {
      case 'register':
        await this.handleRegister(interaction);
        break;
      case 'update':
        await this.handleUpdate(interaction);
        break;
      case 'remove':
        await this.handleRemove(interaction);
        break;
      case 'clear':
        await this.handleClear(interaction);
        break;
      case 'cleargroup':
        await this.handleClearGroup(interaction);
        break;
      case 'list':
        await this.handleList(interaction);
        break;
      case 'join':
        await this.handleJoin(interaction);
        break;
      case 'leave':
        await this.handleLeave(interaction);
        break;
      case 'launch':
        await this.handleLaunch(interaction);
        break;
      case 'preview':
        await this.handlePreview(interaction);
        break;
      case 'stop':
        await this.handleStop(interaction);
        break;
      case 'status':
        await this.handleStatus(interaction);
        break;
      default:
        await interaction.reply({ 
          content: 'Unknown command!', 
          ephemeral: true 
        });
    }
  }

  async handleRegister(interaction) {
    const playerName = interaction.options.getString('playername');
    const seconds = interaction.options.getInteger('seconds');
    const group = interaction.options.getInteger('group') || 1;

    try {
      const player = this.client.playerManager.registerPlayer(playerName, seconds, group);
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Player Registered!')
        .setColor('#4CAF50')
        .setDescription(`**${playerName}** has been registered with **${seconds} seconds** to destination in **Attack Group ${group}**.`)
        .addFields(
          { name: 'Total Players', value: this.client.playerManager.getPlayerCount().toString(), inline: true },
          { name: 'Attack Group', value: `Group ${group}`, inline: true },
          { name: 'Registered At', value: new Date(player.registeredAt).toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleUpdate(interaction) {
    const playerName = interaction.options.getString('playername');
    const seconds = interaction.options.getInteger('seconds');
    const group = interaction.options.getInteger('group');

    try {
      const player = this.client.playerManager.updatePlayer(playerName, seconds, group);
      
      let description = `**${playerName}** has been updated to **${seconds} seconds** to destination.`;
      if (group !== null) {
        description += ` Moved to **Attack Group ${group}**.`;
      }
      
      const embed = new EmbedBuilder()
        .setTitle('🔄 Player Updated!')
        .setColor('#FF9800')
        .setDescription(description)
        .addFields(
          { name: 'Updated At', value: new Date(player.updatedAt).toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleRemove(interaction) {
    const playerName = interaction.options.getString('playername');

    try {
      this.client.playerManager.removePlayer(playerName);
      
      const embed = new EmbedBuilder()
        .setTitle('🗑️ Player Removed!')
        .setColor('#F44336')
        .setDescription(`**${playerName}** has been removed from the player list.`)
        .addFields(
          { name: 'Remaining Players', value: this.client.playerManager.getPlayerCount().toString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleClear(interaction) {
    try {
      const count = this.client.playerManager.clearAllPlayers();
      
      const embed = new EmbedBuilder()
        .setTitle('🧹 All Players Cleared!')
        .setColor('#9C27B0')
        .setDescription(`**${count} players** have been removed from the list.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleClearGroup(interaction) {
    const group = interaction.options.getInteger('group');

    try {
      const playersInGroup = this.client.playerManager.getPlayersByGroup(group);
      const count = playersInGroup.length;
      
      if (count === 0) {
        await interaction.reply({ 
          content: `❌ No players found in Attack Group ${group}!`, 
          ephemeral: true 
        });
        return;
      }

      // Remove each player in the group
      playersInGroup.forEach(player => {
        this.client.playerManager.removePlayer(player.name);
      });
      
      const embed = new EmbedBuilder()
        .setTitle('🧹 Attack Group Cleared!')
        .setColor('#9C27B0')
        .setDescription(`**${count} players** have been removed from **Attack Group ${group}**.`)
        .addFields(
          { name: 'Removed Players', value: playersInGroup.map(p => p.name).join(', '), inline: false }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleList(interaction) {
    const players = this.client.playerManager.getAllPlayers();
    const groups = this.client.playerManager.getAttackGroups();
    
    if (players.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📋 Player List')
        .setColor('#607D8B')
        .setDescription('No players registered yet.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Registered Players')
      .setColor('#2196F3')
      .setDescription(`Total Players: **${players.length}** | Attack Groups: **${groups.join(', ')}**`)
      .addFields(
        players.map(player => ({
          name: `${player.name} (Group ${player.attackGroup})`,
          value: `⏱️ **${player.timeToDestination}s** to destination\n📅 Registered: ${new Date(player.registeredAt).toLocaleString()}`,
          inline: true
        }))
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  async handleJoin(interaction) {
    try {
      await this.client.voiceManager.joinVoiceChannel(interaction);
      
      const embed = new EmbedBuilder()
        .setTitle('🎤 Voice Channel Joined!')
        .setColor('#4CAF50')
        .setDescription('Bot is now in the voice channel and ready for synchronized attacks!')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleLeave(interaction) {
    try {
      this.client.voiceManager.leaveVoiceChannel(interaction.guildId);
      
      const embed = new EmbedBuilder()
        .setTitle('👋 Voice Channel Left!')
        .setColor('#F44336')
        .setDescription('Bot has left the voice channel.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleLaunch(interaction) {
    try {
      const group = interaction.options.getInteger('group');

      // Check if bot is in voice channel
      if (!this.client.voiceManager.isInVoiceChannel(interaction.guildId)) {
        await interaction.reply({ 
          content: '❌ Bot must be in a voice channel first! Use `/join` to add the bot to your voice channel.', 
          ephemeral: true 
        });
        return;
      }

      // Check if players are registered
      if (this.client.playerManager.getPlayerCount() === 0) {
        await interaction.reply({ 
          content: '❌ No players registered! Use `/register` to add players first.', 
          ephemeral: true 
        });
        return;
      }

      // Calculate attack timing
      const attackTiming = this.client.playerManager.calculateAttackTiming(group);
      
      // Start the countdown
      await this.client.voiceManager.startAttackCountdown(interaction, attackTiming);
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handlePreview(interaction) {
    try {
      const group = interaction.options.getInteger('group');

      // Check if players are registered
      if (this.client.playerManager.getPlayerCount() === 0) {
        await interaction.reply({ 
          content: '❌ No players registered! Use `/register` to add players first.', 
          ephemeral: true 
        });
        return;
      }

      // Calculate attack timing
      const attackTiming = this.client.playerManager.calculateAttackTiming(group);
      
      // Generate preview embed (same as launch but without starting countdown)
      const { players, totalDuration, attackGroup } = attackTiming;
      
      const groupText = attackGroup ? `Attack Group ${attackGroup}` : 'All Groups';
      
      const embed = new EmbedBuilder()
        .setTitle('👁️ Attack Sequence Preview')
        .setColor('#9C27B0')
        .setDescription(`**${groupText}**\n**Total Duration:** ${totalDuration} seconds\n**Players:** ${players.length}\n\n*This is a preview - no countdown will be started.*`)
        .addFields(
          players.map(player => ({
            name: `Player ${player.attackOrder}: ${player.name} (Group ${player.attackGroup})`,
            value: `Starts in: **${player.attackStartTime}s** | Arrives in: **${player.timeToDestination}s**`,
            inline: false
          }))
        )
        .addFields(
          { name: '🎤 Voice Channel Status', value: this.client.voiceManager.isInVoiceChannel(interaction.guildId) ? '✅ Connected' : '❌ Not Connected', inline: true },
          { name: '🚀 Ready to Launch', value: this.client.voiceManager.isInVoiceChannel(interaction.guildId) ? '✅ Yes' : '❌ Use `/join` first', inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      await interaction.reply({ 
        content: `❌ Error: ${error.message}`, 
        ephemeral: true 
      });
    }
  }

  async handleStop(interaction) {
    try {
      // Check if there's an active countdown
      if (!this.client.voiceManager.isCountdownActive(interaction.guildId)) {
        await interaction.reply({ 
          content: '❌ No active attack countdown to stop!', 
          ephemeral: true 
        });
        return;
      }

      // Stop the countdown
      await this.client.voiceManager.stopAttackCountdown(interaction);
      
      const embed = new EmbedBuilder()
        .setTitle('⏹️ Attack Countdown Stopped!')
        .setColor('#F44336')
        .setDescription('The synchronized attack countdown has been cancelled.')
        .addFields(
          { name: 'Status', value: 'Countdown stopped and reset', inline: true },
          { name: 'Ready for New Launch', value: '✅ Yes', inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('Stop command error:', error);
      
      // Try to reply, but handle the case where interaction might have timed out
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp({ 
            content: `❌ Error: ${error.message}`, 
            ephemeral: true 
          });
        } else {
          await interaction.reply({ 
            content: `❌ Error: ${error.message}`, 
            ephemeral: true 
          });
        }
      } catch (replyError) {
        console.error('Failed to reply to interaction:', replyError);
      }
    }
  }

  async handleStatus(interaction) {
    const playerCount = this.client.playerManager.getPlayerCount();
    const groups = this.client.playerManager.getAttackGroups();
    const inVoiceChannel = this.client.voiceManager.isInVoiceChannel(interaction.guildId);
    const countdownActive = this.client.voiceManager.isCountdownActive(interaction.guildId);
    
    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Status')
      .setColor('#2196F3')
      .addFields(
        { name: '🎮 Players Registered', value: playerCount.toString(), inline: true },
        { name: '⚔️ Attack Groups', value: groups.length > 0 ? groups.join(', ') : 'None', inline: true },
        { name: '🎤 Voice Channel', value: inVoiceChannel ? '✅ Connected' : '❌ Not Connected', inline: true },
        { name: '🚀 Ready for Launch', value: (playerCount > 0 && inVoiceChannel) ? '✅ Yes' : '❌ No', inline: true },
        { name: '⏱️ Countdown Active', value: countdownActive ? '🔄 Running' : '⏹️ Stopped', inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
}

module.exports = { CommandHandler }; 