"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import { ALL_COUNTRIES } from "@/lib/territories";

interface Props {
  selectedTerritories: string[];
  toggleTerritory: (id: string) => void;
  worldwide?: boolean;
}

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function InteractiveWorldMap({
  selectedTerritories,
  toggleTerritory,
  worldwide,
}: Props) {
  return (
    <div
      style={{
        marginTop: "2.5rem",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          background: "#0f0f14",
          borderRadius: "28px",
          padding: "2rem",
        }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 170 }}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }: any) =>
              geographies
                .filter((geo: any) => String(geo.id).padStart(3, "0") !== "010")
                .map((geo: any) => {
                  const id = String(geo.id).padStart(3, "0");

                  // Solo mostramos como interactivos los países que están en nuestra lista ALL_COUNTRIES
                  const isSupported = ALL_COUNTRIES.includes(id);

                  const isActive =
                    worldwide || selectedTerritories.includes(id);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (isSupported) toggleTerritory(id);
                      }}
                      style={{
                        default: {
                          fill: isActive && isSupported ? "#8b5cf6" : "#2e2e38",
                          stroke: "#1b1b22",
                          strokeWidth: 0.5,
                          outline: "none",
                          transition: "fill 0.3s ease",
                        },
                        hover: {
                          fill: isActive && isSupported ? "#a78bfa" : "#3a3a45",
                          outline: "none",
                          cursor: isSupported ? "pointer" : "default",
                        },
                        pressed: {
                          fill: isSupported ? "#7c3aed" : "#2e2e38",
                          outline: "none",
                        },
                      }}
                    />
                  );
                })
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}