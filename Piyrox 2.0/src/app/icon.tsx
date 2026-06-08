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
          background: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
          borderRadius: 6,
        }}
      >
        <div style={{ position: "relative", width: 20, height: 20 }}>
          {/* Left bracket */}
          <path d="M2 6 L2 14 L4 14 L4 8 L12 8 L12 6 Z" fill="url(#codeGradient)" />
          
          {/* Right bracket */}
          <path d="M18 6 L18 14 L16 14 L16 8 L8 8 L8 6 Z" fill="url(#codeGradient)" />
          
          {/* Central code slash */}
          <path d="M9 4 L11 16 L10 16 L8 4 Z" fill="url(#codeGradient)" />
          
          {/* Binary dots */}
          <circle cx="4" cy="4" r="1" fill="#00ff88" />
          <circle cx="8" cy="4" r="1" fill="#00ccff" />
          <circle cx="16" cy="4" r="1" fill="#00ccff" />
          <circle cx="20" cy="4" r="1" fill="#8844ff" />
          
          <circle cx="4" cy="16" r="1" fill="#8844ff" />
          <circle cx="8" cy="16" r="1" fill="#00ccff" />
          <circle cx="16" cy="16" r="1" fill="#00ccff" />
          <circle cx="20" cy="16" r="1" fill="#00ff88" />
          
          <defs>
            <linearGradient id="codeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ff88" />
              <stop offset="50%" stopColor="#00ccff" />
              <stop offset="100%" stopColor="#8844ff" />
            </linearGradient>
          </defs>
        </div>
      </div>
    ),
    { ...size }
  );
}