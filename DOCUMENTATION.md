# Documentación Técnica de HitStar

## 1. Visión General del Proyecto
**HitStar** es una plataforma integral de distribución musical, gestión de regalías, analíticas y finanzas (KYC/Payouts) para artistas y sellos discográficos. Permite a los usuarios subir su música, gestionar créditos (Master y Publishing), firmar contratos automáticamente y realizar entregas a Plataformas Digitales de Servicios (DSPs) como Spotify, Apple Music, entre otras.

## 2. Stack Tecnológico (Tech Stack)

### 2.1 Backend & Base de Datos
*   **Base de Datos**: PostgreSQL alojada/gestionada a través de **Supabase**.
*   **ORM**: **Prisma** (v6.19.2) - Modelo de datos fuertemente tipado.
*   **Storage**: **Cloudflare R2** implementado usando el SDK de AWS S3 (`@aws-sdk/client-s3`) para subidas multipartes y URLs pre-firmadas, permitiendo subir archivos de audio de gran tamaño y portadas.

### 2.2 Frontend & Framework
*   **Framework**: **Next.js** (v16.1.6) utilizando el moderno App Router (`src/app`).
*   **Librería UI**: **React** (v18.2).
*   **Estilos**: **Tailwind CSS**, junto con estilos globales (`globals.css`).

### 2.3 Audio, Análisis & Herramientas Especiales
*   **Análisis de Audio Local/Browser**: Integración de bibliotecas como `meyda`, `fft-js`, `node-wav` y Web Workers especializados (`essentia-worker.js`) para análisis espectral y estructural (Intro, Outro, Estribillo).
*   **Visualización & Reproducción**: `wavesurfer.js` para los reproductores de forma de onda.
*   **Manejo de Archivos**: `archiver`, `fluent-ffmpeg` (en backend/procesos), `csv-parser`.
*   **Generador de PDF & Visores**: `pdf-lib`, `@react-pdf-viewer/core` para la generación de contratos y visualización de documentos legales.
*   **Gráficos & Mapas**: `recharts` para dashboards financieros y estadísticas; `react-simple-maps`, `d3-geo` para mapas de distribución mundial.

### 2.4 Seguridad & Autenticación
*   **Auth**: Custom credentials/Next-Auth o Supabase Auth (complementado con tokens usando `jose`, `bcrypt` y flujos de reseteo).
*   **Emails transaccionales**: Integración con **Resend** para la confirmación de correos electrónicos y alertas KYC.
*   **Protocolos SFTP**: `ssh2-sftp-client` usado para entregas DDEX a los servidores de las tiendas y DSPs.

---

## 3. Arquitectura de la Base de Datos (Prisma Schema)

El proyecto cuenta con un esquema de base de datos modular y muy robusto dividido en los siguientes dominios:

### 3.1 Usuarios y Seguridad (Users & Identity)
*   **`User`**: Modelo central. Puede tener un rol `USER` o `ADMIN`. Almacena balances de dinero, progreso del onboarding e identificadores legales.
*   **`KycVerification`**: Modelo para manejar el proceso Know Your Customer. Guarda datos de la entidad, información fiscal y estado del proceso en Stripe, etc.
*   **`Document`**: Archivos legales de prueba (DNI, Pasaporte) subidos por el usuario.

### 3.2 Artistas y Plataformas (Artists)
*   **`Artist`**: El perfil de artista del usuario, que engloba su discografía.
*   **`ArtistPlatform`**: Relaciona al artista con Spotify, Apple Music, etc., cacheando KPIs (seguidores, URLs verificadas).

### 3.3 Catálogo (Music Catalog & Releases)
*   **`Release`**: Representa un álbum, EP o Single. Controla el código UPC, metadatos, plataformas de distribución y el **estado** del lanzamiento (DRAFT, AWAITING_SIGNATURE, LIVE, etc.).
*   **`Track`**: Representa los archivos de audio y metadatos por canción (ISRC, Duración). Enlaza a los distintos roles artísticos y de composición (`TrackArtist`, `PublishingCredit`, `MasterParty`).
*   **`TrackSegment`**: Entidades generadas tras el análisis de audio (marca inicios y fin de estribillos, intros, etc.).
*   **`Work`**: Representación editorial y de derechos de autor (composición/canción subyacente).

### 3.4 Contratos y Regalías (Finance & Legal)
*   **`Contract`**: Generados en base a lanzamientos, alojan un hash para inmutabilidad y seguimiento de firmas.
*   **`RoyaltyUsage` / `RoyaltyEarning` / `RoyaltyTransaction`**: El corazón del sistema contable. Registra usos de la música en plataformas (streams/ingresos), pre-calcula los splits de los poseedores de derechos (`RightsHolder`) y orquesta pagos o retiros en masa.
*   **`PayoutProfile`**: Registros de pago de un usuario para emitir sus ganancias.

### 3.5 Operaciones (Ops / Distribution)
*   **`DSPDelivery`**: Bitácora de entregas XML/DDEX enviadas a las plataformas y su estado (PENDING, SENT, FAILED).
*   **`StoreStat` / `Analytics`**: Agregadores para mostrar analíticas en el Dashboard.

---

## 4. Estructura de Rutas principales (`src/app/`)

### 4.1 Frontend App
*   `/(auth)`: Vistas de login/registro. Rutas afines de recuperación están en `/forgot-password`, `/reset-password` y verificaciones en `/verify`.
*   `/dashboard`: El core visual de los usuarios y artistas. Pantallas donde suben lanzamientos, ven reportes, analíticas de Spotify/Apple y gestionan "splits" o royalties.
*   `/admin`: Dashboard interno para los administradores. Posiblemente para aprobar distribuciones, revisar KYC o generar de reportes de pagos.
*   `/onboarding`: Flujo asistido inicial para completar la cuenta de los artistas o disqueras una vez registrados.
*   `/legal`: Páginas estáticas y avisos legales.

### 4.2 Endpoints API (`src/app/api/`)
El proyecto usa las rutas de API (*API Routes*) modernas de Next.js para gestionar procesos de backend:
*   **Archivos / Audio**: `/r2-multipart`, `/audio-upload-url`, `/upload-cover`, `/upload-tracks`. (Se encargan con flujos seguros y directos usando pre-signed URLs hacia Cloudflare R2).
*   **Catálogo**: `/register-track`, `/update-track`, `/reorder-tracks`, `/delete-track...`
*   **Regalías / Finanzas**: `/royalties`, `/royalties-publishing`, `/withdrawals`, `/movements`. Todo el motor administrativo transaccional de ganancias.
*   **Distribución / Contratos**: `/distribution`, `/contracts`, `/splits`, `/update-track-credits`.
*   **Admin / Verificación**: `/admin`, `/upload-kyc`. Procesos seguros para KYC o gestiones limitadas por roles.

## 5. Decisiones de Arquitectura Relevantes a Destacar

1.  **Motor de Cálculo de Split en la Nube**: El diseño del esquema sugiere que HitStar puede analizar montos masivos de reportes (`RoyaltyUsage`), y derivar las ganancias correspondientes considerando el rol (`PublishingCredit` vs `MasterParty`).
2.  **Solidez en Storage para Multimedia**: Se migró la infraestructura o se concibió un puente (Cloudflare R2) para esquivar cuellos de botella al subir archivos Master grandes (WAVs pesados), usando el sistema multi-parte desde el frontend en colaboración con las API routes.
3.  **Procesamiento de Audio Asíncrono Client-Side**: El sistema confía parte del procesamiento pesado del análisis del audio (Detección de Intro/Coro) a scripts locales y Web Workers `essentia-worker.js` cargados del lado del cliente, agilizando el flujo del usuario sin sobrecargar los servidores Vercel.

---

*Documento autogenerado tras análisis estático de código.*
