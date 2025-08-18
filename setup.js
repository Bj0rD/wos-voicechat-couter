#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 CounterBot VC Setup Wizard');
console.log('==============================\n');

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function setup() {
  try {
    // Check if config.json already exists
    const configPath = path.join(process.cwd(), 'config.json');
    if (fs.existsSync(configPath)) {
      const overwrite = await askQuestion('config.json already exists. Overwrite? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    console.log('\n📋 Discord Bot Configuration');
    console.log('----------------------------');
    
    const token = await askQuestion('Enter your Discord Bot Token: ');
    const clientId = await askQuestion('Enter your Discord Client ID: ');
    const guildId = await askQuestion('Enter your Discord Guild (Server) ID: ');

    // Create config.json
    const config = {
      token: token,
      clientId: clientId,
      guildId: guildId
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('\n✅ config.json created successfully!');

    // Ask about TTS provider
    console.log('\n🔊 TTS Service Configuration');
    console.log('----------------------------');
    console.log('Available providers:');
    console.log('1. console - Logs to console (default)');
    console.log('2. local - Uses cross-platform TTS (Windows/macOS/Linux)');
    console.log('3. google - Google Cloud Text-to-Speech');
    console.log('4. azure - Microsoft Azure Speech Services');
    console.log('5. polly - Amazon Polly');

    const ttsChoice = await askQuestion('\nChoose TTS provider (1-5, default: 1): ');
    
    let ttsProvider = 'console';
    switch (ttsChoice) {
      case '2': ttsProvider = 'local'; break;
      case '3': ttsProvider = 'google'; break;
      case '4': ttsProvider = 'azure'; break;
      case '5': ttsProvider = 'polly'; break;
      default: ttsProvider = 'console';
    }

    // Create .env file
    const envContent = `# Discord Bot Configuration
DISCORD_TOKEN=${token}
DISCORD_CLIENT_ID=${clientId}
DISCORD_GUILD_ID=${guildId}

# TTS Service Configuration
TTS_PROVIDER=${ttsProvider}

# Additional TTS configuration (uncomment and fill as needed)
# GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
# AZURE_SPEECH_KEY=your_azure_key_here
# AZURE_SPEECH_REGION=your_azure_region_here
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
`;

    const envPath = path.join(process.cwd(), '.env');
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');

    // Install dependencies
    console.log('\n📦 Installing Dependencies');
    console.log('---------------------------');
    
    const installDeps = await askQuestion('Install dependencies now? (Y/n): ');
    if (installDeps.toLowerCase() !== 'n') {
      console.log('Installing dependencies...');
      const { execSync } = require('child_process');
      execSync('npm install', { stdio: 'inherit' });
      console.log('\n✅ Dependencies installed successfully!');
    }

    console.log('\n🎉 Setup Complete!');
    console.log('==================');
    console.log('\nNext steps:');
    console.log('1. Make sure your bot has the required permissions in Discord');
    console.log('2. Run the bot with: npm start');
    console.log('3. Use /join to add the bot to your voice channel');
    console.log('4. Register players with /register (optionally specify attack group)');
    console.log('5. Preview attacks with /preview (optionally specify group)');
    console.log('6. Launch synchronized attacks with /launch (optionally specify group)');
    console.log('7. Use /stop to cancel countdowns if needed');
    
    if (ttsProvider !== 'console') {
      console.log(`\n📝 Note: You're using ${ttsProvider} TTS. Make sure to:`);
      switch (ttsProvider) {
        case 'local':
          console.log('   - Cross-platform TTS automatically detected');
          console.log('   - Windows: Uses SAPI, macOS: Uses say, Linux: Uses espeak');
          break;
        case 'google':
          console.log('   - Set up Google Cloud project and credentials');
          console.log('   - Install @google-cloud/text-to-speech package');
          break;
        case 'azure':
          console.log('   - Set up Azure Speech Services');
          console.log('   - Install microsoft-cognitiveservices-speech-sdk package');
          break;
        case 'polly':
          console.log('   - Set up AWS account and credentials');
          console.log('   - Install aws-sdk package');
          break;
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setup(); 