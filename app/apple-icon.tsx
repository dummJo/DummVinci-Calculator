import { ImageResponse } from "next/og";
import fs from "fs";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function Icon() {
  const imageBuffer = fs.readFileSync("./public/logo-dv-ptts.png");
  const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          border: "6px solid rgba(217, 119, 87, 0.55)",
          overflow: "hidden",
          background: "#0c0c0c",
        }}
      >
        <img
          src={base64Image}
          alt="DV"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
