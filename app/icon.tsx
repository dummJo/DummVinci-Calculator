import { ImageResponse } from "next/og";
import fs from "fs";

export const size = { width: 32, height: 32 };
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
          borderRadius: "8px",
          border: "1.5px solid rgba(255, 102, 0, 0.55)",
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
