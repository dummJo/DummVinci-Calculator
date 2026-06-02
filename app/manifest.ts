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
      { src: "/logo-dv-ptts.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/logo-dv-ptts.png", sizes: "192x192", type: "image/png", purpose: "any" },
    ],
  };
}
