"use client";

import Link from "next/link";
import { Grid3x3, Boxes, Worm, Bomb, Spade } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Game catalog ───────────────────────────────────────────────────────────
// The break-room hub. Live games link out to their own immersive route; the
// rest are scaffolded as "coming soon" so the roster is visible while we build
// them one by one (Tetris, Snake, Minesweeper, …).

interface GameEntry {
  key: string;
  title: string;
  tagline: string;
  Icon: LucideIcon;
  href?: string;       // present ⇒ playable
  accent: string;      // glyph tint
}

const GAMES: GameEntry[] = [
  {
    key: "2048",
    title: "Praxis²⁰⁴⁸",
    tagline: "Merge ideas until mastery emerges",
    Icon: Grid3x3,
    href: "/game/2048",
    accent: "var(--accent)",
  },
  {
    key: "tetris",
    title: "Ordo Structurae",
    tagline: "Order from falling chaos — piece by piece",
    Icon: Boxes,
    href: "/game/tetris",
    accent: "#4a90d9",
  },
  {
    key: "snake",
    title: "Via Serpentis",
    tagline: "The path grows with every decision taken",
    Icon: Worm,
    href: "/game/snake",
    accent: "#3fae6e",
  },
  {
    key: "minesweeper",
    title: "Campus Periculōrum",
    tagline: "Navigate the unseen — logic over luck",
    Icon: Bomb,
    href: "/game/minesweeper",
    accent: "#d9534f",
  },
  {
    key: "solitaire",
    title: "Solitūdō Aurea",
    tagline: "Patience builds the golden sequence",
    Icon: Spade,
    href: "/game/solitaire",
    accent: "#6b5b95",
  },
];

export default function GameHubPage() {
  return (
    <>
      <style>{`
        .hub {
          min-height: 100vh;
          max-width: 560px;
          margin: 0 auto;
          padding: 32px 18px 48px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        .hub-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 6px;
        }
        .hub-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--fg);
          line-height: 1.05;
          margin-bottom: 8px;
        }
        .hub-sub {
          font-size: 0.9rem;
          color: var(--fg);
          opacity: 0.6;
          line-height: 1.55;
          margin-bottom: 28px;
          max-width: 44ch;
        }
        .hub-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 420px) {
          .hub-grid { grid-template-columns: 1fr; }
          .hub-title { font-size: 2rem; }
        }
        .game-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px 18px;
          border-radius: 20px;
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          text-decoration: none;
          color: var(--fg);
          overflow: hidden;
          transition: transform 0.18s cubic-bezier(0.2,0.8,0.2,1), border-color 0.18s ease, background 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .game-card.playable:hover {
          transform: translateY(-3px);
          border-color: rgba(var(--accent-rgb), 0.45);
          background: rgba(var(--accent-rgb), 0.09);
        }
        .game-card.playable:active { transform: translateY(-1px) scale(0.99); }
        .game-card.locked { opacity: 0.55; cursor: default; }
        .gc-icon {
          width: 46px; height: 46px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(var(--accent-rgb), 0.10);
        }
        .gc-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .gc-tagline {
          font-size: 0.78rem;
          opacity: 0.62;
          line-height: 1.45;
        }
        .gc-badge {
          position: absolute;
          top: 14px; right: 14px;
          font-size: 8px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          font-weight: 700;
          padding: 4px 9px;
          border-radius: 999px;
        }
        .gc-badge.play {
          background: var(--accent);
          color: #fff;
        }
        .gc-badge.soon {
          background: rgba(var(--accent-rgb), 0.10);
          color: var(--fg);
          opacity: 0.7;
          border: 1px solid var(--glass-border);
        }
        .hub-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.4;
          color: var(--fg);
        }
        @media (prefers-reduced-motion: reduce) {
          .game-card { transition: none !important; }
        }
      `}</style>

      <main className="hub">
        <div className="hub-eyebrow">◈ Ludus Praxis</div>
        <h1 className="hub-title">Otium Inter Opera</h1>
        <p className="hub-sub">
          Rest sharpens the mind between specs. Each game is a praxis of logic, patience, and flow.
        </p>

        <div className="hub-grid">
          {GAMES.map(g => {
            const Icon = g.Icon;
            const playable = Boolean(g.href);
            const inner = (
              <>
                <span className={`gc-badge ${playable ? "play" : "soon"}`}>
                  {playable ? "Play" : "Soon"}
                </span>
                <div className="gc-icon">
                  <Icon size={24} strokeWidth={2} style={{ color: g.accent }} />
                </div>
                <div>
                  <div className="gc-title">{g.title}</div>
                  <div className="gc-tagline">{g.tagline}</div>
                </div>
              </>
            );
            return playable ? (
              <Link key={g.key} href={g.href!} className="game-card playable">
                {inner}
              </Link>
            ) : (
              <div key={g.key} className="game-card locked" aria-disabled="true">
                {inner}
              </div>
            );
          })}
        </div>

        <div className="hub-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
