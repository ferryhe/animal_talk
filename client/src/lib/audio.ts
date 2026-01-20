// Guinea pig sound synthesizer using Web Audio API

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

// Generate a wheek sound (high-pitched whistle)
function playWheek() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1800, ctx.currentTime + 0.3);
  osc.frequency.linearRampToValueAtTime(1400, ctx.currentTime + 0.6);
  osc.frequency.linearRampToValueAtTime(2000, ctx.currentTime + 1.0);
  
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.2);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.8);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.5);
}

// Generate a purr sound (deep vibrating)
function playPurr() {
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
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(8, ctx.currentTime);
  lfoGain.gain.setValueAtTime(20, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.2);
  gain.gain.setValueAtTime(0.4, ctx.currentTime + 1.5);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
  
  osc.start(ctx.currentTime);
  lfo.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
  lfo.stop(ctx.currentTime + 2);
}

// Generate a rumble sound (low vibrating with dominance)
function playRumble() {
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
  osc.frequency.setValueAtTime(120, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 1);
  osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 2);
  
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(5, ctx.currentTime);
  lfoGain.gain.setValueAtTime(15, ctx.currentTime);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, ctx.currentTime + 1.5);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 2);
  
  osc.start(ctx.currentTime);
  lfo.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 2);
  lfo.stop(ctx.currentTime + 2);
}

// Generate chutting sound (short staccato clicks)
function playChutting() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 100, ctx.currentTime + i * 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.2);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.2 + 0.02);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.2 + 0.1);
    
    osc.start(ctx.currentTime + i * 0.2);
    osc.stop(ctx.currentTime + i * 0.2 + 0.15);
  }
}

// Generate teeth chattering sound (rapid clicking warning)
function playTeethChatter() {
  const ctx = getAudioContext();
  
  for (let i = 0; i < 12; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime + i * 0.1);
    
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.01);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.1 + 0.05);
    
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.08);
  }
}

// Generate whine sound (high-pitched moan)
function playWhine() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
  osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 1);
  osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 1.5);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.25, ctx.currentTime + 1.3);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.8);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.8);
}

// Main function to play sound by ID
export function playGuineaPigSound(soundId: string): Promise<void> {
  return new Promise((resolve) => {
    switch (soundId) {
      case 'wheek':
        playWheek();
        setTimeout(resolve, 1500);
        break;
      case 'purr':
        playPurr();
        setTimeout(resolve, 2000);
        break;
      case 'rumble':
        playRumble();
        setTimeout(resolve, 2000);
        break;
      case 'chut':
        playChutting();
        setTimeout(resolve, 1500);
        break;
      case 'chatter':
        playTeethChatter();
        setTimeout(resolve, 1500);
        break;
      case 'whine':
        playWhine();
        setTimeout(resolve, 1800);
        break;
      default:
        resolve();
    }
  });
}
