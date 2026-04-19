import type { Metadata } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono, Outfit, Bricolage_Grotesque } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CursorGlow from "@/components/CursorGlow";
import DaVinciAscii from "@/components/DaVinciAscii";
import BottomTabBar from "@/components/nav/BottomTabBar";
import TopBar from "@/components/nav/TopBar";
import DynamicIconManager from "@/components/DynamicIconManager";
import "./globals.css";

const displayFont = Instrument_Serif({ variable: "--font-display", subsets: ["latin"], weight: "400" });
const headingFont = Bricolage_Grotesque({ variable: "--font-heading", subsets: ["latin"] });
const sansFont = Outfit({ variable: "--font-sans", subsets: ["latin"] });
const bodyFont = Inter({ variable: "--font-body", subsets: ["latin"] });
const monoFont = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DummVinci Calculator - Engineering Tools",
  description:
    "Dashboard kalkulasi presales engineer: cable sizing, VSD + airflow (ACQ580 / ACS880), MCCB/MCB Siemens, busbar, braking resistor STAHL, panel XLTC / Rittal.",
  keywords: [
    "cable sizing calculator", "VSD sizing ACQ580 ACS880", "MCCB Siemens 3VA",
    "braking resistor STAHL", "panel Rittal XLTC", "presales engineer", "ABB drive",
    "Supreme Jembo cable", "busbar sizing", "kalkulator kabel Indonesia",
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${displayFont.variable} ${headingFont.variable} ${sansFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`,
          }}
        />
      </head>
      <body style={{ position: "relative" }}>
        <DynamicIconManager />
        <CursorGlow />
        <DaVinciAscii />
        <TopBar />
        <div id="app-root" style={{ 
          paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))", 
          minHeight: "100vh" 
        }}>
          {children}
        </div>
        <BottomTabBar />
        <SpeedInsights />
      </body>
    </html>
  );
}
