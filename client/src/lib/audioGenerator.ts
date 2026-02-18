/**
 * Generate audio data based on sound ID
 * Returns base64 encoded WAV audio or null if generation fails
 */

export function generateAudioData(soundId: string, durationMs: number = 1000): string | null {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = durationMs / 1000;
    const sampleRate = audioContext.sampleRate || 44100;
    const numSamples = Math.ceil(duration * sampleRate);
    
    // Create audio buffer
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    // Generate different sounds based on sound ID
    const soundIdLower = soundId.toLowerCase();
    
    switch (soundIdLower) {
      case 'wheek':
        generateWheek(channelData, sampleRate, duration);
        break;
      case 'purr':
        generatePurr(channelData, sampleRate, duration);
        break;
      case 'chut':
      case 'chuttering':
        generateChuttering(channelData, sampleRate, duration);
        break;
      case 'whine':
      case 'squeak':
        generateSqueaking(channelData, sampleRate, duration);
        break;
      case 'rumble':
      case 'growl':
        generateGrowl(channelData, sampleRate, duration);
        break;
      case 'bark':
        generateBark(channelData, sampleRate, duration);
        break;
      case 'meow':
        generateMeow(channelData, sampleRate, duration);
        break;
      default:
        // Default tone based on any other sound
        generateTone(channelData, sampleRate, 440, duration);
    }
    
    return audioBufferToBase64(audioBuffer);
  } catch (error) {
    console.error('Error generating audio:', error);
    return null;
  }
}

function generateWheek(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Guinea pig wheek - starts high, drops down, repeats
  const wheekDuration = 0.15; // 150ms wheeks
  const wheekPause = 0.1; // 100ms pause
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const cycleTime = (t % (wheekDuration + wheekPause));
    
    if (cycleTime < wheekDuration) {
      // Wheek sound with downward pitch
      const progress = cycleTime / wheekDuration;
      const frequency = 1200 - (progress * 400); // 1200 Hz down to 800 Hz
      const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate)) * 0.4;
      
      // Envelope
      const envelope = Math.sin(progress * Math.PI); // Peak in middle
      channelData[i] = sample * envelope;
    } else {
      channelData[i] = 0;
    }
  }
}

function generatePurr(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Cat purr - low frequency vibration
  const purFreq = 150; // 150 Hz base
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Vibrato modulation
    const vibrato = Math.sin(2 * Math.PI * 4 * t) * 0.3; // 4 Hz vibrato
    const baseWave = Math.sin(2 * Math.PI * purFreq * t);
    const sample = baseWave * (0.7 + vibrato);
    
    // Fade in/out
    const fadeIn = Math.min(t / 0.1, 1);
    const fadeOut = Math.max(1 - (t - duration + 0.1) / 0.1, 0);
    channelData[i] = sample * 0.4 * fadeIn * fadeOut;
  }
}

function generateChuttering(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Rapid staccato clicks
  const clickDuration = 0.05; // 50ms per click
  const spacing = 0.08; // 80ms between clicks
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const cycleTime = t % spacing;
    
    if (cycleTime < clickDuration) {
      // Quick frequency sweep
      const progress = cycleTime / clickDuration;
      const frequency = 800 + (Math.random() * 400); // 800-1200 Hz with variation
      const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
      
      // Sharp envelope
      const envelope = Math.sin(progress * Math.PI);
      channelData[i] = sample * envelope * 0.4;
    } else {
      channelData[i] = 0;
    }
  }
}

function generateSqueaking(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // High frequency with modulation
  const baseFreq = 1500;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Frequency modulation (slight variation)
    const freqMod = Math.sin(2 * Math.PI * 2 * t) * 200; // ±200 Hz variation
    const frequency = baseFreq + freqMod;
    const sample = Math.sin(2 * Math.PI * frequency * t);
    
    // Envelope
    const fadeIn = Math.min(t / 0.05, 1);
    const fadeOut = Math.max(1 - (t - duration + 0.1) / 0.1, 0);
    channelData[i] = sample * 0.35 * fadeIn * fadeOut;
  }
}

function generateGrowl(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Low rumbling sound with noise
  const baseFreq = 100;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Low frequency with some harmonics
    const fundamental = Math.sin(2 * Math.PI * baseFreq * t);
    const harmonic2 = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * 0.3;
    const noise = (Math.random() - 0.5) * 0.2;
    
    const sample = (fundamental + harmonic2 + noise) * 0.3;
    
    // Envelope
    const fadeIn = Math.min(t / 0.1, 1);
    const fadeOut = Math.max(1 - (t - duration + 0.1) / 0.1, 0);
    channelData[i] = sample * fadeIn * fadeOut;
  }
}

function generateBark(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Dog bark - sharp attack, rapid pitch variation
  const barkDuration = 0.3;
  const barkPause = 0.4;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const cycleTime = t % (barkDuration + barkPause);
    
    if (cycleTime < barkDuration) {
      const progress = cycleTime / barkDuration;
      // Bark frequency - starts high, drops
      const frequency = 600 + (Math.sin(progress * Math.PI) * 300);
      const sample = Math.sin(2 * Math.PI * frequency * (i / sampleRate));
      
      // Sharp envelope
      const envelope = Math.sin(progress * Math.PI);
      channelData[i] = sample * envelope * 0.5;
    } else {
      channelData[i] = 0;
    }
  }
}

function generateMeow(channelData: Float32Array, sampleRate: number, duration: number): void {
  const numSamples = channelData.length;
  // Cat meow - dual frequency sweep
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Meow frequency - rises then falls
    const progress = (t / duration);
    const frequency = 300 + (Math.sin(progress * Math.PI) * 400); // 300-700 Hz sweep
    
    const sample = Math.sin(2 * Math.PI * frequency * t);
    
    // Smooth envelope
    const fadeIn = Math.min(t / 0.05, 1);
    const fadeOut = Math.max(1 - (t - duration + 0.1) / 0.1, 0);
    channelData[i] = sample * 0.4 * fadeIn * fadeOut;
  }
}

function generateTone(channelData: Float32Array, sampleRate: number, frequency: number, duration: number): void {
  const numSamples = channelData.length;
  
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const sample = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    
    // Fade in/out
    const fadeIn = Math.min(t / 0.05, 1);
    const fadeOut = Math.max(1 - (t - duration + 0.1) / 0.1, 0);
    channelData[i] = sample * fadeIn * fadeOut;
  }
}

function audioBufferToBase64(audioBuffer: AudioBuffer): string {
  try {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const frameLength = audioBuffer.length;
    
    const channelData = [];
    for (let c = 0; c < numberOfChannels; c++) {
      channelData.push(audioBuffer.getChannelData(c));
    }
    
    const data = new Float32Array(frameLength * numberOfChannels);
    for (let i = 0; i < frameLength; i++) {
      for (let c = 0; c < numberOfChannels; c++) {
        data[i * numberOfChannels + c] = channelData[c][i];
      }
    }
    
    // Convert float32 to int16
    const pcm = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    
    const dataLength = pcm.length * 2;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerSample, true);
    view.setUint16(32, numberOfChannels * bytesPerSample, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Copy PCM data
    const pcmView = new Int16Array(buffer, 44);
    pcmView.set(pcm);
    
    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binary);
  } catch (error) {
    console.error('Error converting audio buffer to base64:', error);
    throw error;
  }
}
