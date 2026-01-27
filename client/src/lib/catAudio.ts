import catMeowOneUrl from "@assets/cat-meow-1-cc0.mp3";
import catMeowTwoUrl from "@assets/cat-meow-2-cc0.mp3";
import catPurrOneUrl from "@assets/cat-purr-1-cc0.mp3";
import catPurrTwoUrl from "@assets/cat-purr-2-cc0.mp3";
import catChatteringOneUrl from "@assets/cat-chattering-1-cc0.mp3";
import catChatteringTwoUrl from "@assets/cat-chattering-2-cc0.mp3";
import catHissOneUrl from "@assets/cat-hiss-1-cc0.mp3";
import catHissTwoUrl from "@assets/cat-hiss-2-cc0.mp3";
import catChirpOneUrl from "@assets/cat-chirp-1-cc0.mp3";
import catChirpTwoUrl from "@assets/cat-chirp-2-cc0.mp3";
import catYowlOneUrl from "@assets/cat-yowl-1-cc0.mp3";
import catYowlTwoUrl from "@assets/cat-yowl-2-cc0.mp3";

// Cat sound synthesizer using Web Audio API

let audioContext: AudioContext | null = null;
const sampleBufferCache = new Map<string, Promise<AudioBuffer>>();

const SAMPLE_PROFILES: Record<
  string,
  {
    urls: string[];
    startRatio: [number, number];
    duration: [number, number];
    playbackRate: [number, number];
    gain: number;
  }
> = {
  meow: {
    urls: [catMeowOneUrl, catMeowTwoUrl],
    startRatio: [0.0, 0.5],
    duration: [0.25, 0.6],
    playbackRate: [0.95, 1.2],
    gain: 0.28,
  },
  purr_cat: {
    urls: [catPurrOneUrl, catPurrTwoUrl],
    startRatio: [0.0, 0.6],
    duration: [6.3, 6.3],
    playbackRate: [0.85, 1.05],
    gain: 0.22,
  },
  yowl: {
    urls: [catMeowOneUrl, catMeowTwoUrl],
    startRatio: [0.0, 0.5],
    duration: [0.5, 1.0],
    playbackRate: [0.8, 1.0],
    gain: 0.2,
  },
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

function getSampleBuffer(url: string): Promise<AudioBuffer> {
  const existing = sampleBufferCache.get(url);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const ctx = getAudioContext();
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    return await ctx.decodeAudioData(data);
  })().catch((error) => {
    sampleBufferCache.delete(url);
    throw error;
  });

  sampleBufferCache.set(url, promise);
  return promise;
}

async function playSampleLayer(soundId: string) {
  const profile = SAMPLE_PROFILES[soundId];
  if (!profile) return;

  try {
    const ctx = getAudioContext();
    const url = profile.urls[Math.floor(Math.random() * profile.urls.length)];
    const buffer = await getSampleBuffer(url);
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
        void playSampleLayer(soundId);
        setTimeout(resolve, 1000);
        break;
      case 'purr_cat':
        void playSampleLayer(soundId);
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
        void playSampleLayer(soundId);
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
