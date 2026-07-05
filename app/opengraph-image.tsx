// app/opengraph-image.tsx — site-wide 1200×630 OG image, applied to every
// route by file convention. Text-only on purpose: ImageResponse ships a
// bundled default font, so no font/logo assets need loading at build time.
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "PTTS Praxis — engineering calculators by PT Prima Tekindo Tirta Sejahtera";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#141413",
          color: "#F5E6DF",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            opacity: 0.65,
            marginBottom: 28,
          }}
        >
          PT PRIMA TEKINDO TIRTA SEJAHTERA
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
          PTTS Praxis
        </div>
        <div style={{ fontSize: 38, marginTop: 24, opacity: 0.85 }}>
          Where engineering knowledge becomes spec
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            opacity: 0.6,
            letterSpacing: 2,
          }}
        >
          CABLE · VSD · BREAKER · BUSBAR · PANEL · POWER QUALITY
        </div>
      </div>
    ),
    size,
  );
}
