"use client";

import { deleteReleaseAction } from "@/app/actions/releases";

export default function DeleteReleaseButton({
  releaseId,
}: {
  releaseId: string;
}) {
  async function handleDelete() {
    const confirmed = confirm(
      "¿Seguro que quieres eliminar este lanzamiento? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    await deleteReleaseAction(releaseId);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      style={{
        padding: "6px 12px",
        fontSize: "0.8rem",
        borderRadius: "8px",
        background: "rgba(239,68,68,0.08)",
        border: "1px solid rgba(239,68,68,0.3)",
        color: "#ef4444",
        cursor: "pointer",
      }}
    >
      Eliminar
    </button>
  );
}