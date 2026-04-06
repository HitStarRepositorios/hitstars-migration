"use client"

import { useState } from "react"

export default function WavDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void
  disabled?: boolean
}) {

  const [dragging, setDragging] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)

    const files = Array.from(e.dataTransfer.files)

    const wavFiles = files.filter(f =>
      f.type === "audio/wav" || f.name.toLowerCase().endsWith(".wav")
    )

    if (wavFiles.length) {
      onFiles(wavFiles)
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    onFiles(Array.from(e.target.files))
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border: dragging
          ? "2px solid #8b5cf6"
          : "2px dashed rgba(255,255,255,0.2)",
        borderRadius: "16px",
        padding: "2rem",
        textAlign: "center",
        background: dragging
          ? "rgba(139,92,246,0.08)"
          : "rgba(255,255,255,0.03)",
        transition: "all 0.15s ease",
        cursor: "pointer",
      }}
    >
      <input
        type="file"
        accept="audio/wav"
        multiple
        onChange={handleInput}
        disabled={disabled}
        style={{ display: "none" }}
        id="wav-drop-input"
      />

      <label
        htmlFor="wav-drop-input"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          cursor: "pointer",
        }}
      >
        <strong>Arrastra WAV aquí</strong>

        <span
          style={{
            fontSize: "0.85rem",
            opacity: 0.7,
          }}
        >
          o haz click para seleccionar archivos
        </span>
      </label>
    </div>
  )
}