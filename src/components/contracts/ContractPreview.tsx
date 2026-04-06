"use client";

export default function ContractPreview({ url }: { url: string }) {
  return (
    <div
      style={{
        background: "#0e0e0f",
        padding: "40px 0",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          height: "85vh",
          background: "#1a1a1b",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "#1a1a1b",
          }}
        />
      </div>
    </div>
  );
}