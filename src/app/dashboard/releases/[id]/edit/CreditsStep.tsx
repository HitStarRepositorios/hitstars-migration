"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type HolderBase = {
  id?: string
  email?: string
  phone?: string
  isSelf?: boolean
}


type MasterSplit = {
  id: string
  percentage: number
  role: string

  holder: {
    id?: string
    legalName: string
    stageName?: string
    entityType?: "INDIVIDUAL" | "COMPANY"
    taxId?: string
    taxCountry?: string
    email?: string
    phone?: string
    isSelf?: boolean
  }

  revenueShare?: number
}

type PublishingSplit = {
  id: string
  share: number
  role: string

  holder: {
    id?: string
    firstName: string
    lastName: string
    email?: string
    phone?: string
    nationality?: string
    ipiNumber?: string
    pro?: string
      isSelf?: boolean
  }

  publisherName?: string
  publisherIpi?: string
}

const COLORS: string[] = [
  "#6d28d9",
  "#db2777",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#14b8a6",
  "#f43f5e",
];

const REVENUE_COLORS: string[] = [
  "#10b981",
  "#22c55e",
  "#4ade80",
  "#86efac",
  "#16a34a",
  "#15803d",
  "#065f46",
];

const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]{2,60}$/
const ipiRegex = /^[0-9]{9,11}$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const publisherRegex = /^[a-zA-ZÀ-ÿ0-9\s&'().-]{2,80}$/

const NATIONALITIES = [
  "ES",
  "US",
  "GB",
  "FR",
  "DE",
  "IT",
  "BR",
  "MX",
  "AR",
  "CO",
  "CL",
  "PT",
  "NL",
  "BE",
  "SE",
  "NO",
  "FI",
  "DK",
  "CA",
  "AU",
  "JP",
  "KR",
  "CN",
] as const

const splitsMemory =
  typeof window !== "undefined"
    ? ((window as any).__splitsMemory ??= {})
    : {}

function validatePublishingFields(splits: PublishingSplit[]) {



  for (const split of splits) {

    // 🔑 ignorar si no tiene porcentaje
    if (!split.share || split.share === 0) continue

    if (split.holder.firstName && !nameRegex.test(split.holder.firstName)) {
      return "El nombre del autor no es válido"
    }

    if (split.holder.lastName && !nameRegex.test(split.holder.lastName)) {
      return "Los apellidos del autor no son válidos"
    }

    if (split.holder.ipiNumber && !ipiRegex.test(split.holder.ipiNumber)) {
      return "El IPI debe tener entre 9 y 11 dígitos"
    }

    if (!split.holder.email || !emailRegex.test(split.holder.email)) {
      return "Email inválido"
    }

    if (!split.holder.nationality) {
      return "La nacionalidad es obligatoria"
    }

  }

  return null
}

function validateField(field: string, value: string) {

  if (field === "firstName" || field === "lastName") {
    if (!nameRegex.test(value)) {
      return "Solo letras y espacios"
    }
  }

  if (field === "ipiNumber") {
    if (value && !ipiRegex.test(value)) {
      return "IPI inválido"
    }
  }

  if (field === "email") {

    if (!value) {
      return "Email obligatorio"
    }

    if (!emailRegex.test(value)) {
      return "Formato: nombre@email.com"
    }

  }

  if (field === "publisherIpi") {
    if (value && !ipiRegex.test(value)) {
      return "IPI inválido"
    }
  }

  if (field === "phone") {

    if (!value) return ""

    if (value.length < 6) {
      return "Teléfono inválido"
    }

  }

  if (field === "nationality") {

    if (!value) {
      return "Nacionalidad obligatoria"
    }

  }

  return ""
}



export default function CreditsStep({ release }: any) {
  return (
    <div className="flex-col gap-xl">
      <h3>Créditos y Royalties</h3>
      <p className="text-muted">
        Configura el reparto de ingresos por pista.
      </p>

      {release.tracks.map((track: any) => (
        <TrackCredits key={track.id} track={track} />
      ))}
    </div>
  );
}

function TrackCredits({ track }: any) {

  const memoryKey = track.id

  const [masterInitialized, setMasterInitialized] = useState(false)
  const [publishingInitialized, setPublishingInitialized] = useState(false)

  const hasLoadedRef = useRef(false)


  const router = useRouter();


  const [activeType, setActiveType] =
    useState<"MASTER" | "PUBLISHING">("MASTER");

  const [composer, setComposer] = useState(track.composer || "");
  const [publisher, setPublisher] = useState(track.publisher || "");
  const [iswc, setIswc] = useState(track.iswc || "");
  const [lyrics, setLyrics] = useState(track.lyrics || "");

  // ===============================
  // MASTER SPLITS (modelo Split)
  // ===============================
  const [masterSplits, setMasterSplits] = useState<MasterSplit[]>(() => {


    if (splitsMemory[memoryKey]?.master) {
      return splitsMemory[memoryKey].master
    }

    const existing = Array.isArray(track.masterParties)
      ? track.masterParties
      : []

    if (existing.length > 0) {
      return existing.map((s: any) => ({
        id: s.id,
        role: s.role ?? "ARTIST",
        percentage: Number(s.ownershipShare) ?? 0,
        revenueShare: s.revenueShare ?? undefined,
        holder: {
          id: s.rightsHolder?.id,
          legalName: s.rightsHolder?.name ?? "",
          stageName: s.stageName ?? "",
          entityType: s.entityType ?? "INDIVIDUAL",
          taxId: s.rightsHolder?.taxId ?? "",
          taxCountry: s.rightsHolder?.taxCountry ?? "",
          email: s.rightsHolder?.email ?? "",
          phone: s.rightsHolder?.phone ?? "",
        }
      }))
    }

    return [{
      id: crypto.randomUUID(),
      role: "ARTIST",
      percentage: 100,
      revenueShare: 100,
      holder: { legalName: "" }
    }]

  })

  useEffect(() => {

    if (hasLoadedRef.current || splitsMemory[memoryKey]?.master) return

    const existing = Array.isArray(track.masterParties)
      ? track.masterParties
      : []

    if (existing.length > 0) {

      setMasterSplits(
        existing.map((s: any) => ({
          id: s.id,
          role: s.role ?? "ARTIST",
          percentage: Number(s.ownershipShare) ?? 0,
          revenueShare: s.revenueShare ?? undefined,
          holder: {
            id: s.rightsHolder?.id,
            legalName: s.rightsHolder?.name ?? "",
            stageName: s.stageName ?? "",
            entityType: s.entityType ?? "INDIVIDUAL",
            taxId: s.rightsHolder?.taxId ?? "",
            taxCountry: s.rightsHolder?.taxCountry ?? "",
            email: s.rightsHolder?.email ?? "",
            phone: s.rightsHolder?.phone ?? "",
          }
        }))
      )

    }

    hasLoadedRef.current = true

  }, [track.masterParties])

  useEffect(() => {
    splitsMemory[memoryKey] = {
      ...(splitsMemory[memoryKey] || {}),
      master: masterSplits
    }
  }, [masterSplits])

  useEffect(() => {
    console.log("STATE", masterSplits)
  }, [masterSplits])


  // ===============================
  // PUBLISHING SPLITS (modelo PublishingCredit)
  // ===============================
  const [publishingSplits, setPublishingSplits] = useState<PublishingSplit[]>(() => {

    if (splitsMemory[memoryKey]?.publishing) {
      return splitsMemory[memoryKey].publishing
    }

    const existing = Array.isArray(track.publishingCredits)
      ? track.publishingCredits
      : []

    if (existing.length > 0) {
      return existing.map((p: any) => ({
        id: p.id,
        role: p.role ?? "AUTOR_MUSICA_LETRA",
        share: Number(p.share) ?? 0,
        holder: {
          id: p.rightsHolder?.id,
          firstName: p.rightsHolder?.firstName ?? "",
          lastName: p.rightsHolder?.lastName ?? "",
          email: p.rightsHolder?.email ?? "",
          phone: p.rightsHolder?.phone ?? "",
          nationality: p.rightsHolder?.nationality ?? "",
          ipiNumber: p.rightsHolder?.ipi ?? "",
          pro: p.rightsHolder?.pro ?? "",
        },
        publisherName: p.publisherName ?? "",
        publisherIpi: p.publisherIpi ?? ""
      }))
    }

    return [{
      id: crypto.randomUUID(),
      role: "AUTOR_MUSICA_LETRA",
      share: 0,
      holder: { firstName: "", lastName: "" }
    }]
  })

  useEffect(() => {

    if (hasLoadedRef.current || splitsMemory[memoryKey]?.publishing) return

    const existing = Array.isArray(track.publishingCredits)
      ? track.publishingCredits
      : []

    if (existing.length > 0) {

      setPublishingSplits(
        existing.map((p: any) => ({
          id: p.id,
          role: p.role ?? "AUTOR_MUSICA_LETRA",
          share: Number(p.share) ?? 0,
          holder: {
            id: p.rightsHolder?.id,
            firstName: p.rightsHolder?.firstName ?? "",
            lastName: p.rightsHolder?.lastName ?? "",
            email: p.rightsHolder?.email ?? "",
            phone: p.rightsHolder?.phone ?? "",
            nationality: p.rightsHolder?.nationality ?? "",
            ipiNumber: p.rightsHolder?.ipi ?? "",
            pro: p.rightsHolder?.pro ?? "",
          },
          publisherName: p.publisherName ?? "",
          publisherIpi: p.publisherIpi ?? ""
        }))
      )

    }

  }, [track.publishingCredits])

  useEffect(() => {
    splitsMemory[memoryKey] = {
      ...(splitsMemory[memoryKey] || {}),
      publishing: publishingSplits
    }
  }, [publishingSplits])

  const [loadingSplits, setLoadingSplits] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  function distributeShares(values: number[]) {
    const total = values.reduce((sum, v) => sum + v, 0)
    const diff = Number((100 - total).toFixed(2))

    if (Math.abs(diff) >= 0.01) {
      values[0] = Number((values[0] + diff).toFixed(2))
    }

    return values


  }



  function autoBalance(
    type: "MASTER" | "PUBLISHING",
    index: number,
    newValue: number
  ) {
    const clampValue = Math.max(0, Math.min(100, newValue));

    function distribute(values: number[]) {
      const total = values.reduce((sum, v) => sum + v, 0);
      const diff = Number((100 - total).toFixed(2));

      if (Math.abs(diff) >= 0.01) {
        values[0] = Number((values[0] + diff).toFixed(2));
      }

      return values;
    }

    if (type === "MASTER") {
      setMasterSplits((prev) => {
        const updated = prev.map(s => ({
          ...s,
          holder: { ...s.holder }
        }))

        if (updated.length === 1) {
          updated[index].percentage = clampValue;
          return updated;
        }

        const remaining = 100 - clampValue;
        const othersCount = updated.length - 1;
        const share = Number((remaining / othersCount).toFixed(2));

        const values = updated.map((_, i) =>
          i === index ? clampValue : share
        );

        const corrected = distribute(values);

        return updated.map((s, i) => ({
          ...s,
          percentage: corrected[i],
        }));
      });
    }

    if (type === "PUBLISHING") {
      setPublishingSplits((prev) => {
        const updated = prev.map((s) => ({ ...s }));

        if (updated.length === 1) {
          updated[index].share = clampValue;
          return updated;
        }

        const remaining = 100 - clampValue;
        const othersCount = updated.length - 1;
        const share = Number((remaining / othersCount).toFixed(2));

        const values = updated.map((_, i) =>
          i === index ? clampValue : share
        );

        const corrected = distribute(values);

        return updated.map((s, i) => ({
          ...s,
          share: corrected[i],
        }));
      });
    }
  }

  function autoBalanceRevenue(index: number, newValue: number) {

    const clampValue = Math.max(0, Math.min(100, newValue))

    setMasterSplits(prev => {

      const updated = prev.map(s => ({ ...s }))

      if (updated.length === 1) {
        updated[index].revenueShare = clampValue
        return updated
      }

      const remaining = 100 - clampValue
      const othersCount = updated.length - 1
      const share = Number((remaining / othersCount).toFixed(2))

      const values = updated.map((_, i) =>
        i === index ? clampValue : share
      )

      const total = values.reduce((sum, v) => sum + v, 0)
      const diff = Number((100 - total).toFixed(2))

      if (Math.abs(diff) >= 0.01) {
        values[0] = Number((values[0] + diff).toFixed(2))
      }

      return updated.map((s, i) => ({
        ...s,
        revenueShare: values[i]
      }))

    })
  }



  // ===============================
  // UPDATE SPLIT
  // ===============================

  function updateSplit(
    type: "MASTER" | "PUBLISHING",
    index: number,
    field: string,
    value: any
  ) {



    if (type === "MASTER") {

      setMasterSplits(prev =>
        prev.map((s, i) => {

          if (i !== index) return s

          if (field === "holder") {
            return {
              ...s,
              holder: {
                ...s.holder,
                ...value
              }
            }
          }

          return {
            ...s,
            [field]: value
          }

        })
      )
    }

    if (type === "PUBLISHING") {

      setPublishingSplits(prev => {

        const next = [...prev]

        const split = { ...next[index] }

        if (field === "holder") {

          split.holder = {
            ...split.holder,
            ...value
          }

        } else {

          (split as any)[field] = value

        }

        next[index] = split

        return next
      })
    }

    console.log("UPDATE", type, index, field, value)


  }


  // ===============================
  // ADD SPLIT
  // ===============================
  function addSplit(type: "MASTER" | "PUBLISHING") {
    if (type === "MASTER") {
      setMasterSplits((prev) => {
        const newSplits = [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "ARTIST",
            percentage: 0,
            holder: {
              legalName: ""
            }
          },
        ];

        const equalShare = 100 / newSplits.length;

        return newSplits.map((s) => ({
          ...s,
          percentage: Number(equalShare.toFixed(2)),
          revenueShare: Number(equalShare.toFixed(2))
        }));
      });
    }

    if (type === "PUBLISHING") {
      setPublishingSplits((prev) => {
        const newSplits = [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "AUTOR_MUSICA_LETRA",
            share: 0,
            holder: {
              firstName: "",
              lastName: ""
            }
          },
        ];

        const equalShare = 100 / newSplits.length;

        return newSplits.map((s) => ({
          ...s,
          share: Number(equalShare.toFixed(2)),
        }));
      });
    }
  }
  // ===============================
  // REMOVE SPLIT
  // ===============================
  function removeSplit(type: "MASTER" | "PUBLISHING", index: number) {

    if (type === "MASTER") {
      setMasterSplits((prev) => {

        const filtered = prev.filter((_, i) => i !== index)

        if (filtered.length === 0) return prev

        const equalShare = Number((100 / filtered.length).toFixed(2))

        return filtered.map((s) => ({
          ...s,
          percentage: equalShare
        }))
      })
    }

    if (type === "PUBLISHING") {
      setPublishingSplits((prev) => {

        const filtered = prev.filter((_, i) => i !== index)

        if (filtered.length === 0) return prev

        const equalShare = Number((100 / filtered.length).toFixed(2))

        return filtered.map((s) => ({
          ...s,
          share: equalShare
        }))
      })
    }
  }


  // ===============================
  // TOTALES
  // ===============================
  const masterTotal = masterSplits.reduce(
    (sum, s) => sum + Number(s.percentage || 0),
    0
  );

  const revenueTotal = masterSplits.reduce(
    (sum, s) => sum + Number(s.revenueShare ?? s.percentage ?? 0),
    0
  );

  const hasValidMasterName = masterSplits.some(
    (s) => s.holder?.legalName?.trim()
  )
  useEffect(() => {
    console.log("STATE", masterSplits)
  }, [masterSplits])

  const publishingTotal = publishingSplits.reduce(
    (sum, s) => sum + Number(s.share || 0),
    0
  );


  // ===============================
  // SAVE SPLITS
  // ===============================
  async function saveSplits() {

    if (activeType === "MASTER") {

      const masterHasName = masterSplits.some(
        (s) => s.holder?.legalName?.trim()
      );

      if (masterTotal !== 100) {
        alert("MASTER debe sumar exactamente 100%");
        return;
      }

      if (revenueTotal !== 100) {
        alert("Revenue Share debe sumar exactamente 100%");
        return;
      }

      if (!masterHasName) {
        alert("Debe existir al menos un titular en MASTER.");
        return;
      }

      const validMasterSplits = masterSplits.filter(
        (s) => s.holder.legalName?.trim() && s.percentage > 0
      );

      if (validMasterSplits.length === 0) {
        alert("Debe existir al menos un titular en MASTER con porcentaje mayor que 0%");
        return;
      }

      const hasValidMaster = masterSplits.some(
        (s) => s.holder.legalName?.trim() && Number(s.percentage) > 0
      );

      if (!hasValidMaster) {
        alert("Debe existir al menos un titular en MASTER.");
        return;
      }

      console.log("MASTER SPLITS SAVE", masterSplits);

    }

    if (activeType === "PUBLISHING") {

      const publishingFieldError = validatePublishingFields(publishingSplits);

      if (publishingFieldError) {
        alert(publishingFieldError);
        return;
      }

      for (const split of publishingSplits) {

        if (split.share > 0) {

          if (!split.holder.email) {
            alert("Cada autor debe tener email");
            return;
          }

          if (!split.holder.nationality) {
            alert("Cada autor debe tener nacionalidad");
            return;
          }

        }

      }

      const publishingUsed = publishingSplits.some(
        (s) => Number(s.share) > 0
      );

      if (publishingUsed) {

        const publishingHasInvalid = publishingSplits.some(
          (s) =>
            ((s.holder.firstName?.trim() || s.holder.lastName?.trim()) && Number(s.share) === 0) ||
            (!(s.holder.firstName?.trim() && s.holder.lastName?.trim()) && Number(s.share) > 0)
        );

        if (publishingHasInvalid) {
          alert("En PUBLISHING no puede haber porcentajes sin autor completo.");
          return;
        }

        if (publishingTotal !== 100) {
          alert("Si usas PUBLISHING debe sumar 100%");
          return;
        }

        const authorRoles = [
          "AUTOR_MUSICA",
          "AUTOR_LETRA",
          "AUTOR_MUSICA_LETRA",
          "COAUTOR"
        ];

        const authors = publishingSplits.filter(
          (s) => authorRoles.includes(s.role) && Number(s.share) > 0
        );

        if (authors.length === 0) {
          alert("Debe existir al menos un autor en Publishing.");
          return;
        }

        if (track.isInstrumental) {

          const hasComposer = publishingSplits.some(
            (s) =>
              (s.role === "AUTOR_MUSICA" ||
                s.role === "AUTOR_MUSICA_LETRA") &&
              Number(s.share) > 0
          );

          if (!hasComposer) {
            alert("Las obras instrumentales deben tener al menos un autor de música.");
            return;
          }

        }

        const arranger = publishingSplits.find(
          (s) => s.role === "ARREGLISTA"
        );

        if (arranger && Number(arranger.share) > 10) {
          alert("El Arreglista no puede superar el 10% en Publishing.");
          return;
        }

        const editorialTotal = publishingSplits
          .filter((s) => s.role === "EDITORIAL" || s.role === "SUBEDITORIAL")
          .reduce((sum, s) => sum + Number(s.share || 0), 0);

        if (editorialTotal > 50) {
          alert("La parte editorial no puede superar el 50% del Publishing.");
          return;
        }

        const hasEditorial = publishingSplits.some(
          (s) =>
            (s.role === "EDITORIAL" || s.role === "SUBEDITORIAL") &&
            Number(s.share) > 0
        );

        if (hasEditorial && authors.length === 0) {
          alert("No puede existir Editorial si no hay Autor.");
          return;
        }

      }

    }


    // ---------- SAVE ----------

    try {
      setLoadingSplits(true);

      const res = await fetch("/api/splits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          masterParties: masterSplits.map((s) => ({
            role: s.role,
            ownershipShare: s.percentage,
            revenueShare: s.revenueShare ?? s.percentage,

            rightsHolder: {
              id: s.holder.id ?? null,
              name: s.holder.legalName,
              email: s.holder.email ?? null,
              taxId: s.holder.taxId ?? null,
              taxCountry: s.holder.taxCountry ?? null,
              isSelf: s.holder.isSelf ?? false
            }
          })),
          publishingCredits: publishingSplits.map((s) => ({
            role: s.role,
            share: s.share,
            publisherName: s.publisherName ?? null,
            publisherIpi: s.publisherIpi ?? null,

            rightsHolder: {
              id: s.holder.id ?? null,
              firstName: s.holder.firstName,
              lastName: s.holder.lastName,
              email: s.holder.email ?? null,
              phone: s.holder.phone ?? null,
              nationality: s.holder.nationality ?? null,
              ipi: s.holder.ipiNumber ?? null,
              pro: s.holder.pro ?? null,
              isSelf: s.holder.isSelf ?? false
            }
          })),
          lyrics,
          iswc,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al guardar los splits");
        return;
      }

      console.log("BEFORE REFRESH", masterSplits)

      //router.refresh();

      setSuccessMessage(true);

      setTimeout(() => {
        setSuccessMessage(false);
      }, 2500);

    } catch (err) {
      console.error(err);
      alert("Error inesperado al guardar");
    } finally {
      setLoadingSplits(false);
    }
  }


  return (
    <div className="glass-panel" style={{ padding: "2rem", marginBottom: "3rem" }}>
      <h4 style={{ marginBottom: "2rem" }}>
        {track.trackNumber}. {track.title}
      </h4>

      <div style={{ marginBottom: "2.5rem" }} />

      {!track.isInstrumental && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();

            try {
              const res = await fetch("/api/update-track-credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  trackId: track.id,

                  masterParties: masterSplits.map((s) => ({
                    role: s.role,
                    ownershipShare: s.percentage,
                    revenueShare: s.revenueShare ?? null,

                    rightsHolder: {
                      id: s.holder.id ?? null,
                      name: s.holder.legalName,
                      email: s.holder.email ?? null,
                      taxId: s.holder.taxId ?? null,
                      taxCountry: s.holder.taxCountry ?? null
                    }
                  })),

                  publishingCredits: publishingSplits.map((s) => ({
                    role: s.role,
                    share: s.share,
                    publisherName: s.publisherName ?? null,
                    publisherIpi: s.publisherIpi ?? null,

                    rightsHolder: {
                      id: s.holder.id ?? null,
                      firstName: s.holder.firstName,
                      lastName: s.holder.lastName,
                      email: s.holder.email ?? null,
                      phone: s.holder.phone ?? null,
                      nationality: s.holder.nationality ?? null,
                      ipi: s.holder.ipiNumber ?? null,
                      pro: s.holder.pro ?? null
                    }
                  })),

                  lyrics,
                  iswc,
                }),
              });

              if (!res.ok) {
                alert("Error al guardar la letra");
                return;
              }

              alert("Letra guardada correctamente");
            } catch (error) {
              console.error(error);
              alert("Error inesperado");
            }
          }}
          style={{
            marginBottom: "3rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <textarea
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Letra de la canción"
            className="form-input"
            rows={6}
            style={{ minHeight: "140px" }}
          />

          <div>
            <button
              type="submit"
              className="btn btn-secondary"
            >
              Guardar letra
            </button>
          </div>
        </form>
      )
      }

      {/* ROYALTIES SWITCH */}
      <div
        style={{
          padding: "2rem",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.03)",
          marginBottom: "3rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h5>Royalties</h5>

          <select
            value={activeType}
            onChange={(e) =>
              setActiveType(e.target.value as "MASTER" | "PUBLISHING")
            }
            className="form-input"
            style={{ width: "200px" }}
          >
            <option value="MASTER">MASTER</option>
            <option value="PUBLISHING">PUBLISHING</option>
          </select>
        </div>

        <SplitSection
          type={activeType}
          splits={
            activeType === "MASTER"
              ? masterSplits
              : publishingSplits
          }
          updateSplit={(index, field, value) => {
            if (activeType === "MASTER") {
              updateSplit("MASTER", index, field, value)
            } else {
              updateSplit("PUBLISHING", index, field, value)
            }
          }}
          autoBalance={autoBalance}
          autoBalanceRevenue={autoBalanceRevenue}
          addSplit={() => addSplit(activeType)}
          removeSplit={(index: number) =>
            removeSplit(activeType, index)
          }
          total={
            activeType === "MASTER"
              ? masterTotal
              : publishingTotal
          }


        />
      </div>




      {masterTotal === 100 && publishingTotal === 0 && (
        <div
          style={{
            background: "rgba(59,130,246,0.1)",
            border: "1px solid #3b82f6",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            color: "#3b82f6",
          }}
        >
          ℹ️ No has configurado derechos editoriales (Publishing).
          <br />
          Si gestionas tu editorial externamente puedes dejar esta sección vacía.
          <br />
          Si deseas que HIT STAR gestione y recaude tus derechos editoriales,
          debes completar el 100%.
        </div>
      )}

      {publishingTotal > 0 && publishingTotal !== 100 && (
        <div
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid #f59e0b",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            color: "#f59e0b",
          }}
        >
          ⚠️ El reparto de Publishing no suma 100%.
          <br />
          Si deseas que gestionemos tus derechos editoriales,
          el total debe ser 100%.
        </div>
      )}

      {masterTotal === 100 && !hasValidMasterName && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid #ef4444",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            color: "#ef4444",
          }}
        >
          ❌ Debes introducir al menos un titular en los derechos MASTER.
          <br />
          El reparto puede sumar 100%, pero necesitamos identificar
          quién posee esos derechos fonográficos.
        </div>
      )}
      {revenueTotal !== 100 && (
        <div
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid #f59e0b",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            color: "#f59e0b",
          }}
        >
          ⚠️ El reparto de Revenue Share debe sumar 100%.
        </div>
      )}
      <button
        type="button"
        onClick={saveSplits}
        disabled={
          loadingSplits ||
          masterTotal !== 100 || revenueTotal !== 100 ||
          !hasValidMasterName
        }
        className="btn btn-primary"
      >
        {loadingSplits ? "Guardando..." : "Guardar Splits"}
      </button>

      {successMessage && (
        <div
          style={{
            marginTop: "0.8rem",
            color: "#10b981",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          ✓ Splits actualizados correctamente
        </div>
      )}
    </div>
  );
}



type SplitSectionProps = {
  type: "MASTER" | "PUBLISHING"
  splits: any[]
  updateSplit: (index: number, field: string, value: any) => void
  autoBalance: any
  autoBalanceRevenue: any
  addSplit: any
  removeSplit: any
  total: number
}

function SplitSection({
  type,
  splits,
  updateSplit,
  autoBalance,
  autoBalanceRevenue,
  addSplit,
  removeSplit,
  total,
}: SplitSectionProps) {

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = [...splits];

  const [expanded, setExpanded] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function getFieldStyle(splitId: string, field: string) {
    return {
      borderColor: fieldErrors[`${splitId}-${field}`] ? "#ef4444" : undefined
    }
  }

  console.log("TYPE:", type)
  console.log("FILTERED SPLITS:", filtered)

  const chartData = filtered
    .filter((s: any) => {
      const value = type === "MASTER" ? s.percentage : s.share
      return Number(value) > 0
    })
    .map((s: any) => {

      const displayName =
        type === "MASTER"
          ? s?.holder?.legalName?.trim() || "Sin titular"
          : `${s?.holder?.firstName || ""} ${s?.holder?.lastName || ""}`.trim() || "Sin autor"

      return {
        ...s,
        displayName
      }
    })

  useEffect(() => {
    console.log("SplitSection received splits:", splits)
  }, [splits])

  console.log("CHART DATA FINAL:", chartData)

  return (
    <div>
      <div
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong>
            {type === "MASTER"
              ? "Derechos Fonográficos (Master)"
              : "Derechos de Autor (Publishing)"}
          </strong>

          <strong
            style={{
              color: total === 100 ? "#10b981" : "#ef4444",
            }}
          >
            {total}%
          </strong>
        </div>

        {/* 👇 MENSAJE SOLO PARA MASTER */}
        {type === "MASTER" && total !== 100 && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.85rem",
              color: "#ef4444",
            }}
          >
            El total debe sumar 100%.
          </div>
        )}
      </div>

      {filtered.map((split: any, i: number) => {

        const realIndex = i;

        return (

          <div
            key={`${type}-${split.id}`}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1rem",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              {/* ===================== */}
              {/* NOMBRE / AUTOR */}
              {/* ===================== */}

              {type === "MASTER" ? (
                <input
                  name={`legal-${split.id}`}
                  placeholder="Nombre legal owner"
                  value={split.holder?.legalName ?? ""}
                  onChange={(e) => {
                    const value = e.target.value

                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      legalName: value
                    })
                  }}
                  className="form-input"
                />
              ) : (
                <>
                  <input
                    placeholder="Nombre"
                    value={split.holder.firstName}
                    onChange={(e) => {

                      const value = e.target.value

                      updateSplit(realIndex, "holder", {
                        ...split.holder,
                        firstName: value
                      })



                      const error = validateField("firstName", value)

                      setFieldErrors(prev => ({
                        ...prev,
                        [`${split.id}-firstName`]: error
                      }))

                    }}
                    className="form-input"
                    title={fieldErrors[`${split.id}-firstName`] || ""}
                    style={getFieldStyle(split.id, "firstName")}
                  />




                  <input
                    placeholder="Apellidos"
                    value={split.holder.lastName}
                    onChange={(e) => {

                      const value = e.target.value

                      updateSplit(realIndex, "holder", {
                        ...split.holder,
                        lastName: value
                      })

                      const error = validateField("lastName", value)

                      setFieldErrors(prev => ({
                        ...prev,
                        [`${split.id}-lastName`]: error
                      }))

                    }}
                    className="form-input"
                    title={fieldErrors[`${split.id}-lastName`] || ""}
                    style={getFieldStyle(split.id, "lastName")}
                  />


                </>
              )}

              {/* ===================== */}
              {/* ROLE (solo publishing necesita realmente esto,
          pero lo mantenemos visualmente igual) */}
              {/* ===================== */}

              <select
                value={split.role}
                onChange={(e) =>
                  updateSplit(realIndex, "role", e.target.value)
                }
                className="form-input"
              >
                {type === "MASTER" ? (
                  <>
                    <option value="ARTIST">Artista</option>
                    <option value="PRODUCER">Productor</option>
                    <option value="REMIXER">Remixer</option>
                    <option value="LABEL">Discográfica</option>
                    <option value="INVESTOR">Inversor</option>
                  </>
                ) : (
                  <>
                    <option value="AUTOR_MUSICA">Autor Música</option>
                    <option value="AUTOR_LETRA">Autor Letra</option>
                    <option value="AUTOR_MUSICA_LETRA">Autor Música y Letra</option>
                    <option value="COAUTOR">Coautor</option>
                    <option value="ARREGLISTA">Arreglista</option>
                    <option value="EDITORIAL">Editorial</option>
                    <option value="SUBEDITORIAL">Subeditorial</option>
                  </>
                )}
              </select>

              {/* ===================== */}
              {/* PORCENTAJE */}
              {/* ===================== */}

              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={
                  (type === "MASTER" ? split.percentage : split.share) || ""
                }
                onChange={(e) => {
                  const value = parseFloat(e.target.value)

                  if (isNaN(value)) {
                    autoBalance(type, realIndex, 0)
                    return
                  }

                  autoBalance(type, realIndex, value)
                }}
                onFocus={(e) => e.target.select()}
                className="form-input"
                style={{ width: "90px" }}
              />

              {type === "MASTER" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setExpanded(expanded === split.id ? null : split.id)
                  }
                >
                  {expanded === split.id ? "−" : "DET"}
                </button>
              )}

              {type === "PUBLISHING" && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() =>
                    setExpanded(expanded === split.id ? null : split.id)
                  }
                >
                  {expanded === split.id ? "−" : "PRO"}
                </button>
              )}

              {filtered.length > 1 && (
                <button
                  onClick={() => removeSplit(realIndex)}
                  type="button"
                  className="btn btn-secondary"
                >
                  ✕
                </button>
              )}

              {i === filtered.length - 1 && (
                <button
                  onClick={() => addSplit(type)}
                  type="button"
                  className="btn btn-secondary"
                >
                  +
                </button>
              )}
            </div>

            {type === "MASTER" && expanded === split.id && (
              <div
                style={{
                  marginLeft: "2rem",
                  marginBottom: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.75rem"
                }}
              >

                <input
                  placeholder="Nombre de empresa"
                  value={split.holder.stageName || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      stageName: e.target.value
                    })
                  }
                  className="form-input"
                />

                <select
                  value={split.holder.entityType || "INDIVIDUAL"}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      entityType: e.target.value
                    })
                  }
                  className="form-input"
                >
                  <option value="INDIVIDUAL">Persona física</option>
                  <option value="COMPANY">Empresa</option>
                </select>

                <input
                  placeholder="Tax ID / NIF"
                  value={split.holder.taxId || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      taxId: e.target.value
                    })
                  }
                  className="form-input"
                />

                <select
                  value={split.holder.taxCountry || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      taxCountry: e.target.value
                    })
                  }
                  className="form-input"
                >
                  <option value="">País fiscal</option>

                  {NATIONALITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Email"
                  value={split.holder.email || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      email: e.target.value
                    })
                  }
                  className="form-input"
                />

                <label style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
  <input
    type="checkbox"
    checked={split.holder.isSelf || false}
    onChange={(e)=>
      updateSplit(realIndex,"holder",{
        ...split.holder,
        isSelf:e.target.checked
      })
    }
  />
  Este titular soy yo
</label>

                <input
                  placeholder="Teléfono"
                  value={split.holder.phone || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      phone: e.target.value
                    })
                  }
                  className="form-input"
                />

                <input
                  type="number"
                  placeholder="Revenue share (opcional)"
                  value={
                    Number.isFinite(split.revenueShare)
                      ? Number(split.revenueShare)
                      : ""
                  }
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {

                    const value = parseFloat(e.target.value)

                    if (isNaN(value)) {
                      autoBalanceRevenue(realIndex, 0)
                      return
                    }

                    autoBalanceRevenue(realIndex, value)

                  }}
                  className="form-input"
                />




                <div
                  style={{
                    gridColumn: "1 / -1",
                    fontSize: "0.8rem",
                    opacity: 0.7,
                    marginTop: "0.25rem"
                  }}
                >
                  El <strong>Ownership</strong> define quién es dueño del máster.
                  El <strong>Revenue Share</strong> define cómo se reparten los ingresos.
                  En la mayoría de casos ambos porcentajes son iguales.
                </div>

              </div>
            )}

            {type === "PUBLISHING" && expanded === split.id && (
              <div
                style={{
                  marginLeft: "2rem",
                  marginBottom: "1rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "0.75rem"
                }}
              >

                <input
                  placeholder="IPI / CAE (si ya existe)"
                  value={split.holder.ipiNumber || ""}
                  onChange={(e) => {

                    const value = e.target.value

                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      ipiNumber: value
                    })

                    const error = validateField("ipiNumber", value)

                    setFieldErrors(prev => ({
                      ...prev,
                      [`${split.id}-ipiNumber`]: error
                    }))

                  }}
                  className="form-input"
                  title={fieldErrors[`${split.id}-ipiNumber`] || ""}
                  style={{
                    borderColor: fieldErrors[`${split.id}-ipiNumber`] ? "#ef4444" : undefined
                  }}
                />





                <select
                  value={split.holder.pro || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      pro: e.target.value
                    })
                  }
                  className="form-input"
                >
                  <option value="">PRO (si está afiliado)</option>
                  <option value="SGAE">SGAE</option>
                  <option value="ASCAP">ASCAP</option>
                  <option value="BMI">BMI</option>
                  <option value="PRS">PRS</option>
                  <option value="SACEM">SACEM</option>
                  <option value="GEMA">GEMA</option>
                </select>

                <input
                  placeholder="Email"
                  value={split.holder.email || ""}
                  onChange={(e) => {

                    const value = e.target.value

                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      email: value
                    })

                    const error = validateField("email", value)

                    setFieldErrors(prev => ({
                      ...prev,
                      [`${split.id}-email`]: error
                    }))

                  }}
                  className="form-input"
                  title={fieldErrors[`${split.id}-email`] || ""}
                  style={getFieldStyle(split.id, "email")}
                />

                <label style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
  <input
    type="checkbox"
    checked={split.holder.isSelf || false}
    onChange={(e)=>
      updateSplit(realIndex,"holder",{
        ...split.holder,
        isSelf:e.target.checked
      })
    }
  />
  Este autor soy yo
</label>





                <input
                  placeholder="Editorial (si ya existe)"
                  value={split.publisherName || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "publisherName", e.target.value)
                  }
                  className="form-input"
                />

                <input
                  placeholder="IPI editorial (si ya existe)"
                  value={split.publisherIpi || ""}
                  onChange={(e) =>
                    updateSplit(realIndex, "publisherIpi", e.target.value)
                  }
                  className="form-input"
                />

                <select
                  value={split.holder.nationality || ""}
                  onChange={(e) => {

                    const value = e.target.value

                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      nationality: value
                    })

                    const error = validateField("nationality", value)

                    setFieldErrors(prev => ({
                      ...prev,
                      [`${split.id}-nationality`]: error
                    }))
                  }}
                  className="form-input"
                  title={fieldErrors[`${split.id}-nationality`] || ""}
                  style={getFieldStyle(split.id, "nationality")}
                >
                  <option value="">Nacionalidad *</option>

                  {NATIONALITIES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}

                </select>


                <input
                  placeholder="Teléfono (opcional)"
                  value={split.holder.phone || ""}
                  onChange={(e) => {

                    const value = e.target.value

                    updateSplit(realIndex, "holder", {
                      ...split.holder,
                      phone: value
                    })

                    const error = validateField("phone", value)

                    setFieldErrors(prev => ({
                      ...prev,
                      [`${split.id}-phone`]: error
                    }))

                  }}
                  className="form-input"
                  title={fieldErrors[`${split.id}-phone`] || ""}
                  style={getFieldStyle(split.id, "phone")}
                />

              </div>
            )}



          </div>
        );
      })}

      {type === "PUBLISHING" && (
        <div style={{
          fontSize: "0.8rem",
          opacity: 0.7,
          marginTop: "0.5rem"
        }}>
          El IPI y la PRO solo son necesarios si el autor ya está registrado en una sociedad de gestión.
        </div>
      )}


      {mounted && total === 100 && filtered.length > 0 && (

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem",
            marginTop: "1.5rem"
          }}
        >

          {/* OWNERSHIP / PUBLISHING */}
          <div style={{ height: 250, width: "100%", minWidth: 0 }}>

            <strong style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {type === "MASTER" ? "Ownership" : "Publishing Split"}
            </strong>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey={type === "MASTER" ? "percentage" : "share"}
                  nameKey="displayName"
                  innerRadius={60}
                  outerRadius={90}
                  animationDuration={1000}
                >
                  {chartData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-main-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>

          </div>

          {/* REVENUE SHARE (solo MASTER) */}
          {type === "MASTER" && (

            <div style={{ height: 250, width: "100%", minWidth: 0 }}>

              <strong style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                Revenue Share
              </strong>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={filtered}
                    dataKey="revenueShare"
                    nameKey="holder.legalName"
                    innerRadius={60}
                    outerRadius={90}
                    animationDuration={1000}
                  >
                    {filtered.map((_: any, index: number) => (
                      <Cell
                        key={`cell-revenue-${index}`}
                        fill={REVENUE_COLORS[index % REVENUE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>

            </div>

          )}

        </div>

      )}
    </div>
  );
}