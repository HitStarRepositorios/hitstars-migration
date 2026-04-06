"use client";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

interface Props {
  selectedTerritories: string[];
  toggleTerritory: (id: string) => void;
  worldwide?: boolean;
}

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

/**
 * ISO NUMÉRICOS COMPLETOS AGRUPADOS POR CONTINENTE
 * (basados en ISO 3166-1 numeric)
 */
// Quita 643 de EUROPE
// Y crea región independiente si quieres:

const RUSSIA = ["643"];

const EUROPE = [
  "008","020","040","056","070","100","112","191","196","203","208","233",
  "246","250","276","300","348","352","372","380","428","440","442","470",
  "498","499","528","578","616","620","642","688","703","705","724",
  "752","756","804","826"
];

const AFRICA = [
  "012","024","072","108","120","132","140","148","174","178","180","204",
  "226","231","232","262","266","270","288","324","384","404","426","430",
  "434","450","454","466","478","480","504","508","516","562","566","624",
  "646","678","686","690","694","706","710","716","728","729","732","748",
  "768","788","800","818","834","854","894"
];

const ASIA = [
  "004","031","048","050","051","064","096","104","116","144","156","196",
  "268","356","360","364","368","376","392","398","400","408","410","414",
  "417","418","422","458","462","496","498","512","524","586","608","634",
  "682","702","704","706","760","762","764","784","795","860","887","158", // Taiwan
"608", // Philippines
"360", // Indonesia
"598", // Papua New Guinea
"096", // Brunei
"702", // Singapore
];

const NORTH_AMERICA = [
  "124","840","304" // Canada, USA, Greenland
];

const LATAM = [
  "032","068","076","084","152","170","188","192","214","218","222","320",
  "328","332","340","388","484","558","591","600","604","630","662","670",
  "740","858","862"
];

const OCEANIA = [
  "036","090","242","296","316","520","540","548","554","598","776","798","882"
];

const regionById: Record<string, string> = {};

// Construimos el mapa automáticamente
EUROPE.forEach(id => regionById[id] = "EUROPE");
AFRICA.forEach(id => regionById[id] = "AFRICA");
ASIA.forEach(id => regionById[id] = "ASIA");
NORTH_AMERICA.forEach(id => regionById[id] = "NORTH_AMERICA");
LATAM.forEach(id => regionById[id] = "LATAM");
OCEANIA.forEach(id => regionById[id] = "OCEANIA");
RUSSIA.forEach(id => regionById[id] = "RUSSIA");

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
                const region = regionById[id];

                const isActive =
                  worldwide ||
                  (region &&
                    selectedTerritories.includes(region));

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (region) toggleTerritory(region);
                    }}
                    style={{
                      default: {
                        fill: isActive ? "#8b5cf6" : "#2e2e38",
                        stroke: "#1b1b22",
                        strokeWidth: 0.5,
                        outline: "none",
                        transition: "fill 0.3s ease",
                      },
                      hover: {
                        fill: isActive ? "#a78bfa" : "#3a3a45",
                        outline: "none",
                        cursor: region ? "pointer" : "default",
                      },
                      pressed: {
                        fill: "#7c3aed",
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