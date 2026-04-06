"use client";

import { loginAction } from "@/app/actions/auth";
import { useActionState } from "react";

export default function AdminLoginPage() {
    const [state, formAction, pending] = useActionState(loginAction, null);

    return (
        <div className="bg-mesh">
            <main className="container flex items-center justify-center pt-xl pb-xl" style={{ minHeight: '100vh' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', borderTop: '4px solid var(--accent-secondary)' }}>
                    <div className="text-center mb-lg">
                        <h2 className="text-secondary">Portal Admin</h2>
                        <p className="text-muted">Acceso reservado a personal</p>
                    </div>

                    <form action={formAction}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email Admin</label>
                            <input type="email" id="email" name="email" className="form-input" required />
                        </div>

                        <div className="form-group mb-xl">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input type="password" id="password" name="password" className="form-input" required />
                        </div>

                        {state?.error && (
                            <p className="text-center mb-md" style={{ color: 'var(--error)' }}>{state.error}</p>
                        )}

                        <button type="submit" className="btn btn-secondary btn-block" disabled={pending}>
                            {pending ? "Verificando..." : "Acceso Seguro"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
