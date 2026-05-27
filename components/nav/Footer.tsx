"use client";
import { useEffect, useState } from "react";

import { getRandomQuote, type Quote } from "@/lib/quotes";
import { useLang } from "@/lib/i18n";

interface IpApiData {
  ip: string;
  city?: string;
  country: string;
  country_name: string;
  org?: string;
  error?: boolean;
}

const formatTime = () =>
  new Date().toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" });

function TerminalWidget() {
  const { t } = useLang();
  const [data, setData] = useState<IpApiData | null>(null);
  const [time, setTime] = useState<string>(formatTime);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Clock
    const timer = setInterval(() => {
      setTime(formatTime());
    }, 1000);

    // Same-origin geolocated IP Fetch (bypasses adblockers)
    fetch("/api/ip", { cache: "no-store" })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error("IP geolocator error:", e);
        setLoading(false);
      });

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      marginTop: 40,
      fontFamily: "var(--font-mono), monospace",
      fontSize: 11,
      color: "var(--muted)",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      opacity: 0.65,
    }}>
      {data ? (
        <>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
            <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.common.yourIp}</span>
            <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 15, letterSpacing: "0.05em" }}>{data.ip}</span>
            <span style={{ fontWeight: 700, color: "var(--fg-soft)" }}>{data.country}</span>
          </div>
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            flexWrap: "wrap",
            gap: 6,
            letterSpacing: "0.02em"
          }}>
            <span>{data.city ? `${data.city}, ${data.country_name}` : data.country_name}</span>
            <span>·</span>
            {data.org && (
              <>
                <span>{data.org}</span>
                <span>·</span>
              </>
            )}
            <span>⏱ {time}</span>
          </div>
        </>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.common.yourIp}</span>
          <span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 13, letterSpacing: "0.05em" }}>
            {loading ? "LOAD..." : "OFFLINE / BLOCKED"}
          </span>
          <span>·</span>
          <span>⏱ {time}</span>
        </div>
      )}
    </div>
  );
}

export default function Footer() {
  const { t } = useLang();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [views, setViews] = useState<number>(0);

  useEffect(() => {
    const q = getRandomQuote();
    const timeoutId = setTimeout(() => setQuote(q), 0);

    // Universal page views tracking via CounterAPI
    if (typeof window !== "undefined") {
      const sessionKey = "dummvinci_session_seen";
      const hasSeen = sessionStorage.getItem(sessionKey);
      
      const endpoint = hasSeen ? "/api/views" : "/api/views?inc=true";
      sessionStorage.setItem(sessionKey, "true");
      
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          if (data && typeof data.count === "number") {
            setViews(data.count);
          }
        })
        .catch(err => {
          console.error("Failed to fetch views:", err);
        });
    }

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <footer style={{
      marginTop: 64,
      textAlign: "center",
      paddingBottom: 40,
      opacity: quote ? 1 : 0,
      transition: "opacity 1s ease",
    }}>
      <div style={{ 
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "var(--accent)", 
        opacity: 0.5,
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: 12
      }}>
        {t.common.managedBy}
      </div>
      
      <div style={{
        maxWidth: 400,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 2
      }}>
        <div style={{
          fontFamily: "var(--font-body)",
          fontSize: 11,
          fontStyle: "italic",
          color: "var(--fg-soft)",
          lineHeight: 1.5
        }}>
          &ldquo;{quote?.text}&rdquo;
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "var(--muted-soft)",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          — {quote?.author}
        </div>
      </div>

      {/* PTTS Credit */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, marginTop: 16, opacity: 0.45
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%", overflow: "hidden",
          background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.ptts.co.id/uploads/1/3/3/7/133745061/logo-web_orig.png"
            alt="PTTS"
            style={{ width: "90%", height: "90%", objectFit: "contain" }}
          />
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 8,
          color: "var(--muted-soft)", letterSpacing: "0.06em",
          textTransform: "uppercase"
        }}>
          {t.common.supportedBy}
        </span>
      </div>

      <TerminalWidget />

      {/* Page view counter */}
      <div style={{
        marginTop: 24,
        fontFamily: "var(--font-mono), monospace",
        fontSize: 10,
        color: "var(--muted-soft)",
        opacity: 0.4,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}>
        {t.common.views}: {views}
      </div>
    </footer>
  );
}
