"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BEST_KEYS = {
  easy:   "ptts_ms_best_easy",
  medium: "ptts_ms_best_medium",
  expert: "ptts_ms_best_expert",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "expert";
type GameStatus  = "idle" | "running" | "won" | "lost";

interface DiffConfig {
  rows: number;
  cols: number;
  mines: number;
}

const DIFF_CONFIG: Record<Difficulty, DiffConfig> = {
  easy:   { rows: 9,  cols: 9,  mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

interface Cell {
  isMine:    boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacent:  number; // count of adjacent mines (0-8)
  isHit:     boolean; // the specific mine the player clicked
}

interface BoardState {
  cells:      Cell[][];    // [row][col]
  difficulty: Difficulty;
  status:     GameStatus;
  flagCount:  number;
  elapsed:    number;      // seconds
  bests:      Record<Difficulty, number | null>;
}

type Action =
  | { type: "SET_DIFFICULTY"; difficulty: Difficulty }
  | { type: "NEW_GAME" }
  | { type: "FIRST_CLICK"; row: number; col: number }
  | { type: "REVEAL"; row: number; col: number }
  | { type: "FLAG";   row: number; col: number }
  | { type: "TICK" }
  | { type: "SET_BEST"; difficulty: Difficulty; time: number };

// ─── Board Helpers ────────────────────────────────────────────────────────────

function makeEmptyBoard(rows: number, cols: number): Cell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): Cell => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacent: 0, isHit: false,
    }))
  );
}

function cloneBoard(board: Cell[][]): Cell[][] {
  return board.map(row => row.map(cell => ({ ...cell })));
}

/** Place mines randomly, avoiding `safeRow`, `safeCol` and their 8 neighbours. */
function placeMines(
  board: Cell[][],
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number
): Cell[][] {
  const next = cloneBoard(board);
  const forbidden = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeRow + dr;
      const c = safeCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        forbidden.add(`${r},${c}`);
      }
    }
  }

  // Build candidate list
  const candidates: [number, number][] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!forbidden.has(`${r},${c}`)) candidates.push([r, c]);

  // Fisher-Yates partial shuffle
  const count = Math.min(mines, candidates.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    const [r, c] = candidates[i];
    next[r][c] = { ...next[r][c], isMine: true };
  }

  // Compute adjacency counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (next[r][c].isMine) continue;
      let adj = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && next[nr][nc].isMine) adj++;
        }
      next[r][c] = { ...next[r][c], adjacent: adj };
    }
  }

  return next;
}

/** Flood-fill reveal from (row, col). Mutates board in place for performance. */
function floodReveal(board: Cell[][], rows: number, cols: number, row: number, col: number): void {
  const stack: [number, number][] = [[row, col]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    const cell = board[r][c];
    if (cell.isRevealed || cell.isFlagged || cell.isMine) continue;
    board[r][c] = { ...cell, isRevealed: true };
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++)
          if (dr !== 0 || dc !== 0) stack.push([r + dr, c + dc]);
    }
  }
}

function checkWin(cells: Cell[][]): boolean {
  for (const row of cells)
    for (const cell of row)
      if (!cell.isMine && !cell.isRevealed) return false;
  return true;
}

function revealAllMines(cells: Cell[][], hitRow: number, hitCol: number): Cell[][] {
  return cells.map((row, r) =>
    row.map((cell, c) => {
      if (cell.isMine) {
        return { ...cell, isRevealed: true, isHit: r === hitRow && c === hitCol };
      }
      // Incorrectly placed flags on non-mines: keep revealed as flag to show mistake
      return cell;
    })
  );
}

// ─── Initial State ────────────────────────────────────────────────────────────

function makeInitialState(difficulty: Difficulty = "easy"): BoardState {
  const { rows, cols } = DIFF_CONFIG[difficulty];
  return {
    cells:      makeEmptyBoard(rows, cols),
    difficulty,
    status:     "idle",
    flagCount:  0,
    elapsed:    0,
    bests:      { easy: null, medium: null, expert: null },
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: BoardState, action: Action): BoardState {
  switch (action.type) {

    case "SET_DIFFICULTY": {
      if (action.difficulty === state.difficulty && state.status === "idle") return state;
      return { ...makeInitialState(action.difficulty), bests: state.bests };
    }

    case "NEW_GAME": {
      return { ...makeInitialState(state.difficulty), bests: state.bests };
    }

    case "SET_BEST": {
      const current = state.bests[action.difficulty];
      if (current !== null && current <= action.time) return state;
      return { ...state, bests: { ...state.bests, [action.difficulty]: action.time } };
    }

    case "FIRST_CLICK": {
      // Only valid when idle
      if (state.status !== "idle") return state;
      const { difficulty } = state;
      const { rows, cols, mines } = DIFF_CONFIG[difficulty];
      // Place mines avoiding first click neighbourhood
      let cells = placeMines(makeEmptyBoard(rows, cols), rows, cols, mines, action.row, action.col);
      // Reveal from clicked cell
      cells = cloneBoard(cells);
      floodReveal(cells, rows, cols, action.row, action.col);
      const won = checkWin(cells);
      return {
        ...state,
        cells,
        status:    won ? "won" : "running",
        flagCount: 0,
        elapsed:   0,
      };
    }

    case "REVEAL": {
      if (state.status !== "running") return state;
      const { row, col } = action;
      const cell = state.cells[row][col];
      if (cell.isRevealed || cell.isFlagged) return state;

      if (cell.isMine) {
        // Game over — reveal all mines
        const cells = revealAllMines(cloneBoard(state.cells), row, col);
        return { ...state, cells, status: "lost" };
      }

      // Safe reveal
      const { rows, cols } = DIFF_CONFIG[state.difficulty];
      const cells = cloneBoard(state.cells);
      floodReveal(cells, rows, cols, row, col);
      const won = checkWin(cells);
      return { ...state, cells, status: won ? "won" : "running" };
    }

    case "FLAG": {
      if (state.status !== "running" && state.status !== "idle") return state;
      const { row, col } = action;
      const cell = state.cells[row][col];
      if (cell.isRevealed) return state;
      const cells = cloneBoard(state.cells);
      const wasFlag = cell.isFlagged;
      cells[row][col] = { ...cell, isFlagged: !wasFlag };
      return { ...state, cells, flagCount: state.flagCount + (wasFlag ? -1 : 1) };
    }

    case "TICK": {
      if (state.status !== "running") return state;
      return { ...state, elapsed: state.elapsed + 1 };
    }

    default:
      return state;
  }
}

// ─── Number colours ───────────────────────────────────────────────────────────

const NUM_COLORS: Record<number, string> = {
  1: "#2563eb",  // blue
  2: "#16a34a",  // green
  3: "#dc2626",  // red
  4: "#1e3a8a",  // dark blue
  5: "#991b1b",  // dark red
  6: "#0f766e",  // teal
  7: "#111827",  // near-black
  8: "#6b7280",  // gray
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MinesweeperPage() {
  const [state, dispatch] = useReducer(reducer, undefined, () => makeInitialState("easy"));
  const [immersive, setImmersive] = useState(false);
  const shellRef   = useRef<HTMLDivElement>(null);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load persisted best times ──────────────────────────────────────────────
  useEffect(() => {
    (["easy", "medium", "expert"] as Difficulty[]).forEach(d => {
      const raw = localStorage.getItem(BEST_KEYS[d]);
      if (raw) {
        const t = parseInt(raw, 10);
        if (!isNaN(t)) dispatch({ type: "SET_BEST", difficulty: d, time: t });
      }
    });
  }, []);

  // ── Persist best time when won ─────────────────────────────────────────────
  useEffect(() => {
    if (state.status !== "won") return;
    const d = state.difficulty;
    const current = state.bests[d];
    const elapsed  = state.elapsed;
    if (current === null || elapsed < current) {
      localStorage.setItem(BEST_KEYS[d], String(elapsed));
      dispatch({ type: "SET_BEST", difficulty: d, time: elapsed });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (state.status === "running") {
      timerRef.current = setInterval(() => dispatch({ type: "TICK" }), 1000);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state.status]);

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  const enterImmersive = useCallback(() => {
    setImmersive(true);
    const el = shellRef.current;
    if (el?.requestFullscreen) el.requestFullscreen().catch(() => {});
  }, []);

  const exitImmersive = useCallback(() => {
    setImmersive(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const toggleImmersive = useCallback(() => {
    if (immersive) exitImmersive(); else enterImmersive();
  }, [immersive, enterImmersive, exitImmersive]);

  useEffect(() => {
    const onFsChange = () => { if (!document.fullscreenElement) setImmersive(false); };
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

  // ── Cell event handlers ────────────────────────────────────────────────────
  // Long-press tracking refs (per-cell via data attribute, no state mutation)
  const longPressTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressFired  = useRef(false);
  const pointerMoved    = useRef(false);

  const handleCellPointerDown = useCallback((row: number, col: number) => {
    pointerMoved.current   = false;
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      if (!pointerMoved.current) {
        longPressFired.current = true;
        dispatch({ type: "FLAG", row, col });
      }
    }, 500);
  }, []);

  const handleCellPointerUp = useCallback((row: number, col: number) => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
    // If the long-press already fired, skip click reveal
    if (longPressFired.current) { longPressFired.current = false; return; }
    // Normal tap/click → reveal
    const cell = state.cells[row]?.[col];
    if (!cell) return;
    if (cell.isFlagged || cell.isRevealed) return;

    if (state.status === "idle") {
      dispatch({ type: "FIRST_CLICK", row, col });
    } else {
      dispatch({ type: "REVEAL", row, col });
    }
  }, [state.cells, state.status]);

  const handleCellPointerMove = useCallback(() => {
    pointerMoved.current = true;
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  }, []);

  const handleCellContextMenu = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      dispatch({ type: "FLAG", row, col });
    },
    []
  );

  // ── Derived values ─────────────────────────────────────────────────────────
  const { cells, difficulty, status, flagCount, elapsed, bests } = state;
  const { mines } = DIFF_CONFIG[difficulty];
  const mineCounter = mines - flagCount;
  const bestTime    = bests[difficulty];

  const formatTime = (s: number) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <>
      <style>{`
        /* ── Page shell ─────────────────────────────────────────────────────── */
        .ms-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        .ms-page.immersive {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          background: var(--bg);
          overflow-y: auto;
          padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
          align-items: center;
          justify-content: flex-start;
        }
        .ms-page.immersive .ms-instructions,
        .ms-page.immersive .ms-footer { display: none; }

        /* ── Top row ────────────────────────────────────────────────────────── */
        .ms-top-row {
          width: 100%;
          max-width: 700px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .ms-back-link, .ms-fs-btn {
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
        .ms-back-link:hover, .ms-fs-btn:hover { background: rgba(var(--accent-rgb), 0.16); }
        .ms-back-link:active, .ms-fs-btn:active { transform: scale(0.95); }

        /* ── Title ──────────────────────────────────────────────────────────── */
        .ms-title-row {
          width: 100%;
          max-width: 700px;
          margin-bottom: 18px;
        }
        .ms-title {
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .ms-subtitle {
          font-size: 0.72rem;
          color: var(--fg);
          opacity: 0.55;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 2px;
          font-family: var(--font-mono);
        }

        /* ── Difficulty picker ──────────────────────────────────────────────── */
        .ms-diff-row {
          width: 100%;
          max-width: 700px;
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .ms-diff-btn {
          flex: 1 1 80px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid var(--glass-border);
          background: rgba(var(--accent-rgb), 0.06);
          color: var(--fg);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.22s ease;
          white-space: nowrap;
          text-align: center;
        }
        .ms-diff-btn:hover { background: rgba(var(--accent-rgb), 0.14); }
        .ms-diff-btn:active { transform: scale(0.96); }
        .ms-diff-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }

        /* ── Status bar ─────────────────────────────────────────────────────── */
        .ms-status-row {
          width: 100%;
          max-width: 700px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .ms-stat-pair {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(var(--accent-rgb), 0.07);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 7px 14px;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--fg);
          min-width: 80px;
        }
        .ms-stat-pair .label {
          font-size: 0.7rem;
          opacity: 0.55;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ms-new-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 9px 22px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          transition: opacity 0.3s ease, transform 0.22s ease;
          white-space: nowrap;
        }
        .ms-new-btn:hover { opacity: 0.85; }
        .ms-new-btn:active { transform: scale(0.96); }
        .ms-best-note {
          font-size: 0.68rem;
          font-family: var(--font-mono);
          color: var(--accent);
          opacity: 0.85;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          white-space: nowrap;
        }

        /* ── Board wrapper (handles horizontal scroll for large grids) ───────── */
        .ms-board-scroll {
          width: 100%;
          max-width: 700px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .ms-board-outer {
          position: relative;
          display: inline-block;
          min-width: min-content;
        }

        /* ── Board grid ─────────────────────────────────────────────────────── */
        .ms-board {
          display: grid;
          gap: 2px;
          padding: 6px;
          background: var(--glass-border);
          border-radius: 10px;
          user-select: none;
        }

        /* ── Individual cells ───────────────────────────────────────────────── */
        .ms-cell {
          width: 32px;
          height: 32px;
          min-width: 32px;
          min-height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 5px;
          font-weight: 800;
          font-size: 0.85rem;
          line-height: 1;
          cursor: pointer;
          transition: background 0.18s ease, transform 0.14s ease;
          /* touch-action: none on individual cells only — do NOT put on board/page */
          touch-action: none;
          -webkit-tap-highlight-color: transparent;
          font-family: var(--font-mono), monospace;
          box-sizing: border-box;
          position: relative;
          flex-shrink: 0;
        }
        .ms-cell.unrevealed {
          background: rgba(var(--accent-rgb), 0.12);
          border: 1px solid var(--glass-border);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.18);
        }
        .ms-cell.unrevealed:hover {
          background: rgba(var(--accent-rgb), 0.22);
          transform: scale(1.06);
        }
        .ms-cell.unrevealed:active { transform: scale(0.94); }
        .ms-cell.revealed {
          background: rgba(var(--accent-rgb), 0.04);
          border: 1px solid rgba(var(--accent-rgb), 0.08);
          box-shadow: inset 0 1px 3px rgba(0,0,0,0.12);
          cursor: default;
        }
        .ms-cell.flagged {
          background: rgba(var(--accent-rgb), 0.14);
          border: 1px solid rgba(var(--accent-rgb), 0.35);
          cursor: pointer;
        }
        .ms-cell.mine-hit {
          background: rgba(220, 38, 38, 0.45) !important;
          border: 1px solid rgba(220, 38, 38, 0.7) !important;
        }
        .ms-cell.mine-reveal {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
          cursor: default;
        }

        /* ── Win flash ──────────────────────────────────────────────────────── */
        @keyframes ms-win-flash {
          0%   { background: rgba(var(--accent-rgb), 0.04); }
          40%  { background: rgba(var(--accent-rgb), 0.30); }
          100% { background: rgba(var(--accent-rgb), 0.04); }
        }
        .ms-board.won .ms-cell.revealed {
          animation: ms-win-flash 1.2s ease forwards;
        }

        /* ── Loss overlay (red tint) ────────────────────────────────────────── */
        .ms-board-outer .ms-loss-tint {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: rgba(220, 38, 38, 0.12);
          pointer-events: none;
          z-index: 5;
          animation: ms-tint-in 0.5s ease;
        }
        @keyframes ms-tint-in { from { opacity: 0; } to { opacity: 1; } }

        /* ── Status message banner ──────────────────────────────────────────── */
        .ms-banner {
          width: 100%;
          max-width: 700px;
          margin-top: 12px;
          padding: 12px 18px;
          border-radius: 12px;
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-align: center;
          animation: ms-tint-in 0.5s ease;
        }
        .ms-banner.won-banner {
          background: rgba(22, 163, 74, 0.15);
          border: 1px solid rgba(22, 163, 74, 0.35);
          color: #16a34a;
        }
        .ms-banner.lost-banner {
          background: rgba(220, 38, 38, 0.12);
          border: 1px solid rgba(220, 38, 38, 0.35);
          color: #dc2626;
        }

        /* ── Instructions card ──────────────────────────────────────────────── */
        .ms-instructions {
          width: 100%;
          max-width: 700px;
          margin-top: 28px;
          padding: 18px 20px;
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        .ms-inst-title {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 10px;
        }
        .ms-inst-body {
          font-size: 0.82rem;
          color: var(--fg);
          opacity: 0.75;
          line-height: 1.65;
        }
        .ms-inst-body strong { color: var(--accent); opacity: 1; font-weight: 700; }
        .ms-inst-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 0.78rem;
        }
        .ms-inst-table td {
          padding: 4px 8px;
          border-bottom: 1px solid rgba(var(--accent-rgb), 0.08);
          vertical-align: top;
        }
        .ms-inst-table td:first-child {
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          white-space: nowrap;
          width: 130px;
        }

        /* ── Footer ─────────────────────────────────────────────────────────── */
        .ms-footer {
          margin-top: 32px;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.4;
          color: var(--fg);
          text-align: center;
        }

        /* ── Responsive tweaks ──────────────────────────────────────────────── */
        @media (max-width: 390px) {
          .ms-title { font-size: 1.9rem; }
          .ms-cell { width: 30px; height: 30px; min-width: 30px; min-height: 30px; font-size: 0.78rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ms-cell, .ms-board.won .ms-cell.revealed,
          .ms-loss-tint, .ms-banner { animation: none !important; }
        }
      `}</style>

      <main
        className={`ms-page${immersive ? " immersive" : ""}`}
        data-no-ptr
        ref={shellRef}
      >
        {/* ── Top row ─────────────────────────────────────────────────────── */}
        <div className="ms-top-row">
          {immersive ? (
            <span />
          ) : (
            <Link href="/game" className="ms-back-link">
              <ArrowLeft size={15} strokeWidth={2.4} /> Games
            </Link>
          )}
          <button type="button" className="ms-fs-btn" onClick={toggleImmersive}>
            {immersive
              ? <Minimize2 size={15} strokeWidth={2.4} />
              : <Maximize2 size={15} strokeWidth={2.4} />
            }
            {immersive ? "Exit" : "Fullscreen"}
          </button>
        </div>

        {/* ── Title ───────────────────────────────────────────────────────── */}
        <div className="ms-title-row">
          <div className="ms-title">MINESWEEPER</div>
          <div className="ms-subtitle">◈ By DummVinci · PTTS Praxis</div>
        </div>

        {/* ── Difficulty picker ────────────────────────────────────────────── */}
        <div className="ms-diff-row">
          {(["easy", "medium", "expert"] as Difficulty[]).map(d => (
            <button
              key={d}
              type="button"
              className={`ms-diff-btn${difficulty === d ? " active" : ""}`}
              onClick={() => dispatch({ type: "SET_DIFFICULTY", difficulty: d })}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
              &nbsp;
              <span style={{ fontWeight: 400, opacity: 0.7, fontSize: "0.7rem" }}>
                {DIFF_CONFIG[d].cols}×{DIFF_CONFIG[d].rows} · {DIFF_CONFIG[d].mines}💣
              </span>
            </button>
          ))}
        </div>

        {/* ── Status bar ──────────────────────────────────────────────────── */}
        <div className="ms-status-row">
          <div className="ms-stat-pair">
            <span className="label">Mines</span>
            <span>🚩 {mineCounter}</span>
          </div>
          <div className="ms-stat-pair">
            <span className="label">Time</span>
            <span>⏱ {formatTime(elapsed)}</span>
          </div>
          {bestTime !== null && (
            <div className="ms-best-note">
              Best: {formatTime(bestTime)}
            </div>
          )}
          <button
            type="button"
            className="ms-new-btn"
            onClick={() => dispatch({ type: "NEW_GAME" })}
          >
            New Game
          </button>
        </div>

        {/* ── Board ───────────────────────────────────────────────────────── */}
        <div className="ms-board-scroll">
          <div className="ms-board-outer">
            <div
              className={`ms-board${status === "won" ? " won" : ""}`}
              style={{
                gridTemplateColumns: `repeat(${DIFF_CONFIG[difficulty].cols}, 32px)`,
              }}
            >
              {cells.map((row, r) =>
                row.map((cell, c) => {
                  let cellClass = "ms-cell";
                  let content: React.ReactNode = null;

                  if (cell.isRevealed) {
                    if (cell.isMine) {
                      cellClass += cell.isHit ? " mine-hit" : " mine-reveal";
                      content = "💣";
                    } else {
                      cellClass += " revealed";
                      if (cell.adjacent > 0) {
                        content = (
                          <span style={{ color: NUM_COLORS[cell.adjacent] ?? "#6b7280" }}>
                            {cell.adjacent}
                          </span>
                        );
                      }
                    }
                  } else if (cell.isFlagged) {
                    cellClass += " flagged";
                    content = "🚩";
                  } else {
                    cellClass += " unrevealed";
                  }

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={cellClass}
                      onPointerDown={() => handleCellPointerDown(r, c)}
                      onPointerUp={() => handleCellPointerUp(r, c)}
                      onPointerMove={handleCellPointerMove}
                      onPointerCancel={handleCellPointerMove}
                      onContextMenu={e => handleCellContextMenu(e, r, c)}
                    >
                      {content}
                    </div>
                  );
                })
              )}
            </div>
            {/* Red tint overlay on loss */}
            {status === "lost" && <div className="ms-loss-tint" />}
          </div>
        </div>

        {/* ── Result banner ───────────────────────────────────────────────── */}
        {status === "won" && (
          <div className="ms-banner won-banner">
            You cleared the field! &nbsp;⏱ {formatTime(elapsed)}
            {bestTime !== null && bestTime === elapsed && " · New Best!"}
          </div>
        )}
        {status === "lost" && (
          <div className="ms-banner lost-banner">
            💥 Boom! Hit a mine — better luck next time.
          </div>
        )}

        {/* ── Instructions ────────────────────────────────────────────────── */}
        <div className="ms-instructions">
          <div className="ms-inst-title">◈ How to play</div>
          <div className="ms-inst-body">
            Reveal every safe cell without triggering a mine. Numbers show how many mines
            touch that cell. Use flags to mark suspected mines.{" "}
            <strong>First click is always safe.</strong>
          </div>
          <table className="ms-inst-table">
            <tbody>
              <tr>
                <td>Desktop · Reveal</td>
                <td>Left-click on an unrevealed cell</td>
              </tr>
              <tr>
                <td>Desktop · Flag</td>
                <td>Right-click on an unrevealed cell</td>
              </tr>
              <tr>
                <td>Mobile · Reveal</td>
                <td>Tap an unrevealed cell</td>
              </tr>
              <tr>
                <td>Mobile · Flag</td>
                <td>Long-press (≥ 500 ms) on a cell</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ms-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
