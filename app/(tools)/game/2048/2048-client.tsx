"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Grid = (number | null)[][];
type Dir = "up" | "down" | "left" | "right";

interface State {
  grid: Grid;
  score: number;
  best: number;
  over: boolean;
  won: boolean;
  continueAfterWin: boolean;
}

// ─── Core game logic ──────────────────────────────────────────────────────────

function empty(): Grid {
  return Array.from({ length: 4 }, () => Array(4).fill(null));
}

function addTile(grid: Grid): Grid {
  const free: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!grid[r][c]) free.push([r, c]);
  if (!free.length) return grid;
  const [r, c] = free[Math.floor(Math.random() * free.length)];
  const next = grid.map(row => [...row]);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slideRow(row: (number | null)[]): { row: (number | null)[]; gain: number } {
  const vals = row.filter(Boolean) as number[];
  let gain = 0;
  const merged: number[] = [];
  let i = 0;
  while (i < vals.length) {
    if (i + 1 < vals.length && vals[i] === vals[i + 1]) {
      merged.push(vals[i] * 2);
      gain += vals[i] * 2;
      i += 2;
    } else {
      merged.push(vals[i]);
      i++;
    }
  }
  while (merged.length < 4) merged.push(0);
  return { row: merged.map(v => v || null), gain };
}

function moveGrid(grid: Grid, dir: Dir): { grid: Grid; gain: number } {
  let g = grid.map(r => [...r]);
  let totalGain = 0;

  // Rotate so we always slide "left", then rotate back
  const rotations: Record<Dir, number> = { left: 0, down: 1, right: 2, up: 3 };
  const spins = rotations[dir];

  function rot90(g: Grid): Grid {
    return g[0].map((_, i) => g.map(r => r[i]).reverse());
  }
  for (let i = 0; i < spins; i++) g = rot90(g);

  const slid = g.map(row => {
    const { row: r, gain } = slideRow(row);
    totalGain += gain;
    return r;
  });

  // Rotate back
  function rotBack(g: Grid): Grid {
    return g[0].map((_, i) => g.map(r => r[4 - 1 - i]));
  }
  let result = slid;
  for (let i = 0; i < spins; i++) result = rotBack(result);

  return { grid: result, gain: totalGain };
}

function gridsEqual(a: Grid, b: Grid) {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (a[r][c] !== b[r][c]) return false;
  return true;
}

function isGameOver(grid: Grid): boolean {
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++) {
      if (!grid[r][c]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
    }
  return true;
}

function hasWon(grid: Grid): boolean {
  return grid.some(row => row.some(v => v === 2048));
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "MOVE"; dir: Dir }
  | { type: "NEW_GAME" }
  | { type: "CONTINUE" }
  | { type: "SET_BEST"; best: number };

function init(): State {
  const g = addTile(addTile(empty()));
  return { grid: g, score: 0, best: 0, over: false, won: false, continueAfterWin: false };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_GAME": {
      const g = addTile(addTile(empty()));
      return { ...state, grid: g, score: 0, over: false, won: false, continueAfterWin: false };
    }
    case "SET_BEST":
      return { ...state, best: action.best };
    case "CONTINUE":
      return { ...state, won: false, continueAfterWin: true };
    case "MOVE": {
      if (state.over || (state.won && !state.continueAfterWin)) return state;
      const { grid: moved, gain } = moveGrid(state.grid, action.dir);
      if (gridsEqual(moved, state.grid)) return state;
      const newGrid = addTile(moved);
      const newScore = state.score + gain;
      const newBest = Math.max(state.best, newScore);
      const won = !state.continueAfterWin && hasWon(newGrid);
      const over = !won && isGameOver(newGrid);
      return { ...state, grid: newGrid, score: newScore, best: newBest, over, won };
    }
  }
}

// ─── Tile colours ─────────────────────────────────────────────────────────────

const TILE_STYLE: Record<number, { bg: string; fg: string; size: string }> = {
  2:    { bg: "rgba(var(--accent-rgb),0.10)", fg: "var(--fg)", size: "1.8rem" },
  4:    { bg: "rgba(var(--accent-rgb),0.18)", fg: "var(--fg)", size: "1.8rem" },
  8:    { bg: "rgba(var(--accent-rgb),0.35)", fg: "#fff",      size: "1.8rem" },
  16:   { bg: "rgba(var(--accent-rgb),0.50)", fg: "#fff",      size: "1.6rem" },
  32:   { bg: "rgba(var(--accent-rgb),0.65)", fg: "#fff",      size: "1.6rem" },
  64:   { bg: "rgba(var(--accent-rgb),0.80)", fg: "#fff",      size: "1.5rem" },
  128:  { bg: "var(--accent)",                fg: "#fff",      size: "1.4rem" },
  256:  { bg: "#e8a020",                      fg: "#fff",      size: "1.4rem" },
  512:  { bg: "#d4821a",                      fg: "#fff",      size: "1.3rem" },
  1024: { bg: "#c06010",                      fg: "#fff",      size: "1.1rem" },
  2048: { bg: "#a04000",                      fg: "#fff",      size: "1.0rem" },
};

function tileStyle(val: number) {
  return TILE_STYLE[val] ?? { bg: "#6b3000", fg: "#fff", size: "0.85rem" };
}

// ─── Component ────────────────────────────────────────────────────────────────

const BEST_KEY = "ptts_2048_best";

export default function Game2048Page() {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [immersive, setImmersive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // Load persisted best
  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved) dispatch({ type: "SET_BEST", best: parseInt(saved, 10) });
  }, []);

  // Persist best score
  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(state.best));
  }, [state.best]);

  // Keyboard
  useEffect(() => {
    const keyMap: Record<string, Dir> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const dir = keyMap[e.key];
      if (!dir) return;
      e.preventDefault();
      dispatch({ type: "MOVE", dir });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Immersive / fullscreen ──────────────────────────────────────────────
  // Two layers of "fullscreen":
  //   1. The CSS immersive overlay (position:fixed, top z-index) — always works,
  //      including iOS Safari where the Fullscreen API is unavailable on
  //      arbitrary elements. This is what hides the TopBar / tab bar / feedback.
  //   2. The native Fullscreen API — best-effort, additionally hides the browser
  //      chrome (address bar) on Android/desktop. Failure is non-fatal.
  const enterImmersive = useCallback(() => {
    setImmersive(true);
    const el = shellRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => { /* CSS overlay still applies */ });
    }
  }, []);

  const exitImmersive = useCallback(() => {
    setImmersive(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleImmersive = useCallback(() => {
    if (immersive) exitImmersive();
    else enterImmersive();
  }, [immersive, enterImmersive, exitImmersive]);

  // Sync state when the user leaves native fullscreen via Esc / system gesture.
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Esc also exits the CSS-only immersive mode (when native FS never engaged).
  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) exitImmersive();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive, exitImmersive]);

  // Touch/swipe
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // too small
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch({ type: "MOVE", dir: dx > 0 ? "right" : "left" });
    } else {
      dispatch({ type: "MOVE", dir: dy > 0 ? "down" : "up" });
    }
  }, []);

  return (
    <>
      <style>{`
        .game-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        /* Immersive: cover ALL web chrome (watermark z150, feedback z142,
           modal z200, nav z100) with an opaque, theme-matched full-screen layer. */
        .game-page.immersive {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          background: var(--bg);
          overflow-y: auto;
          padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
          justify-content: center;
        }
        .game-top-row {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .game-back-link, .game-fs-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--fg);
          text-decoration: none;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          transition: background 0.3s ease, transform 0.22s ease;
        }
        .game-back-link:hover, .game-fs-btn:hover { background: rgba(var(--accent-rgb), 0.16); }
        .game-fs-btn:active, .game-back-link:active { transform: scale(0.95); }
        .game-header {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }
        .game-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: var(--accent);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .game-subtitle {
          font-size: 0.72rem;
          color: var(--fg);
          opacity: 0.55;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 2px;
          font-family: var(--font-mono);
        }
        .score-row { display: flex; gap: 10px; }
        .score-box {
          background: rgba(var(--accent-rgb),0.08);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 8px 16px;
          text-align: center;
          min-width: 72px;
        }
        .score-label {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.55;
          font-family: var(--font-mono);
          color: var(--fg);
        }
        .score-val {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.2;
        }
        .game-controls {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 10px;
        }
        .game-hint {
          font-size: 0.72rem;
          opacity: 0.5;
          font-family: var(--font-mono);
          color: var(--fg);
        }
        .new-game-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 9px 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          transition: opacity 0.3s ease, transform 0.22s ease;
          white-space: nowrap;
        }
        .new-game-btn:hover { opacity: 0.85; }
        .new-game-btn:active { transform: scale(0.96); }
        .board-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
          user-select: none;
          touch-action: none;
        }
        .board {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          padding: 10px;
          background: var(--glass-border);
          border-radius: 16px;
          aspect-ratio: 1;
        }
        .cell-bg {
          border-radius: 10px;
          background: rgba(var(--accent-rgb), 0.06);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tile {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          line-height: 1;
          animation: tileIn 0.28s cubic-bezier(0.22,1,0.36,1);
          will-change: transform;
        }
        @keyframes tileIn {
          from { transform: scale(0.82); opacity: 0.4; }
          to   { transform: scale(1);    opacity: 1;   }
        }
        .overlay {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          background: rgba(var(--accent-rgb), 0.12);
          animation: overlayIn 0.5s ease;
          z-index: 10;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .overlay-title {
          font-size: 2rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.02em;
        }
        .overlay-btn {
          padding: 10px 28px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: opacity 0.3s ease, transform 0.22s ease;
        }
        .overlay-btn-primary { background: var(--accent); color: #fff; }
        .overlay-btn-secondary { background: var(--glass-border); color: var(--fg); }
        .overlay-btn:hover { opacity: 0.85; }
        .overlay-btn:active { transform: scale(0.96); }
        .game-instructions {
          width: 100%;
          max-width: 420px;
          margin-top: 28px;
          padding: 18px 20px;
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        .inst-title {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 10px;
        }
        .inst-body {
          font-size: 0.82rem;
          color: var(--fg);
          opacity: 0.75;
          line-height: 1.6;
        }
        .game-footer {
          margin-top: 32px;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.4;
          color: var(--fg);
          text-align: center;
        }
        /* Immersive trims the long-form chrome so only the board + score show. */
        .game-page.immersive .game-instructions,
        .game-page.immersive .game-footer { display: none; }
        @media (max-width: 390px) {
          .game-title { font-size: 2rem; }
          .board { gap: 7px; padding: 7px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tile, .overlay { animation: none !important; }
        }
      `}</style>

      <main className={`game-page${immersive ? " immersive" : ""}`} data-no-ptr ref={shellRef}>
        {/* Top row: back to hub (hidden in immersive) + fullscreen toggle */}
        <div className="game-top-row">
          {immersive ? (
            <span />
          ) : (
            <Link href="/game" className="game-back-link">
              <ArrowLeft size={15} strokeWidth={2.4} /> Games
            </Link>
          )}
          <button type="button" className="game-fs-btn" onClick={toggleImmersive}>
            {immersive ? <Minimize2 size={15} strokeWidth={2.4} /> : <Maximize2 size={15} strokeWidth={2.4} />}
            {immersive ? "Exit" : "Fullscreen"}
          </button>
        </div>

        {/* Header */}
        <div className="game-header">
          <div>
            <div className="game-title">2048</div>
            <div className="game-subtitle">◈ By DummVinci · PTTS Praxis</div>
          </div>
          <div className="score-row">
            <div className="score-box">
              <div className="score-label">Score</div>
              <div className="score-val">{state.score}</div>
            </div>
            <div className="score-box">
              <div className="score-label">Best</div>
              <div className="score-val">{state.best}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="game-controls">
          <div className="game-hint">Swipe or use arrow keys / WASD</div>
          <button
            type="button"
            className="new-game-btn"
            onClick={() => dispatch({ type: "NEW_GAME" })}
          >
            New Game
          </button>
        </div>

        {/* Board */}
        <div className="board-wrap" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="board">
            {state.grid.map((row, r) =>
              row.map((val, c) => {
                const s = val ? tileStyle(val) : null;
                return (
                  <div className="cell-bg" key={`${r}-${c}`}>
                    {val && s ? (
                      <div
                        className="tile"
                        style={{ background: s.bg, color: s.fg, fontSize: s.size }}
                      >
                        {val}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {/* Overlay: Win */}
          {state.won && (
            <div className="overlay">
              <div className="overlay-title">You Win!</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="overlay-btn overlay-btn-primary"
                  onClick={() => dispatch({ type: "CONTINUE" })}
                >
                  Keep Going
                </button>
                <button
                  type="button"
                  className="overlay-btn overlay-btn-secondary"
                  onClick={() => dispatch({ type: "NEW_GAME" })}
                >
                  New Game
                </button>
              </div>
            </div>
          )}

          {/* Overlay: Game Over */}
          {state.over && (
            <div className="overlay">
              <div className="overlay-title">Game Over</div>
              <div className="score-val" style={{ fontSize: "1rem", color: "var(--fg)", opacity: 0.7 }}>
                Score: {state.score}
              </div>
              <button
                type="button"
                className="overlay-btn overlay-btn-primary"
                onClick={() => dispatch({ type: "NEW_GAME" })}
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="game-instructions">
          <div className="inst-title">◈ How to play</div>
          <div className="inst-body">
            Swipe (mobile) or use ← → ↑ ↓ / W A S D (desktop) to slide all tiles.
            When two tiles with the same number collide, they merge into one.
            Reach <strong style={{ color: "var(--accent)" }}>2048</strong> to win!
          </div>
        </div>

        <div className="game-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
