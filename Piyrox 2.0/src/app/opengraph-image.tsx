import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PIYROX — Cheap Digital Subscriptions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #000000 0%, #0a0800 50%, #050400 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Logo area */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.1)",
              border: "2px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", position: "relative", width: 24, height: 24 }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 16, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.8)" }} />
              <div style={{ position: "absolute", left: 8, top: 8, width: 16, height: 16, borderRadius: 3, background: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              background: "linear-gradient(135deg, #ffffff, #a1a1aa)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-1px",
            }}
          >
            PIYROX
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Cheap Netflix, Spotify & Digital Subscriptions
        </p>

        <p
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Instant delivery · Secure payments · Best prices guaranteed
        </p>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
          {["⚡ Instant Delivery", "🔒 Secure", "💰 Best Prices", "🌍 Worldwide"].map((label) => (
            <div
              key={label}
              style={{
                padding: "8px 20px",
                borderRadius: 100,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#ffffff",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <p style={{ position: "absolute", bottom: 32, color: "rgba(255,255,255,0.25)", fontSize: 16 }}>
          piyrox.sbs
        </p>
      </div>
    ),
    { ...size }
  );
}
