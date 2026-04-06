"use client";

import { useState } from "react";
import { processRoyaltiesAction } from "@/app/actions/admin/royalties";

/**
 * Admin button to trigger R2 royalty processing.
 * Includes loading states and success/error feedback.
 */
export default function ProcessRoyaltiesBtn() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success?: boolean; message?: string; error?: string } | null>(null);

    async function handleProcess() {
        setLoading(true);
        setResult(null);

        try {
            const res = await processRoyaltiesAction();
            setResult(res);
        } catch (err) {
            setResult({ success: false, error: "Error de ejecución en el servidor" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <button 
                onClick={handleProcess} 
                disabled={loading}
                className="btn btn-primary"
                style={{ 
                  width: "100%", 
                  padding: "1rem",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem"
                }}
            >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span> Generando Liquidaciones...
                  </>
                ) : (
                  <>
                    <span>🔄</span> Procesar Royalties desde R2
                  </>
                )}
            </button>

            {result && (
                <div style={{ 
                    padding: "1rem", 
                    borderRadius: "12px", 
                    fontSize: "0.9rem",
                    textAlign: "left",
                    background: result.success ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                    border: result.success ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(239, 68, 68, 0.2)",
                    color: result.success ? "#34d399" : "#f87171"
                }}>
                    <strong>{result.success ? "¡Éxito!" : "Error en proceso"}</strong>
                    <p style={{ margin: "0.5rem 0 0", opacity: 0.8 }}>
                      {result.success ? result.message : result.error}
                    </p>
                </div>
            )}
        </div>
    );
}
