/**
 * Audio recognition using feature-based analysis
 * 
 * This is the original recognition method that extracts audio features
 * (spectral centroid, zero-crossing rate, RMS energy, activity ratio)
 * and compares them against predefined profiles.
 * 
 * Note: Consider using audioRecognitionFast.ts for faster waveform-based recognition.
 * 
 * @module audioRecognition
 */

import type { SoundDefinition } from "@/lib/guineaPigSounds";

export type RecognizerAnimal = "guinea_pig" | "cat" | "dog";

export type RecognitionOptions = {
  durationMs: number;
  signal?: AbortSignal;
};

/**
 * Audio features extracted from microphone input
 */
type AnalysisFeatures = {
  centroidHz: number;      // Spectral centroid - frequency center of gravity
  zcr: number;             // Zero-crossing rate - frequency indicator
  rmsAvg: number;          // Average RMS energy - volume level
  rmsPeak: number;         // Peak RMS energy - maximum volume
  activityRatio: number;   // Percentage of active frames above threshold
};

/**
 * Sound profile with target values and tolerances
 */
type SoundProfile = {
  centroidHz: number;
  centroidTolerance: number;
  activityRatio: number;
  activityTolerance: number;
  zcr: number;
  zcrTolerance: number;
  rmsAvg: number;
  rmsTolerance: number;
};

const SOUND_PROFILES: Record<RecognizerAnimal, Record<string, SoundProfile>> = {
  guinea_pig: {
    wheek: {
      centroidHz: 1800,
      centroidTolerance: 900,
      activityRatio: 0.35,
      activityTolerance: 0.25,
      zcr: 0.12,
      zcrTolerance: 0.1,
      rmsAvg: 0.06,
      rmsTolerance: 0.05,
    },
    purr: {
      centroidHz: 350,
      centroidTolerance: 250,
      activityRatio: 0.8,
      activityTolerance: 0.2,
      zcr: 0.04,
      zcrTolerance: 0.04,
      rmsAvg: 0.03,
      rmsTolerance: 0.03,
    },
    rumble: {
      centroidHz: 220,
      centroidTolerance: 200,
      activityRatio: 0.55,
      activityTolerance: 0.25,
      zcr: 0.03,
      zcrTolerance: 0.04,
      rmsAvg: 0.025,
      rmsTolerance: 0.03,
    },
    chut: {
      centroidHz: 1200,
      centroidTolerance: 700,
      activityRatio: 0.2,
      activityTolerance: 0.15,
      zcr: 0.22,
      zcrTolerance: 0.12,
      rmsAvg: 0.04,
      rmsTolerance: 0.04,
    },
    chatter: {
      centroidHz: 1500,
      centroidTolerance: 700,
      activityRatio: 0.25,
      activityTolerance: 0.2,
      zcr: 0.28,
      zcrTolerance: 0.12,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    whine: {
      centroidHz: 900,
      centroidTolerance: 600,
      activityRatio: 0.45,
      activityTolerance: 0.25,
      zcr: 0.1,
      zcrTolerance: 0.08,
      rmsAvg: 0.04,
      rmsTolerance: 0.04,
    },
  },
  cat: {
    meow: {
      centroidHz: 900,
      centroidTolerance: 500,
      activityRatio: 0.45,
      activityTolerance: 0.25,
      zcr: 0.1,
      zcrTolerance: 0.08,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    purr_cat: {
      centroidHz: 220,
      centroidTolerance: 180,
      activityRatio: 0.85,
      activityTolerance: 0.2,
      zcr: 0.03,
      zcrTolerance: 0.04,
      rmsAvg: 0.02,
      rmsTolerance: 0.03,
    },
    hiss: {
      centroidHz: 2500,
      centroidTolerance: 1200,
      activityRatio: 0.5,
      activityTolerance: 0.3,
      zcr: 0.35,
      zcrTolerance: 0.2,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    chirp: {
      centroidHz: 2000,
      centroidTolerance: 900,
      activityRatio: 0.2,
      activityTolerance: 0.15,
      zcr: 0.28,
      zcrTolerance: 0.15,
      rmsAvg: 0.04,
      rmsTolerance: 0.04,
    },
    yowl: {
      centroidHz: 700,
      centroidTolerance: 450,
      activityRatio: 0.75,
      activityTolerance: 0.2,
      zcr: 0.08,
      zcrTolerance: 0.08,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    chatter_cat: {
      centroidHz: 1800,
      centroidTolerance: 900,
      activityRatio: 0.25,
      activityTolerance: 0.2,
      zcr: 0.3,
      zcrTolerance: 0.15,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
  },
  dog: {
    bark: {
      centroidHz: 700,
      centroidTolerance: 450,
      activityRatio: 0.2,
      activityTolerance: 0.2,
      zcr: 0.12,
      zcrTolerance: 0.1,
      rmsAvg: 0.06,
      rmsTolerance: 0.06,
    },
    whine_dog: {
      centroidHz: 1200,
      centroidTolerance: 600,
      activityRatio: 0.45,
      activityTolerance: 0.25,
      zcr: 0.12,
      zcrTolerance: 0.1,
      rmsAvg: 0.04,
      rmsTolerance: 0.04,
    },
    growl: {
      centroidHz: 200,
      centroidTolerance: 180,
      activityRatio: 0.45,
      activityTolerance: 0.25,
      zcr: 0.04,
      zcrTolerance: 0.05,
      rmsAvg: 0.04,
      rmsTolerance: 0.04,
    },
    howl: {
      centroidHz: 500,
      centroidTolerance: 350,
      activityRatio: 0.75,
      activityTolerance: 0.2,
      zcr: 0.06,
      zcrTolerance: 0.06,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    yip: {
      centroidHz: 1600,
      centroidTolerance: 700,
      activityRatio: 0.2,
      activityTolerance: 0.15,
      zcr: 0.25,
      zcrTolerance: 0.12,
      rmsAvg: 0.05,
      rmsTolerance: 0.05,
    },
    pant: {
      centroidHz: 1500,
      centroidTolerance: 800,
      activityRatio: 0.75,
      activityTolerance: 0.2,
      zcr: 0.3,
      zcrTolerance: 0.15,
      rmsAvg: 0.02,
      rmsTolerance: 0.03,
    },
  },
};

function scoreFeature(value: number, target: number, tolerance: number) {
  if (tolerance <= 0) {
    return 0;
  }
  const diff = Math.abs(value - target);
  return Math.max(0, 1 - diff / tolerance);
}

function scoreSound(profile: SoundProfile, features: AnalysisFeatures) {
  const centroidScore = scoreFeature(
    features.centroidHz,
    profile.centroidHz,
    profile.centroidTolerance,
  );
  const activityScore = scoreFeature(
    features.activityRatio,
    profile.activityRatio,
    profile.activityTolerance,
  );
  const zcrScore = scoreFeature(features.zcr, profile.zcr, profile.zcrTolerance);
  const rmsScore = scoreFeature(
    features.rmsAvg,
    profile.rmsAvg,
    profile.rmsTolerance,
  );

  return (
    centroidScore * 0.45 +
    activityScore * 0.25 +
    zcrScore * 0.2 +
    rmsScore * 0.1
  );
}

async function analyzeMicrophone(
  durationMs: number,
  signal?: AbortSignal,
): Promise<AnalysisFeatures> {
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error("Microphone not available");
  }

  const ctx = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  analyser.smoothingTimeConstant = 0.6;
  source.connect(analyser);

  const timeData = new Float32Array(analyser.fftSize);
  const freqData = new Uint8Array(analyser.frequencyBinCount);
  const rmsValues: number[] = [];
  let zcrSum = 0;
  let centroidSum = 0;
  let frameCount = 0;
  let rmsPeak = 0;
  const binHz = ctx.sampleRate / analyser.fftSize;

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

    intervalId = setInterval(() => {
      analyser.getFloatTimeDomainData(timeData);
      let sumSquares = 0;
      let zeroCrossings = 0;
      let prev = timeData[0] ?? 0;

      for (let i = 0; i < timeData.length; i += 1) {
        const value = timeData[i] ?? 0;
        sumSquares += value * value;
        if (i > 0 && (value >= 0) !== (prev >= 0)) {
          zeroCrossings += 1;
        }
        prev = value;
      }

      const rms = Math.sqrt(sumSquares / timeData.length);
      rmsValues.push(rms);
      rmsPeak = Math.max(rmsPeak, rms);
      zcrSum += zeroCrossings / Math.max(1, timeData.length - 1);

      analyser.getByteFrequencyData(freqData);
      let weightedSum = 0;
      let magnitudeSum = 0;
      for (let i = 0; i < freqData.length; i += 1) {
        const magnitude = freqData[i] ?? 0;
        magnitudeSum += magnitude;
        weightedSum += magnitude * i;
      }
      const centroid =
        magnitudeSum > 0 ? (weightedSum / magnitudeSum) * binHz : 0;
      centroidSum += centroid;
      frameCount += 1;
    }, 60);

    timeoutId = setTimeout(() => {
      cleanup();
      signal?.removeEventListener("abort", onAbort);

      if (frameCount === 0) {
        reject(new Error("no frames"));
        return;
      }

      const rmsAvg =
        rmsValues.reduce((total, value) => total + value, 0) / frameCount;
      const zcr = zcrSum / frameCount;
      const centroidHz = centroidSum / frameCount;

      const activityThreshold = Math.max(0.02, rmsPeak * 0.35);
      const activeFrames = rmsValues.filter(
        (value) => value >= activityThreshold,
      ).length;
      const activityRatio = activeFrames / frameCount;

      if (rmsPeak < 0.008) {
        reject(new Error("no audio"));
        return;
      }

      resolve({
        centroidHz,
        zcr,
        rmsAvg,
        rmsPeak,
        activityRatio,
      });
    }, durationMs);
  });
}

export async function recognizeAnimalSounds(
  animal: RecognizerAnimal,
  library: SoundDefinition[],
  options: RecognitionOptions,
): Promise<SoundDefinition[]> {
  const features = await analyzeMicrophone(options.durationMs, options.signal);
  const profiles = SOUND_PROFILES[animal];
  const scored = library.map((sound) => {
    const profile = profiles[sound.id];
    const score = profile ? scoreSound(profile, features) : 0.15;
    return { sound, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(({ sound, score }, index) => {
    const base = 40 + score * 55;
    const confidence = Math.max(
      10,
      Math.min(95, Math.round(base - index * 8)),
    );
    return { ...sound, confidence };
  });
}
