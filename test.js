const { PlayerManager } = require('./src/PlayerManager');
const { TTSService } = require('./src/TTSService');

console.log('🧪 Testing CounterBot VC Core Functionality');
console.log('==========================================\n');

// Test async functionality
async function runTests() {
  // Test PlayerManager
  console.log('1. Testing PlayerManager...');
  const playerManager = new PlayerManager();

  try {
    // Test player registration
    playerManager.registerPlayer('Player1', 10);
    playerManager.registerPlayer('Player2', 15);
    playerManager.registerPlayer('Player3', 20);
    console.log('✅ Player registration successful');

    // Test player listing
    const players = playerManager.getAllPlayers();
    console.log(`✅ Found ${players.length} players`);

    // Test attack timing calculation
    const attackTiming = playerManager.calculateAttackTiming();
    console.log('✅ Attack timing calculation successful');
    console.log(`   Total duration: ${attackTiming.totalDuration} seconds`);
    console.log(`   Players: ${attackTiming.players.length}`);

    // Display attack sequence
    console.log('\n📋 Attack Sequence:');
    attackTiming.players.forEach(player => {
      console.log(`   ${player.attackOrder}. ${player.name}: Start at ${player.attackStartTime}s, Arrive at ${player.timeToDestination}s`);
    });

    // Test player update
    playerManager.updatePlayer('Player1', 12);
    console.log('✅ Player update successful');

    // Test player removal
    playerManager.removePlayer('Player3');
    console.log('✅ Player removal successful');

    // Test final calculation
    const finalTiming = playerManager.calculateAttackTiming();
    console.log(`✅ Final timing: ${finalTiming.players.length} players, ${finalTiming.totalDuration}s duration`);

  } catch (error) {
    console.error('❌ PlayerManager test failed:', error.message);
  }

  // Test TTSService
  console.log('\n2. Testing TTSService...');
  const ttsService = new TTSService();

  try {
    // Test console TTS
    await ttsService.generateSpeech('Test message');
    console.log('✅ Console TTS working');

    // Test provider switching
    ttsService.setProvider('local');
    console.log(`✅ TTS provider switched to: ${ttsService.getCurrentProvider()}`);

    // Test available providers
    const providers = ttsService.getAvailableProviders();
    console.log(`✅ Available TTS providers: ${providers.join(', ')}`);

    // Test provider availability
    console.log(`✅ Google TTS available: ${ttsService.isProviderAvailable('google')}`);
    console.log(`✅ Console TTS available: ${ttsService.isProviderAvailable('console')}`);

  } catch (error) {
    console.error('❌ TTSService test failed:', error.message);
  }

  // Test edge cases
  console.log('\n3. Testing Edge Cases...');

  try {
    // Test invalid time
    try {
      playerManager.registerPlayer('InvalidPlayer', 0);
      console.log('❌ Should have rejected 0 seconds');
    } catch (error) {
      console.log('✅ Correctly rejected 0 seconds');
    }

    // Test negative time
    try {
      playerManager.registerPlayer('InvalidPlayer2', -5);
      console.log('❌ Should have rejected negative seconds');
    } catch (error) {
      console.log('✅ Correctly rejected negative seconds');
    }

    // Test duplicate player
    try {
      playerManager.registerPlayer('Player1', 25);
      console.log('✅ Duplicate player registration handled');
    } catch (error) {
      console.log('❌ Unexpected error with duplicate player');
    }

    // Test non-existent player update
    try {
      playerManager.updatePlayer('NonExistentPlayer', 30);
      console.log('❌ Should have rejected non-existent player');
    } catch (error) {
      console.log('✅ Correctly rejected non-existent player update');
    }

    // Test empty player list
    playerManager.clearAllPlayers();
    try {
      playerManager.calculateAttackTiming();
      console.log('❌ Should have rejected empty player list');
    } catch (error) {
      console.log('✅ Correctly rejected empty player list');
    }

  } catch (error) {
    console.error('❌ Edge case test failed:', error.message);
  }

  console.log('\n🎉 All tests completed!');
  console.log('\nTo run the actual bot:');
  console.log('1. Configure your Discord bot credentials');
  console.log('2. Run: npm start');
  console.log('3. Use the slash commands in Discord');
}

// Run the tests
runTests().catch(console.error); 