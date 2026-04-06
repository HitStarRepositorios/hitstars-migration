export type TrackAnalysis = {
  bpm: number | null;
  duration: number;
  segments: { start: number; end: number; type: string }[];
  estimatedTone: string | null;
  sampleRate: number;
  bitDepth: number;
  codec: string;
  version?: number; // NEW: Tracking analysis version
};

// ─── Essentia Worker Singleton ────────────────────────────────────────────────

let essentiaWorker: Worker | null = null;
let essentiaErrored = false;
type WorkerCallback = {
  resolve: (v: { bpm: number | null; estimatedTone: string | null; features?: any }) => void;
  reject: (e: Error) => void;
};
const workerCallbacks = new Map<string, WorkerCallback>();

function getEssentiaWorker(): Worker {
  if (typeof window === 'undefined') throw new Error('Worker only in browser');
  if (essentiaErrored) throw new Error('Essentia worker failed to initialize');

  if (!essentiaWorker) {
    // CACHE BUST v22
    essentiaWorker = new Worker('/essentia-worker.js?v=22');

    essentiaWorker.onmessage = (e) => {
      const { type, id, bpm, estimatedTone, features, message } = e.data;

      if (type === 'result' && id) {
        const cb = workerCallbacks.get(id);
        if (cb) { cb.resolve({ bpm, estimatedTone, features }); workerCallbacks.delete(id); }

      } else if (type === 'error' && id) {
        const cb = workerCallbacks.get(id);
        if (cb) { cb.reject(new Error(message)); workerCallbacks.delete(id); }

      } else if (type === 'init_error') {
        console.warn('[audioAnalysis] Essentia init error:', message);
        essentiaErrored = true;
        workerCallbacks.forEach(cb => cb.reject(new Error(message)));
        workerCallbacks.clear();
        essentiaWorker = null;
      }
    };

    essentiaWorker.onerror = (e) => {
      console.error('[audioAnalysis] Worker crash:', e.message);
      workerCallbacks.forEach(cb => cb.reject(new Error('Worker crash')));
      workerCallbacks.clear();
      essentiaWorker = null;
    };
  }

  return essentiaWorker;
}

async function analyzeWithEssentia(
  audioBuffer: AudioBuffer,
  timeoutMs = 20000
): Promise<{ bpm: number | null; estimatedTone: string | null }> {
  return new Promise((resolve, reject) => {
    const id = Math.random().toString(36).slice(2);
    const worker = getEssentiaWorker();

    // Send first 60s only (enough for BPM + Key, 4x faster)
    const maxSamples = Math.min(audioBuffer.sampleRate * 60, audioBuffer.length);
    const audioData = audioBuffer.getChannelData(0).slice(0, maxSamples);

    const timer = setTimeout(() => {
      workerCallbacks.delete(id);
      reject(new Error('Essentia timeout after ' + timeoutMs + 'ms'));
    }, timeoutMs);

    workerCallbacks.set(id, {
      resolve: (v) => { clearTimeout(timer); resolve(v); },
      reject:  (e) => { clearTimeout(timer); reject(e); },
    });

    // Transfer the buffer (zero-copy, much faster than serializing)
    worker.postMessage(
      { id, audioData, sampleRate: audioBuffer.sampleRate },
      [audioData.buffer]
    );
  });
}

// ─── Precision Utilities ───────────────────────────────────────────────────

/**
 * Normaliza un BPM detectado buscando armonías musicales (1/2, 1/3, 2/3, 3/2) 
 * que encajen en el rango "Musical Humano" (56 - 155 BPM) y preferendo
 * números enteros como 60, 90, 120.
 */
export function normalizeBPM(rawBpm: number | null): number | null {
  if (!rawBpm || rawBpm < 40 || rawBpm > 300) return rawBpm;

  // Candidatos basados en relaciones musicales comunes:
  // x1 (Original), /2, /3, /4 (Sub-armónicos)
  // x2, x3 (Sobre-armónicos)
  // x2/3, x3/2 (Síncopas y ritmos compuestos)
  const candidates = [
    rawBpm, rawBpm / 2, rawBpm / 3, rawBpm / 4,
    rawBpm * 2, rawBpm * 3,
    (rawBpm * 2) / 3, (rawBpm * 3) / 2
  ];

  // Filtramos por el rango humano (56 - 155 BPM)
  const valid = candidates
    .filter(c => c >= 56 && c <= 155);

  if (valid.length === 0) return Math.round(rawBpm);

  // Clasificación por "Cercanía a Estándar"
  // Priorizamos valores cercanos a 60, 120, 128 o múltiplos de 10
  valid.sort((a, b) => {
    const score = (val: number) => {
      let s = 100;
      if (Math.abs(val - 60) < 1.5) s -= 90; // Prioridad máxima a 60
      if (Math.abs(val - 120) < 1.5) s -= 80;
      if (Math.abs(val - 128) < 1.5) s -= 70;
      if (val % 10 === 0) s -= 10;
      return s;
    };
    return score(a) - score(b);
  });

  return Math.round(valid[0]);
}

/** Obtiene la duración exacta del archivo usando los metadatos del navegador. */
function getExactDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(0);
    });
    audio.src = url;
  });
}

export async function analyzeAudio(file: File): Promise<TrackAnalysis> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

  // Get exact duration and partial buffer for analysis
  const [realDuration, arrayBuffer] = await Promise.all([
    getExactDuration(file),
    file.slice(0, 44100 * 4 * 300).arrayBuffer(), // 5 min max for analysis speed
  ]);

  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // 1. Detección Base (Rápida con Algoritmo de Flujo Espectral)
  let bpm: number | null = normalizeBPM(detectBPM(audioBuffer));
  let estimatedTone: string | null = null;
  let segments = detectSegmentsSpectral(audioBuffer, realDuration);

  // 2. Intento de Análisis Profesional (Essentia)
  try {
    const id = Math.random().toString(36).slice(2);
    const worker = getEssentiaWorker();
    
    const essentiaResult = await new Promise<any>((resolve, reject) => {
        const timeout = setTimeout(() => {
            workerCallbacks.delete(id); 
            reject(new Error('Timeout'));
        }, 30000);

        workerCallbacks.set(id, {
            resolve: (v) => { clearTimeout(timeout); resolve(v); },
            reject: (e) => { clearTimeout(timeout); reject(e); }
        });

        const maxSamples = Math.min(audioBuffer.sampleRate * 240, audioBuffer.length);
        const audioData = audioBuffer.getChannelData(0).slice(0, maxSamples);
        worker.postMessage({ id, audioData, sampleRate: audioBuffer.sampleRate }, [audioData.buffer]);
    });

    if (essentiaResult.bpm !== null) bpm = normalizeBPM(essentiaResult.bpm);
    if (essentiaResult.estimatedTone !== null) estimatedTone = essentiaResult.estimatedTone;
    
    // Si Essentia tiene rasgos avanzados, refinamos los segmentos
    if (essentiaResult.features && essentiaResult.features.rms) {
      segments = detectSegmentsAdvanced(essentiaResult.features, realDuration, bpm || 120);
    }

    // 3. Pulido Rítmico Universal (Forzar variedad y evitar estribillos infinitos)
    segments = polishSegments(segments, realDuration);
  } catch (e) {
    console.warn('[audioAnalysis] Fallback a análisis espectral local:', (e as Error).message);
    estimatedTone = detectTone(audioBuffer);
  }

  return {
    bpm,
    duration: realDuration > 10 ? realDuration : Math.round(audioBuffer.duration),
    segments,
    estimatedTone,
    sampleRate: audioBuffer.sampleRate,
    bitDepth: 16,
    codec: 'WAV',
    version: 22, // NEW: Mark this analysis as 'Pro'
  };
}

// ─── Advanced Segment Detection (Spectral Transition Scanner) ───────────

/** 
 * Segmentación por Novedad Tímbrica y Alineación de Compases (Bar-Phasing)
 * 1. Usa la rejilla musical (BPM) para 'chapar' los bordes de sección.
 * 2. Garantiza que los cambios ocurran en múltiplos de compases (4 u 8).
 */
function detectSegmentsAdvanced(features: any, realDuration: number, bpm: number): { start: number; end: number; type: string }[] {
    const { rms, novelty, structuralSimilarity } = features;
    const numWindows = rms.length;
    if (numWindows < 10) return [{ start: 0, end: realDuration, type: 'chorus' }];

    // 1. Rejilla Musical (Bar Grid)
    // Suponemos 4/4: un bloque de 4 compases = (60/bpm) * 16 pulsos
    const secondsPerBeat = 60 / (bpm || 120);
    const fourBarsDuration = secondsPerBeat * 16;
    
    const snapToBar = (time: number) => {
        const barIdx = Math.round(time / fourBarsDuration);
        return Math.min(realDuration, barIdx * fourBarsDuration);
    };

    // 2. Identificar Puntos de Corte (Novelty Peaks)
    const transitions: number[] = [];
    const novArr = novelty || [];
    for (let i = 2; i < novArr.length - 2; i++) {
        if (novArr[i] > novArr[i-1] && novArr[i] > novArr[i+1] && novArr[i] > 1.1) {
            transitions.push(i);
        }
    }

    // 3. Encontrar el 'Hook' Tímbrico
    let maxRep = 0;
    let seedIdx = 15;
    const sSim = structuralSimilarity || [];
    for (let i = 0; i < sSim.length; i++) {
        const posWeight = i > 15 ? 1.4 : 1.0; 
        const score = sSim[i] * posWeight * (rms[i] || 0.1);
        if (score > maxRep) { maxRep = score; seedIdx = i; }
    }

    // 4. Marcar Gemelos
    const choruses: number[] = [seedIdx];
    for (let i = 0; i < sSim.length; i++) {
        if (Math.abs(i - seedIdx) < 12) continue;
        if (sSim[i] > (maxRep * 0.70) && sSim[i] > 1) {
            const tooClose = choruses.some(idx => Math.abs(idx - i) < 18);
            if (!tooClose) choruses.push(i);
        }
    }
    choruses.sort((a,b) => a-b);

    interface Seg { start: number; end: number; type: string }
    const segments: Seg[] = [];

    // 5. Construcción Alineada a Compases
    let cursor = 0;
    const findNearestMusicalBreak = (time: number) => {
        // Buscamos un pico de novedad cerca de un cambio de compás
        const b = transitions.find(idx => Math.abs(idx*2 - time) < 8);
        return snapToBar(b ? b * 2 : time);
    };

    // Intro (Alineada a compás)
    const introEnd = findNearestMusicalBreak(Math.min(16, choruses[0]*2));
    segments.push({ start: 0, end: introEnd, type: 'intro' });
    cursor = introEnd;

    choruses.forEach(idx => {
        const startTime = findNearestMusicalBreak(idx * 2);
        
        if (startTime > cursor + 4) {
            segments.push({ start: cursor, end: startTime, type: 'verse' });
        }

        // Duración de estribillo: típicamente 8 o 16 compases
        const targetEnd = startTime + (fourBarsDuration * 2); // 8 compases por defecto
        const nextBreak = transitions.find(tIdx => tIdx*2 > startTime + 12 && tIdx*2 < startTime + 40);
        const endTime = findNearestMusicalBreak(nextBreak ? nextBreak*2 : targetEnd);
        
        if (startTime >= cursor && endTime > startTime) {
          segments.push({ start: startTime, end: endTime, type: 'chorus' });
          cursor = endTime;
        }
    });

    if (cursor < realDuration) {
        segments.push({ start: cursor, end: realDuration, type: 'outro' });
    }

    return polishSegments(segments, realDuration);
}

/**
 * Pulido Rítmico de Segmentos (El Ejecutor de Composición)
 * 1. Prohíbe más de 3 estribillos.
 * 2. Fuerza secciones con contraste (Mín 15s para Versos, Máx 60s total).
 */
function polishSegments(raw: {start:number, end:number, type:string}[], duration: number) {
    if (raw.length === 0) return [{ start: 0, end: duration, type: 'chorus' }];

    // Deep clone per safety
    const workingRaw = raw.map(s => ({ ...s }));

    // 1. Limitar a los 3 mejores estribillos (para evitar ruido visual)
    const chorusSegments = workingRaw.filter(s => s.type === 'chorus');
    if (chorusSegments.length > 3) {
        const kept = [
            chorusSegments[0],
            chorusSegments[Math.floor(chorusSegments.length / 2)],
            chorusSegments[chorusSegments.length - 1]
        ];
        workingRaw.forEach(s => {
            if (s.type === 'chorus' && !kept.includes(s)) s.type = 'verse';
        });
    }

    const merged: {start:number, end:number, type:string}[] = [];
    if (workingRaw.length === 0) return [];
    let last = { ...workingRaw[0] };

    // 2. Fusión Selectiva (Respetar Versos de > 15s)
    for (let i = 1; i < workingRaw.length; i++) {
        const s = workingRaw[i];
        const isSmallVerse = s.type === 'verse' && (s.end - s.start) < 15;
        const isSmallChorus = s.type === 'chorus' && (s.end - s.start) < 10;
        
        if (s.type === last.type || isSmallVerse || isSmallChorus) {
            last.end = s.end;
        } else {
            merged.push(last);
            last = { ...s };
        }
    }
    merged.push(last);

    // 3. Garantía de Contraste y Variedad (Máximo 60s por bloque)
    const final: typeof merged = [];
    merged.forEach(s => {
        const len = s.end - s.start;
        
        // Si un bloque es eterno (> 60s), lo partimos inyectando un contraste
        if (len > 60) {
            const splitPoint = s.start + 30;
            const gapLen = 15;
            
            final.push({ start: s.start, end: splitPoint, type: s.type });
            // Inyectamos un verso o puente si el bloque era un Chorus
            const fillerType = s.type === 'chorus' ? 'verse' : 'bridge';
            final.push({ start: splitPoint, end: splitPoint + gapLen, type: fillerType });
            final.push({ start: splitPoint + gapLen, end: s.end, type: s.type });
        } else {
            final.push(s);
        }
    });

    if (final.length > 0) final[final.length - 1].end = duration;
    return final;
}

/** 
 * Detector de Segmentos Espectrales Finito (Local Fallback)
 * Busca transiciones naturales en la onda de sonido.
 */
function detectSegmentsSpectral(buffer: AudioBuffer, realDuration: number): { start: number; end: number; type: string }[] {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const numCheckpoints = Math.floor(realDuration / 4); // Ventanas de 4s
  const step = 4 * sr;

  const energies: number[] = [];
  for (let i = 0; i < numCheckpoints; i++) {
    let sum = 0;
    const start = i * step;
    const end = Math.min(start + step, data.length);
    for (let j = start; j < end; j += 400) sum += data[j] * data[j];
    energies.push(Math.sqrt(sum / ((end - start) / 400)));
  }

  const avgEnergy = energies.reduce((a,b) => a+b, 0) / energies.length;
  const segments: { start: number; end: number; type: string }[] = [];
  let currentStart = 0;

  // Umbral de cambio más receptivo (0.25 en lugar de 0.4) para evitar "Todo Intro"
  const changeThreshold = avgEnergy * 0.25;

  // Intro (fija los primeros 8-15s)
  const introEnd = Math.min(12, realDuration);
  segments.push({ start: 0, end: introEnd, type: 'intro' });
  currentStart = introEnd;

  for (let i = Math.floor(introEnd / 4); i < numCheckpoints; i++) {
    const diff = Math.abs(energies[i] - energies[i-1]);
    const time = i * 4;

    if (diff > changeThreshold && (time - currentStart) > 16) {
       // Si sube mucho la energía es Chorus, si baja es Verse
       const type = energies[i] > avgEnergy ? 'chorus' : 'verse';
       segments.push({ start: currentStart, end: time, type });
       currentStart = time;
    }
  }

  // Garantía de Diversidad: Si solo hay 1 segmento aparte de la intro, forzamos un Chorus
  if (segments.length < 3 && realDuration > 40) {
    let peakIdx = 0;
    let maxE = 0;
    for(let i=0; i<energies.length; i++) if(energies[i]>maxE) { maxE=energies[i]; peakIdx=i; }
    const pTime = Math.max(introEnd + 10, peakIdx * 4);
    
    // Insertamos un chorus de 45s en el pico
    const cEnd = Math.min(realDuration - 10, pTime + 45);
    segments.push({ start: pTime, end: cEnd, type: 'chorus' });
    currentStart = cEnd;
  }

  // 4. Outro Final
  if (currentStart < realDuration) {
    segments.push({ start: currentStart, end: realDuration, type: 'outro' });
  }

  return polishSegments(segments, realDuration);
}

// ─── Fallback BPM (Sub-band Beat Detection) ─────────────────────────

function detectBPM(buffer: AudioBuffer): number | null {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  
  // Analizamos los primeros 60s
  const dataLength = Math.min(data.length, sr * 60);
  const peaks = [];
  
  // Umbral de pico adaptable
  let maxVal = 0;
  for(let i=0; i<sr*5; i+=500) if(Math.abs(data[i])>maxVal) maxVal = Math.abs(data[i]);
  const threshold = maxVal * 0.85;

  for (let i = 0; i < dataLength; i += 200) {
    if (Math.abs(data[i]) > threshold) {
      peaks.push(i);
      i += (sr * 0.25); // Debounce de 250ms (~240bpm max)
    }
  }

  if (peaks.length < 5) return null;

  const intervals = [];
  for (let i = 1; i < peaks.length; i++) intervals.push(peaks[i] - peaks[i - 1]);
  intervals.sort((a,b) => a-b);
  
  const medianInterval = intervals[Math.floor(intervals.length / 2)];
  const bpm = 60 / (medianInterval / buffer.sampleRate);
  return bpm;
}
function detectTone(_buffer: AudioBuffer): string | null {
  return null;
}
