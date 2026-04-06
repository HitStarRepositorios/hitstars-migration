"use client";

import { registerAction } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function RegisterPage() {
    const [state, formAction, pending] = useActionState(registerAction, null);

    return (
        <>
            <div className="bg-mesh"></div>
            <main className="container flex items-center justify-center pt-xl pb-xl" style={{ minHeight: '100vh' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '450px' }}>
                    <div className="text-center mb-lg">
                        <h2>Crear Cuenta</h2>
                        <p className="text-muted">Únete a Hit Star y distribuye tu música</p>
                    </div>

                    <form action={formAction}>


  {/* DATOS ARTÍSTICOS */}
  <h4 className="text-secondary mt-lg mb-md">Datos Artísticos</h4>

  <div className="form-group">
    <label className="form-label" htmlFor="name">Nombre Artístico</label>
    <input type="text" id="name" name="name" className="form-input" required />
  </div>

  <div className="form-group">
  <label className="form-label" htmlFor="ipi">
    IPI de Autor (opcional)
  </label>
  <input
    type="text"
    id="ipi"
    name="ipi"
    className="form-input"
    placeholder="Ej: 00012345678"
  />
</div>

<div className="form-group">
  <label className="form-label" htmlFor="pro">
    Sociedad de gestión (PRO)
  </label>

  <select id="pro" name="pro" className="form-input">
    <option value="">No afiliado</option>
    <option value="SGAE">SGAE</option>
    <option value="ASCAP">ASCAP</option>
    <option value="BMI">BMI</option>
    <option value="PRS">PRS</option>
    <option value="SACEM">SACEM</option>
  </select>
</div>

  {/* DATOS DE ACCESO */}
  <h4 className="text-secondary mt-lg mb-md">Acceso</h4>

  <div className="form-group">
    <label className="form-label" htmlFor="email">Email</label>
    <input type="email" id="email" name="email" className="form-input" required />
  </div>

  <div className="form-group mb-xl">
    <label className="form-label" htmlFor="password">Contraseña</label>
    <input type="password" id="password" name="password" className="form-input" required minLength={6} />
  </div>

  <div className="form-group mb-xl">
  <label className="form-label" htmlFor="confirmPassword">
    Confirmar Contraseña
  </label>
  <input
    type="password"
    id="confirmPassword"
    name="confirmPassword"
    className="form-input"
    required
    minLength={6}
  />
</div>

  {state?.error && (
    <p className="text-center mb-md" style={{ color: 'var(--error)' }}>
      {state.error}
    </p>
  )}

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1.2rem",
  }}
>
  <input
    type="checkbox"
    id="terms"
    name="terms"
    required
    style={{
      width: "16px",
      height: "16px",
      flexShrink: 0,
    }}
  />

  <label
    htmlFor="terms"
    style={{
      fontSize: "0.9rem",
      lineHeight: "1.4",
      cursor: "pointer",
    }}
  >
    Acepto los{" "}
    <a href="/legal/terms" target="_blank" className="text-gradient">
      términos y condiciones
    </a>{" "}
    y la{" "}
    <a href="/legal/privacy" target="_blank" className="text-gradient">
      política de privacidad
    </a>
  </label>
</div>

  <button type="submit" className="btn btn-primary btn-block mb-md" disabled={pending}>
    {pending ? "Registrando..." : "Crear Cuenta"}
  </button>
</form>

                    <p className="text-center text-sm text-secondary">
                        ¿Ya tienes cuenta? <Link href="/login" className="text-gradient">Inicia Sesión</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
