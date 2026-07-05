"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GRID_SIZE = 20;
const BEST_KEY = "ptts_snake_best";
const INITIAL_SPEED_MS = 150;
const SPEED_FLOOR_MS = 60;
const SPEED_STEP_MS = 5;
const FOODS_PER_LEVEL_STEP = 5;
const SCORE_PER_FOOD = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type GameStatus = "IDLE" | "RUNNING" | "PAUSED" | "OVER";

interface Point {
  r: number;
  c: number;
}

interface SnakeState {
  snake: Point[];       // head at index 0
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  best: number;
  foodEaten: number;
  status: GameStatus;
}

type SnakeAction =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "CHANGE_DIRECTION"; dir: Direction }
  | { type: "TOGGLE_PAUSE" }
  | { type: "NEW_GAME" }
  | { type: "SET_BEST"; best: number };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.r},${p.c}`));
  const free: Point[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) free.push({ r, c });
    }
  }
  if (!free.length) return { r: 0, c: 0 };
  return free[Math.floor(Math.random() * free.length)];
}

function initialSnake(): Point[] {
  const midR = Math.floor(GRID_SIZE / 2);
  const midC = Math.floor(GRID_SIZE / 2);
  // Head at (midR, midC), length 3, moving right → tail is further left
  return [
    { r: midR, c: midC },
    { r: midR, c: midC - 1 },
    { r: midR, c: midC - 2 },
  ];
}

function buildInitialState(best: number): SnakeState {
  const snake = initialSnake();
  return {
    snake,
    food: randomFood(snake),
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    best,
    foodEaten: 0,
    status: "IDLE",
  };
}

function oppositeDir(d: Direction): Direction {
  if (d === "UP") return "DOWN";
  if (d === "DOWN") return "UP";
  if (d === "LEFT") return "RIGHT";
  return "LEFT";
}

function moveHead(head: Point, dir: Direction): Point {
  switch (dir) {
    case "UP":    return { r: head.r - 1, c: head.c };
    case "DOWN":  return { r: head.r + 1, c: head.c };
    case "LEFT":  return { r: head.r, c: head.c - 1 };
    case "RIGHT": return { r: head.r, c: head.c + 1 };
  }
}

function isOutOfBounds(p: Point): boolean {
  return p.r < 0 || p.r >= GRID_SIZE || p.c < 0 || p.c >= GRID_SIZE;
}

function hitsSelf(head: Point, body: Point[]): boolean {
  return body.some((p) => p.r === head.r && p.c === head.c);
}

function speedForFoodCount(foodEaten: number): number {
  const reductions = Math.floor(foodEaten / FOODS_PER_LEVEL_STEP);
  return Math.max(SPEED_FLOOR_MS, INITIAL_SPEED_MS - reductions * SPEED_STEP_MS);
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: SnakeState, action: SnakeAction): SnakeState {
  switch (action.type) {
    case "SET_BEST":
      return { ...state, best: action.best };

    case "START":
      return { ...state, status: "RUNNING" };

    case "NEW_GAME": {
      const snake = initialSnake();
      return {
        snake,
        food: randomFood(snake),
        direction: "RIGHT",
        nextDirection: "RIGHT",
        score: 0,
        best: state.best,
        foodEaten: 0,
        status: "RUNNING",
      };
    }

    case "TOGGLE_PAUSE": {
      if (state.status === "RUNNING") return { ...state, status: "PAUSED" };
      if (state.status === "PAUSED")  return { ...state, status: "RUNNING" };
      return state;
    }

    case "CHANGE_DIRECTION": {
      if (state.status !== "RUNNING" && state.status !== "PAUSED") return state;
      // Cannot reverse into self
      if (action.dir === oppositeDir(state.direction)) return state;
      return { ...state, nextDirection: action.dir };
    }

    case "TICK": {
      if (state.status !== "RUNNING") return state;

      const dir = state.nextDirection;
      const newHead = moveHead(state.snake[0], dir);

      // Wall collision
      if (isOutOfBounds(newHead)) {
        const newBest = Math.max(state.best, state.score);
        return { ...state, direction: dir, status: "OVER", best: newBest };
      }

      // Self collision (against body excluding the tail which will move away)
      const bodyWithoutTail = state.snake.slice(0, -1);
      if (hitsSelf(newHead, bodyWithoutTail)) {
        const newBest = Math.max(state.best, state.score);
        return { ...state, direction: dir, status: "OVER", best: newBest };
      }

      const ateFood = newHead.r === state.food.r && newHead.c === state.food.c;

      let newSnake: Point[];
      if (ateFood) {
        // Grow: keep tail
        newSnake = [newHead, ...state.snake];
      } else {
        // Move: drop tail
        newSnake = [newHead, ...state.snake.slice(0, -1)];
      }

      const newFoodEaten = ateFood ? state.foodEaten + 1 : state.foodEaten;
      const newScore = ateFood ? state.score + SCORE_PER_FOOD : state.score;
      const newBest = Math.max(state.best, newScore);
      const newFood = ateFood ? randomFood(newSnake) : state.food;

      return {
        ...state,
        snake: newSnake,
        food: newFood,
        direction: dir,
        nextDirection: dir,
        score: newScore,
        best: newBest,
        foodEaten: newFoodEaten,
        status: "RUNNING",
      };
    }
  }
}

// ─── Cell type helpers ────────────────────────────────────────────────────────

type CellKind = "empty" | "head" | "body" | "food";

function buildCellMap(snake: Point[], food: Point): Map<string, CellKind> {
  const map = new Map<string, CellKind>();
  map.set(`${food.r},${food.c}`, "food");
  for (let i = snake.length - 1; i >= 0; i--) {
    const p = snake[i];
    map.set(`${p.r},${p.c}`, i === 0 ? "head" : "body");
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SnakePage() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => buildInitialState(0)
  );
  const [immersive, setImmersive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load persisted best ────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved) dispatch({ type: "SET_BEST", best: parseInt(saved, 10) });
  }, []);

  // ── Persist best score ─────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(state.best));
  }, [state.best]);

  // ── Game tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== "RUNNING") {
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    const speed = speedForFoodCount(state.foodEaten);

    // Always re-create interval when speed may have changed or status changed
    if (tickRef.current !== null) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      dispatch({ type: "TICK" });
    }, speed);

    return () => {
      if (tickRef.current !== null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
    // Deliberately depend on foodEaten to re-create interval when speed changes
  }, [state.status, state.foodEaten]);

  // ── Keyboard controls ──────────────────────────────────────────────────────
  useEffect(() => {
    const dirMap: Record<string, Direction> = {
      ArrowUp: "UP", ArrowDown: "DOWN", ArrowLeft: "LEFT", ArrowRight: "RIGHT",
      w: "UP", s: "DOWN", a: "LEFT", d: "RIGHT",
      W: "UP", S: "DOWN", A: "LEFT", D: "RIGHT",
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (state.status === "IDLE") {
          dispatch({ type: "START" });
        } else {
          dispatch({ type: "TOGGLE_PAUSE" });
        }
        return;
      }
      const dir = dirMap[e.key];
      if (dir) {
        e.preventDefault();
        if (state.status === "IDLE") dispatch({ type: "START" });
        dispatch({ type: "CHANGE_DIRECTION", dir });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.status]);

  // ── Immersive / fullscreen ─────────────────────────────────────────────────
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

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement) setImmersive(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  useEffect(() => {
    if (!immersive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) exitImmersive();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [immersive, exitImmersive]);

  // ── Touch / swipe ──────────────────────────────────────────────────────────
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; // below threshold

      let dir: Direction;
      if (Math.abs(dx) >= Math.abs(dy)) {
        dir = dx > 0 ? "RIGHT" : "LEFT";
      } else {
        dir = dy > 0 ? "DOWN" : "UP";
      }

      if (state.status === "IDLE") dispatch({ type: "START" });
      dispatch({ type: "CHANGE_DIRECTION", dir });
    },
    [state.status]
  );

  // ── Derived display values ─────────────────────────────────────────────────
  const level = Math.floor(state.score / 50) + 1;
  const cellMap = buildCellMap(state.snake, state.food);

  // Pre-render flat cell array for the grid
  const cells: CellKind[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      cells.push(cellMap.get(`${r},${c}`) ?? "empty");
    }
  }

  return (
    <>
      <style>{`
        .snake-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        .snake-page.immersive {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          background: var(--bg);
          overflow-y: auto;
          padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
          justify-content: center;
        }

        /* ── Top row ─────────────────────────────────────────────────────── */
        .snake-top-row {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .snake-back-link, .snake-fs-btn {
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
        .snake-back-link:hover, .snake-fs-btn:hover {
          background: rgba(var(--accent-rgb), 0.16);
        }
        .snake-fs-btn:active, .snake-back-link:active { transform: scale(0.95); }

        /* ── Header ──────────────────────────────────────────────────────── */
        .snake-header {
          width: 100%;
          max-width: 420px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 20px;
        }
        .snake-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: var(--accent);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .snake-subtitle {
          font-size: 0.72rem;
          color: var(--fg);
          opacity: 0.55;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 2px;
          font-family: var(--font-mono);
        }

        /* ── Score boxes ─────────────────────────────────────────────────── */
        .score-row { display: flex; gap: 8px; }
        .score-box {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 8px 14px;
          text-align: center;
          min-width: 62px;
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
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.2;
        }

        /* ── Board wrap ──────────────────────────────────────────────────── */
        .snake-board-wrap {
          position: relative;
          width: 100%;
          max-width: 420px;
          user-select: none;
          touch-action: none;
        }
        .snake-board {
          display: grid;
          grid-template-columns: repeat(${GRID_SIZE}, 1fr);
          gap: 2px;
          padding: 8px;
          background: var(--glass-border);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          aspect-ratio: 1;
          box-sizing: border-box;
        }

        /* ── Cells ───────────────────────────────────────────────────────── */
        .snake-cell {
          border-radius: 3px;
          aspect-ratio: 1;
          background: rgba(var(--accent-rgb), 0.05);
          transition: background 0.12s;
        }
        .snake-cell.head {
          background: var(--accent);
          border-radius: 5px;
        }
        .snake-cell.body {
          background: rgba(var(--accent-rgb), 0.65);
          border-radius: 3px;
        }
        .snake-cell.food {
          background: #4cbb8a;
          border-radius: 50%;
          animation: foodPulse 1.4s ease-in-out infinite;
        }
        @keyframes foodPulse {
          0%, 100% { transform: scale(0.82); }
          50%       { transform: scale(1.0);  }
        }

        /* ── Overlay (pause / game over) ─────────────────────────────────── */
        .snake-overlay {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          backdrop-filter: blur(8px) saturate(140%);
          -webkit-backdrop-filter: blur(8px) saturate(140%);
          background: rgba(var(--accent-rgb), 0.12);
          animation: overlayIn 0.5s ease;
          z-index: 10;
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
        .overlay-title {
          font-size: 1.9rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.02em;
        }
        .overlay-sub {
          font-size: 0.82rem;
          color: var(--fg);
          opacity: 0.6;
          font-family: var(--font-mono);
          letter-spacing: 0.08em;
        }
        .overlay-score {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--fg);
          opacity: 0.75;
        }
        .overlay-btn-row { display: flex; gap: 10px; }
        .overlay-btn {
          padding: 10px 26px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-family: var(--font-display), sans-serif;
          transition: opacity 0.3s ease, transform 0.22s ease;
        }
        .overlay-btn-primary { background: var(--accent); color: #fff; }
        .overlay-btn-secondary {
          background: rgba(var(--accent-rgb), 0.12);
          color: var(--fg);
          border: 1px solid var(--glass-border);
        }
        .overlay-btn:hover { opacity: 0.85; }
        .overlay-btn:active { transform: scale(0.96); }

        /* ── Action buttons ──────────────────────────────────────────────── */
        .snake-actions {
          width: 100%;
          max-width: 420px;
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .snake-action-btn {
          flex: 1;
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          padding: 10px 0;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--fg);
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          transition: background 0.3s ease, transform 0.22s ease;
        }
        .snake-action-btn:hover { background: rgba(var(--accent-rgb), 0.18); }
        .snake-action-btn:active { transform: scale(0.97); }
        .snake-action-btn.primary {
          background: var(--accent);
          color: #fff;
          border-color: transparent;
        }
        .snake-action-btn.primary:hover { opacity: 0.88; background: var(--accent); }

        /* ── Instructions ────────────────────────────────────────────────── */
        .snake-instructions {
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
          line-height: 1.65;
        }
        .inst-key {
          display: inline-block;
          background: rgba(var(--accent-rgb), 0.12);
          border: 1px solid var(--glass-border);
          border-radius: 5px;
          padding: 1px 6px;
          font-family: var(--font-mono);
          font-size: 0.76rem;
          color: var(--fg);
        }

        /* ── Footer ──────────────────────────────────────────────────────── */
        .snake-footer {
          margin-top: 32px;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.4;
          color: var(--fg);
          text-align: center;
        }

        /* ── Immersive hides long-form chrome ────────────────────────────── */
        .snake-page.immersive .snake-instructions,
        .snake-page.immersive .snake-footer { display: none; }

        /* ── Responsive ──────────────────────────────────────────────────── */
        @media (max-width: 390px) {
          .snake-title { font-size: 2rem; }
          .snake-board { gap: 1px; padding: 5px; }
          .score-box { padding: 6px 10px; min-width: 52px; }
          .score-val { font-size: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .snake-cell.food { animation: none !important; }
          .snake-overlay { animation: none !important; }
        }
      `}</style>

      <main
        className={`snake-page${immersive ? " immersive" : ""}`}
        data-no-ptr
        ref={shellRef}
      >
        {/* ── Top row ──────────────────────────────────────────────────────── */}
        <div className="snake-top-row">
          {immersive ? (
            <span />
          ) : (
            <Link href="/game" className="snake-back-link">
              <ArrowLeft size={15} strokeWidth={2.4} /> Games
            </Link>
          )}
          <button
            type="button"
            className="snake-fs-btn"
            onClick={toggleImmersive}
          >
            {immersive ? (
              <Minimize2 size={15} strokeWidth={2.4} />
            ) : (
              <Maximize2 size={15} strokeWidth={2.4} />
            )}
            {immersive ? "Exit" : "Fullscreen"}
          </button>
        </div>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="snake-header">
          <div>
            <div className="snake-title">SNAKE</div>
            <div className="snake-subtitle">◈ By DummVinci · PTTS Praxis</div>
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
            <div className="score-box">
              <div className="score-label">Level</div>
              <div className="score-val">{level}</div>
            </div>
          </div>
        </div>

        {/* ── Board ────────────────────────────────────────────────────────── */}
        <div
          className="snake-board-wrap"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="snake-board">
            {cells.map((kind, idx) => (
              <div key={idx} className={`snake-cell${kind !== "empty" ? ` ${kind}` : ""}`} />
            ))}
          </div>

          {/* Overlay: IDLE — press any key / tap to start */}
          {state.status === "IDLE" && (
            <div className="snake-overlay">
              <div className="overlay-title">SNAKE</div>
              <div className="overlay-sub">Press any arrow / WASD key</div>
              <div className="overlay-sub">or tap the board to start</div>
              <button
                type="button"
                className="overlay-btn overlay-btn-primary"
                onClick={() => dispatch({ type: "START" })}
              >
                Start Game
              </button>
            </div>
          )}

          {/* Overlay: PAUSED */}
          {state.status === "PAUSED" && (
            <div className="snake-overlay">
              <div className="overlay-title">Paused</div>
              <div className="overlay-score">Score: {state.score}</div>
              <div className="overlay-btn-row">
                <button
                  type="button"
                  className="overlay-btn overlay-btn-primary"
                  onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
                >
                  Resume
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

          {/* Overlay: GAME OVER */}
          {state.status === "OVER" && (
            <div className="snake-overlay">
              <div className="overlay-title">Game Over</div>
              <div className="overlay-score">Score: {state.score}</div>
              {state.score > 0 && state.score === state.best && (
                <div
                  className="overlay-sub"
                  style={{ color: "#4cbb8a", opacity: 1 }}
                >
                  ★ New Best!
                </div>
              )}
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

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <div className="snake-actions">
          {state.status === "RUNNING" ? (
            <button
              type="button"
              className="snake-action-btn"
              onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            >
              Pause
            </button>
          ) : state.status === "PAUSED" ? (
            <button
              type="button"
              className="snake-action-btn primary"
              onClick={() => dispatch({ type: "TOGGLE_PAUSE" })}
            >
              Resume
            </button>
          ) : (
            <button
              type="button"
              className="snake-action-btn primary"
              onClick={() => dispatch({ type: state.status === "IDLE" ? "START" : "NEW_GAME" })}
            >
              {state.status === "IDLE" ? "Start" : "New Game"}
            </button>
          )}
          <button
            type="button"
            className="snake-action-btn"
            onClick={() => dispatch({ type: "NEW_GAME" })}
          >
            New Game
          </button>
        </div>

        {/* ── Instructions ──────────────────────────────────────────────────── */}
        <div className="snake-instructions">
          <div className="inst-title">◈ How to play</div>
          <div className="inst-body">
            Guide the snake to eat food and grow longer. Avoid walls and your
            own tail!
            <br />
            <br />
            <span className="inst-key">← → ↑ ↓</span> or{" "}
            <span className="inst-key">W A S D</span> — change direction
            &nbsp;&nbsp;
            <span className="inst-key">P</span> — pause / resume
            <br />
            Swipe on mobile (min 30 px) to change direction.
            <br />
            <br />
            Every food eaten scores{" "}
            <strong style={{ color: "var(--accent)" }}>+10 pts</strong>. Speed
            increases every 5 foods. Level = score ÷ 50 + 1.
          </div>
        </div>

        <div className="snake-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
