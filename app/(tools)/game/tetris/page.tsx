"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLS = 10;
const ROWS = 20;
const BEST_KEY = "ptts_tetris_best";

// Gravity interval (ms) per level — floor 50ms, subtract 80ms per level
const BASE_INTERVAL = 800;
const LEVEL_DECREMENT = 80;
const MIN_INTERVAL = 50;

function gravityInterval(level: number): number {
  return Math.max(MIN_INTERVAL, BASE_INTERVAL - level * LEVEL_DECREMENT);
}

// Score multipliers per lines cleared in one drop
const LINE_MULTIPLIER = [0, 1, 3, 5, 8];

// ─── Tetromino definitions ────────────────────────────────────────────────────

type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

interface TetrominoDef {
  color: string;
  brightColor: string;
  // 4 rotation states, each is array of [row, col] offsets from pivot
  rotations: [number, number][][];
}

const TETROMINOES: Record<TetrominoType, TetrominoDef> = {
  I: {
    color: "#00c8d4",
    brightColor: "#1ae6f4",
    rotations: [
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [1, 3],
      ],
      [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ],
      [
        [2, 0],
        [2, 1],
        [2, 2],
        [2, 3],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ],
    ],
  },
  O: {
    color: "#f0c040",
    brightColor: "#ffd84d",
    rotations: [
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ],
    ],
  },
  T: {
    color: "#a040d0",
    brightColor: "#bc55ed",
    rotations: [
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [1, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 1],
      ],
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
    ],
  },
  S: {
    color: "#40c060",
    brightColor: "#55d978",
    rotations: [
      [
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
      [
        [1, 1],
        [1, 2],
        [2, 0],
        [2, 1],
      ],
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ],
    ],
  },
  Z: {
    color: "#e04040",
    brightColor: "#f55555",
    rotations: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
      ],
      [
        [1, 0],
        [1, 1],
        [2, 1],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
      ],
    ],
  },
  J: {
    color: "#4080e0",
    brightColor: "#5595f7",
    rotations: [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 0],
        [2, 0],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
      ],
      [
        [0, 1],
        [1, 1],
        [2, 0],
        [2, 1],
      ],
    ],
  },
  L: {
    color: "#e08020",
    brightColor: "#f59535",
    rotations: [
      [
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
      ],
      [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ],
      [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 0],
      ],
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ],
    ],
  },
};

const TETROMINO_TYPES: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];

function randomTetromino(): TetrominoType {
  return TETROMINO_TYPES[Math.floor(Math.random() * TETROMINO_TYPES.length)];
}

// ─── Types ────────────────────────────────────────────────────────────────────

// Board is a 2D array: null = empty, TetrominoType = locked cell
type Board = (TetrominoType | null)[][];

interface ActivePiece {
  type: TetrominoType;
  row: number; // top-left row offset of the bounding box
  col: number; // top-left col offset
  rotation: number; // 0–3
}

interface GameState {
  board: Board;
  active: ActivePiece | null;
  next: TetrominoType;
  score: number;
  best: number;
  lines: number;
  level: number;
  phase: "playing" | "paused" | "over" | "idle";
  lockCountdown: boolean; // true when piece is on the ground and lock timer is running
}

// ─── Board helpers ────────────────────────────────────────────────────────────

function emptyBoard(): Board {
  return Array.from({ length: ROWS }, () => Array<TetrominoType | null>(COLS).fill(null));
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

/** Get absolute cell positions for a piece given its state. */
function getCells(piece: ActivePiece): [number, number][] {
  const offsets = TETROMINOES[piece.type].rotations[piece.rotation];
  return offsets.map(([dr, dc]) => [piece.row + dr, piece.col + dc]);
}

/** Check whether a piece position is valid (no collision, within bounds). */
function isValid(board: Board, piece: ActivePiece): boolean {
  const cells = getCells(piece);
  for (const [r, c] of cells) {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return false;
    if (r >= 0 && board[r][c] !== null) return false;
  }
  return true;
}

/** Lock the active piece onto the board. */
function lockPiece(board: Board, piece: ActivePiece): Board {
  const next = cloneBoard(board);
  const cells = getCells(piece);
  for (const [r, c] of cells) {
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      next[r][c] = piece.type;
    }
  }
  return next;
}

/** Clear completed rows, return new board + count of cleared lines. */
function clearLines(board: Board): { board: Board; cleared: number } {
  const remaining = board.filter((row) => row.some((cell) => cell === null));
  const cleared = ROWS - remaining.length;
  const filler = Array.from({ length: cleared }, () =>
    Array<TetrominoType | null>(COLS).fill(null)
  );
  return { board: [...filler, ...remaining], cleared };
}

/** Compute the ghost piece (where the piece would land). */
function ghostPiece(board: Board, piece: ActivePiece): ActivePiece {
  let ghost = { ...piece };
  while (isValid(board, { ...ghost, row: ghost.row + 1 })) {
    ghost = { ...ghost, row: ghost.row + 1 };
  }
  return ghost;
}

/** Spawn a new piece at the top. Returns null if spawn position is blocked (game over). */
function spawnPiece(type: TetrominoType): ActivePiece {
  // Spawn centred, slightly above visible area
  return { type, row: 0, col: Math.floor((COLS - 4) / 2), rotation: 0 };
}

/** SRS wall-kick offsets for J, L, S, T, Z (JLSTZ) pieces.
 *  Index: [fromRotation][kickIndex] = [rowOffset, colOffset]
 *  We test 5 kick offsets for each rotation transition. */
const WALL_KICKS_JLSTZ: Record<string, [number, number][]> = {
  "0->1": [[0, 0], [0, -1], [-1, -1], [2, 0], [2, -1]],
  "1->0": [[0, 0], [0, 1], [1, 1], [-2, 0], [-2, 1]],
  "1->2": [[0, 0], [0, 1], [1, 1], [-2, 0], [-2, 1]],
  "2->1": [[0, 0], [0, -1], [-1, -1], [2, 0], [2, -1]],
  "2->3": [[0, 0], [0, 1], [-1, 1], [2, 0], [2, 1]],
  "3->2": [[0, 0], [0, -1], [1, -1], [-2, 0], [-2, -1]],
  "3->0": [[0, 0], [0, -1], [1, -1], [-2, 0], [-2, -1]],
  "0->3": [[0, 0], [0, 1], [-1, 1], [2, 0], [2, 1]],
};

const WALL_KICKS_I: Record<string, [number, number][]> = {
  "0->1": [[0, 0], [0, -2], [0, 1], [1, -2], [-2, 1]],
  "1->0": [[0, 0], [0, 2], [0, -1], [-1, 2], [2, -1]],
  "1->2": [[0, 0], [0, -1], [0, 2], [-2, -1], [1, 2]],
  "2->1": [[0, 0], [0, 1], [0, -2], [2, 1], [-1, -2]],
  "2->3": [[0, 0], [0, 2], [0, -1], [1, 2], [-2, -1]],
  "3->2": [[0, 0], [0, -2], [0, 1], [-1, -2], [2, 1]],
  "3->0": [[0, 0], [0, 1], [0, -2], [-2, 1], [1, -2]],
  "0->3": [[0, 0], [0, -1], [0, 2], [2, -1], [-1, 2]],
};

/** Attempt a clockwise rotation with SRS wall kicks. Returns new piece or null on failure. */
function rotateCW(board: Board, piece: ActivePiece): ActivePiece | null {
  const nextRot = (piece.rotation + 1) % 4 as 0 | 1 | 2 | 3;
  const key = `${piece.rotation}->${nextRot}`;
  const kicks =
    piece.type === "I"
      ? WALL_KICKS_I[key] ?? [[0, 0]]
      : piece.type === "O"
      ? [[0, 0]]
      : WALL_KICKS_JLSTZ[key] ?? [[0, 0]];

  for (const [dr, dc] of kicks) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: nextRot,
      row: piece.row + dr,
      col: piece.col + dc,
    };
    if (isValid(board, candidate)) return candidate;
  }
  return null;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "NEW_GAME" }
  | { type: "SET_BEST"; best: number }
  | { type: "TICK" }           // gravity tick — piece falls one row
  | { type: "LOCK" }           // lock delay expired — lock the piece
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "SOFT_DROP" }      // move down once, +1 score
  | { type: "HARD_DROP" }      // drop to ghost, +2 per row
  | { type: "ROTATE_CW" }
  | { type: "PAUSE_TOGGLE" };

function buildInitialState(): GameState {
  return {
    board: emptyBoard(),
    active: null,
    next: randomTetromino(),
    score: 0,
    best: 0,
    lines: 0,
    level: 0,
    phase: "idle",
    lockCountdown: false,
  };
}

function startGame(state: GameState): GameState {
  const firstType = randomTetromino();
  const active = spawnPiece(firstType);
  return {
    ...buildInitialState(),
    best: state.best,
    active,
    next: randomTetromino(),
    phase: "playing",
    lockCountdown: false,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return startGame(state);

    case "SET_BEST":
      return { ...state, best: action.best };

    case "PAUSE_TOGGLE": {
      if (state.phase === "over" || state.phase === "idle") return state;
      return {
        ...state,
        phase: state.phase === "paused" ? "playing" : "paused",
      };
    }

    case "TICK": {
      if (state.phase !== "playing" || !state.active) return state;
      const movedDown: ActivePiece = { ...state.active, row: state.active.row + 1 };

      if (isValid(state.board, movedDown)) {
        // Piece successfully moved down — reset lock countdown
        return { ...state, active: movedDown, lockCountdown: false };
      }

      // Cannot move down — signal lock countdown start (handled externally via LOCK action)
      if (!state.lockCountdown) {
        return { ...state, lockCountdown: true };
      }
      // If lockCountdown was already true and TICK fires again before LOCK,
      // just stay — LOCK will handle the actual lock.
      return state;
    }

    case "LOCK": {
      if (state.phase !== "playing" || !state.active) return state;

      // Double-check the piece is still grounded (player might have moved it)
      const pieceBelow: ActivePiece = { ...state.active, row: state.active.row + 1 };
      if (isValid(state.board, pieceBelow)) {
        // Piece is no longer on the ground — cancel lock, keep falling
        return { ...state, lockCountdown: false };
      }

      // Lock piece
      const newBoard = lockPiece(state.board, state.active);
      const { board: clearedBoard, cleared } = clearLines(newBoard);

      const newLines = state.lines + cleared;
      const newLevel = Math.floor(newLines / 10);
      const scoreGain = cleared > 0 ? 100 * LINE_MULTIPLIER[cleared] * (newLevel + 1) : 0;
      const newScore = state.score + scoreGain;
      const newBest = Math.max(state.best, newScore);

      // Spawn next piece
      const nextActive = spawnPiece(state.next);
      const nextNext = randomTetromino();

      // Game over check: spawned piece collides immediately
      if (!isValid(clearedBoard, nextActive)) {
        return {
          ...state,
          board: clearedBoard,
          active: null,
          score: newScore,
          best: newBest,
          lines: newLines,
          level: newLevel,
          phase: "over",
          lockCountdown: false,
        };
      }

      return {
        ...state,
        board: clearedBoard,
        active: nextActive,
        next: nextNext,
        score: newScore,
        best: newBest,
        lines: newLines,
        level: newLevel,
        phase: "playing",
        lockCountdown: false,
      };
    }

    case "MOVE_LEFT": {
      if (state.phase !== "playing" || !state.active) return state;
      const moved: ActivePiece = { ...state.active, col: state.active.col - 1 };
      if (!isValid(state.board, moved)) return state;
      // Moving resets lock countdown
      return { ...state, active: moved, lockCountdown: false };
    }

    case "MOVE_RIGHT": {
      if (state.phase !== "playing" || !state.active) return state;
      const moved: ActivePiece = { ...state.active, col: state.active.col + 1 };
      if (!isValid(state.board, moved)) return state;
      return { ...state, active: moved, lockCountdown: false };
    }

    case "SOFT_DROP": {
      if (state.phase !== "playing" || !state.active) return state;
      const moved: ActivePiece = { ...state.active, row: state.active.row + 1 };
      if (!isValid(state.board, moved)) return state;
      return { ...state, active: moved, score: state.score + 1, lockCountdown: false };
    }

    case "HARD_DROP": {
      if (state.phase !== "playing" || !state.active) return state;
      const ghost = ghostPiece(state.board, state.active);
      const dropped = ghost.row - state.active.row;
      const newScore = state.score + dropped * 2;
      // Lock immediately
      const lockedBoard = lockPiece(state.board, ghost);
      const { board: clearedBoard, cleared } = clearLines(lockedBoard);
      const newLines = state.lines + cleared;
      const newLevel = Math.floor(newLines / 10);
      const lineScore = cleared > 0 ? 100 * LINE_MULTIPLIER[cleared] * (newLevel + 1) : 0;
      const finalScore = newScore + lineScore;
      const newBest = Math.max(state.best, finalScore);
      const nextActive = spawnPiece(state.next);
      const nextNext = randomTetromino();
      if (!isValid(clearedBoard, nextActive)) {
        return {
          ...state,
          board: clearedBoard,
          active: null,
          score: finalScore,
          best: newBest,
          lines: newLines,
          level: newLevel,
          phase: "over",
          lockCountdown: false,
        };
      }
      return {
        ...state,
        board: clearedBoard,
        active: nextActive,
        next: nextNext,
        score: finalScore,
        best: newBest,
        lines: newLines,
        level: newLevel,
        phase: "playing",
        lockCountdown: false,
      };
    }

    case "ROTATE_CW": {
      if (state.phase !== "playing" || !state.active) return state;
      const rotated = rotateCW(state.board, state.active);
      if (!rotated) return state;
      // Rotation resets lock countdown
      return { ...state, active: rotated, lockCountdown: false };
    }

    default:
      return state;
  }
}

// ─── Rendering helpers ────────────────────────────────────────────────────────

/** Build a render snapshot: ROWS×COLS of {type, isActive, isGhost} */
interface CellRender {
  type: TetrominoType | null;
  isActive: boolean;
  isGhost: boolean;
}

function buildRenderGrid(
  board: Board,
  active: ActivePiece | null
): CellRender[][] {
  // Start with the locked board
  const grid: CellRender[][] = board.map((row) =>
    row.map((cell) => ({ type: cell, isActive: false, isGhost: false }))
  );

  if (active) {
    // Ghost
    const ghost = ghostPiece(board, active);
    const ghostCells = getCells(ghost);
    for (const [r, c] of ghostCells) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if (!grid[r][c].type) {
          grid[r][c] = { type: active.type, isActive: false, isGhost: true };
        }
      }
    }
    // Active piece (overrides ghost if they overlap)
    const activeCells = getCells(active);
    for (const [r, c] of activeCells) {
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        grid[r][c] = { type: active.type, isActive: true, isGhost: false };
      }
    }
  }

  return grid;
}

/** Build a 4×4 preview grid for the next piece. */
function buildPreviewGrid(type: TetrominoType): (TetrominoType | null)[][] {
  const grid: (TetrominoType | null)[][] = Array.from({ length: 4 }, () =>
    Array(4).fill(null)
  );
  const offsets = TETROMINOES[type].rotations[0];
  for (const [r, c] of offsets) {
    if (r >= 0 && r < 4 && c >= 0 && c < 4) {
      grid[r][c] = type;
    }
  }
  return grid;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TetrisPage() {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState);
  const [immersive, setImmersive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  // Interval refs
  const gravityRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load persisted best
  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved) dispatch({ type: "SET_BEST", best: parseInt(saved, 10) });
  }, []);

  // Persist best score
  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(state.best));
  }, [state.best]);

  // ── Game loop: gravity ──────────────────────────────────────────────────────
  useEffect(() => {
    if (gravityRef.current) {
      clearInterval(gravityRef.current);
      gravityRef.current = null;
    }

    if (state.phase !== "playing") return;

    const interval = gravityInterval(state.level);
    gravityRef.current = setInterval(() => {
      dispatch({ type: "TICK" });
    }, interval);

    return () => {
      if (gravityRef.current) {
        clearInterval(gravityRef.current);
        gravityRef.current = null;
      }
    };
  }, [state.phase, state.level]);

  // ── Lock delay timer ────────────────────────────────────────────────────────
  useEffect(() => {
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    if (state.phase === "playing" && state.lockCountdown) {
      lockTimerRef.current = setTimeout(() => {
        dispatch({ type: "LOCK" });
      }, 500);
    }

    return () => {
      if (lockTimerRef.current) {
        clearTimeout(lockTimerRef.current);
        lockTimerRef.current = null;
      }
    };
  }, [state.phase, state.lockCountdown, state.active]);

  // ── Keyboard controls ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "MOVE_LEFT" });
          break;
        case "ArrowRight":
          e.preventDefault();
          dispatch({ type: "MOVE_RIGHT" });
          break;
        case "ArrowDown":
          e.preventDefault();
          dispatch({ type: "SOFT_DROP" });
          break;
        case "ArrowUp":
        case "x":
        case "X":
          e.preventDefault();
          dispatch({ type: "ROTATE_CW" });
          break;
        case " ":
          e.preventDefault();
          dispatch({ type: "HARD_DROP" });
          break;
        case "p":
        case "P":
          e.preventDefault();
          dispatch({ type: "PAUSE_TOGGLE" });
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Immersive / fullscreen ──────────────────────────────────────────────────
  const enterImmersive = useCallback(() => {
    setImmersive(true);
    const el = shellRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // CSS overlay still applies
      });
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

  // ── Touch / swipe controls ──────────────────────────────────────────────────
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
      const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      touchStartRef.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Threshold for a swipe vs tap
      if (absDx < 12 && absDy < 12) {
        // Tap — check for double tap (hard drop)
        const now = Date.now();
        const sinceLastTap = now - lastTapRef.current;
        if (sinceLastTap < 300) {
          // Double tap
          dispatch({ type: "HARD_DROP" });
          lastTapRef.current = 0;
        } else {
          // Single tap — rotate
          dispatch({ type: "ROTATE_CW" });
          lastTapRef.current = now;
        }
        return;
      }

      // Swipe
      if (absDy > absDx && dy > 20) {
        // Swipe down — soft drop (repeat based on distance)
        const cells = Math.max(1, Math.floor(absDy / 20));
        for (let i = 0; i < cells; i++) dispatch({ type: "SOFT_DROP" });
      } else if (absDx > absDy && absDx > 15) {
        if (dx < 0) dispatch({ type: "MOVE_LEFT" });
        else dispatch({ type: "MOVE_RIGHT" });
      }

      void dt; // suppress unused var
    },
    []
  );

  // ── Build render grid ───────────────────────────────────────────────────────
  // Memoised: cloning the 20×10 board + ghost projection on every render adds
  // up at high gravity (each TICK re-renders), and immersive/score-only updates
  // don't change the board at all.
  const renderGrid = useMemo(
    () => buildRenderGrid(state.board, state.active),
    [state.board, state.active]
  );
  const previewGrid = useMemo(() => buildPreviewGrid(state.next), [state.next]);

  // ── Cell colour helper ──────────────────────────────────────────────────────
  function cellBg(cell: CellRender): string {
    if (!cell.type) return "rgba(var(--accent-rgb), 0.06)";
    const def = TETROMINOES[cell.type];
    if (cell.isGhost) return def.color + "40"; // 25% opacity approximation
    if (cell.isActive) return def.brightColor;
    return def.color;
  }

  function cellBorder(cell: CellRender): string {
    if (!cell.type) return "1px solid rgba(var(--accent-rgb), 0.08)";
    const def = TETROMINOES[cell.type];
    if (cell.isGhost) return `1px solid ${def.color}60`;
    return `1px solid ${def.brightColor}80`;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .tetris-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px 40px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        .tetris-page.immersive {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          background: var(--bg);
          overflow-y: auto;
          padding: max(24px, env(safe-area-inset-top)) 16px max(24px, env(safe-area-inset-bottom));
          justify-content: center;
        }
        .tetris-top-row {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }
        .tetris-back-link, .tetris-fs-btn {
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
        .tetris-back-link:hover, .tetris-fs-btn:hover { background: rgba(var(--accent-rgb), 0.16); }
        .tetris-fs-btn:active, .tetris-back-link:active { transform: scale(0.95); }
        .tetris-header {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 16px;
        }
        .tetris-title {
          font-size: 2.6rem;
          font-weight: 900;
          color: var(--accent);
          line-height: 1;
          letter-spacing: -0.03em;
        }
        .tetris-subtitle {
          font-size: 0.72rem;
          color: var(--fg);
          opacity: 0.55;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 2px;
          font-family: var(--font-mono);
        }
        .tetris-score-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .tetris-score-box {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 6px 12px;
          text-align: center;
          min-width: 56px;
        }
        .tetris-score-label {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.55;
          font-family: var(--font-mono);
          color: var(--fg);
        }
        .tetris-score-val {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.2;
        }
        /* Main play area: board + sidebar */
        .tetris-play-area {
          width: 100%;
          max-width: 480px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        /* Board: 10 cols × 20 rows.
           We use a fixed cell size approach so the board has exact proportions. */
        .tetris-board-wrap {
          position: relative;
          flex: 0 0 auto;
          /* Cell size computed via CSS: total width = 10 cells + gaps + padding */
          --cell: clamp(22px, 5.6vw, 30px);
          width: calc(var(--cell) * 10 + 2px * 9 + 8px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 4px;
          background: rgba(var(--accent-rgb), 0.03);
          touch-action: none;
          user-select: none;
        }
        .tetris-board {
          display: grid;
          grid-template-columns: repeat(10, var(--cell));
          grid-template-rows: repeat(20, var(--cell));
          gap: 2px;
        }
        .tetris-cell {
          width: var(--cell);
          height: var(--cell);
          border-radius: 3px;
          box-sizing: border-box;
          transition: background 0.1s ease;
        }
        /* Sidebar */
        .tetris-sidebar {
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 80px;
        }
        .tetris-panel {
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 12px;
        }
        .tetris-panel-label {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          opacity: 0.55;
          font-family: var(--font-mono);
          color: var(--fg);
          margin-bottom: 8px;
        }
        .tetris-preview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          aspect-ratio: 1;
        }
        .tetris-preview-cell {
          aspect-ratio: 1;
          border-radius: 3px;
        }
        /* Buttons row */
        .tetris-btn-row {
          width: 100%;
          max-width: 480px;
          display: flex;
          gap: 10px;
          margin-top: 14px;
          justify-content: flex-start;
        }
        .tetris-btn {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          padding: 9px 20px;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          color: var(--fg);
          transition: background 0.3s ease, transform 0.22s ease;
          white-space: nowrap;
        }
        .tetris-btn:hover { background: rgba(var(--accent-rgb), 0.16); }
        .tetris-btn:active { transform: scale(0.96); }
        .tetris-btn-primary {
          background: var(--accent);
          color: #fff;
          border-color: transparent;
        }
        .tetris-btn-primary:hover { opacity: 0.88; background: var(--accent); }
        /* Overlay */
        .tetris-overlay {
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
          background: rgba(var(--accent-rgb), 0.10);
          animation: tetrisOverlayIn 0.5s ease;
          z-index: 10;
        }
        @keyframes tetrisOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .tetris-overlay-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.02em;
          text-align: center;
        }
        .tetris-overlay-sub {
          font-size: 0.82rem;
          color: var(--fg);
          opacity: 0.65;
          font-family: var(--font-mono);
          text-align: center;
        }
        .tetris-overlay-btn {
          padding: 10px 24px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.82rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: opacity 0.3s ease, transform 0.22s ease;
          font-family: var(--font-display), sans-serif;
        }
        .tetris-overlay-btn-primary { background: var(--accent); color: #fff; }
        .tetris-overlay-btn-secondary { background: var(--glass-border); color: var(--fg); }
        .tetris-overlay-btn:hover { opacity: 0.85; }
        .tetris-overlay-btn:active { transform: scale(0.96); }
        /* Instructions */
        .tetris-instructions {
          width: 100%;
          max-width: 480px;
          margin-top: 24px;
          padding: 18px 20px;
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
        }
        .tetris-inst-title {
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 12px;
        }
        .tetris-inst-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 16px;
        }
        .tetris-inst-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .tetris-inst-key {
          font-size: 0.72rem;
          font-family: var(--font-mono);
          background: rgba(var(--accent-rgb), 0.10);
          border: 1px solid var(--glass-border);
          border-radius: 4px;
          padding: 1px 6px;
          white-space: nowrap;
          color: var(--accent);
          font-weight: 700;
          flex-shrink: 0;
        }
        .tetris-inst-desc {
          font-size: 0.78rem;
          color: var(--fg);
          opacity: 0.70;
        }
        /* Footer */
        .tetris-footer {
          margin-top: 32px;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.4;
          color: var(--fg);
          text-align: center;
        }
        /* Immersive trims non-essential chrome */
        .tetris-page.immersive .tetris-instructions,
        .tetris-page.immersive .tetris-footer { display: none; }
        /* Mobile-first tweaks */
        @media (max-width: 390px) {
          .tetris-title { font-size: 2rem; }
          .tetris-score-row { gap: 5px; }
          .tetris-score-box { min-width: 44px; padding: 5px 8px; }
          .tetris-score-val { font-size: 0.9rem; }
          .tetris-inst-grid { grid-template-columns: 1fr; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tetris-overlay { animation: none !important; }
          .tetris-cell { transition: none !important; }
        }
      `}</style>

      <main
        className={`tetris-page${immersive ? " immersive" : ""}`}
        data-no-ptr
        ref={shellRef}
      >
        {/* Top row */}
        <div className="tetris-top-row">
          {immersive ? (
            <span />
          ) : (
            <Link href="/game" className="tetris-back-link">
              <ArrowLeft size={15} strokeWidth={2.4} /> Games
            </Link>
          )}
          <button
            type="button"
            className="tetris-fs-btn"
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

        {/* Header */}
        <div className="tetris-header">
          <div>
            <div className="tetris-title">TETRIS</div>
            <div className="tetris-subtitle">◈ By DummVinci · PTTS Praxis</div>
          </div>
          <div className="tetris-score-row">
            <div className="tetris-score-box">
              <div className="tetris-score-label">Score</div>
              <div className="tetris-score-val">{state.score}</div>
            </div>
            <div className="tetris-score-box">
              <div className="tetris-score-label">Best</div>
              <div className="tetris-score-val">{state.best}</div>
            </div>
            <div className="tetris-score-box">
              <div className="tetris-score-label">Level</div>
              <div className="tetris-score-val">{state.level}</div>
            </div>
            <div className="tetris-score-box">
              <div className="tetris-score-label">Lines</div>
              <div className="tetris-score-val">{state.lines}</div>
            </div>
          </div>
        </div>

        {/* Play area */}
        <div className="tetris-play-area">
          {/* Board */}
          <div
            className="tetris-board-wrap"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="tetris-board">
              {renderGrid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="tetris-cell"
                    style={{
                      background: cellBg(cell),
                      border: cellBorder(cell),
                    }}
                  />
                ))
              )}
            </div>

            {/* Paused overlay */}
            {state.phase === "paused" && (
              <div className="tetris-overlay">
                <div className="tetris-overlay-title">Paused</div>
                <div className="tetris-overlay-sub">Press P to resume</div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="tetris-overlay-btn tetris-overlay-btn-primary"
                    onClick={() => dispatch({ type: "PAUSE_TOGGLE" })}
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    className="tetris-overlay-btn tetris-overlay-btn-secondary"
                    onClick={() => dispatch({ type: "NEW_GAME" })}
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}

            {/* Game over overlay */}
            {state.phase === "over" && (
              <div className="tetris-overlay">
                <div className="tetris-overlay-title">Game Over</div>
                <div className="tetris-overlay-sub">
                  Score: {state.score} · Lines: {state.lines}
                </div>
                <button
                  type="button"
                  className="tetris-overlay-btn tetris-overlay-btn-primary"
                  onClick={() => dispatch({ type: "NEW_GAME" })}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Idle (not started) overlay */}
            {state.phase === "idle" && (
              <div className="tetris-overlay">
                <div className="tetris-overlay-title">TETRIS</div>
                <div className="tetris-overlay-sub">Ready to play?</div>
                <button
                  type="button"
                  className="tetris-overlay-btn tetris-overlay-btn-primary"
                  onClick={() => dispatch({ type: "NEW_GAME" })}
                >
                  Start Game
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="tetris-sidebar">
            {/* Next piece preview */}
            <div className="tetris-panel">
              <div className="tetris-panel-label">Next</div>
              <div className="tetris-preview">
                {previewGrid.map((row, r) =>
                  row.map((cell, c) => (
                    <div
                      key={`prev-${r}-${c}`}
                      className="tetris-preview-cell"
                      style={{
                        background: cell
                          ? TETROMINOES[cell].color
                          : "rgba(var(--accent-rgb), 0.06)",
                        border: cell
                          ? `1px solid ${TETROMINOES[cell].brightColor}80`
                          : "1px solid rgba(var(--accent-rgb), 0.08)",
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Level info panel */}
            <div className="tetris-panel">
              <div className="tetris-panel-label">Speed</div>
              <div
                style={{
                  fontSize: "0.78rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--fg)",
                  opacity: 0.75,
                  lineHeight: 1.5,
                }}
              >
                {gravityInterval(state.level)}
                <span
                  style={{ fontSize: "0.65rem", opacity: 0.55, marginLeft: 2 }}
                >
                  ms
                </span>
                <br />
                <span style={{ fontSize: "0.65rem", opacity: 0.55 }}>
                  Lv {state.level} interval
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="tetris-btn-row">
          <button
            type="button"
            className="tetris-btn tetris-btn-primary"
            onClick={() => dispatch({ type: "NEW_GAME" })}
          >
            New Game
          </button>
          <button
            type="button"
            className="tetris-btn"
            onClick={() => dispatch({ type: "PAUSE_TOGGLE" })}
            disabled={state.phase === "over" || state.phase === "idle"}
          >
            {state.phase === "paused" ? "Resume" : "Pause"}
          </button>
        </div>

        {/* Instructions */}
        <div className="tetris-instructions">
          <div className="tetris-inst-title">◈ Controls</div>
          <div className="tetris-inst-grid">
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">← →</span>
              <span className="tetris-inst-desc">Move left / right</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">↑ / X</span>
              <span className="tetris-inst-desc">Rotate clockwise</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">↓</span>
              <span className="tetris-inst-desc">Soft drop (+1 pt/cell)</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">Space</span>
              <span className="tetris-inst-desc">Hard drop (+2 pt/cell)</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">P</span>
              <span className="tetris-inst-desc">Pause / Resume</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">Tap</span>
              <span className="tetris-inst-desc">Rotate (mobile)</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">Swipe ↕←→</span>
              <span className="tetris-inst-desc">Move / soft drop</span>
            </div>
            <div className="tetris-inst-row">
              <span className="tetris-inst-key">Double-tap</span>
              <span className="tetris-inst-desc">Hard drop (mobile)</span>
            </div>
          </div>
        </div>

        <div className="tetris-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
