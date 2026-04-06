"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { SpecialZoomLevel } from "@react-pdf-viewer/core";

const defaultLayoutPluginInstance = defaultLayoutPlugin();


export default function ContractViewer({ url }: { url: string }) {
  const layoutPlugin = defaultLayoutPlugin();

  return (
    <div
      style={{
        height: "80vh",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#0b0b0b",
      }}
    >
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <Viewer
  fileUrl={url}
  defaultScale={SpecialZoomLevel.PageFit}
  plugins={[defaultLayoutPluginInstance]}
/>
      </Worker>
    </div>
  );
}