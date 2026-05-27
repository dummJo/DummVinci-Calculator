import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CursorGlow from "@/components/CursorGlow";
import DaVinciAscii from "@/components/DaVinciAscii";
import BottomTabBar from "@/components/nav/BottomTabBar";
import TopBar from "@/components/nav/TopBar";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const monoFont = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DummVinci Tools - Engineering Suite",
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
    <html lang="id" className={`${inter.variable} ${monoFont.variable}`}>
      <body style={{ position: "relative" }}>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{var t=localStorage.getItem("theme")||"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})();`}</Script>

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
