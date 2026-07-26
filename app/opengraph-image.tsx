import { ImageResponse } from "next/og";

export const alt =
  "PlatoRest — Menú digital con QR y sistema gastronómico para restaurantes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#ff6b00",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.05 }}>
          PlatoRest
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 44,
            fontWeight: 500,
            lineHeight: 1.25,
            color: "rgba(255,255,255,0.92)",
            maxWidth: 900,
          }}
        >
          Menú digital con QR y sistema gastronómico todo-en-uno para
          restaurantes
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 30,
            fontWeight: 600,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Buenos Aires · Argentina
        </div>
      </div>
    ),
    size
  );
}
