export default function OnboardingStartPage() {
  return (
    <div className="container pt-xl pb-xl" style={{ maxWidth: 800 }}>
      <div className="glass-panel text-center">
        <h1>Bienvenido a Hit Star</h1>

        <p className="text-muted mt-md">
          Vamos a configurar tu perfil artístico para comenzar a distribuir tu música.
        </p>

        <div style={{ marginTop: "2rem" }}>
          <a href="/onboarding/profile" className="btn btn-primary">
            Comenzar
          </a>
        </div>
      </div>
    </div>
  );
}