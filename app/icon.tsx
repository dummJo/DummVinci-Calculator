import { ImageResponse } from "next/og";
import fs from "fs";
import path from "path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const basePath = path.normalize(path.join(process.cwd(), "public"));
  const imagePath = path.normalize(path.join(basePath, "logo-dv-ptts.png"));
  if (!imagePath.startsWith(basePath)) {
    throw new Error("Invalid path specified!");
  }
  const imageBuffer = fs.readFileSync(imagePath);
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
          border: "1.5px solid rgba(226, 117, 77, 0.55)",
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
