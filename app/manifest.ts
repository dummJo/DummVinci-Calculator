import type { MetadataRoute } from "next";

// PWA install manifest. Name reflects the product brand (PTTS Praxis); the
// DummVinci trademark stays in the UI attribution lines, not the install name.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PTTS Praxis — Engineering Suite",
    short_name: "PTTS Praxis",
    description:
      "Presales engineering suite: cable, VSD, breaker, busbar, braking resistor, panel sizing. by DummVinci.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5E6DF",
    theme_color: "#F5E6DF",
    icons: [
      // Declare the file's REAL dimensions (1000×1000, verified) — the previous
      // 512/192 entries lied about size, which degrades install-icon scaling on
      // both platforms. One truthful ≥512px entry satisfies install criteria.
      { src: "/logo-dv-ptts.png", sizes: "1000x1000", type: "image/png", purpose: "any" },
    ],
  };
}
