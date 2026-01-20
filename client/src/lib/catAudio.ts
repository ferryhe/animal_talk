// Cat sound synthesizer using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Generate a meow sound
function playMeow() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.2);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.8);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.4, ctx.currentTime + 0.6);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1);
}

// Generate a purr sound (cat version - deeper)
function playCatPurr() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(25, ctx.currentTime);
  
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(25, ctx.currentTime);
  lfoGain.gain.setValueAtTime(5, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.8);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
  
  osc.start(ctx.currentTime);
  lfo.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
  lfo.stop(ctx.currentTime + 2);
}

// Generate a hiss sound
function playHiss() {
  const ctx = getAudioContext();
  const bufferSize = ctx.sampleRate * 1.5;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  
  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, ctx.currentTime);
  
  const gain = ctx.createGain();
  
  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  
  whiteNoise.start(ctx.currentTime);
  whiteNoise.stop(ctx.currentTime + 1.5);
}

// Generate a chirp/trill sound
function playChirp() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 4; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const startTime = ctx.currentTime + i * 0.15;
    osc.frequency.setValueAtTime(800, startTime);
    osc.frequency.linearRampToValueAtTime(1200, startTime + 0.05);
    osc.frequency.linearRampToValueAtTime(900, startTime + 0.1);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
}

// Generate a yowl sound (long cry)
function playYowl() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 1);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.5);
  osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 2);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.25, ctx.currentTime + 1.8);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.2);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2.2);
}

// Generate cat chattering sound (prey response)
function playCatChatter() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 10; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const startTime = ctx.currentTime + i * 0.08;
    osc.frequency.setValueAtTime(600 + Math.random() * 300, startTime);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.04);
    
    osc.start(startTime);
    osc.stop(startTime + 0.06);
  }
}

// Main function to play cat sound by ID
export function playCatSound(soundId: string): Promise<void> {
  return new Promise((resolve) => {
    switch (soundId) {
      case 'meow':
        playMeow();
        setTimeout(resolve, 1000);
        break;
      case 'purr_cat':
        playCatPurr();
        setTimeout(resolve, 2000);
        break;
      case 'hiss':
        playHiss();
        setTimeout(resolve, 1500);
        break;
      case 'chirp':
        playChirp();
        setTimeout(resolve, 800);
        break;
      case 'yowl':
        playYowl();
        setTimeout(resolve, 2200);
        break;
      case 'chatter_cat':
        playCatChatter();
        setTimeout(resolve, 1000);
        break;
      default:
        resolve();
    }
  });
}
