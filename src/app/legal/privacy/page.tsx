export default function PrivacyPage() {
  return (
    <div className="container pt-xl pb-xl" style={{ maxWidth: 900 }}>
      <h1>Política de Privacidad – Hit Star</h1>

      <p>Última actualización: {new Date().getFullYear()}</p>

      <h2>1. Responsable del tratamiento</h2>
      <p>
        El responsable del tratamiento de los datos personales es Hit Star
        (en adelante, "la Plataforma").
      </p>

      <h2>2. Datos que recopilamos</h2>
      <p>Podemos recopilar los siguientes datos personales:</p>
      <ul>
        <li>Nombre artístico y datos identificativos</li>
        <li>Dirección de correo electrónico</li>
        <li>Contraseña cifrada</li>
        <li>Datos de identidad (DNI, pasaporte u otros documentos)</li>
        <li>Fecha de nacimiento</li>
        <li>Datos fiscales y bancarios (IBAN, tax ID, etc.)</li>
        <li>Información de perfiles en plataformas digitales</li>
        <li>Dirección IP y datos técnicos de conexión</li>
      </ul>

      <h2>3. Finalidad del tratamiento</h2>
      <p>Tratamos los datos personales para:</p>
      <ul>
        <li>Gestionar el registro y acceso a la Plataforma</li>
        <li>Procesar la distribución digital de contenidos musicales</li>
        <li>Verificar la identidad del usuario (KYC)</li>
        <li>Gestionar pagos de royalties</li>
        <li>Cumplir obligaciones legales y fiscales</li>
        <li>Prevenir fraudes y usos indebidos</li>
      </ul>

      <h2>4. Base legal</h2>
      <p>
        El tratamiento de datos se basa en:
      </p>
      <ul>
        <li>La ejecución del contrato entre el usuario y la Plataforma</li>
        <li>El cumplimiento de obligaciones legales</li>
        <li>El consentimiento del usuario</li>
        <li>El interés legítimo en prevenir fraude y proteger la Plataforma</li>
      </ul>

      <h2>5. Conservación de datos</h2>
      <p>
        Los datos se conservarán mientras exista relación contractual y durante
        los plazos legalmente exigidos para cumplir obligaciones fiscales o
        legales.
      </p>

      <h2>6. Cesión de datos</h2>
      <p>
        Los datos podrán compartirse con:
      </p>
      <ul>
        <li>Plataformas digitales de distribución (Spotify, Apple Music, etc.)</li>
        <li>Proveedores de servicios de pago</li>
        <li>Proveedores de servicios de verificación de identidad</li>
        <li>Autoridades competentes cuando sea legalmente requerido</li>
      </ul>

      <h2>7. Seguridad</h2>
      <p>
        Hit Star aplica medidas técnicas y organizativas adecuadas para proteger
        los datos personales frente a accesos no autorizados, pérdida o
        alteración.
      </p>

      <h2>8. Derechos del usuario</h2>
      <p>
        El usuario puede ejercer los siguientes derechos:
      </p>
      <ul>
        <li>Acceso a sus datos personales</li>
        <li>Rectificación de datos inexactos</li>
        <li>Supresión de datos</li>
        <li>Limitación del tratamiento</li>
        <li>Portabilidad de datos</li>
        <li>Oposición al tratamiento</li>
      </ul>
      <p>
        Para ejercer estos derechos, el usuario puede contactar a través del
        correo electrónico oficial de la Plataforma.
      </p>

      <h2>9. Transferencias internacionales</h2>
      <p>
        En caso de que los datos sean transferidos fuera del Espacio Económico
        Europeo, se adoptarán las garantías legales necesarias conforme a la
        normativa aplicable.
      </p>

      <h2>10. Modificaciones</h2>
      <p>
        Hit Star podrá actualizar esta política de privacidad cuando sea
        necesario. Las modificaciones serán publicadas en esta página.
      </p>
    </div>
  );
}