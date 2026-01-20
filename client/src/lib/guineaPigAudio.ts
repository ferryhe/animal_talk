import guineaPigSampleUrl from "@assets/guinea-pigs-cc0.mp3";

// Guinea pig sound synthesizer using Web Audio API

let audioContext: AudioContext | null = null;
let sampleBufferPromise: Promise<AudioBuffer> | null = null;

const SAMPLE_PROFILES: Record<
  string,
  {
    startRatio: [number, number];
    duration: [number, number];
    playbackRate: [number, number];
    gain: number;
  }
> = {
  wheek: { startRatio: [0.02, 0.18], duration: [0.4, 0.8], playbackRate: [1.1, 1.35], gain: 0.28 },
  purr: { startRatio: [0.18, 0.45], duration: [1.0, 1.8], playbackRate: [0.85, 1.0], gain: 0.22 },
  rumble: { startRatio: [0.35, 0.65], duration: [0.8, 1.4], playbackRate: [0.8, 0.95], gain: 0.2 },
  chut: { startRatio: [0.4, 0.9], duration: [0.2, 0.45], playbackRate: [1.2, 1.5], gain: 0.2 },
  chatter: { startRatio: [0.4, 0.9], duration: [0.25, 0.5], playbackRate: [1.25, 1.6], gain: 0.18 },
  whine: { startRatio: [0.2, 0.75], duration: [0.6, 1.0], playbackRate: [0.95, 1.15], gain: 0.22 },
};

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

async function getSampleBuffer(): Promise<AudioBuffer> {
  if (!sampleBufferPromise) {
    sampleBufferPromise = (async () => {
      const ctx = getAudioContext();
      const response = await fetch(guineaPigSampleUrl);
      const data = await response.arrayBuffer();
      return await ctx.decodeAudioData(data);
    })().catch((error) => {
      sampleBufferPromise = null;
      throw error;
    });
  }
  return sampleBufferPromise;
}

async function playSampleLayer(soundId: string) {
  const profile = SAMPLE_PROFILES[soundId];
  if (!profile) return;

  try {
    const ctx = getAudioContext();
    const buffer = await getSampleBuffer();
    const duration = randomBetween(profile.duration[0], profile.duration[1]);
    const maxStart = Math.max(0, buffer.duration - duration);
    const startRatio = randomBetween(profile.startRatio[0], profile.startRatio[1]);
    const start = Math.min(startRatio * buffer.duration, maxStart);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(
      randomBetween(profile.playbackRate[0], profile.playbackRate[1]),
      ctx.currentTime,
    );

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(profile.gain, ctx.currentTime);

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime, start, duration);
  } catch {
    // Ignore sample errors and fall back to synth-only output.
  }
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
        void playSampleLayer(soundId);
        playWheek();
        setTimeout(resolve, 1500);
        break;
      case 'purr':
        void playSampleLayer(soundId);
        playPurr();
        setTimeout(resolve, 2000);
        break;
      case 'rumble':
        void playSampleLayer(soundId);
        playRumble();
        setTimeout(resolve, 2000);
        break;
      case 'chut':
        void playSampleLayer(soundId);
        playChutting();
        setTimeout(resolve, 1500);
        break;
      case 'chatter':
        void playSampleLayer(soundId);
        playTeethChatter();
        setTimeout(resolve, 1500);
        break;
      case 'whine':
        void playSampleLayer(soundId);
        playWhine();
        setTimeout(resolve, 1800);
        break;
      default:
        resolve();
    }
  });
}
