"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  kyc?: {
    status: string;
  };
  firstName?: string;
  lastName?: string;
  country?: string;
  dateOfBirth?: string;
}

export default function KycPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const kycStatus = user?.kyc?.status ?? "NOT_STARTED";
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          router.push("/");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  async function handleScan() {
    if (!dniFront || !dniBack) {
      alert("Por favor, sube ambos lados del documento.");
      return;
    }

    setIsValidating(true);
    // 🕵️ SIMULACIÓN DE OCR / ESCANEO PREMIUM
    // En un entorno real aquí llamaríamos a Tesseract.js o una API de Vision
    await new Promise(r => setTimeout(r, 2500));
    setIsValidating(false);
    setIsValidated(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValidated) {
      alert("Por favor, valida los documentos primero.");
      return;
    }
    
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    if (dniFront) formData.append("dniFront", dniFront);
    if (dniBack) formData.append("dniBack", dniBack);

    try {
      const res = await fetch("/api/upload-kyc", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploading(false);
        alert(data?.error || "Error en el servidor");
        return;
      }

      // 🔄 Refetch usuario actualizado
      const updatedRes = await fetch("/api/me");
      const updatedData = await updatedRes.json();
      setUser(updatedData.user);
      setUploading(false);

    } catch (err: any) {
      setUploading(false);
      console.error(err);
      alert("Ocurrió un error al subir el documento.");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center m-xl">
        <div className="animate-pulse text-muted">Cargando perfil de seguridad...</div>
      </div>
    );
  }

  return (
    <div className="flex-col gap-lg animate-fade-in">
      <div className="glass-panel" style={{ maxWidth: 800, margin: "0 auto" }}>
        
        <h2 className="text-gradient">Verificación de Identidad</h2>

        <div style={{ marginTop: "1.5rem" }}>
          <p className="text-muted">
            Sigue los pasos para verificar tu identidad y cumplir con las normativas internacionales de distribución de royalties.
          </p>
        </div>

        {/* 📊 ESTADO */}
        <div style={{ marginTop: "2rem" }}>
          <div className="flex items-center gap-sm mb-md">
            <span className="text-sm font-medium text-secondary">Estado actual:</span>
            <span className={`badge ${
              kycStatus === 'APPROVED' ? 'badge-success' : 
              kycStatus === 'PENDING' ? 'badge-warning' : 
              kycStatus === 'REJECTED' ? 'badge-error' : 'badge-purple'
            }`}>
              {kycStatus === 'NOT_STARTED' ? 'Sin iniciar' : 
               kycStatus === 'PENDING' ? 'En revisión' : 
               kycStatus === 'APPROVED' ? 'Verificado' : 'Rechazado'}
            </span>
          </div>

          {kycStatus === "APPROVED" && (
            <div className="glass-panel" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.3)", padding: "1.5rem" }}>
              <div className="flex items-center gap-md">
                <span style={{ fontSize: "1.5rem" }}>✅</span>
                <div>
                  <h4 style={{ margin: 0 }}>Identidad Verificada</h4>
                  <p className="text-muted text-sm">Ya puedes recibir pagos de royalties sin restricciones.</p>
                </div>
              </div>
            </div>
          )}

          {kycStatus === "PENDING" && (
            <div className="glass-panel" style={{ background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.3)", padding: "1.5rem" }}>
              <div className="flex items-center gap-md">
                <span style={{ fontSize: "1.5rem" }}>🟡</span>
                <div>
                  <h4 style={{ margin: 0 }}>En Revisión</h4>
                  <p className="text-muted text-sm">Nuestro equipo legal está validando tus documentos (1-3 días hábiles).</p>
                </div>
              </div>
            </div>
          )}

          {kycStatus === "REJECTED" && (
            <div className="glass-panel" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.3)", padding: "1.5rem" }}>
              <div className="flex items-center gap-md">
                <span style={{ fontSize: "1.5rem" }}>🔴</span>
                <div>
                  <h4 style={{ margin: 0 }}>Verificación Rechazada</h4>
                  <p className="text-muted text-sm">Por favor, revisa que las fotos sean claras y los datos coincidan.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {(kycStatus === "NOT_STARTED" || kycStatus === "REJECTED") && (
          <form onSubmit={handleSubmit} className="flex-col gap-lg mt-xl">
            {/* TIPO DE ENTIDAD */}
            <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <label className="form-label mb-sm">¿Cómo emites tus facturas?</label>
              <div className="flex gap-lg">
                <label className="flex items-center gap-xs cursor-pointer group">
                  <input type="radio" name="legalEntityType" value="INDIVIDUAL" defaultChecked className="accent-purple" />
                  <span className="group-hover:text-white transition-colors">Persona física / Freelance</span>
                </label>
                <label className="flex items-center gap-xs cursor-pointer group">
                  <input type="radio" name="legalEntityType" value="COMPANY" className="accent-purple" />
                  <span className="group-hover:text-white transition-colors">Empresa / Sello Discográfico</span>
                </label>
              </div>
            </div>

            {/* DATOS PERSONALES */}
            <div className="glass-panel grid grid-cols-2 gap-md" style={{ padding: "1.5rem" }}>
              <div className="form-group col-span-1">
                <label className="form-label">Nombre legal</label>
                <input type="text" name="firstName" required className="form-input" placeholder="Nombre completo" />
              </div>
              <div className="form-group col-span-1">
                <label className="form-label">Apellidos</label>
                <input type="text" name="lastName" required className="form-input" placeholder="Apellidos" />
              </div>
              <div className="form-group col-span-1">
                <label className="form-label">Fecha de nacimiento</label>
                <input type="date" name="dateOfBirth" required className="form-input" />
              </div>
              <div className="form-group col-span-1">
                <label className="form-label">Nacionalidad</label>
                <input type="text" name="nationality" required className="form-input" placeholder="ej. Española" />
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">País de residencia fiscal</label>
                <input type="text" name="country" required className="form-input" placeholder="ej. España" />
              </div>
            </div>

            {/* DOCUMENTACIÓN */}
            <div className="glass-panel flex-col gap-lg" style={{ padding: "1.5rem" }}>
              <div className="grid grid-cols-2 gap-md">
                <div className="form-group">
                  <label className="form-label">Tipo de documento</label>
                  <select name="documentType" required className="form-input">
                    <option value="DNI">DNI / Tarjeta de Identidad</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="NIE">NIE</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Número de documento</label>
                  <input type="text" name="documentNumber" required className="form-input" placeholder="ej. 12345678X" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-lg">
                <div className="flex flex-col gap-sm">
                  <label className="form-label">Anverso (Cara frontal)</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="dniFront"
                      onChange={(e) => {
                        setDniFront(e.target.files?.[0] || null);
                        setIsValidated(false);
                      }}
                      className="hidden"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="dniFront" 
                      className={`flex flex-col items-center justify-center p-xl border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        dniFront ? 'border-success/50 bg-success/5' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'
                      }`}
                    >
                      {dniFront ? (
                        <div className="flex flex-col items-center gap-xs">
                          <span className="text-xl">📄</span>
                          <span className="text-success text-sm font-medium">{dniFront.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-xs">
                          <span className="text-xl text-muted">+</span>
                          <span className="text-muted text-sm">Subir frontal</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex flex-col gap-sm">
                  <label className="form-label">Reverso (Cara posterior)</label>
                  <div className="relative">
                    <input
                      type="file"
                      id="dniBack"
                      onChange={(e) => {
                        setDniBack(e.target.files?.[0] || null);
                        setIsValidated(false);
                      }}
                      className="hidden"
                      accept="image/*"
                    />
                    <label 
                      htmlFor="dniBack" 
                      className={`flex flex-col items-center justify-center p-xl border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        dniBack ? 'border-success/50 bg-success/5' : 'border-white/10 hover:border-purple-500/50 hover:bg-white/5'
                      }`}
                    >
                      {dniBack ? (
                        <div className="flex flex-col items-center gap-xs">
                          <span className="text-xl">📄</span>
                          <span className="text-success text-sm font-medium">{dniBack.name}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-xs">
                          <span className="text-xl text-muted">+</span>
                          <span className="text-muted text-sm">Subir reverso</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {!isValidated && (
                <button
                  type="button"
                  onClick={handleScan}
                  className="btn btn-secondary w-full"
                  disabled={isValidating || !dniFront || !dniBack}
                  style={{ position: 'relative', overflow: 'hidden' }}
                >
                  {isValidating && (
                    <div className="absolute inset-0 bg-purple-500/20" style={{
                      width: '100%',
                      animation: 'scan 2.5s ease-in-out infinite'
                    }} />
                  )}
                  {isValidating ? "Escaneando documentos..." : "🔍 Validar Documentos"}
                </button>
              )}

              {isValidated && (
                <div className="animate-fade-in text-center p-md bg-success/10 border border-success/30 rounded-xl">
                  <span className="text-success font-semibold">✓ Documentos validados (OCR OK)</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block py-lg"
              disabled={uploading || !isValidated}
            >
              {uploading ? "Enviando para revisión..." : "Enviar para revisión →"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .hidden { display: none; }
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .badge {
          padding: 0.25rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-purple { background: rgba(139, 92, 246, 0.2); color: #a78bfa; border: 1px solid rgba(139, 92, 246, 0.3); }
        .badge-success { background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        .badge-warning { background: rgba(250, 204, 21, 0.2); color: #fbbf24; border: 1px solid rgba(250, 204, 21, 0.3); }
        .badge-error { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      `}</style>
    </div>
  );
}