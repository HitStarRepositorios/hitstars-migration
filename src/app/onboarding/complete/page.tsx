"use client";

import { completeOnboardingAction } from "@/app/actions/onboarding";
import { useRouter } from "next/navigation";

export default function CompleteStep() {
  const router = useRouter();

  async function handleComplete() {
    await completeOnboardingAction();
    router.push("/dashboard");
  }

  return (
    <div className="glass-panel" style={{ maxWidth: 600, margin: "4rem auto" }}>
      <h2>¡Todo listo!</h2>
      <p>Tu perfil ha sido configurado correctamente.</p>

      <button onClick={handleComplete} className="btn btn-primary">
        Ir al Dashboard
      </button>
    </div>
  );
}