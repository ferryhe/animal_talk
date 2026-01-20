// Dog sound synthesizer using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Generate a bark sound
function playBark() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 2; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    const startTime = ctx.currentTime + i * 0.4;
    osc.frequency.setValueAtTime(300, startTime);
    osc.frequency.linearRampToValueAtTime(450, startTime + 0.05);
    osc.frequency.linearRampToValueAtTime(250, startTime + 0.15);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.1);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.2);
    
    osc.start(startTime);
    osc.stop(startTime + 0.25);
  }
}

// Generate a whine sound
function playDogWhine() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 1);
  osc.frequency.linearRampToValueAtTime(550, ctx.currentTime + 1.5);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.3);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.8);
}

// Generate a growl sound
function playGrowl() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  const gain = ctx.createGain();
  
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1);
  osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 2);
  
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(6, ctx.currentTime);
  lfoGain.gain.setValueAtTime(10, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.35, ctx.currentTime + 1.8);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
  
  osc.start(ctx.currentTime);
  lfo.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
  lfo.stop(ctx.currentTime + 2);
}

// Generate a howl sound
function playHowl() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.5);
  osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 1);
  osc.frequency.setValueAtTime(500, ctx.currentTime + 2);
  osc.frequency.linearRampToValueAtTime(350, ctx.currentTime + 2.5);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.35, ctx.currentTime + 2);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.8);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2.8);
}

// Generate a yip/yelp sound
function playYip() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    const startTime = ctx.currentTime + i * 0.25;
    osc.frequency.setValueAtTime(600, startTime);
    osc.frequency.linearRampToValueAtTime(900, startTime + 0.05);
    osc.frequency.linearRampToValueAtTime(700, startTime + 0.1);
    
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.12);
    
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }
}

// Generate happy panting sound
function playPant() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 6; i++) {
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    
    for (let j = 0; j < bufferSize; j++) {
      output[j] = Math.random() * 2 - 1;
    }
    
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gain = ctx.createGain();
    
    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    const startTime = ctx.currentTime + i * 0.25;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + 0.15);
    
    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.2);
  }
}

// Main function to play dog sound by ID
export function playDogSound(soundId: string): Promise<void> {
  return new Promise((resolve) => {
    switch (soundId) {
      case 'bark':
        playBark();
        setTimeout(resolve, 1000);
        break;
      case 'whine_dog':
        playDogWhine();
        setTimeout(resolve, 1800);
        break;
      case 'growl':
        playGrowl();
        setTimeout(resolve, 2000);
        break;
      case 'howl':
        playHowl();
        setTimeout(resolve, 2800);
        break;
      case 'yip':
        playYip();
        setTimeout(resolve, 1000);
        break;
      case 'pant':
        playPant();
        setTimeout(resolve, 1800);
        break;
      default:
        resolve();
    }
  });
}
