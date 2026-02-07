/**
 * Fast audio recognition using waveform comparison
 * Combines waveform matching with feature-based analysis for better accuracy
 */

import type { SoundDefinition } from "@/lib/guineaPigSounds";
import {
  extractFeaturesFromMicrophone,
  compareWaveforms,
  loadReferenceWaveform,
  clearWaveformCache,
  type WaveformFeatures,
} from "@/lib/waveformComparison";

export type RecognizerAnimal = "guinea_pig" | "cat" | "dog";

export type RecognitionOptions = {
  durationMs: number;
  signal?: AbortSignal;
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
// Track if reference loading is in progress to avoid duplicate loads
const loadingPromises = new Map<string, Promise<Map<string, WaveformFeatures>>>();

/**
 * Load reference waveforms for an animal (with deduplication and concurrency limiting)
 * This ensures only one load operation happens even if called multiple times
 * and limits concurrent AudioContext usage to avoid browser limits
 */
async function loadReferenceWaveforms(
  animal: RecognizerAnimal
): Promise<Map<string, WaveformFeatures>> {
  // Return cached if available
  if (referenceCache.has(animal)) {
    return referenceCache.get(animal)!;
  }

  // Return existing promise if already loading
  if (loadingPromises.has(animal)) {
    return loadingPromises.get(animal)!;
  }

  // Start new load operation with limited concurrency
  const loadPromise = (async () => {
    const refMap = new Map<string, WaveformFeatures>();
    const soundMap = REFERENCE_WAVEFORMS[animal];

    // Load references sequentially to avoid hitting browser AudioContext limits
    for (const [soundId, urls] of Object.entries(soundMap)) {
      if (urls.length > 0) {
        try {
          const features = await loadReferenceWaveform(soundId, urls[0]);
          refMap.set(soundId, features);
        } catch (error) {
          console.warn(`Failed to load reference for ${soundId}:`, error);
        }
      }
    }

    referenceCache.set(animal, refMap);
    loadingPromises.delete(animal); // Clean up after load completes

    return refMap;
  })();

  loadingPromises.set(animal, loadPromise);
  return loadPromise;
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
  let stream: MediaStream;
  
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    await ctx.close();
    throw err;
  }
  
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048; // Higher resolution for waveform
  analyser.smoothingTimeConstant = 0.3; // Less smoothing for better detail
  source.connect(analyser);

  const bufferLength = analyser.fftSize;
  const dataArray = new Float32Array(bufferLength);
  const sampleRate = ctx.sampleRate;
  
  // Pre-allocate array for efficiency (avoid push + spread overhead)
  const expectedSamples = Math.ceil((durationMs / 30) * bufferLength);
  const collectedData = new Float32Array(expectedSamples);
  let writeIndex = 0;

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
      // Copy directly into pre-allocated array (avoid push + spread overhead)
      for (let i = 0; i < dataArray.length && writeIndex < collectedData.length; i++) {
        collectedData[writeIndex++] = dataArray[i];
      }
    }, 30);

    timeoutId = setTimeout(() => {
      cleanup();
      signal?.removeEventListener("abort", onAbort);

      if (writeIndex === 0) {
        reject(new Error("no audio data"));
        return;
      }

      // Trim to actual collected length
      const audioData = collectedData.slice(0, writeIndex);
      
      // Check if there's actual audio signal (compute max with loop, not spread)
      let maxAmplitude = 0;
      for (let i = 0; i < audioData.length; i++) {
        const value = Math.abs(audioData[i]);
        if (value > maxAmplitude) {
          maxAmplitude = value;
        }
      }
      
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
  // Analyze microphone and extract waveform features
  const { features } = await analyzeMicrophoneWithWaveform(
    animal,
    options.durationMs,
    options.signal,
  );

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

  // If no results, throw to trigger fallback
  throw new Error("waveform matching failed");
}

/**
 * Pre-load reference waveforms for an animal to improve first-use performance
 * Call this function early (e.g., when user selects an animal) to warm the cache
 * 
 * @param animal - The animal type to pre-load references for
 * @returns Promise that resolves when references are loaded
 * 
 * @example
 * // Pre-load when user navigates to listen mode
 * useEffect(() => {
 *   preloadReferenceWaveforms('guinea_pig');
 * }, []);
 */
export async function preloadReferenceWaveforms(
  animal: RecognizerAnimal
): Promise<void> {
  try {
    await loadReferenceWaveforms(animal);
  } catch (error) {
    console.warn(`Failed to preload references for ${animal}:`, error);
  }
}

/**
 * Clear cached reference waveforms to free memory
 * Useful for memory management in long-running sessions
 */
export function clearReferenceCache(): void {
  referenceCache.clear();
  loadingPromises.clear();
  clearWaveformCache(); // Also clear underlying waveform cache
}
