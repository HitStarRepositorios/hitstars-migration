import sys
import json
import essentia.standard as es
import numpy as np

file = sys.argv[1]

# ---------------- LOAD AUDIO ----------------

loader = es.MonoLoader(filename=file)
audio = loader()
sr = loader.paramValue("sampleRate")

duration = len(audio) / sr

# ---------------- BPM + BEATS ----------------

rhythm = es.RhythmExtractor2013(method="multifeature")
bpm, beats, conf, _, _ = rhythm(audio)

beats = list(beats)

# ---------------- Danceability ----------------

dance = es.Danceability()
danceability, _ = dance(audio)

# ---------------- Key ----------------

key, scale, strength = es.KeyExtractor()(audio)

# ---------------- FRAME FEATURES ----------------

frame_size = 2048
hop = 1024

window = es.Windowing(type="hann")
spectrum = es.Spectrum()
spectral_peaks = es.SpectralPeaks()
hpcp = es.HPCP()
rms = es.RMS()

chromas = []
energies = []

for i in range(0, len(audio) - frame_size, hop):

    frame = audio[i:i+frame_size]

    energies.append(rms(frame))

    spec = spectrum(window(frame))
    freqs, mags = spectral_peaks(spec)

    chroma = hpcp(freqs, mags)

    chromas.append(chroma)

chromas = np.array(chromas)
energies = np.array(energies)

# ---------------- SELF SIMILARITY MATRIX ----------------

similarity = np.dot(chromas, chromas.T)

# ---------------- NOVELTY CURVE ----------------

novelty = np.zeros(len(similarity))

for i in range(1, len(similarity) - 1):

    novelty[i] = np.mean(
        np.abs(similarity[i] - similarity[i-1])
    )

# suavizar curva con ventana más grande para evitar micro-segmentos
kernel = np.ones(16) / 16
novelty = np.convolve(novelty, kernel, mode="same")

threshold = np.mean(novelty) * 1.5

boundaries = []

for i in range(1, len(novelty) - 1):

    if novelty[i] > threshold and novelty[i] > novelty[i-1] and novelty[i] > novelty[i+1]:
        boundaries.append(i)

# ---------------- BUILD SEGMENTS ----------------

segments = []

current_start = 0
min_section = 20

for b in boundaries:

    time = (b * hop) / sr

    if time > duration:
        break

    if time - current_start < min_section:
        continue

    segments.append({
        "start": round(current_start,2),
        "end": round(time,2),
        "type": "section"
    })

    current_start = time

# último segmento
if current_start < duration:

    segments.append({
        "start": round(current_start,2),
        "end": round(duration,2),
        "type": "section"
    })

# fallback si salen pocos segmentos
if len(segments) < 3:

    segments = []

    block = 30
    t = 0

    while t < duration:

        end = min(t + block, duration)

        segments.append({
            "start": round(t,2),
            "end": round(end,2),
            "type": "section"
        })

        t += block

# ---------------- FEATURES PER SEGMENT ----------------

section_vectors = []
section_energy = []

for s in segments:

    start = int(s["start"] * sr / hop)
    end = int(s["end"] * sr / hop)

    slice_chroma = chromas[start:end]
    slice_energy = energies[start:end]

    if len(slice_chroma) == 0:
        section_vectors.append(np.zeros(12))
    else:
        section_vectors.append(np.mean(slice_chroma, axis=0))

    if len(slice_energy) == 0:
        section_energy.append(0)
    else:
        section_energy.append(float(np.mean(slice_energy)))

section_vectors = np.array(section_vectors)

# ---------------- REPETITION SCORE ----------------

repetition = [0.0] * len(section_vectors)

for i in range(len(section_vectors)):
    for j in range(len(section_vectors)):
        if i == j:
            continue
        similarity = np.dot(section_vectors[i], section_vectors[j])
        if similarity > 0.85:
            repetition[i] += 1

# Normalizar repetición (0 a 1)
max_rep = max(repetition) if max(repetition) > 0 else 1
repetition_norm = [r / max_rep for r in repetition]

# ---------------- ENERGY SCORE ----------------

# Normalizar energía (0 a 1)
max_energy = max(section_energy) if max(section_energy) > 0 else 1
energy_norm = [e / max_energy for e in section_energy]

# ---------------- CHORUS SCORE ----------------
# Damos más peso a la energía (70%) que a la repetición (30%)
# El estribillo suele ser la parte más fuerte y que se repite.

scores = []
for i in range(len(segments)):
    seg_duration = segments[i]["end"] - segments[i]["start"]
    
    # Penalizar segmentos muy cortos como estribillos (menos de 10s)
    length_penalty = 1.0 if seg_duration >= 10 else 0.2
    
    # Penalizar la intro como estribillo (si empieza en 0)
    pos_penalty = 0.5 if segments[i]["start"] < 15 else 1.0
    
    score = (0.7 * energy_norm[i] + 0.3 * repetition_norm[i]) * length_penalty * pos_penalty
    scores.append(score)

chorus_index = int(np.argmax(scores)) if scores else -1

# ---------------- CLASSIFY ----------------

for i, s in enumerate(segments):

    if i == 0:
        s["type"] = "intro"

    elif i == len(segments) - 1:
        s["type"] = "outro"

    elif i == chorus_index and scores[i] > 0.4:
        s["type"] = "chorus"

    else:
        s["type"] = "verse"

# ---------------- OUTPUT ----------------

clean_segments = []

for s in segments:

    clean_segments.append({
        "start": float(s["start"]),
        "end": float(s["end"]),
        "type": str(s["type"])
    })

result = {
    "bpm": float(bpm),
    "danceability": float(danceability),
    "key": str(key),
    "scale": str(scale),
    "segments": clean_segments
}

print(json.dumps(result))