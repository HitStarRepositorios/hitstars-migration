"use client";

import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  name?: string;
  value: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  name,
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState(value);

  // Sincronizar el valor interno si cambia la prop
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const selectedOption = options.find((o) => o.value === internalValue);
  const filtered = options.filter(
    (o) =>
      o.label.toLowerCase().includes(search.toLowerCase()) ||
      o.value.toLowerCase().includes(search.toLowerCase())
  );

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function click(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", click);
    return () => document.removeEventListener("mousedown", click);
  }, []);

  return (
    <div className="relative" ref={ref} style={{ position: "relative" }}>
      {name && <input type="hidden" name={name} value={internalValue} />}

      <div
        className="form-input"
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setSearch("");
          }
        }}
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ opacity: 0.5, fontSize: "0.8rem" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "#1b1b22",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            marginTop: "4px",
            padding: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          }}
        >
          <input
            type="text"
            autoFocus
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{
              marginBottom: "8px",
              padding: "6px 10px",
              minHeight: "36px",
              width: "100%",
            }}
          />
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: "8px", opacity: 0.5, fontSize: "0.9rem" }}>
                No se encontraron opciones.
              </div>
            ) : null}
            {filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  setInternalValue(opt.value);
                  setOpen(false);
                  if (onChange) onChange(opt.value);
                }}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background:
                    internalValue === opt.value
                      ? "rgba(139,92,246,0.2)"
                      : "transparent",
                  color: internalValue === opt.value ? "#c4b5fd" : "inherit",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (internalValue !== opt.value)
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (internalValue !== opt.value)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
