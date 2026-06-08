import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #09090b, #000000)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div style={{ position: "relative", width: 18, height: 18 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 12, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.8)" }} />
          <div style={{ position: "absolute", left: 6, top: 6, width: 12, height: 12, borderRadius: 2, background: "rgba(255,255,255,0.6)" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}