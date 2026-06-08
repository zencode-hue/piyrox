import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090b",
          borderRadius: 40,
          border: "2px solid rgba(255,255,255,0.15)",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#a1a1aa" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="28" fill="url(#g1)" fillOpacity="0.8" />
          <rect x="42" y="42" width="46" height="46" rx="12" fill="url(#g1)" fillOpacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  );
}