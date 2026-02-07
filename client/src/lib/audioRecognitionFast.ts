/**
 * Fast audio recognition using waveform comparison
 * Combines waveform matching with feature-based analysis for better accuracy
 */

import type { SoundDefinition } from "@/lib/guineaPigSounds";
import {
  extractFeaturesFromMicrophone,
  compareWaveforms,
  loadReferenceWaveform,
  type WaveformFeatures,
} from "@/lib/waveformComparison";

export type RecognizerAnimal = "guinea_pig" | "cat" | "dog";

export type RecognitionOptions = {
  durationMs: number;
  signal?: AbortSignal;
  useWaveformMatching?: boolean; // Enable waveform comparison (default: true)
};

type RecognitionResult = {
  soundId: string;
  confidence: number;
  method: "waveform" | "features" | "hybrid";
};

// Reference waveform URLs mapping (will be populated on first use)
const REFERENCE_WAVEFORMS: Record<
  RecognizerAnimal,
  Record<string, string[]>
> = {
  guinea_pig: {
    wheek: [
      new URL("@assets/guinea-pig-wheek-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-wheek-2-cc0.mp3", import.meta.url).href,
    ],
    purr: [
      new URL("@assets/guinea-pig-purr-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-purr-2-cc0.mp3", import.meta.url).href,
    ],
    rumble: [
      new URL("@assets/guinea-pig-rumble-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-rumble-2-cc0.mp3", import.meta.url).href,
    ],
    chut: [
      new URL("@assets/guinea-pig-chutting-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-chutting-2-cc0.mp3", import.meta.url).href,
    ],
    chatter: [
      new URL("@assets/guinea-pig-chatter-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-chatter-2-cc0.mp3", import.meta.url).href,
    ],
    whine: [
      new URL("@assets/guinea-pig-whine-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/guinea-pig-whine-2-cc0.mp3", import.meta.url).href,
    ],
  },
  cat: {
    meow: [
      new URL("@assets/cat-meow-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/cat-meow-2-cc0.mp3", import.meta.url).href,
    ],
    purr_cat: [
      new URL("@assets/cat-purr-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/cat-purr-2-cc0.mp3", import.meta.url).href,
    ],
    hiss: [
      new URL("@assets/cat-hiss-1-cc0.mp3", import.meta.url).href,
    ],
    chirp: [],
    yowl: [],
    chatter_cat: [],
  },
  dog: {
    bark: [
      new URL("@assets/dog-bark-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-bark-2-cc0.mp3", import.meta.url).href,
    ],
    whine_dog: [
      new URL("@assets/dog-whine-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-whine-2-cc0.mp3", import.meta.url).href,
    ],
    growl: [
      new URL("@assets/dog-growl-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-growl-2-cc0.mp3", import.meta.url).href,
    ],
    howl: [
      new URL("@assets/dog-howl-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-howl-2-cc0.mp3", import.meta.url).href,
    ],
    yip: [
      new URL("@assets/dog-yip-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-yip-2-cc0.mp3", import.meta.url).href,
    ],
    pant: [
      new URL("@assets/dog-pant-1-cc0.mp3", import.meta.url).href,
      new URL("@assets/dog-pant-2-cc0.mp3", import.meta.url).href,
    ],
  },
};

// Cache for loaded reference waveforms
const referenceCache = new Map<string, Map<string, WaveformFeatures>>();

/**
 * Load reference waveforms for an animal
 */
async function loadReferenceWaveforms(
  animal: RecognizerAnimal
): Promise<Map<string, WaveformFeatures>> {
  if (referenceCache.has(animal)) {
    return referenceCache.get(animal)!;
  }

  const refMap = new Map<string, WaveformFeatures>();
  const soundMap = REFERENCE_WAVEFORMS[animal];

  // Load first URL for each sound as reference
  const loadPromises = Object.entries(soundMap).map(async ([soundId, urls]) => {
    if (urls.length > 0) {
      try {
        const features = await loadReferenceWaveform(soundId, urls[0]);
        refMap.set(soundId, features);
      } catch (error) {
        console.warn(`Failed to load reference for ${soundId}:`, error);
      }
    }
  });

  await Promise.all(loadPromises);
  referenceCache.set(animal, refMap);

  return refMap;
}

/**
 * Capture and analyze microphone audio with waveform comparison
 */
async function analyzeMicrophoneWithWaveform(
  animal: RecognizerAnimal,
  durationMs: number,
  signal?: AbortSignal,
): Promise<{ features: WaveformFeatures; audioData: Float32Array; sampleRate: number }> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error("Microphone not available");
  }

  const ctx = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048; // Higher resolution for waveform
  analyser.smoothingTimeConstant = 0.3; // Less smoothing for better detail
  source.connect(analyser);

  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);
  const collectedData: number[] = [];
  const sampleRate = ctx.sampleRate;

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
    stream.getTracks().forEach((track) => track.stop());
    source.disconnect();
    analyser.disconnect();
    void ctx.close();
  };

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      cleanup();
      reject(new Error("aborted"));
      return;
    }

    const onAbort = () => {
      cleanup();
      reject(new Error("aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    // Collect audio data at 30ms intervals (faster than original 60ms)
    intervalId = setInterval(() => {
      analyser.getFloatTimeDomainData(dataArray);
      collectedData.push(...Array.from(dataArray));
    }, 30);

    timeoutId = setTimeout(() => {
      cleanup();
      signal?.removeEventListener("abort", onAbort);

      if (collectedData.length === 0) {
        reject(new Error("no audio data"));
        return;
      }

      // Convert to Float32Array
      const audioData = new Float32Array(collectedData);
      
      // Check if there's actual audio signal
      const maxAmplitude = Math.max(...Array.from(audioData).map(Math.abs));
      if (maxAmplitude < 0.005) {
        reject(new Error("no audio"));
        return;
      }

      // Extract waveform features
      const features = extractFeaturesFromMicrophone(
        audioData,
        sampleRate,
        durationMs / 1000
      );

      resolve({ features, audioData, sampleRate });
    }, durationMs);
  });
}

/**
 * Recognize animal sounds using fast waveform comparison
 */
export async function recognizeAnimalSoundsFast(
  animal: RecognizerAnimal,
  library: SoundDefinition[],
  options: RecognitionOptions,
): Promise<SoundDefinition[]> {
  const useWaveform = options.useWaveformMatching ?? true;

  try {
    // Analyze microphone and extract waveform features
    const { features } = await analyzeMicrophoneWithWaveform(
      animal,
      options.durationMs,
      options.signal,
    );

    if (useWaveform) {
      // Load reference waveforms
      const referenceMap = await loadReferenceWaveforms(animal);

      if (referenceMap.size > 0) {
        // Compare against reference waveforms
        const matches: RecognitionResult[] = [];

        for (const [soundId, refFeatures] of referenceMap.entries()) {
          const similarity = compareWaveforms(features, refFeatures);
          const confidence = Math.round(
            Math.min(95, Math.max(10, similarity * 100))
          );

          matches.push({
            soundId,
            confidence,
            method: "waveform",
          });
        }

        // Sort by confidence
        matches.sort((a, b) => b.confidence - a.confidence);

        // Map to SoundDefinition objects
        const results = matches.slice(0, 3).map((match) => {
          const sound = library.find((s) => s.id === match.soundId);
          if (sound) {
            return { ...sound, confidence: match.confidence };
          }
          return null;
        }).filter((s): s is SoundDefinition => s !== null);

        if (results.length > 0) {
          return results;
        }
      }
    }

    // Fallback: return random results if waveform matching fails
    throw new Error("waveform matching failed");
  } catch (error) {
    // If waveform matching fails, throw to trigger fallback
    throw error;
  }
}
