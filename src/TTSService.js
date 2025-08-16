const { createAudioResource } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class TTSService {
  constructor() {
    this.provider = 'console'; // Default to console logging
    this.audioCache = new Map(); // key -> filePath
    this.numberLibrary = new Map(); // number -> filePath
    this.libraryInitialized = false;
  }

  // Set the TTS provider
  setProvider(provider) {
    this.provider = provider;
  }

  // Initialize the number library (pre-generate numbers 1-200)
  async initializeNumberLibrary() {
    if (this.libraryInitialized) return;

    try {
      const { exec, execFile } = require('child_process');
      const ffmpegPath = require('ffmpeg-static');

      // Ensure library directory exists
      const libraryDir = path.join(__dirname, '../temp/library');
      if (!fs.existsSync(libraryDir)) {
        fs.mkdirSync(libraryDir, { recursive: true });
      }

      const run = (cmd) => new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
          if (err) return reject(err);
          resolve({ stdout, stderr });
        });
      });

      const runFfmpeg = (args) => new Promise((resolve, reject) => {
        execFile(ffmpegPath, args, (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message));
          resolve({ stdout, stderr });
        });
      });

      console.log('🔊 Initializing number library (1-200)...');

      // Generate numbers 1-200
      for (let i = 1; i <= 200; i++) {
        const numberFile = path.join(libraryDir, `${i}.wav`);
        
        // Skip if already exists
        if (fs.existsSync(numberFile)) {
          this.numberLibrary.set(i, numberFile);
          continue;
        }

        // Generate the number
        const rawFile = path.join(libraryDir, `raw_${i}.aiff`);
        await run(`say -o "${rawFile}" -v "Samantha" -r 170 "${i}."`);
        
        // Pad/truncate to exactly 1.000s
        await runFfmpeg(['-y', '-i', rawFile, '-af', 'apad=pad_dur=1,atrim=0:1', '-ar', '48000', '-ac', '2', numberFile]);
        
        // Clean up raw file
        try { fs.unlinkSync(rawFile); } catch (_) {}
        
        this.numberLibrary.set(i, numberFile);
      }

      this.libraryInitialized = true;
      console.log('✅ Number library initialized!');
      
    } catch (error) {
      console.error('❌ Failed to initialize number library:', error);
      throw error;
    }
  }

  // Generate speech from text
  async generateSpeech(text, options = {}) {
    switch (this.provider) {
      case 'console':
        return this.consoleTTS(text);
      case 'local':
        return this.localTTS(text, options);
      case 'google':
        return this.googleTTS(text, options);
      case 'azure':
        return this.azureTTS(text, options);
      case 'polly':
        return this.amazonPollyTTS(text, options);
      default:
        return this.consoleTTS(text);
    }
  }

  // Console TTS (default - just logs to console)
  async consoleTTS(text) {
    console.log(`🔊 TTS: ${text}`);
    return null; // No audio resource
  }

  // Build a stable cache key for a given players/timing configuration
  buildCountdownCacheKey(players) {
    // Normalize: sort by attackStartTime then name, pick only relevant fields
    const normalized = [...players]
      .map(p => ({ name: String(p.name), t: Number(p.attackStartTime) }))
      .sort((a, b) => (a.t - b.t) || a.name.localeCompare(b.name));

    // Include voice and algo version to avoid cross-version cache collisions
    const payload = {
      v: 'sync-v3', // Updated version for library-based generation
      voice: 'Samantha',
      rate: 170,
      players: normalized,
    };

    return crypto
      .createHash('sha1')
      .update(JSON.stringify(payload))
      .digest('hex');
  }

  // Generate a complete synchronized countdown sequence with precise 1-second ticks
  async generateSynchronizedCountdown(players, totalDuration) {
    try {
      // Initialize number library if needed
      await this.initializeNumberLibrary();

      // Check cache first
      const cacheKey = this.buildCountdownCacheKey(players);
      const cachedPath = this.audioCache.get(cacheKey);
      if (cachedPath && fs.existsSync(cachedPath)) {
        // Reuse previously generated file
        return createAudioResource(cachedPath);
      }

      const { exec, execFile } = require('child_process');
      const ffmpegPath = require('ffmpeg-static');

      // Ensure temp dir
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

      const run = (cmd) => new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => {
          if (err) return reject(err);
          resolve({ stdout, stderr });
        });
      });

      const runFfmpeg = (args) => new Promise((resolve, reject) => {
        execFile(ffmpegPath, args, (err, stdout, stderr) => {
          if (err) return reject(new Error(stderr || err.message));
          resolve({ stdout, stderr });
        });
      });

      // Build simplified intro script
      const firstPlayer = players.find(p => p.attackStartTime === 0) || players[0];
      const maxTime = Math.max(...players.map(p => p.attackStartTime));

      let introScript = '';
      introScript += `Synchronized attack sequence. ${firstPlayer.name} starts first. `;
      players.forEach((p) => {
        if (p.attackStartTime === 0) introScript += `${p.name} starts immediately. `;
        else introScript += `${p.name} starts at second ${p.attackStartTime}. `;
      });
      introScript += `${firstPlayer.name} ready. Three. Two. One. Go. `;

      const ts = Date.now();
      const introFile = path.join(tempDir, `intro_${ts}.aiff`);
      await run(`say -o "${introFile}" -v "Samantha" -r 170 "${introScript}"`);

      // Use pre-generated number library instead of generating each number
      const numberFiles = [];
      for (let i = 1; i <= maxTime; i++) {
        const numberFile = this.numberLibrary.get(i);
        if (numberFile && fs.existsSync(numberFile)) {
          numberFiles.push(numberFile);
        } else {
          // Fallback: generate the number if not in library
          console.warn(`Number ${i} not found in library, generating...`);
          const raw = path.join(tempDir, `raw_${i}_${ts}.aiff`);
          const seg = path.join(tempDir, `seg_${i}_${ts}.wav`);
          await run(`say -o "${raw}" -v "Samantha" -r 170 "${i}."`);
          await runFfmpeg(['-y', '-i', raw, '-af', 'apad=pad_dur=1,atrim=0:1', '-ar', '48000', '-ac', '2', seg]);
          numberFiles.push(seg);
          try { fs.unlinkSync(raw); } catch (_) {}
        }
      }

      // Create final phrase clip: "Sequence complete."
      const finalAiff = path.join(tempDir, `final_${ts}.aiff`);
      await run(`say -o "${finalAiff}" -v "Samantha" -r 170 "Sequence complete."`);
      const finalWav = path.join(tempDir, `final_${ts}.wav`);
      await runFfmpeg(['-y', '-i', finalAiff, '-ar', '48000', '-ac', '2', finalWav]);
      try { fs.unlinkSync(finalAiff); } catch (_) {}

      // Concat: intro + library numbers + final line
      const listFile = path.join(tempDir, `list_${ts}.txt`);
      const outputFile = path.join(tempDir, `sync_countdown_${cacheKey}.wav`);

      // Ensure intro is consistent format for concat; re-encode intro
      const introWav = path.join(tempDir, `intro_${ts}.wav`);
      await runFfmpeg(['-y', '-i', introFile, '-ar', '48000', '-ac', '2', introWav]);
      try { fs.unlinkSync(introFile); } catch (_) {}

      const concatFiles = [introWav, ...numberFiles, finalWav];
      fs.writeFileSync(listFile, concatFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));

      await runFfmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c:a', 'pcm_s16le', outputFile]);

      // Cleanup intermediates (keep final output for playback)
      try { fs.unlinkSync(introWav); } catch (_) {}
      try { fs.unlinkSync(finalWav); } catch (_) {}
      try { fs.unlinkSync(listFile); } catch (_) {}
      // Don't delete library files, but clean up any fallback files
      for (const f of numberFiles) {
        if (f.includes(`seg_${ts}`)) {
          try { fs.unlinkSync(f); } catch (_) {}
        }
      }

      // Store in cache and return audio resource for the final file
      this.audioCache.set(cacheKey, outputFile);
      const audioResource = createAudioResource(outputFile);
      return audioResource;
    } catch (error) {
      console.error('Synchronized countdown error:', error);
      throw error;
    }
  }

  // Local TTS using system commands (kept for compatibility)
  async localTTS(text, options = {}) {
    try {
      const { exec } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      
      // Create temp directory if it doesn't exist
      const tempDir = path.join(__dirname, '../temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      // Generate unique filename
      const outputFile = path.join(tempDir, `tts_${Date.now()}.aiff`);
      
      // Use macOS 'say' command to generate audio with English voice
      return new Promise((resolve, reject) => {
        exec(`say -o "${outputFile}" -v "Samantha" -r 150 "${text}"`, (error) => {
          if (error) {
            console.error('Say command error:', error);
            reject(error);
          } else {
            // Wait a bit for file to be written
            setTimeout(() => {
              if (fs.existsSync(outputFile)) {
                // Create audio resource from the generated file
                const audioResource = createAudioResource(outputFile);
                resolve(audioResource);
                
                // Clean up file after a delay
                setTimeout(() => {
                  try {
                    fs.unlinkSync(outputFile);
                  } catch (cleanupError) {
                    console.log('Cleanup error (non-critical):', cleanupError.message);
                  }
                }, 10000); // Clean up after 10 seconds
              } else {
                reject(new Error('Audio file was not created'));
              }
            }, 500);
          }
        });
      });
      
    } catch (error) {
      console.error('Local TTS error:', error);
      return this.consoleTTS(text);
    }
  }

  // Google Cloud Text-to-Speech
  async googleTTS(text, options = {}) {
    try {
      // This is a placeholder for Google Cloud TTS integration
      // You'll need to:
      // 1. Set up Google Cloud project
      // 2. Enable Text-to-Speech API
      // 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
      // 4. Install @google-cloud/text-to-speech package
      
      console.log(`🔊 Google TTS: ${text}`);
      
      // Example implementation:
      // const textToSpeech = require('@google-cloud/text-to-speech');
      // const client = new textToSpeech.TextToSpeechClient();
      // 
      // const request = {
      //   input: { text: text },
      //   voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      //   audioConfig: { audioEncoding: 'MP3' },
      // };
      // 
      // const [response] = await client.synthesizeSpeech(request);
      // const audioContent = response.audioContent;
      // 
      // // Convert to audio resource
      // const resource = createAudioResource(Buffer.from(audioContent));
      // return resource;
      
      return null;
    } catch (error) {
      console.error('Google TTS error:', error);
      return this.consoleTTS(text);
    }
  }

  // Microsoft Azure Speech Services
  async azureTTS(text, options = {}) {
    try {
      // This is a placeholder for Azure Speech Services integration
      // You'll need to:
      // 1. Set up Azure Speech Services
      // 2. Get subscription key and region
      // 3. Install microsoft-cognitiveservices-speech-sdk package
      
      console.log(`🔊 Azure TTS: ${text}`);
      
      // Example implementation:
      // const sdk = require('microsoft-cognitiveservices-speech-sdk');
      // const speechConfig = sdk.SpeechConfig.fromSubscription(
      //   process.env.AZURE_SPEECH_KEY,
      //   process.env.AZURE_SPEECH_REGION
      // );
      // 
      // const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
      // const result = await synthesizer.speakTextAsync(text);
      // 
      // if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      //   const resource = createAudioResource(result.audioData);
      //   return resource;
      // }
      
      return null;
    } catch (error) {
      console.error('Azure TTS error:', error);
      return this.consoleTTS(text);
    }
  }

  // Amazon Polly TTS
  async amazonPollyTTS(text, options = {}) {
    try {
      // This is a placeholder for Amazon Polly integration
      // You'll need to:
      // 1. Set up AWS account
      // 2. Configure AWS credentials
      // 3. Install aws-sdk package
      
      console.log(`🔊 Amazon Polly TTS: ${text}`);
      
      // Example implementation:
      // const AWS = require('aws-sdk');
      // const polly = new AWS.Polly();
      // 
      // const params = {
      //   Text: text,
      //   OutputFormat: 'mp3',
      //   VoiceId: 'Joanna'
      // };
      // 
      // const result = await polly.synthesizeSpeech(params).promise();
      // const resource = createAudioResource(result.AudioStream);
      // return resource;
      
      return null;
    } catch (error) {
      console.error('Amazon Polly TTS error:', error);
      return this.consoleTTS(text);
    }
  }

  // Get available TTS providers
  getAvailableProviders() {
    return [
      'console',
      'local',
      'google',
      'azure',
      'polly'
    ];
  }

  // Check if a provider is available
  isProviderAvailable(provider) {
    return this.getAvailableProviders().includes(provider);
  }

  // Get current provider
  getCurrentProvider() {
    return this.provider;
  }
}

module.exports = { TTSService }; 