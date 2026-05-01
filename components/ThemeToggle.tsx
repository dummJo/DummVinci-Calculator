"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { flushSync } from "react-dom";
import { Sun, Moon } from "lucide-react";

type VT = { ready: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => VT };

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);
  const [burst, setBurst] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    document.documentElement.setAttribute("data-theme", initial);
    const timeoutId = setTimeout(() => {
      setTheme(initial);
      setMounted(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    const btn = btnRef.current;
    if (!btn || !mounted) return;

    // Gold burst pulse on button
    setBurst(true);
    setTimeout(() => setBurst(false), 420);

    const { top, left, width, height } = btn.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top  + height / 2;
    const endRadius = Math.hypot(
      Math.max(left, window.innerWidth  - left),
      Math.max(top,  window.innerHeight - top)
    );
    const DUR = 580;

    // ── Gold compass ring: traces the circle perimeter as it expands ──
    const ring = document.createElement("div");
    Object.assign(ring.style, {
      position:     "fixed",
      borderRadius: "50%",
      border:       "1.5px solid rgba(201,168,76,0.75)",
      boxShadow:    "0 0 10px rgba(201,168,76,0.45), inset 0 0 6px rgba(201,168,76,0.2)",
      zIndex:       "9999",
      pointerEvents:"none",
      width:        `${width}px`,
      height:       `${width}px`,
      left:         `${cx - width / 2}px`,
      top:          `${cy - width / 2}px`,
      opacity:      "0.85",
      willChange:   "transform, opacity",
    });
    document.body.appendChild(ring);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.transition = `transform ${DUR}ms cubic-bezier(0.22,1,0.36,1), opacity ${DUR * 0.7}ms ease-in ${DUR * 0.2}ms`;
      ring.style.transform  = `scale(${(endRadius * 2) / width})`;
      ring.style.opacity    = "0";
    }));
    setTimeout(() => ring.remove(), DUR + 50);

    const applyTheme = () => {
      flushSync(() => {
        setTheme(next);
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("theme", next);
      });
    };

    const startVT = (document as DocWithVT).startViewTransition?.bind(document);
    if (!startVT) { applyTheme(); return; }

    const transition = startVT(applyTheme);

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${cx}px ${cy}px)`,
            `circle(${endRadius}px at ${cx}px ${cy}px)`,
          ],
        },
        {
          duration: DUR,
          easing:   "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }, [theme, mounted]);

  if (!mounted) return <div style={{ width: 32, height: 32 }} />;

  return (
    <>
      <style>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          mix-blend-mode: normal;
          animation: none;
        }
        @keyframes btnBurst {
          0%   { transform: scale(1);    box-shadow: 0 0 0 0    rgba(201,168,76,0.5); }
          40%  { transform: scale(1.38); box-shadow: 0 0 0 14px rgba(201,168,76,0);   }
          100% { transform: scale(1);    box-shadow: none; }
        }
        .theme-btn-burst {
          animation: btnBurst 0.40s cubic-bezier(0.22,1,0.36,1) forwards;
        }
      `}</style>
      <button
        ref={btnRef}
        onClick={toggle}
        className={burst ? "theme-btn-burst" : ""}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        style={{
          background:     "none",
          border:         "1px solid var(--border)",
          borderRadius:   "50%",
          width:          32,
          height:         32,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          cursor:         "pointer",
          color:          "var(--accent)",
          transition:     "border-color 0.2s, color 0.2s, box-shadow 0.2s",
          flexShrink:     0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--accent)";
          e.currentTarget.style.boxShadow   = "0 0 10px rgba(201,168,76,0.35)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.boxShadow   = "none";
        }}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </button>
    </>
  );
}
