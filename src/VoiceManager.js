const { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const { TTSService } = require('./TTSService');
const fs = require('fs');
const path = require('path');

class VoiceManager {
  constructor(client) {
    this.client = client;
    this.connections = new Map();
    this.audioPlayers = new Map();
    this.countdownTimers = new Map();
    this.ttsService = new TTSService();
    
    // Set TTS provider to local for actual voice output
    this.ttsService.setProvider('local');
  }

  // Join a voice channel
  async joinVoiceChannel(interaction) {
    const voiceChannel = interaction.member.voice.channel;
    
    if (!voiceChannel) {
      throw new Error('You need to be in a voice channel to use this command!');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      const audioPlayer = createAudioPlayer();
      connection.subscribe(audioPlayer);

      this.connections.set(interaction.guildId, connection);
      this.audioPlayers.set(interaction.guildId, audioPlayer);

      // Handle connection events
      connection.on(VoiceConnectionStatus.Ready, () => {
        console.log('Voice connection ready');
      });

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch (error) {
          connection.destroy();
          this.connections.delete(interaction.guildId);
          this.audioPlayers.delete(interaction.guildId);
        }
      });

      return connection;
    } catch (error) {
      throw new Error(`Failed to join voice channel: ${error.message}`);
    }
  }

  // Leave voice channel
  leaveVoiceChannel(guildId) {
    const connection = this.connections.get(guildId);
    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
      this.audioPlayers.delete(guildId);
      
      // Clear any active countdown
      const timer = this.countdownTimers.get(guildId);
      if (timer) {
        clearTimeout(timer);
        this.countdownTimers.delete(guildId);
      }
    }
  }

  // Start synchronized attack countdown
  async startAttackCountdown(interaction, attackTiming) {
    if (!this.connections.has(interaction.guildId)) {
      throw new Error('Bot is not in a voice channel. Use /join first.');
    }

    const { players, totalDuration } = attackTiming;
    
    // Create countdown embed
    const groupText = attackTiming.attackGroup ? `Attack Group ${attackTiming.attackGroup}` : 'All Groups';
    
    const embed = new EmbedBuilder()
      .setTitle('🚀 Attack Sequence Initiated!')
      .setColor('#FF6B6B')
      .setDescription(`**${groupText}**\n**Total Duration:** ${totalDuration} seconds\n**Players:** ${players.length}`)
      .addFields(
        players.map(player => ({
          name: `Player ${player.attackOrder}: ${player.name} (Group ${player.attackGroup})`,
          value: `Starts in: **${player.attackStartTime}s** | Arrives in: **${player.timeToDestination}s**`,
          inline: false
        }))
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Generate and play synchronized countdown
    await this.playSynchronizedCountdown(interaction.guildId, players, totalDuration);
  }

  // Stop the current attack countdown
  async stopAttackCountdown(interaction) {
    const guildId = interaction.guildId;
    
    // Clear any active countdown timers
    const timer = this.countdownTimers.get(guildId);
    if (timer) {
      clearTimeout(timer);
      this.countdownTimers.delete(guildId);
    }

    // Stop any ongoing audio
    const audioPlayer = this.audioPlayers.get(guildId);
    if (audioPlayer) {
      audioPlayer.stop();
    }

    // Clear the countdown state
    this.countdownTimers.delete(guildId);
    
    return true;
  }

  // Check if there's an active countdown
  isCountdownActive(guildId) {
    return this.countdownTimers.has(guildId);
  }

  // Play synchronized countdown sequence
  async playSynchronizedCountdown(guildId, players, totalDuration) {
    const connection = this.connections.get(guildId);
    const audioPlayer = this.audioPlayers.get(guildId);
    
    if (!connection || !audioPlayer) {
      throw new Error('Voice connection not available');
    }

    try {
      // Generate the complete synchronized countdown audio
      const audioResource = await this.ttsService.generateSynchronizedCountdown(players, totalDuration);
      
      if (audioResource) {
        // Store the countdown timer for potential stopping
        const countdownTimer = setTimeout(() => {
          this.countdownTimers.delete(guildId);
        }, (totalDuration + 5) * 1000); // Add 5 seconds buffer
        
        this.countdownTimers.set(guildId, countdownTimer);
        
        // Play the complete synchronized countdown
        audioPlayer.play(audioResource);
        
        // Wait for audio to finish
        return new Promise((resolve) => {
          audioPlayer.once(AudioPlayerStatus.Idle, () => {
            this.countdownTimers.delete(guildId);
            resolve();
          });
        });
      } else {
        throw new Error('Failed to generate countdown audio');
      }
      
    } catch (error) {
      console.error('Synchronized countdown error:', error);
      throw error;
    }
  }

  // This method is no longer used with the synchronized approach
  // Kept for compatibility but not called
  async countdownForPlayer(audioPlayer, playerName) {
    // Deprecated - using synchronized countdown instead
    console.log(`Countdown for ${playerName} - using synchronized approach`);
  }

  // Speak text using TTS service
  async speakText(audioPlayer, text) {
    try {
      // Generate speech using the TTS service
      const audioResource = await this.ttsService.generateSpeech(text);
      
      if (audioResource) {
        // Play the audio if TTS service provided audio
        audioPlayer.play(audioResource);
        
        // Wait for audio to finish before continuing
        return new Promise((resolve) => {
          audioPlayer.once(AudioPlayerStatus.Idle, resolve);
        });
      } else {
        // If no audio resource (e.g., console TTS), just wait a bit
        await this.delay(500);
      }
    } catch (error) {
      console.error('TTS error:', error);
      // Fallback to console logging
      console.log(`🔊 TTS Fallback: ${text}`);
      await this.delay(500);
    }
  }

  // Utility delay function
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if bot is in a voice channel
  isInVoiceChannel(guildId) {
    return this.connections.has(guildId);
  }

  // Get current voice connection
  getConnection(guildId) {
    return this.connections.get(guildId);
  }
}

module.exports = { VoiceManager }; 