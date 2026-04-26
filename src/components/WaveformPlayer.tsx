"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

type Segment = {
  start: number
  end: number
  type: string
}

type Props = {
  audioUrl: string;
  previewStart?: number;
  duration?: number;
  segments?: Segment[];
  onPreviewChange?: (seconds: number) => void;
};

export default function WaveformPlayer({
  audioUrl,
  previewStart = 0,
  duration,
  segments = [],
  onPreviewChange,
}: Props) {

  const containerRef = useRef<HTMLDivElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const isInteracting = useRef(false);
  const seekTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Snapshot Refs para evitar cierres obsoletos (Stale Closures)
  const durationRef = useRef(duration);
  const callbackRef = useRef(onPreviewChange);

  useEffect(() => { durationRef.current = duration; }, [duration]);
  useEffect(() => { callbackRef.current = onPreviewChange; }, [onPreviewChange]);

  // Paleta HSL Curada (Vibrante y Profesional)
  const colors: Record<string,string> = {
    intro: "hsla(210, 100%, 65%, 0.8)",    // Blue
    verse: "hsla(35, 100%, 65%, 0.7)",     // Amber (Naranja vibrante)
    chorus: "hsla(330, 100%, 65%, 0.9)",   // Pink
    hook: "hsla(330, 100%, 65%, 0.9)",     // Pink
    bridge: "hsla(270, 100%, 70%, 0.8)",   // Purple
    outro: "hsla(210, 100%, 65%, 0.8)",    // Blue
    section: "hsla(0, 0%, 50%, 0.5)"       // Neutral
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const suggestedPreview =
    segments.find(s => s.type === "chorus")?.start ?? null;

  /* VISIBILITY OBSERVER & FALLBACK */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { rootMargin: "300px" });
    
    observer.observe(el);
    
    // Fallback: Si el observer no dispara, forzamos visibilidad tras 500ms
    const timer = setTimeout(() => setVisible(true), 500);
    
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);
 
  /* CREATE WAVESURFER */
  useEffect(() => {
    if (!visible || !waveformRef.current || !audioUrl || !audioRef.current) return;
    if (wavesurfer.current) return;
 
    try {
      setError(null);
      
      // Forzar recarga del elemento audio para evitar estados de error cacheados
      if (audioRef.current) {
        audioRef.current.load();
      }

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        media: audioRef.current,
        waveColor: "rgba(255, 255, 255, 0.15)",
        progressColor: "#a78bfa",
        cursorColor: "#c4b5fd",
        height: 60,
        barWidth: 2,
        barGap: 3,
        barRadius: 4,
        normalize: true,
        interact: true,
        cursorWidth: 2,
      });
   
      wavesurfer.current = ws;
 
      ws.on("ready", () => {
        setReady(true);
        setError(null);
        if (previewStart && duration) {
          ws.seekTo(previewStart / duration);
        }
      });

      ws.on("play", () => setIsPlaying(true));
      ws.on("pause", () => setIsPlaying(false));
      ws.on("timeupdate", (t) => setCurrentTime(t));

      ws.on("error", (err) => {
        console.error("WaveSurfer Error:", err);
        
        // Si falla la URL con proxy/token, intentamos una vez con la URL directa (si existe)
        if (audioUrl.includes('token=') || audioUrl.includes('?key=')) {
          console.log("Intentando fallback a URL directa...");
          setError("Error en el proxy. Reintentando conexión directa...");
          
          // Intentar extraer la URL original o simplemente avisar
          // En este componente no tenemos track.fileUrl directamente, así que 
          // lo mejor es avisar al usuario o intentar limpiar la URL.
        }
        
        setError("Error de conexión con el servidor de audio.");
      });

      ws.on("interaction", (newTime: number) => {
        if (typeof newTime !== 'number') return;
        isInteracting.current = true;
        if (seekTimeout.current) clearTimeout(seekTimeout.current);
        seekTimeout.current = setTimeout(() => { isInteracting.current = false; }, 1000);
        callbackRef.current?.(Math.floor(newTime));
      });
    } catch (e) {
      console.error("WaveSurfer Init Error:", e);
      setError("Error al inicializar el reproductor.");
    }

    return () => {
      if (wavesurfer.current) {
        try {
          wavesurfer.current.unAll();
          wavesurfer.current.destroy();
        } catch (e) {}
        wavesurfer.current = null;
      }
    };
  }, [audioUrl, visible]);

  /* UPDATE PREVIEW POSITION */
  useEffect(() => {
    if (!wavesurfer.current || !duration || isInteracting.current || isPlaying) return;
    const progress = previewStart / duration;
    wavesurfer.current.seekTo(Math.max(0, Math.min(1, progress)));
  }, [previewStart, duration, isPlaying]);

  const togglePlay = () => {
    if (wavesurfer.current) wavesurfer.current.playPause();
  };

  const playFrom = (time: number) => {
    if (!wavesurfer.current || !duration) return;
    wavesurfer.current.setTime(time);
    wavesurfer.current.play();
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        borderRadius: "20px",
        overflow: "hidden",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
      }}
    >
      {/* ELEMENTO AUDIO OCULTO PARA BACKEND NATIVO */}
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        crossOrigin="anonymous"
        preload="auto"
      />

      {/* ─── HEADER: TITLE & CONTROLS ────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button 
           onClick={togglePlay}
           style={{
             width: "44px",
             height: "44px",
             borderRadius: "50%",
             background: "#a78bfa",
             border: "none",
             color: "white",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             cursor: "pointer",
             transition: "transform 0.2s ease, background 0.2s ease",
             boxShadow: "0 0 15px rgba(167, 139, 250, 0.4)"
           }}
           onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
           onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          {isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: "2px" }}><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10.5-6.86a1 1 0 0 0 0-1.72L9.5 4.28a1 1 0 0 0-1.5.86z"/></svg>
          )}
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
            <button 
                onClick={() => playFrom(previewStart)}
                style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.8)",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    cursor: "pointer"
                }}
            >
                ▶ Escuchar Preview
            </button>
            {suggestedPreview !== null && (
                <button 
                    onClick={() => playFrom(suggestedPreview)}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        background: "rgba(74, 222, 128, 0.1)",
                        border: "1px solid rgba(74, 222, 128, 0.2)",
                        color: "#4ade80",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        cursor: "pointer"
                    }}
                >
                    ✦ Sugerido
                </button>
            )}
        </div>

        <div style={{ fontSize: "0.85rem", fontVariantNumeric: "tabular-nums", color: "rgba(255,255,255,0.6)" }}>
            <span style={{ color: "#a78bfa", fontWeight: 700 }}>{formatTime(currentTime)}</span>
            <span style={{ margin: "0 4px" }}>/</span>
            <span>{formatTime(duration || 0)}</span>
        </div>
      </div>

      {/* ─── WAVEFORM ──────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", minHeight: "60px", marginBottom: "10px" }}>
        {error && (
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            background: 'rgba(239,68,68,0.1)', 
            color: '#ef4444', 
            zIndex: 20,
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            textAlign: 'center',
            padding: '0 20px',
            border: '1px solid rgba(239,68,68,0.2)'
          }}>
            {error}
          </div>
        )}
        {visible ? (
          <div ref={waveformRef} />
        ) : (
          <div style={{ height: "60px", width: "100%", background: "rgba(255,255,255,0.02)" }} />
        )}

        {/* SUGGESTED PREVIEW MARKER (GREEN LINE) */}
        {suggestedPreview !== null && duration && (
          <div
            style={{
              position: "absolute",
              left: `${(suggestedPreview / duration) * 100}%`,
              top: 0,
              bottom: 0,
              width: "2px",
              background: "#4ade80",
              boxShadow: "0 0 10px rgba(74, 222, 128, 0.6)",
              zIndex: 10,
              opacity: 0.6,
              pointerEvents: "none"
            }}
          />
        )}
      </div>

      {/* ─── STRUCTURE TIMELINE ────────────────────── */}
      {duration && segments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{
            display: "flex",
            width: "100%",
            height: "6px",
            borderRadius: "3px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.05)",
          }}>
            {segments.map((s, i) => {
              const width = ((s.end - s.start) / duration) * 100;
              return (
                <div
                  key={`seg-${s.start}-${i}`}
                  style={{
                    width: `${width}%`,
                    background: colors[s.type.toLowerCase()] || colors.section,
                    borderRight: "1px solid rgba(0,0,0,0.1)",
                  }}
                />
              );
            })}
          </div>

          <div style={{
            display: "flex",
            width: "100%",
            fontSize: "9px",
            marginTop: "6px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
          }}>
            {segments.map((s, i) => {
              const width = ((s.end - s.start) / duration) * 100;
              return (
                <div
                  key={`label-${s.start}-${i}`}
                  style={{
                    width: `${width}%`,
                    textAlign: "center",
                    textTransform: "uppercase",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    marginTop: "4px",
                    color: width > 4 ? (colors[s.type.toLowerCase()] || "#9ca3af") : "transparent",
                    transition: "all 0.2s ease"
                  }}
                >
                  {width > 6 ? s.type : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}