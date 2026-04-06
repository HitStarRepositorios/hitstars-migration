/**
 * Essentia.js Web Worker for Hit Star
 * Runs professional audio analysis (BPM + Key) off the main thread.
 * Loaded via CDN to avoid Turbopack/WASM build issues.
 */

let essentia = null;
let isReady = false;
const queue = [];

// Add minimal shim for WASM modules that expect browser or node context
if (typeof self.window === 'undefined') self.window = self;
if (typeof self.exports === 'undefined') self.exports = {};
if (typeof self.module === 'undefined') self.module = { exports: self.exports };
if (typeof self.document === 'undefined') {
  self.document = {
    readyState: 'complete',
    currentScript: { src: '/essentia-wasm.web.js' },
    createElement: function() { return { style: {} }; },
    getElementsByTagName: function() { return [{ appendChild: function() {} }]; }
  };
}

// Load Essentia WASM + Core from local files
try {
  importScripts(
    '/essentia-wasm.web.js',
    '/essentia-core.js'
  );

  EssentiaWASM().then(function (wasmModule) {
    essentia = new Essentia(wasmModule);
    isReady = true;
    self.postMessage({ type: 'ready' });

    // Process queued jobs
    queue.forEach(processJob);
    queue.length = 0;
  }).catch(function (err) {
    self.postMessage({ type: 'init_error', message: 'WASM init failed: ' + err.message });
  });

} catch (e) {
  self.postMessage({ type: 'init_error', message: 'importScripts failed: ' + e.message });
}

function processJob(data) {
  const { id, audioData, sampleRate } = data;

  try {
    // audioData arrives as Float32Array (transferred)
    const signal = essentia.arrayToVector(audioData);

    let bpm = null;
    let estimatedTone = null;

    // ── BPM (with sanity check for half/triple harmonics) ──────────
    try {
      const rhythm = essentia.RhythmExtractor2013(signal);
      let rawBpm = rhythm.bpm;

      if (rawBpm && rawBpm > 40 && rawBpm < 300) {
        // Surgical Pulse Normalization (/1, /2, /3, /4)
        const candidates = [rawBpm, rawBpm / 2, rawBpm / 3, rawBpm / 4];
        
        // Find the lowest grounded BPM that is still 'Humanly Musical' (> 56 BPM)
        // This correctly resolves 178 or 180 to ~60 BPM instead of 89 or 90
        const sorted = candidates.filter(c => c >= 56 && c <= 155).sort((a, b) => a - b);
        bpm = Math.round(sorted[0] || rawBpm);
      }
    } catch (e) {
      console.warn('[essentia-worker] BPM error:', e.message);
    }

    // ── KEY / TONE ────────────────────────────────────────────────────
    try {
      const keyData = essentia.KeyExtractor(signal);

      const key = keyData.key;    // e.g. "A", "C"
      const scale = keyData.scale; // "major" | "minor"

      estimatedTone = scale === 'minor' ? key + 'm' : key;
    } catch (e) {
      console.warn('[essentia-worker] Key error:', e.message);
    }

    // ── BPM MODE ANALYSIS (Tempo Histograms) ─────────────────
    // Instead of one global reading, we take the consensus of multiple windows.
    const bpms = [];
    const chunkSize = sampleRate * 30; // 30s chunks
    const numChunks = Math.floor(audioData.length / chunkSize);
    
    for (let c = 0; c < numChunks; c++) {
        const chunk = audioData.subarray(c * chunkSize, (c + 1) * chunkSize);
        const chunkVector = essentia.arrayToVector(chunk);
        try {
            const res = essentia.RhythmExtractor2013(chunkVector);
            if (res.bpm > 40 && res.bpm < 240) bpms.push(res.bpm);
        } catch(e) {}
    }

    // Pick the statistical 'winner' (most frequent BPM area)
    let consensusBpm = 120; // Default
    if (bpms.length > 0) {
        // Group by 1 BPM bins
        const bins = {};
        bpms.forEach(b => {
           const rounded = Math.round(b);
           bins[rounded] = (bins[rounded] || 0) + 1;
        });
        const sortedBins = Object.entries(bins).sort((a, b) => b[1] - a[1]);
        consensusBpm = parseFloat(sortedBins[0][0]);
    }

    // ── STRUCTURE ANALYSIS (MFCC Timbre + Rhythmic Novelty) ─────
    const features = {
        rms: [],
        centroid: [],
        mfcc: [],    
        novelty: []  
    };
    
    const windowSize = sampleRate * 2;
    const numWindows = Math.floor(audioData.length / windowSize);
    let lastMfcc = null;
    
    for (let i = 0; i < numWindows; i++) {
        const start = i * windowSize;
        const end = Math.min(start + windowSize, audioData.length);
        const chunk = audioData.subarray(start, end);
        const chunkVector = essentia.arrayToVector(chunk);
        
        try {
            const rmsValue = essentia.RMS(chunkVector).rms;
            features.rms.push(rmsValue);
            
            const spectrum = essentia.Spectrum(chunkVector).spectrum;
            const centroidValue = essentia.Centroid(spectrum).centroid;
            features.centroid.push(centroidValue);

            const mfccResult = essentia.MFCC(spectrum).mfcc;
            features.mfcc.push(mfccResult);

            if (lastMfcc) {
                let distance = 0;
                for (let k = 0; k < mfccResult.length; k++) {
                    distance += Math.pow(mfccResult[k] - lastMfcc[k], 2);
                }
                features.novelty.push(Math.sqrt(distance));
            } else {
                features.novelty.push(0);
            }
            lastMfcc = mfccResult;

        } catch (e) {
            features.rms.push(0);
            features.centroid.push(0);
            features.mfcc.push(new Array(13).fill(0));
            features.novelty.push(0);
        }
    }

    // ── Advanced Structural Similarity
    const structuralSimilarity = [];
    for (let i = 0; i < features.mfcc.length; i++) {
        let similarityCount = 0;
        const current = features.mfcc[i];
        for (let j = 0; j < features.mfcc.length; j++) {
            if (Math.abs(i - j) < 15) continue;
            let dist = 0;
            for (let k = 0; k < current.length; k++) {
                dist += Math.pow(current[k] - features.mfcc[j][k], 2);
            }
            if (Math.sqrt(dist) < 1.4) similarityCount++;
        }
        structuralSimilarity.push(similarityCount);
    }

    self.postMessage({ 
        type: 'result', 
        id, 
        bpm: consensusBpm, 
        estimatedTone,
        features: {
            ...features,
            structuralSimilarity
        }
    });

  } catch (e) {
    self.postMessage({ type: 'error', id, message: e.message });
  }
}

self.onmessage = function (event) {
  if (!isReady) {
    queue.push(event.data);
  } else {
    processJob(event.data);
  }
};
