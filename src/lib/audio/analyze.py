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

# suavizar curva
kernel = np.ones(8) / 8
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

repetition = [0] * len(section_vectors)

for i in range(len(section_vectors)):

    for j in range(len(section_vectors)):

        if i == j:
            continue

        similarity = np.dot(section_vectors[i], section_vectors[j])

        if similarity > 0.85:
            repetition[i] += 1

# ---------------- ENERGY SCORE ----------------

avg_energy = np.mean(section_energy)

energy_score = [
    1 if e > avg_energy * 1.15 else 0
    for e in section_energy
]

# ---------------- CHORUS SCORE ----------------

scores = [
    repetition[i] + energy_score[i]
    for i in range(len(repetition))
]

chorus_index = int(np.argmax(scores)) if scores else -1

# ---------------- CLASSIFY ----------------

for i, s in enumerate(segments):

    if i == 0:
        s["type"] = "intro"

    elif i == len(segments) - 1:
        s["type"] = "outro"

    elif scores[i] == scores[chorus_index] and scores[i] > 0:
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