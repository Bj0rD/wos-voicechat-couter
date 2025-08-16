class PlayerManager {
  constructor() {
    this.players = new Map();
  }

  // Register a new player with their time to destination and attack group
  registerPlayer(playerName, timeToDestination, attackGroup = 1) {
    if (timeToDestination <= 0) {
      throw new Error('Time to destination must be greater than 0');
    }
    
    if (attackGroup <= 0) {
      throw new Error('Attack group must be greater than 0');
    }
    
    this.players.set(playerName, {
      name: playerName,
      timeToDestination: timeToDestination,
      attackGroup: attackGroup,
      registeredAt: Date.now()
    });
    
    return this.players.get(playerName);
  }

  // Update a player's time to destination and/or attack group
  updatePlayer(playerName, newTimeToDestination, newAttackGroup = null) {
    if (!this.players.has(playerName)) {
      throw new Error(`Player ${playerName} not found`);
    }
    
    if (newTimeToDestination <= 0) {
      throw new Error('Time to destination must be greater than 0');
    }
    
    if (newAttackGroup !== null && newAttackGroup <= 0) {
      throw new Error('Attack group must be greater than 0');
    }
    
    const player = this.players.get(playerName);
    player.timeToDestination = newTimeToDestination;
    if (newAttackGroup !== null) {
      player.attackGroup = newAttackGroup;
    }
    player.updatedAt = Date.now();
    
    return player;
  }

  // Remove a specific player
  removePlayer(playerName) {
    if (!this.players.has(playerName)) {
      throw new Error(`Player ${playerName} not found`);
    }
    
    return this.players.delete(playerName);
  }

  // Remove all players
  clearAllPlayers() {
    const count = this.players.size;
    this.players.clear();
    return count;
  }

  // Get all registered players
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  // Get a specific player
  getPlayer(playerName) {
    return this.players.get(playerName);
  }

  // Check if a player exists
  hasPlayer(playerName) {
    return this.players.has(playerName);
  }

  // Get the number of registered players
  getPlayerCount() {
    return this.players.size;
  }

  // Get players by attack group
  getPlayersByGroup(attackGroup) {
    return this.getAllPlayers().filter(player => player.attackGroup === attackGroup);
  }

  // Get all unique attack groups
  getAttackGroups() {
    const groups = new Set(this.getAllPlayers().map(player => player.attackGroup));
    return Array.from(groups).sort((a, b) => a - b);
  }

  // Get player count by group
  getPlayerCountByGroup(attackGroup) {
    return this.getPlayersByGroup(attackGroup).length;
  }

  // Calculate attack timing for all players or specific group
  calculateAttackTiming(attackGroup = null) {
    if (this.players.size === 0) {
      throw new Error('No players registered');
    }

    // Get players to calculate timing for
    let players;
    if (attackGroup !== null) {
      players = this.getPlayersByGroup(attackGroup);
      if (players.length === 0) {
        throw new Error(`No players found in attack group ${attackGroup}`);
      }
    } else {
      players = this.getAllPlayers();
    }

    const maxTime = Math.max(...players.map(p => p.timeToDestination));
    
    // Calculate when each player should start their attack
    // so they all arrive at the same time
    const attackTiming = players.map(player => ({
      ...player,
      attackStartTime: maxTime - player.timeToDestination,
      attackOrder: 0 // Will be set by VoiceManager
    }));

    // Sort by attack start time (earliest first)
    attackTiming.sort((a, b) => a.attackStartTime - b.attackStartTime);
    
    // Assign attack order
    attackTiming.forEach((player, index) => {
      player.attackOrder = index + 1;
    });

    return {
      players: attackTiming,
      totalDuration: maxTime,
      launchTime: Date.now(),
      attackGroup: attackGroup
    };
  }
}

module.exports = { PlayerManager }; 