"use client";

import { loginAction } from "@/app/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function LoginPage() {
    const [state, formAction, pending] = useActionState(loginAction, null);

    return (
        <>
            <div className="bg-mesh"></div>
            <main className="container flex items-center justify-center pt-xl pb-xl" style={{ minHeight: '100vh' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
                    <div className="text-center mb-lg">
                        <h2>Bienvenido</h2>
                        <p className="text-muted">Inicia sesión en Hit Star</p>
                    </div>

                    <form action={formAction}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input type="email" id="email" name="email" className="form-input" required />
                        </div>

                        <div className="form-group mb-xl">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input type="password" id="password" name="password" className="form-input" required />
                        </div>

                        {state?.error && (
                            <p className="text-center mb-md" style={{ color: 'var(--error)' }}>{state.error}</p>
                        )}

                        <button type="submit" className="btn btn-primary btn-block mb-md" disabled={pending}>
                            {pending ? "Entrando..." : "Acceder"}
                        </button>

                        <p className="text-center text-sm text-secondary" style={{ marginTop: "0.75rem" }}>
  <Link href="/forgot-password" className="text-gradient">
    ¿Olvidaste tu contraseña?
  </Link>
</p>
                    </form>

                    <p className="text-center text-sm text-secondary">
                        ¿No tienes cuenta? <Link href="/register" className="text-gradient">Regístrate</Link>
                    </p>
                </div>
            </main>
        </>
    );
}
