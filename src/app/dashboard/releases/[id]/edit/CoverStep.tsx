"use client";

import { useState } from "react";

export default function CoverStep({ release }: any) {

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(release.coverUrl || null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {

    e.preventDefault()

    const form = e.currentTarget
    const fileInput = form.cover as HTMLInputElement

    const file = fileInput.files?.[0]

    /* 🔴 SI NO HAY ARCHIVO NUEVO */

    if (!file) {

      if (release.coverUrl) {
        setMessage("La portada ya está subida.")
      } else {
        setMessage("Selecciona una imagen.")
      }

      return

    }

    /* 🟣 SI HAY ARCHIVO → SUBIR */

    setLoading(true)
    setMessage(null)

    const formData = new FormData(form)

    const res = await fetch("/api/upload-cover", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()

    if (data.error) {

      setMessage(data.error)

    } else {

      setMessage("Portada actualizada correctamente.")

      // refrescar preview
      setPreview(data.coverUrl || preview)

    }

    setLoading(false)

  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    setPreview(url)

  }

  return (

    <form
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="flex-col gap-lg"
    >

      <input type="hidden" name="releaseId" value={release.id} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "2rem",
          alignItems: "start"
        }}
      >

        {/* PREVIEW */}

        <div
          style={{
            width: "300px",
            aspectRatio: "1 / 1",
            borderRadius: "16px",
            overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >

          {preview ? (

            <img
              src={preview}
              alt="Portada"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />

          ) : (

            <span
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)"
              }}
            >
              Sin portada
            </span>

          )}

        </div>

        {/* UPLOAD */}

        <div className="form-group">

          <label className="form-label">
            Portada del lanzamiento
          </label>

          <div
            style={{
              padding: "1.5rem",
              borderRadius: "14px",
              border: "1px dashed rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.03)",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem"
            }}
          >

            <input
              type="file"
              name="cover"
              accept="image/png, image/jpeg"
              className="form-input"
              onChange={handleFileChange}
            />

            <small className="text-muted">
              JPG o PNG — exactamente 3000x3000 píxeles
            </small>

          </div>

          {message && (

            <p
              style={{
                marginTop: "0.8rem",
                color: message.includes("correctamente")
                  ? "var(--success)"
                  : "#ef4444",
              }}
            >
              {message}
            </p>

          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: "1rem" }}
          >
            {loading ? "Subiendo..." : "Guardar portada"}
          </button>

        </div>

      </div>

      {preview && (
        <button
          type="button"
          onClick={async () => {

            const res = await fetch("/api/delete-cover", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                releaseId: release.id
              })
            })

            const data = await res.json()

            if (data.success) {
              setPreview(null)
              setMessage("Portada eliminada.")
            }

          }}
          className="btn btn-secondary"
          style={{
            marginTop: "0.75rem"
          }}
        >
          Eliminar portada
        </button>
      )}

    </form>

  )

}