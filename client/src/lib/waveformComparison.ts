/**
 * Fast waveform comparison for audio recognition
 * Uses cross-correlation and spectral similarity to match audio against reference patterns
 */

import type { SoundDefinition } from "@/lib/guineaPigSounds";

export type WaveformFeatures = {
  // Time-domain features
  waveform: Float32Array; // Downsampled waveform for quick comparison
  envelope: Float32Array; // Amplitude envelope
  
  // Frequency-domain features
  spectralProfile: Float32Array; // Average frequency distribution
  
  // Timing features
  duration: number;
  peakPositions: number[]; // Normalized positions of amplitude peaks
};

export type WaveformMatch = {
  soundId: string;
  similarity: number; // 0-1 score
  confidence: number; // 0-100 percentage
};

// Cache for pre-computed reference waveforms
const waveformCache = new Map<string, WaveformFeatures>();

/**
 * Extract waveform features from audio data
 */
export function extractWaveformFeatures(
  audioBuffer: AudioBuffer,
  targetLength: number = 256
): WaveformFeatures {
  const channelData = audioBuffer.getChannelData(0); // Use first channel
  const duration = audioBuffer.duration;
  
  // Downsample waveform for quick comparison
  const waveform = downsampleArray(channelData, targetLength);
  
  // Calculate amplitude envelope
  const envelope = calculateEnvelope(channelData, targetLength);
  
  // Calculate average spectral profile using FFT-like binning
  const spectralProfile = calculateSpectralProfile(channelData, 32);
  
  // Find peak positions (normalized 0-1)
  const peakPositions = findPeaks(envelope, 0.3); // 30% threshold
  
  return {
    waveform,
    envelope,
    spectralProfile,
    duration,
    peakPositions,
  };
}

/**
 * Downsample array to target length using averaging
 */
function downsampleArray(data: Float32Array, targetLength: number): Float32Array {
  if (data.length <= targetLength) {
    return new Float32Array(data);
  }
  
  const result = new Float32Array(targetLength);
  const blockSize = data.length / targetLength;
  
  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * blockSize);
    const end = Math.floor((i + 1) * blockSize);
    let sum = 0;
    let count = 0;
    
    for (let j = start; j < end && j < data.length; j++) {
      sum += Math.abs(data[j] ?? 0);
      count++;
    }
    
    result[i] = count > 0 ? sum / count : 0;
  }
  
  return result;
}

/**
 * Calculate amplitude envelope
 */
function calculateEnvelope(data: Float32Array, targetLength: number): Float32Array {
  const envelope = new Float32Array(targetLength);
  const blockSize = data.length / targetLength;
  
  for (let i = 0; i < targetLength; i++) {
    const start = Math.floor(i * blockSize);
    const end = Math.floor((i + 1) * blockSize);
    let max = 0;
    
    for (let j = start; j < end && j < data.length; j++) {
      max = Math.max(max, Math.abs(data[j] ?? 0));
    }
    
    envelope[i] = max;
  }
  
  return envelope;
}

/**
 * Calculate spectral profile using simple frequency binning
 */
function calculateSpectralProfile(data: Float32Array, numBins: number): Float32Array {
  const profile = new Float32Array(numBins);
  const fftSize = 2048;
  const numFrames = Math.floor(data.length / fftSize);
  
  if (numFrames === 0) {
    return profile;
  }
  
  // Simple magnitude spectrum approximation
  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * fftSize;
    
    for (let bin = 0; bin < numBins; bin++) {
      const freqStart = Math.floor((bin * fftSize) / numBins);
      const freqEnd = Math.floor(((bin + 1) * fftSize) / numBins);
      let binEnergy = 0;
      
      for (let i = freqStart; i < freqEnd && offset + i < data.length; i++) {
        binEnergy += Math.abs(data[offset + i] ?? 0);
      }
      
      profile[bin] += binEnergy;
    }
  }
  
  // Normalize
  const maxVal = Math.max(...Array.from(profile));
  if (maxVal > 0) {
    for (let i = 0; i < numBins; i++) {
      profile[i] /= maxVal;
    }
  }
  
  return profile;
}

/**
 * Find peaks in envelope (normalized positions 0-1)
 */
function findPeaks(envelope: Float32Array, threshold: number): number[] {
  const peaks: number[] = [];
  const maxVal = Math.max(...Array.from(envelope));
  const thresholdVal = maxVal * threshold;
  
  for (let i = 1; i < envelope.length - 1; i++) {
    const prev = envelope[i - 1] ?? 0;
    const curr = envelope[i] ?? 0;
    const next = envelope[i + 1] ?? 0;
    
    if (curr > prev && curr > next && curr > thresholdVal) {
      peaks.push(i / envelope.length);
    }
  }
  
  return peaks;
}

/**
 * Calculate cross-correlation similarity between two arrays
 */
function crossCorrelation(a: Float32Array, b: Float32Array): number {
  const len = Math.min(a.length, b.length);
  let correlation = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < len; i++) {
    const valA = a[i] ?? 0;
    const valB = b[i] ?? 0;
    correlation += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }
  
  const denom = Math.sqrt(normA * normB);
  return denom > 0 ? correlation / denom : 0;
}

/**
 * Calculate cosine similarity between two arrays
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  return crossCorrelation(a, b); // Same as cross-correlation for normalized vectors
}

/**
 * Calculate peak pattern similarity
 */
function peakSimilarity(peaksA: number[], peaksB: number[], tolerance: number = 0.1): number {
  if (peaksA.length === 0 || peaksB.length === 0) {
    return 0;
  }
  
  let matches = 0;
  
  for (const peakA of peaksA) {
    for (const peakB of peaksB) {
      if (Math.abs(peakA - peakB) < tolerance) {
        matches++;
        break;
      }
    }
  }
  
  // Normalized by average number of peaks
  return (2 * matches) / (peaksA.length + peaksB.length);
}

/**
 * Compare waveform features and return similarity score
 */
export function compareWaveforms(
  features1: WaveformFeatures,
  features2: WaveformFeatures
): number {
  // Envelope similarity (40% weight) - temporal pattern
  const envelopeSim = crossCorrelation(features1.envelope, features2.envelope);
  
  // Spectral similarity (35% weight) - frequency content
  const spectralSim = cosineSimilarity(features1.spectralProfile, features2.spectralProfile);
  
  // Peak pattern similarity (15% weight) - rhythmic structure
  const peakSim = peakSimilarity(features1.peakPositions, features2.peakPositions);
  
  // Waveform shape similarity (10% weight) - fine details
  const waveformSim = crossCorrelation(features1.waveform, features2.waveform);
  
  // Combined weighted score
  return (
    envelopeSim * 0.4 +
    spectralSim * 0.35 +
    peakSim * 0.15 +
    waveformSim * 0.1
  );
}

/**
 * Load and cache reference waveform from audio file
 */
export async function loadReferenceWaveform(
  soundId: string,
  audioUrl: string
): Promise<WaveformFeatures> {
  const cacheKey = `${soundId}_${audioUrl}`;
  
  if (waveformCache.has(cacheKey)) {
    return waveformCache.get(cacheKey)!;
  }
  
  try {
    const ctx = new AudioContext();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    await ctx.close();
    
    const features = extractWaveformFeatures(audioBuffer);
    waveformCache.set(cacheKey, features);
    
    return features;
  } catch (error) {
    console.error(`Failed to load reference waveform for ${soundId}:`, error);
    throw error;
  }
}

/**
 * Match recorded audio against reference waveforms
 */
export async function matchWaveform(
  recordedFeatures: WaveformFeatures,
  referenceMap: Map<string, WaveformFeatures>
): Promise<WaveformMatch[]> {
  const matches: WaveformMatch[] = [];
  
  for (const [soundId, refFeatures] of referenceMap.entries()) {
    const similarity = compareWaveforms(recordedFeatures, refFeatures);
    const confidence = Math.round(Math.min(95, Math.max(10, similarity * 100)));
    
    matches.push({
      soundId,
      similarity,
      confidence,
    });
  }
  
  // Sort by similarity (highest first)
  matches.sort((a, b) => b.similarity - a.similarity);
  
  return matches;
}

/**
 * Extract waveform features from microphone audio data
 */
export function extractFeaturesFromMicrophone(
  audioData: Float32Array,
  sampleRate: number,
  durationSeconds: number
): WaveformFeatures {
  // Create a simple AudioBuffer-like structure
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const trimmedData = audioData.slice(0, numSamples);
  
  // Use similar extraction logic
  const targetLength = 256;
  const waveform = downsampleArray(trimmedData, targetLength);
  const envelope = calculateEnvelope(trimmedData, targetLength);
  const spectralProfile = calculateSpectralProfile(trimmedData, 32);
  const peakPositions = findPeaks(envelope, 0.3);
  
  return {
    waveform,
    envelope,
    spectralProfile,
    duration: durationSeconds,
    peakPositions,
  };
}
