import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CursorGlow from "@/components/CursorGlow";
import DaVinciAscii from "@/components/DaVinciAscii";
import BottomTabBar from "@/components/nav/BottomTabBar";
import TopBar from "@/components/nav/TopBar";
import SplashScreen from "@/components/SplashScreen";
import PageTransition from "@/components/PageTransition";
import PullToRefresh from "@/components/PullToRefresh";
import SharedWatermark from "@/components/share/SharedWatermark";
import FeedbackButton from "@/components/FeedbackButton";
import { PLAUSIBLE_DOMAIN, PLAUSIBLE_SRC } from "@/lib/analytics";

import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });
const monoFont = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

const APP_NAME = "PTTS Praxis";
const APP_TAGLINE = "Where engineering knowledge becomes spec · by DummVinci";
const APP_DESC =
  "Dashboard kalkulasi presales engineer: cable sizing, VSD + airflow (ACQ580 / ACS880), MCCB/MCB Siemens, busbar, braking resistor STAHL, panel XLTC / Rittal.";

// Canonical host the app lives on. Drives metadataBase so OG/Twitter image and
// canonical URLs always point at the live domain. Matches next.config.ts.
const CANONICAL_HOST = process.env.NEXT_PUBLIC_CANONICAL_HOST ?? "ptts-praxis.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(`https://${CANONICAL_HOST}`),
  applicationName: APP_NAME,
  title: { default: `${APP_NAME} — ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description: APP_DESC,
  keywords: [
    "cable sizing calculator", "VSD sizing ACQ580 ACS880", "MCCB Siemens 3VA",
    "braking resistor STAHL", "panel Rittal XLTC", "presales engineer", "ABB drive",
    "Supreme Jembo cable", "busbar sizing", "kalkulator kabel Indonesia",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESC,
  },
};

// Organization + WebSite structured data, rendered into the static HTML of
// every page. Company facts match ptts.co.id.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://ptts.co.id/#org",
      name: "PT Prima Tekindo Tirta Sejahtera",
      url: "https://ptts.co.id",
      logo: `https://${CANONICAL_HOST}/logo-dv-ptts.png`,
      telephone: "+62-21-629-3028",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Jl. Pangeran Jayakarta Ruko 141 Blok A1 No.11",
        addressLocality: "Jakarta Pusat",
        postalCode: "10730",
        addressCountry: "ID",
      },
    },
    {
      "@type": "WebSite",
      name: APP_NAME,
      url: `https://${CANONICAL_HOST}`,
      publisher: { "@id": "https://ptts.co.id/#org" },
    },
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F5E6DF" },
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning className={`${inter.variable} ${monoFont.variable}`}>
      <head>
        {/* Pre-paint background so the first frame on iOS Safari already matches the theme,
           avoiding the flash before JS resolves localStorage. */}
        <style>{`
          html { background-color: #F5E6DF; }
          @media (prefers-color-scheme: dark) {
            html { background-color: #141413; }
          }
          html[data-theme="light"] { background-color: #F5E6DF; }
          html[data-theme="dark"] { background-color: #141413; }
        `}</style>
      </head>
      <body style={{ position: "relative" }}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- static, escaped JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(function(){try{
  var saved=localStorage.getItem("theme");
  var t=saved||(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  document.documentElement.setAttribute("data-theme",t);
  // Only override the static prefers-color-scheme meta tags when user explicitly chose a theme
  // that differs from the OS preference (otherwise the static tags already match)
  if(saved){
    var metas=document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach(function(m){m.parentNode.removeChild(m);});
    var m=document.createElement("meta");
    m.name="theme-color";
    m.content=t==="dark"?"#141413":"#F5E6DF";
    document.head.appendChild(m);
  }
  document.documentElement.classList.add("no-theme-transition");
  requestAnimationFrame(function(){requestAnimationFrame(function(){
    document.documentElement.classList.remove("no-theme-transition");
  });});
}catch(e){}})();`}</Script>
        {/* Register service worker for offline / PWA caching. */}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function(){});
          }
        `}</Script>
        <SplashScreen />
        <PageTransition />
        <PullToRefresh />

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
        <FeedbackButton />
        <SharedWatermark />
        <SpeedInsights />
        {/* Plausible — privacy-first analytics, only mounts when the domain env is set. */}
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src={PLAUSIBLE_SRC}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
