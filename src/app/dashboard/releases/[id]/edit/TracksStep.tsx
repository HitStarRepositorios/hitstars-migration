"use client";

import { useState, useEffect, useRef } from "react";
import { GENRE_MAP } from "@/lib/genres";
import WaveformPlayer from "@/components/WaveformPlayer";
import TrackArtistsEditor from "@/components/TrackArtistsEditor";
import { useRouter } from "next/navigation";
import WavDropzone from "@/components/WavDropzone"
import { analyzeAudio, normalizeBPM } from "@/lib/audio/audioAnalysis";


import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

/* ===============================
   TYPES
=============================== */

type TrackSegment = {
  start: number
  end: number
  type: string
}

type Track = {
  id: string
  trackNumber: number
  title: string
  isrc?: string
  duration?: number
  subGenre?: string
  isInstrumental?: boolean
  explicit?: boolean
  recordingEdition?:
  | "ORIGINAL"
  | "REMASTERED"
  | "RADIO_EDIT"
  | "LIVE"
  | "ACOUSTIC"
  | "INSTRUMENTAL"
  previewStart?: number
  fileUrl?: string

  segments?: TrackSegment[]

  artists?: {
    id: string
    artistName: string
    role: "MAIN" | "FEATURED" | "PRODUCER" | "REMIXER"
    spotifyId?: string
  }[]

  estimatedBPM?: number
  estimatedTone?: string
  estimatedDanceability?: string
  localUrl?: string
  proxiedUrl?: string 
  analysisVersion?: number // NEW: Track the version of the audio model used
};




/* ===============================
   SORTABLE WRAPPER
=============================== */

function SortableTrack({
  track,
  children,
}: {
  track: Track;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging
      ? "0 15px 35px rgba(0,0,0,0.45)"
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        display: "flex",
        gap: "1rem",
        alignItems: "stretch",
      }}
    >
      {/* DRAG HANDLE */}
      <div
        {...attributes}
        {...listeners}
        style={{
          width: "32px",
          minWidth: "32px",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <div
          style={{
            width: "4px",
            height: "18px",
            background: "rgba(255,255,255,0.4)",
            borderRadius: "4px",
          }}
        />
      </div>

      {/* CONTENIDO REAL */}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}


const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

function parseTimeToSeconds(value: string): number | null {
  if (!isValidTimeFormat(value)) return null;

  const parts = value.split(":").map(Number);

  if (parts.some(isNaN)) return null;

  if (parts.length === 2) {
    const [m, s] = parts;
    if (s >= 60) return null;
    return m * 60 + s;
  }

  if (parts.length === 3) {
    const [h, m, s] = parts;
    if (m >= 60 || s >= 60) return null;
    return h * 3600 + m * 60 + s;
  }

  return null;
}

function isValidTimeFormat(value: string) {
  return /^(\d{1,2}:)?\d{1,2}:\d{1,2}$/.test(value);
}

/* ===============================
   COMPONENT
=============================== */

export default function TracksStep({ release }: any) {

  const router = useRouter();

  const releaseMainArtist =
    release.releaseArtists?.find((a: any) => a.isPrimary)?.artistName || ""

  const [mounted, setMounted] = useState(false);
  const [tracks, setTracks] = useState<Track[]>(
    (release.tracks as Track[]) || []
  );
  const [loading, setLoading] = useState(false);
  const [isSingle, setIsSingle] = useState(
    release.distributionType === "SINGLE"
  );
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const [previewInputs, setPreviewInputs] = useState<Record<string, string>>({});
  const [editingTitles, setEditingTitles] = useState<Record<string, string>>({});
  const [openTrackId, setOpenTrackId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("");

  const sensors = useSensors(useSensor(PointerSensor));
  const toggleTrack = (trackId: string) => {
    setOpenTrackId((prev) => (prev === trackId ? null : trackId));
  };

  useEffect(() => {
    setIsSingle(release.distributionType === "SINGLE");
  }, [release.distributionType]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {

    if (!release.tracks?.length) return

    const releaseMainArtist =
      release.releaseArtists?.find((a: any) => a.isPrimary)?.artistName || ""

    let workerUrl = process.env.NEXT_PUBLIC_R2_WORKER_URL || "";
    if (workerUrl && !workerUrl.startsWith("http")) {
      workerUrl = `https://${workerUrl}`;
    }

    const tracksWithDefaultArtist = release.tracks.map((t: Track) => {
      // Extraer la key del fileUrl si existe y crear la proxiedUrl
      let proxiedUrl = undefined;
      if (t.fileUrl && t.fileUrl.includes("cdn.hitstar.es/")) {
        const key = t.fileUrl.split("cdn.hitstar.es/")[1];
        if (key && workerUrl) {
          proxiedUrl = `${workerUrl}?key=${encodeURIComponent(key)}`;
        }
      }

      if (t.artists && t.artists.length > 0) return { ...t, proxiedUrl };

      return {
        ...t,
        proxiedUrl,
        artists: [
          {
            id: crypto.randomUUID(),
            artistName: releaseMainArtist,
            role: "MAIN"
          }
        ]
      }

    })

    setTracks(tracksWithDefaultArtist)

  }, [release.id])



  const invalidSingle = isSingle && tracks.length > 1;
  const tracksMissingSubgenre = tracks.filter(t => !t.subGenre || t.subGenre === "")
  const hasMissingSubgenre = tracksMissingSubgenre.length > 0

  const allowedSubgenres =
    release.genre && GENRE_MAP[release.genre]
      ? GENRE_MAP[release.genre]
      : [];

  const tracksMissingMainArtist = tracks.filter(
    (t) =>
      !t.artists ||
      !t.artists.some(
        (a) =>
          a.role === "MAIN" &&
          a.artistName &&
          a.artistName.trim() !== ""
      )
  )

  const hasMissingMainArtist = tracksMissingMainArtist.length > 0


  /* ===============================
     DRAG END
  =============================== */

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);

    const newTracks = arrayMove(tracks, oldIndex, newIndex).map(
      (track, index) => ({
        ...track,
        trackNumber: index + 1,
      })
    );

    setTracks(newTracks);

    await fetch("/api/reorder-tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        releaseId: release.id,
        orderedIds: newTracks.map((t) => t.id),
      }),
    });
  };

  // Función para procesar y subir archivos a R2
  const processAndUploadFiles = async (files: File[]) => {
    setLoading(true);
    const rejectedFiles: { name: string; reason: string }[] = [];

    for (const file of files) {
      if (file.size > 2 * 1024 * 1024 * 1024) {
        rejectedFiles.push({ name: file.name, reason: "Archivo demasiado grande (>2GB)" });
        continue;
      }

      try {
        setLoadingStatus(`Analizando ${file.name}...`);
        const analysis = await analyzeAudio(file);
        analysis.bpm = normalizeBPM(analysis.bpm);

        setLoadingStatus(`Subiendo ${file.name} (0%)...`);
        
        // 1. Generar la clave (Key) del archivo
        const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const key = `audio/${Date.now()}-${sanitizedFilename}`;

        // 2. Subida directa al Cloudflare Worker Proxy
        // Usamos variables de entorno para la URL y el Token del Worker
        let workerUrl = process.env.NEXT_PUBLIC_R2_WORKER_URL;
        const workerToken = process.env.NEXT_PUBLIC_R2_WORKER_TOKEN;

        if (!workerUrl) throw new Error("NEXT_PUBLIC_R2_WORKER_URL no configurada en Vercel");
        
        // Asegurar que la URL tenga https://
        if (!workerUrl.startsWith("http")) {
            workerUrl = `https://${workerUrl}`;
        }

        const uploadRes = await fetch(`${workerUrl}?key=${encodeURIComponent(key)}`, {
          method: "PUT",
          body: file,
          headers: {
            "Authorization": `Bearer ${workerToken}`,
            "Content-Type": "audio/wav"
          }
        });
        
        if (!uploadRes.ok) {
           const errText = await uploadRes.text();
           throw new Error(`Fallo en la subida al Worker (${uploadRes.status}): ${errText}`);
        }

        // 3. Generar la URL pública final (usando tu Custom Domain cdn.hitstar.es)
        const baseUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://cdn.hitstar.es").replace(/\/$/, "");
        const publicUrl = `${baseUrl}/${key}`;

        // Registrar en BD
        setLoadingStatus("Registrando pista...");
        const regRes = await fetch("/api/register-track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            releaseId: release.id,
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileUrl: publicUrl,
            duration: analysis.duration,
            sampleRate: analysis.sampleRate,
            bitDepth: analysis.bitDepth,
            codec: analysis.codec,
            estimatedBPM: analysis.bpm,
            estimatedTone: analysis.estimatedTone,
            segments: analysis.segments,
            analysisVersion: 22, // NEW: Mark as Phase 22 compliant
          }),
        });

        const regData = await regRes.json();
        if (regData.success) {
          // Generamos una URL local y una URL proxied por el Worker
          const localBlobUrl = URL.createObjectURL(file);
          const proxiedUrl = `${workerUrl}?key=${encodeURIComponent(key)}`;
          
          setTracks((prev) => {
            const newList = [...prev, { ...regData.track, localUrl: localBlobUrl, proxiedUrl }];
            return newList.map((t, i) => ({ ...t, trackNumber: i + 1 }));
          });
          if (tracks.length === 0) setOpenTrackId(regData.track.id);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        rejectedFiles.push({ name: file.name, reason: err.message || "Error desconocido" });
      }
    }

    if (rejectedFiles.length > 0) {
      alert("Errores en la subida:\n" + rejectedFiles.map(f => `${f.name}: ${f.reason}`).join("\n"));
    }

    setLoading(false);
    setLoadingStatus("");
  };

  /* ===============================
     SUBIR TRACKS
  =============================== */

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (isSingle && tracks.length >= 1) {
      alert("Un SINGLE solo puede tener 1 pista.");
      return;
    }
    const files = Array.from(e.target.files);
    await processAndUploadFiles(files);
    e.target.value = "";
  };

  const handleDropUpload = async (files: File[]) => {
    await processAndUploadFiles(files);
  };

  /* ===============================
     ACTUALIZAR TRACK
  =============================== */

  const updateTrack = async (
    trackId: string,
    field: keyof Track,
    value: any
  ) => {
    const res = await fetch("/api/update-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trackId,
        field,
        value,
      }),
    });

    if (res.ok) {
      setTracks((prev) =>
        prev.map((t) =>
          t.id === trackId ? { ...t, [field]: value } : t
        )
      );
    }
  };

  /**
   * Actualización atómica de múltiples campos para evitar condiciones de carrera (Race Conditions)
   * Útil para re-análisis donde cambian BPM, Tono y Segmentos a la vez.
   */
  const bulkUpdateTrack = async (trackId: string, updates: Partial<Track>) => {
    // 1. Guardar en BD (un solo hit al API si es posible, o secuencial para evitar bloqueos)
    // Para simplificar y asegurar consistencia, usamos una sola llamada si el API lo soporta, 
    // pero como nuestro API es genérico por 'field', haremos un batch local.
    
    // NOTA: Para máxima eficiencia, este API debería soportar un objeto 'updates'.
    // De momento, actualizamos el estado de golpe (Atómico) y persistimos los campos clave.
    
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId ? { ...t, ...updates } : t
      )
    );

    // Persistencia secuencial para no saturar
    for (const [field, value] of Object.entries(updates)) {
        await fetch("/api/update-track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trackId, field, value }),
        });
    }
  };

  /* ===============================
     ELIMINAR TRACK
  =============================== */

  const deleteTrack = async (trackId: string) => {
    const confirmDelete = confirm(
      "¿Seguro que quieres eliminar esta pista?"
    );

    if (!confirmDelete) return;

    const res = await fetch("/api/delete-track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackId }),
    });

    const data = await res.json();

    if (data.success) {
      setTracks((prev) =>
        prev.filter((t) => t.id !== trackId)
      );
    }
  };

  /* ===============================
     RE-ANALIZAR TRACK
  =============================== */

  const handleReanalyze = async (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    setLoading(true);
    setLoadingStatus(`Actualizando análisis de ${track.title}...`);

    try {
      const sourceUrl = track.localUrl || track.proxiedUrl || track.fileUrl;
      const response = await fetch(sourceUrl!);
      const blob = await response.blob();
      const file = new File([blob], "re-analyze.wav", { type: "audio/wav" });

      const analysis = await analyzeAudio(file);
      const finalBpm = normalizeBPM(analysis.bpm);

      // ACTUALIZACIÓN ATÓMICA (Evita el fallo de 60 vs 89 y que no cambie la estructura)
      await bulkUpdateTrack(trackId, {
        estimatedBPM: finalBpm ?? undefined,
        estimatedTone: analysis.estimatedTone ?? undefined,
        segments: analysis.segments,
        analysisVersion: 22 // PERSIST: Mark the upgraded version
      });

      setLoadingStatus("¡Análisis actualizado!");
      setTimeout(() => setLoadingStatus(""), 2000);
    } catch (err) {
      console.error("Re-analyze error:", err);
      alert("Error al re-analizar la pista. Contacta con soporte.");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex-col gap-lg">
      <div>
        <h3>Tracks</h3>
        <p className="text-muted">
          {isSingle
            ? "Un SINGLE solo puede tener 1 pista."
            : "Puedes subir varias pistas a la vez."}
        </p>
      </div>

      <div className="form-group">
        <input
          type="file"
          accept="audio/wav"
          multiple={!isSingle}
          onChange={handleUpload}
          className="form-input"
        />
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
          <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
          <span>{loadingStatus || "Subiendo pistas..."}</span>
        </div>
      )}

      {invalidSingle && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.4)",
            padding: "1rem",
            borderRadius: "12px",
            color: "#ef4444",
          }}
        >
          ⚠ Este lanzamiento es SINGLE y tiene más de una pista.
          Debes eliminar las pistas adicionales.
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tracks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {tracks.map((track) => (
              <SortableTrack key={track.id} track={track}>




                <div
                  className="glass-panel"
                  style={{
                    padding: "1.5rem",
                    borderRadius: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                    alignItems: "flex-start",
                    border: invalidSingle
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >

                  {/* HEADER FULL WIDTH */}

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.75rem",
                      width: "100%",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >

                      <button
                        type="button"
                        onClick={() => toggleTrack(track.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "inherit",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "1rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.9rem",
                        }}
                      >

                        <span
                          style={{
                            display: "inline-flex",
                            width: "18px",
                            height: "18px",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.05)",
                            transition: "transform 0.2s ease",
                            transform: openTrackId === track.id
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                            fontSize: "0.75rem",
                            opacity: 0.8
                          }}
                        >
                          ▶
                        </span>

                        <span>
                          {track.trackNumber}. {track.title}
                        </span>

                        {/* BADGES DE ANÁLISIS */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.5rem' }}>
                          {track.estimatedBPM && (
                            <span style={{ 
                              background: 'rgba(139,92,246,0.2)', 
                              color: '#a78bfa', 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              border: '1px solid rgba(139,92,246,0.3)'
                            }}>
                              {track.estimatedBPM}
                            </span>
                          )}
                          {track.estimatedTone && (
                            <span style={{ 
                              background: 'rgba(34,197,94,0.15)', 
                              color: '#4ade80', 
                              padding: '2px 8px', 
                              borderRadius: '6px', 
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              border: '1px solid rgba(34,197,94,0.3)'
                            }}>
                              {track.estimatedTone}
                            </span>
                          )}
                          {track.duration && (
                            <span style={{ 
                              color: 'rgba(255,255,255,0.4)', 
                              fontSize: '0.75rem',
                              marginLeft: '0.3rem'
                            }}>
                              {formatTime(track.duration)}
                            </span>
                          )}
                        </div>

                      </button>

                      <button
                        onClick={() => deleteTrack(track.id)}
                        style={{
                          marginLeft: "auto",
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.35)",
                          color: "#ef4444",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        Eliminar
                      </button>

                    </div>
                  </div>


                  {openTrackId === track.id && (
                    <>


                      {/* TWO COLUMNS */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "minmax(340px,420px) 1fr",
                          gap: "1.5rem",
                          alignItems: "start"
                        }}
                      >

                        <div
                          className="form-group"
                          style={{ gridColumn: "1 / -1" }}
                        >
                          <label className="form-label">
                            Nombre del track *
                          </label>

                          <input
                            type="text"
                            value={editingTitles[track.id] ?? track.title ?? ""}
                            onChange={(e) =>
                              setEditingTitles(prev => ({ ...prev, [track.id]: e.target.value }))
                            }
                            onBlur={(e) => {
                              updateTrack(track.id, "title", e.target.value)
                              setEditingTitles(prev => {
                                const next = { ...prev }
                                delete next[track.id]
                                return next
                              })
                            }}
                            className="form-input"
                          />
                        </div>

                        {/* LEFT COLUMN — ARTISTS */}
                        <TrackArtistsEditor
                          trackId={track.id}
                          artists={track.artists || []}
                          onChange={(artists) => {
                            setTracks((prev) =>
                              prev.map((t) =>
                                t.id === track.id ? { ...t, artists } : t
                              )
                            );
                            // PERSISTIR EN BD
                            updateTrack(track.id, "artists", artists);
                          }}
                        />

                        {/* RIGHT COLUMN */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>



                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "120px 1fr",
                              rowGap: "6px",
                              fontSize: "0.9rem",
                              color: "var(--text-secondary)"
                            }}
                          >




                            <div>Duración</div>
                            <div>
                              {track.duration
                                ? `${Math.floor(track.duration / 60)}:${(track.duration % 60)
                                  .toString()
                                  .padStart(2, "0")}`
                                : "—"}
                            </div>

                            {track.estimatedBPM && (
                              <>
                            <div>BPM</div>
                            <div style={{ 
                                padding: "4px 8px", 
                                color: "var(--accent-primary)", 
                                fontWeight: 700,
                                fontSize: "0.9rem"
                            }}>
                                {track.estimatedBPM || "—"}
                            </div>
                              </>
                            )}

                            {track.estimatedDanceability && (
                              <>
                                <div>Danceability</div>
                                <div>{track.estimatedDanceability}</div>
                              </>
                            )}
                            {track.estimatedTone && (
                              <>
                                <div>Tono</div>
                                <div>{track.estimatedTone}</div>
                              </>
                            )}

                          </div>



                          <div className="form-group">
                            <label className="form-label">
                              Subgénero{" "}
                              {release.genre
                                ? `(${release.genre})`
                                : "(Selecciona género primero)"}
                            </label>

                            <div style={{ position: "relative" }}>
                              <select
                                value={track.subGenre || ""}
                                onChange={(e) =>
                                  updateTrack(track.id, "subGenre", e.target.value)
                                }
                                className="form-input"
                                style={{
                                  appearance: "none",
                                  paddingRight: "44px",
                                  borderColor: !track.subGenre ? "#ef4444" : undefined
                                }}
                                disabled={!release.genre}
                              >
                                <option value="">Seleccionar subgénero</option>

                                {allowedSubgenres.map((g) => (
                                  <option key={g.value} value={g.value}>
                                    {g.label}
                                  </option>
                                ))}
                              </select>

                              {/* custom arrow */}
                              <div
                                style={{
                                  position: "absolute",
                                  right: "65px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  pointerEvents: "none",
                                  fontSize: "0.9rem",
                                  opacity: 0.7
                                }}
                              >
                                ▾
                              </div>
                            </div>
                            {!track.subGenre && (
                              <div
                                style={{
                                  color: "#ef4444",
                                  fontSize: "0.8rem",
                                  marginTop: "0.35rem",
                                  marginBottom: "-0.4rem"
                                }}
                              >
                                El subgénero es obligatorio
                              </div>
                            )}
                          </div>


                        </div>  {/* TWO COLUMNS GRID */}

                        {/* PREVIEW START */}
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            marginTop: "0.3rem",
                            padding: "1.5rem",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.06)"
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                            <div className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>
                              Tiempo de inicio del preview
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                               <input 
                                  type="text"
                                  placeholder="00:00"
                                  value={previewInputs[track.id] ?? formatTime(track.previewStart || 0)}
                                  onChange={(e) => setPreviewInputs(prev => ({ ...prev, [track.id]: e.target.value }))}
                                  onBlur={(e) => {
                                    const secs = parseTimeToSeconds(e.target.value);
                                    if (secs !== null && track.duration && secs <= track.duration) {
                                      updateTrack(track.id, "previewStart", secs);
                                    }
                                    setPreviewInputs(prev => {
                                      const n = { ...prev };
                                      delete n[track.id];
                                      return n;
                                    });
                                  }}
                                  className="form-input"
                                  style={{
                                    width: "110px",
                                    height: "44px",
                                    textAlign: "center",
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    background: "rgba(255,255,255,0.06)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: "10px",
                                    color: "var(--accent-primary)"
                                  }}
                               />
                               <span style={{ fontSize: '0.95rem', opacity: 0.4, fontWeight: 500 }}>/ {formatTime(track.duration || 0)}</span>
                            </div>
                          </div>

                          { (track.localUrl || track.fileUrl || track.proxiedUrl) && (
                            <WaveformPlayer
                              audioUrl={(track.localUrl || track.proxiedUrl || track.fileUrl) as string}
                              previewStart={track.previewStart ?? 0}
                              duration={track.duration ?? 0}
                              segments={track.segments ?? []}
                              onPreviewChange={(seconds) => {
                                updateTrack(track.id, "previewStart", seconds);
                                setPreviewInputs((prev) => ({
                                  ...prev,
                                  [track.id]: formatTime(seconds),
                                }));
                              }}
                            />
                          )}

                          <p style={{ 
                            fontSize: "0.85rem", 
                            color: "var(--text-secondary)",
                            marginTop: "1.2rem",
                            lineHeight: "1.5",
                            opacity: 0.7
                          }}>
                            Este punto se usará como inicio del preview en plataformas como TikTok, Instagram Music, YouTube Shorts y otros DSPs.
                          </p>
                        </div>
                        {/* REC EDITION & FLAGS (COMPACT ROW) */}
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            marginTop: "1rem",
                            padding: "1.2rem",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.04)"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-end",
                              gap: "2rem",
                              flexWrap: "wrap"
                            }}
                          >
                            {/* Selector de Versión */}
                            <div className="form-group" style={{ marginBottom: 0, minWidth: "240px" }}>
                              <label className="form-label" style={{ marginBottom: "6px" }}>Versión de grabación</label>
                              <select
                                value={track.recordingEdition || "ORIGINAL"}
                                onChange={(e) => updateTrack(track.id, "recordingEdition", e.target.value)}
                                className="form-input"
                              >
                                <option value="ORIGINAL">Original</option>
                                <option value="REMASTERED">Remastered</option>
                                <option value="RADIO_EDIT">Radio Edit</option>
                                <option value="LIVE">Live</option>
                                <option value="ACOUSTIC">Acoustic</option>
                                <option value="INSTRUMENTAL">Instrumental</option>
                              </select>
                            </div>

                            {/* Checkboxes agrupados a la derecha */}
                            <div style={{ display: "flex", gap: "1.5rem", paddingBottom: "12px" }}>
                              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.9rem" }}>
                                <input
                                  type="checkbox"
                                  checked={track.isInstrumental || false}
                                  onChange={(e) => updateTrack(track.id, "isInstrumental", e.target.checked)}
                                  style={{ width: "16px", height: "16px" }}
                                />
                                Es instrumental
                              </label>

                              <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontSize: "0.9rem" }}>
                                <input
                                  type="checkbox"
                                  checked={track.explicit || false}
                                  onChange={(e) => updateTrack(track.id, "explicit", e.target.checked)}
                                  style={{ width: "16px", height: "16px" }}
                                />
                                Contenido explícito
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>
              </SortableTrack>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* DROPZONE CENTRADO */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem"
        }}
      >
        <WavDropzone
          onFiles={(files) => {
            handleDropUpload(files)
          }}
        />
      </div>


      {/* FOOTER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "1.5rem",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        {hasMissingSubgenre && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "0.9rem 1.1rem",
              borderRadius: "12px",
              color: "#ef4444",
              fontSize: "0.9rem"
            }}
          >
            ❌ Todas las pistas deben tener subgénero.
          </div>
        )}

        {hasMissingMainArtist && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.4)",
              padding: "0.9rem 1.1rem",
              borderRadius: "12px",
              color: "#ef4444",
              fontSize: "0.9rem"
            }}
          >
            ❌ Todas las pistas deben tener al menos un artista principal.
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          disabled={hasMissingSubgenre || hasMissingMainArtist}
          style={{
            marginLeft: "auto",
            width: "fit-content",
            minWidth: "220px"
          }}
          onClick={() => {

            const errors: string[] = []

            if (hasMissingSubgenre) {
              errors.push("Todas las pistas deben tener un subgénero.")
            }

            if (hasMissingMainArtist) {
              errors.push("Todas las pistas deben tener al menos un artista principal.")
            }

            if (errors.length > 0) {
              alert(errors.join("\n"))
              return
            }

            router.push(`/dashboard/releases/${release.id}/edit?step=credits`)

          }}
        >
          Guardar y continuar →
        </button>
      </div>
    </div>
  );
}