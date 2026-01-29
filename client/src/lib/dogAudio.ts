import dogBarkOneUrl from "@assets/dog-bark-1-cc0.mp3";
import dogBarkTwoUrl from "@assets/dog-bark-2-cc0.mp3";
import dogWhineOneUrl from "@assets/dog-whine-1-cc0.mp3";
import dogWhineTwoUrl from "@assets/dog-whine-2-cc0.mp3";
import dogHowlOneUrl from "@assets/dog-howl-1-cc0.mp3";
import dogHowlTwoUrl from "@assets/dog-howl-2-cc0.mp3";
import dogPantOneUrl from "@assets/dog-pant-1-cc0.mp3";
import dogPantTwoUrl from "@assets/dog-pant-2-cc0.mp3";
import dogHappyPantingOneUrl from "@assets/dog-happy-panting-1-cc0.mp3";
import dogHappyPantingTwoUrl from "@assets/dog-happy-panting-2-cc0.mp3";
import dogGrowlOneUrl from "@assets/dog-growl-1-cc0.mp3";
import dogGrowlTwoUrl from "@assets/dog-growl-2-cc0.mp3";
import dogYipOneUrl from "@assets/dog-yip-1-cc0.mp3";
import dogYipTwoUrl from "@assets/dog-yip-2-cc0.mp3";

// Dog sound synthesizer using Web Audio API

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
  bark: {
    urls: [dogBarkOneUrl, dogBarkTwoUrl],
    startRatio: [0.0, 0.5],
    duration: [0.2, 0.6],
    playbackRate: [0.9, 1.2],
    gain: 0.28,
  },
  whine_dog: {
    urls: [dogWhineOneUrl, dogWhineTwoUrl],
    startRatio: [0.0, 0.6],
    duration: [4.6, 5.2],
    playbackRate: [0.9, 1.1],
    gain: 0.24,
  },
  howl: {
    urls: [dogHowlOneUrl, dogHowlTwoUrl],
    startRatio: [0.0, 0.6],
    duration: [2.3, 6.3],
    playbackRate: [0.85, 1.05],
    gain: 0.22,
  },
  pant: {
    urls: [dogPantOneUrl, dogPantTwoUrl],
    startRatio: [0.0, 0.7],
    duration: [5.4, 1.2],
    playbackRate: [0.9, 1.1],
    gain: 0.18,
  },
  happy_panting: {
    urls: [dogHappyPantingOneUrl, dogHappyPantingTwoUrl],
    startRatio: [0.0, 0.5],
    duration: [2.0, 3.0],
    playbackRate: [0.95, 1.15],
    gain: 0.2,
  },
  growl: {
    urls: [dogGrowlOneUrl, dogGrowlTwoUrl],
    startRatio: [0.0, 0.4],
    duration: [3.2, 4.0],
    playbackRate: [0.9, 1.1],
    gain: 0.22,
  },
  yip: {
    urls: [dogYipOneUrl, dogYipTwoUrl],
    startRatio: [0.0, 0.5],
    duration: [0.6, 1.0],
    playbackRate: [1.0, 1.3],
    gain: 0.26,
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
        void playSampleLayer(soundId);
        setTimeout(resolve, 1000);
        break;
      case 'whine_dog':
        void playSampleLayer(soundId);
        setTimeout(resolve, 1800);
        break;
      case 'growl':
        void playSampleLayer(soundId);
        setTimeout(resolve, 4000);
        break;
      case 'howl':
        void playSampleLayer(soundId);
        setTimeout(resolve, 2800);
        break;
      case 'yip':
        void playSampleLayer(soundId);
        setTimeout(resolve, 1000);
        break;
      case 'pant':
        void playSampleLayer(soundId);
        setTimeout(resolve, 1800);
        break;
      default:
        resolve();
    }
  });
}
