"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Maximize2, Minimize2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

interface Card {
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

type SourceType = "stock" | "waste" | "tableau" | "foundation";

interface Selection {
  source: SourceType;
  pileIndex: number;   // tableau pile index (0-6), foundation index (0-3), or 0 for stock/waste
  cardIndex: number;   // index within pile; for waste/stock = last card
}

interface GameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];   // 4 piles, indexed 0-3 (♠ ♥ ♦ ♣)
  tableau: Card[][];       // 7 piles
  score: number;
  best: number;
  won: boolean;
  selection: Selection | null;
  undoSnapshot: Omit<GameState, "best" | "undoSnapshot"> | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const FOUNDATION_SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const BEST_KEY = "ptts_solitaire_best";

const RED_SUITS: Set<Suit> = new Set(["♥", "♦"]);
const isRed = (suit: Suit) => RED_SUITS.has(suit);

const RANK_LABELS: Record<Rank, string> = {
  1: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7",
  8: "8", 9: "9", 10: "10", 11: "J", 12: "Q", 13: "K",
};

// ─── Deck & Shuffle ───────────────────────────────────────────────────────────

function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let r = 1; r <= 13; r++) {
      deck.push({ suit, rank: r as Rank, faceUp: false });
    }
  }
  return deck;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Deal ─────────────────────────────────────────────────────────────────────

function dealGame(best: number): GameState {
  const deck = shuffle(buildDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);

  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++] };
      card.faceUp = row === col; // only top card face-up
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));

  return {
    stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau,
    score: 0,
    best,
    won: false,
    selection: null,
    undoSnapshot: null,
  };
}

// ─── Move Validation ──────────────────────────────────────────────────────────

function canPlaceOnTableau(card: Card, targetPile: Card[]): boolean {
  if (targetPile.length === 0) {
    return card.rank === 13; // only King on empty
  }
  const top = targetPile[targetPile.length - 1];
  if (!top.faceUp) return false;
  return (
    isRed(card.suit) !== isRed(top.suit) && // opposite colour
    card.rank === top.rank - 1              // one rank lower
  );
}

function canPlaceOnFoundation(card: Card, foundationPile: Card[]): boolean {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Ace starts foundation
  }
  const top = foundationPile[foundationPile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

// Find which foundation index matches a suit
function foundationIndexForSuit(suit: Suit): number {
  return FOUNDATION_SUITS.indexOf(suit);
}

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

function snapshot(state: GameState): Omit<GameState, "best" | "undoSnapshot"> {
  return {
    stock: state.stock.map(c => ({ ...c })),
    waste: state.waste.map(c => ({ ...c })),
    foundations: state.foundations.map(p => p.map(c => ({ ...c }))),
    tableau: state.tableau.map(p => p.map(c => ({ ...c }))),
    score: state.score,
    won: state.won,
    selection: state.selection ? { ...state.selection } : null,
  };
}

function restoreSnapshot(
  prev: Omit<GameState, "best" | "undoSnapshot">,
  best: number,
): GameState {
  return {
    ...prev,
    best,
    undoSnapshot: null,
    selection: null,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "NEW_GAME" }
  | { type: "SET_BEST"; best: number }
  | { type: "CLICK_STOCK" }
  | { type: "SELECT"; sel: Selection }
  | { type: "DESELECT" }
  | { type: "MOVE_TO_TABLEAU"; pileIndex: number }
  | { type: "MOVE_TO_FOUNDATION"; foundationIndex: number }
  | { type: "AUTO_MOVE_TO_FOUNDATION"; source: SourceType; pileIndex: number; cardIndex: number }
  | { type: "UNDO" };

function getSelectedCards(state: GameState, sel: Selection): Card[] {
  switch (sel.source) {
    case "waste":
      return state.waste.length ? [state.waste[state.waste.length - 1]] : [];
    case "tableau":
      return state.tableau[sel.pileIndex].slice(sel.cardIndex);
    case "foundation": {
      const fp = state.foundations[sel.pileIndex];
      return fp.length ? [fp[fp.length - 1]] : [];
    }
    default:
      return [];
  }
}

function checkWin(foundations: Card[][]): boolean {
  return foundations.every(p => p.length === 13);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "NEW_GAME":
      return dealGame(state.best);

    case "SET_BEST":
      return { ...state, best: action.best };

    case "UNDO": {
      if (!state.undoSnapshot) return state;
      return restoreSnapshot(state.undoSnapshot, state.best);
    }

    case "CLICK_STOCK": {
      const snap = snapshot(state);
      if (state.stock.length === 0) {
        // Recycle waste back to stock
        if (state.waste.length === 0) return state;
        const newStock = [...state.waste].reverse().map(c => ({ ...c, faceUp: false }));
        return { ...state, stock: newStock, waste: [], selection: null, undoSnapshot: snap };
      }
      // Flip top card of stock to waste
      const newStock = [...state.stock];
      const card = { ...newStock.pop()!, faceUp: true };
      return { ...state, stock: newStock, waste: [...state.waste, card], selection: null, undoSnapshot: snap };
    }

    case "SELECT":
      return { ...state, selection: action.sel };

    case "DESELECT":
      return { ...state, selection: null };

    case "MOVE_TO_TABLEAU": {
      const { selection } = state;
      if (!selection) return state;
      const cards = getSelectedCards(state, selection);
      if (!cards.length) return { ...state, selection: null };

      const targetPile = state.tableau[action.pileIndex];
      if (!canPlaceOnTableau(cards[0], targetPile)) {
        return { ...state, selection: null }; // invalid — deselect
      }

      const snap = snapshot(state);
      let newState = { ...state, undoSnapshot: snap };
      let scoreGain = 0;

      // Remove cards from source
      if (selection.source === "waste") {
        newState = { ...newState, waste: state.waste.slice(0, -1) };
        scoreGain += 3; // waste-to-tableau
      } else if (selection.source === "tableau") {
        const srcPile = [...state.tableau[selection.pileIndex]];
        srcPile.splice(selection.cardIndex);
        // Flip newly exposed top card
        if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
          srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
          scoreGain += 5; // flip bonus
        }
        const newTab = [...newState.tableau];
        newTab[selection.pileIndex] = srcPile;
        newState = { ...newState, tableau: newTab };
      } else if (selection.source === "foundation") {
        const srcFnd = [...state.foundations[selection.pileIndex]];
        srcFnd.pop();
        const newFnd = [...newState.foundations];
        newFnd[selection.pileIndex] = srcFnd;
        newState = { ...newState, foundations: newFnd };
        scoreGain -= 15; // penalty for moving off foundation
      }

      // Place cards on tableau
      const newTab2 = [...newState.tableau];
      newTab2[action.pileIndex] = [...targetPile, ...cards.map(c => ({ ...c, faceUp: true }))];
      const newScore = Math.max(0, newState.score + scoreGain);
      const newBest = Math.max(state.best, newScore);

      return { ...newState, tableau: newTab2, score: newScore, best: newBest, selection: null };
    }

    case "MOVE_TO_FOUNDATION": {
      const { selection } = state;
      if (!selection) return state;
      const cards = getSelectedCards(state, selection);
      if (cards.length !== 1) return { ...state, selection: null }; // only single card to foundation

      const card = cards[0];
      const fndPile = state.foundations[action.foundationIndex];
      if (!canPlaceOnFoundation(card, fndPile)) {
        return { ...state, selection: null };
      }

      const snap = snapshot(state);
      let newState = { ...state, undoSnapshot: snap };
      let scoreGain = 10; // card to foundation

      // Remove from source
      if (selection.source === "waste") {
        newState = { ...newState, waste: state.waste.slice(0, -1) };
      } else if (selection.source === "tableau") {
        const srcPile = [...state.tableau[selection.pileIndex]];
        srcPile.pop();
        if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
          srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
          scoreGain += 5;
        }
        const newTab = [...newState.tableau];
        newTab[selection.pileIndex] = srcPile;
        newState = { ...newState, tableau: newTab };
      }

      // Place on foundation
      const newFnd = [...newState.foundations];
      newFnd[action.foundationIndex] = [...fndPile, { ...card, faceUp: true }];

      const newScore = Math.max(0, newState.score + scoreGain);
      const newBest = Math.max(state.best, newScore);
      const won = checkWin(newFnd);

      return { ...newState, foundations: newFnd, score: newScore, best: newBest, won, selection: null };
    }

    case "AUTO_MOVE_TO_FOUNDATION": {
      // Find the right card
      let card: Card | null = null;
      if (action.source === "waste" && state.waste.length > 0) {
        card = state.waste[state.waste.length - 1];
      } else if (action.source === "tableau") {
        const pile = state.tableau[action.pileIndex];
        if (pile.length > 0 && pile[pile.length - 1].faceUp) {
          card = pile[pile.length - 1];
        }
      } else if (action.source === "foundation") {
        const pile = state.foundations[action.pileIndex];
        if (pile.length > 0) card = pile[pile.length - 1];
      }

      if (!card) return state;

      const fndIdx = foundationIndexForSuit(card.suit);
      const fndPile = state.foundations[fndIdx];
      if (!canPlaceOnFoundation(card, fndPile)) return state;

      const snap = snapshot(state);
      let newState = { ...state, undoSnapshot: snap };
      let scoreGain = 10;

      if (action.source === "waste") {
        newState = { ...newState, waste: state.waste.slice(0, -1) };
      } else if (action.source === "tableau") {
        const srcPile = [...state.tableau[action.pileIndex]];
        srcPile.pop();
        if (srcPile.length > 0 && !srcPile[srcPile.length - 1].faceUp) {
          srcPile[srcPile.length - 1] = { ...srcPile[srcPile.length - 1], faceUp: true };
          scoreGain += 5;
        }
        const newTab = [...newState.tableau];
        newTab[action.pileIndex] = srcPile;
        newState = { ...newState, tableau: newTab };
      }

      const newFnd = [...newState.foundations];
      newFnd[fndIdx] = [...fndPile, { ...card, faceUp: true }];

      const newScore = Math.max(0, newState.score + scoreGain);
      const newBest = Math.max(state.best, newScore);
      const won = checkWin(newFnd);

      return { ...newState, foundations: newFnd, score: newScore, best: newBest, won, selection: null };
    }

    default:
      return state;
  }
}

// ─── Card Component ───────────────────────────────────────────────────────────

interface CardProps {
  card: Card;
  selected?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  onDoubleClick?: () => void;
  cardWidth: number;
}

function CardView({ card, selected, style, onClick, onDoubleClick, cardWidth }: CardProps) {
  const cardHeight = Math.round(cardWidth * 1.4);
  const isRedSuit = isRed(card.suit);
  const rankLabel = RANK_LABELS[card.rank];

  if (!card.faceUp) {
    return (
      <div
        className="card card-back"
        style={{
          width: cardWidth,
          height: cardHeight,
          ...(selected ? { boxShadow: "0 0 0 2px var(--accent), 0 4px 12px rgba(var(--accent-rgb),0.4)" } : {}),
          ...style,
        }}
        onClick={onClick}
      />
    );
  }

  return (
    <div
      className={`card card-face${selected ? " card-selected" : ""}${isRedSuit ? " card-red" : " card-black"}`}
      style={{ width: cardWidth, height: cardHeight, ...style }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className="card-corner card-corner-tl">
        <span className="card-rank-sm">{rankLabel}</span>
        <span className="card-suit-sm">{card.suit}</span>
      </div>
      <div className="card-center-suit">{card.suit}</div>
      <div className="card-corner card-corner-br">
        <span className="card-rank-sm">{rankLabel}</span>
        <span className="card-suit-sm">{card.suit}</span>
      </div>
    </div>
  );
}

// ─── Empty Slot ───────────────────────────────────────────────────────────────

interface EmptySlotProps {
  label?: string;
  onClick?: () => void;
  cardWidth: number;
}

function EmptySlot({ label, onClick, cardWidth }: EmptySlotProps) {
  const cardHeight = Math.round(cardWidth * 1.4);
  return (
    <div
      className="card-slot"
      style={{ width: cardWidth, height: cardHeight }}
      onClick={onClick}
    >
      {label && <span className="slot-label">{label}</span>}
    </div>
  );
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  const colors = ["var(--accent)", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#e74c3c"];
  return (
    <div className="confetti-wrap" aria-hidden>
      {pieces.map(i => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${(i / 24) * 100}%`,
            background: colors[i % colors.length],
            animationDelay: `${(i * 0.07).toFixed(2)}s`,
            animationDuration: `${1.4 + (i % 5) * 0.2}s`,
            width: i % 3 === 0 ? 10 : 7,
            height: i % 3 === 0 ? 10 : 14,
            borderRadius: i % 2 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SolitairePage() {
  const [state, dispatch] = useReducer(reducer, undefined, () => dealGame(0));
  const [immersive, setImmersive] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ source: SourceType; pileIndex: number; cardIndex: number; time: number } | null>(null);

  // Card sizing: fit 7 piles with 8px gaps and 12px horizontal padding each side
  const [cardWidth, setCardWidth] = useState(46);

  useEffect(() => {
    function calcWidth() {
      const vw = Math.min(window.innerWidth, 480);
      // 7 cards + 6 gaps (6px each) + 2 * padding (12px each side)
      const w = Math.floor((vw - 24 - 6 * 6) / 7);
      setCardWidth(Math.max(36, Math.min(w, 60)));
    }
    calcWidth();
    window.addEventListener("resize", calcWidth);
    return () => window.removeEventListener("resize", calcWidth);
  }, []);

  // Load persisted best score
  useEffect(() => {
    const saved = localStorage.getItem(BEST_KEY);
    if (saved) {
      const n = parseInt(saved, 10);
      if (!isNaN(n)) dispatch({ type: "SET_BEST", best: n });
    }
  }, []);

  // Persist best score
  useEffect(() => {
    localStorage.setItem(BEST_KEY, String(state.best));
  }, [state.best]);

  // ── Immersive / fullscreen ────────────────────────────────────────────────
  const enterImmersive = useCallback(() => {
    setImmersive(true);
    const el = shellRef.current;
    if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
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

  // ── Double-tap detection helper ───────────────────────────────────────────
  const handleCardTap = useCallback(
    (source: SourceType, pileIndex: number, cardIndex: number, card: Card) => {
      if (!card.faceUp) {
        // Face-down card: can only interact in tableau to flip (handled by move logic)
        dispatch({ type: "DESELECT" });
        return;
      }

      const now = Date.now();
      const last = lastTapRef.current;
      const isDoubleTap =
        last &&
        last.source === source &&
        last.pileIndex === pileIndex &&
        last.cardIndex === cardIndex &&
        now - last.time < 400;

      if (isDoubleTap) {
        // Auto-move to foundation
        lastTapRef.current = null;
        dispatch({ type: "AUTO_MOVE_TO_FOUNDATION", source, pileIndex, cardIndex });
        return;
      }

      lastTapRef.current = { source, pileIndex, cardIndex, time: now };

      const { selection } = state;

      // If something is already selected
      if (selection) {
        // Tapping same card: deselect
        if (
          selection.source === source &&
          selection.pileIndex === pileIndex &&
          selection.cardIndex === cardIndex
        ) {
          dispatch({ type: "DESELECT" });
          return;
        }

        // Attempt to move to foundation if tapping a foundation pile
        if (source === "foundation") {
          dispatch({ type: "MOVE_TO_FOUNDATION", foundationIndex: pileIndex });
          return;
        }

        // Attempt to move to tableau
        if (source === "tableau") {
          dispatch({ type: "MOVE_TO_TABLEAU", pileIndex });
          return;
        }

        // Tapping another selectable card: change selection
        dispatch({ type: "SELECT", sel: { source, pileIndex, cardIndex } });
        return;
      }

      // No selection: select this card
      dispatch({ type: "SELECT", sel: { source, pileIndex, cardIndex } });
    },
    [state],
  );

  // ── Stock click ───────────────────────────────────────────────────────────
  const handleStockClick = useCallback(() => {
    dispatch({ type: "DESELECT" });
    dispatch({ type: "CLICK_STOCK" });
  }, []);

  // ── Tableau pile click (empty pile or card tap) ───────────────────────────
  const handleEmptyTableauClick = useCallback(
    (pileIndex: number) => {
      if (state.selection) {
        dispatch({ type: "MOVE_TO_TABLEAU", pileIndex });
      }
    },
    [state.selection],
  );

  const handleEmptyFoundationClick = useCallback(
    (foundationIndex: number) => {
      if (state.selection) {
        dispatch({ type: "MOVE_TO_FOUNDATION", foundationIndex });
      }
    },
    [state.selection],
  );

  const cardHeight = Math.round(cardWidth * 1.4);

  const isSelected = (source: SourceType, pileIndex: number, cardIndex: number) => {
    const sel = state.selection;
    if (!sel) return false;
    if (sel.source !== source) return false;
    if (sel.pileIndex !== pileIndex) return false;
    if (source === "tableau") return cardIndex >= sel.cardIndex;
    return true;
  };

  return (
    <>
      <style>{`
        .sol-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px 40px;
          font-family: var(--font-display), var(--font-body), system-ui, sans-serif;
        }
        .sol-page.immersive {
          position: fixed;
          inset: 0;
          z-index: 2147483000;
          background: var(--bg);
          overflow-y: auto;
          padding: max(16px, env(safe-area-inset-top)) 12px max(16px, env(safe-area-inset-bottom));
          justify-content: flex-start;
        }

        /* ── Top row ── */
        .sol-top-row {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .sol-back-link, .sol-fs-btn {
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
          transition: background 0.3s, transform 0.22s;
          background-color: transparent;
        }
        .sol-back-link:hover, .sol-fs-btn:hover { background: rgba(var(--accent-rgb), 0.16); }
        .sol-back-link:active, .sol-fs-btn:active { transform: scale(0.95); }

        /* ── Header row ── */
        .sol-header {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .sol-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .sol-subtitle {
          font-size: 0.65rem;
          color: var(--fg);
          opacity: 0.5;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          margin-top: 2px;
        }
        .sol-score-area {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sol-score-box {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 5px 10px;
          text-align: center;
          min-width: 56px;
        }
        .sol-score-label {
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.5;
          font-family: var(--font-mono);
          color: var(--fg);
        }
        .sol-score-val {
          font-size: 1rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.2;
        }

        /* ── Controls row ── */
        .sol-controls {
          width: 100%;
          max-width: 480px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .sol-btn {
          background: rgba(var(--accent-rgb), 0.08);
          border: 1px solid var(--glass-border);
          border-radius: 999px;
          padding: 7px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          font-family: var(--font-display), sans-serif;
          color: var(--fg);
          transition: background 0.3s, transform 0.22s;
        }
        .sol-btn:hover { background: rgba(var(--accent-rgb), 0.18); }
        .sol-btn:active { transform: scale(0.95); }
        .sol-btn-primary {
          background: var(--accent);
          color: #fff;
          border-color: transparent;
        }
        .sol-btn-primary:hover { opacity: 0.85; }

        /* ── Game area ── */
        .sol-game {
          width: 100%;
          max-width: 480px;
          user-select: none;
        }

        /* ── Top zone: stock + waste + foundations ── */
        .sol-top-zone {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-bottom: 10px;
        }
        .sol-stock-waste {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .sol-spacer { flex: 1; }
        .sol-foundations {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }

        /* ── Tableau zone ── */
        .sol-tableau {
          display: flex;
          gap: 6px;
          align-items: flex-start;
        }
        .sol-pile {
          flex: 1;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        /* ── Cards ── */
        .card {
          position: relative;
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          flex-shrink: 0;
          cursor: pointer;
          transition: box-shadow 0.25s;
          box-sizing: border-box;
        }
        .card-back {
          background: repeating-linear-gradient(
            45deg,
            var(--accent) 0px,
            var(--accent) 3px,
            rgba(0,0,0,0.25) 3px,
            rgba(0,0,0,0.25) 6px
          );
        }
        .card-face {
          background: #faf9f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.08);
        }
        @media (prefers-color-scheme: dark) {
          .card-face { background: #2a2a28; border-color: rgba(255,255,255,0.08); }
        }
        .card-selected {
          box-shadow: 0 0 0 2px var(--accent), 0 4px 12px rgba(var(--accent-rgb),0.4) !important;
        }
        .card-red { color: #c0392b; }
        .card-black { color: var(--fg); }

        .card-corner {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          line-height: 1;
          padding: 2px 3px;
        }
        .card-corner-tl { top: 0; left: 0; }
        .card-corner-br { bottom: 0; right: 0; transform: rotate(180deg); }
        .card-rank-sm {
          font-size: 0.55rem;
          font-weight: 900;
          line-height: 1;
          font-family: var(--font-display), sans-serif;
        }
        .card-suit-sm {
          font-size: 0.48rem;
          line-height: 1;
        }
        .card-center-suit {
          font-size: 1rem;
          line-height: 1;
          pointer-events: none;
        }

        /* ── Empty slot ── */
        .card-slot {
          border: 2px dashed var(--glass-border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          box-sizing: border-box;
          opacity: 0.65;
        }
        .slot-label {
          font-size: 1rem;
          opacity: 0.5;
        }

        /* ── Stacked tableau cards ── */
        .sol-pile-cards {
          position: relative;
        }
        .pile-card-wrap {
          position: absolute;
          left: 0;
        }
        .pile-card-wrap:first-child {
          position: relative;
        }

        /* ── Win overlay ── */
        .sol-win-overlay {
          position: fixed;
          inset: 0;
          z-index: 2147483100;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(6px);
          animation: fadeIn 0.6s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .sol-win-card {
          background: var(--bg);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          padding: 36px 40px;
          text-align: center;
          max-width: 320px;
          width: 90vw;
          position: relative;
          z-index: 1;
        }
        .sol-win-title {
          font-size: 2.4rem;
          font-weight: 900;
          color: var(--accent);
          letter-spacing: -0.03em;
          margin-bottom: 8px;
        }
        .sol-win-score {
          font-size: 1.1rem;
          color: var(--fg);
          opacity: 0.75;
          margin-bottom: 24px;
          font-family: var(--font-mono);
        }
        .sol-win-btns { display: flex; gap: 12px; justify-content: center; }

        /* ── Confetti ── */
        .confetti-wrap {
          position: fixed;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 2147483090;
        }
        .confetti-piece {
          position: absolute;
          top: -20px;
          animation: confettiFall linear forwards;
          opacity: 0.85;
        }
        @keyframes confettiFall {
          0%   { top: -20px; opacity: 1; transform: translateX(0) rotate(0deg); }
          80%  { opacity: 1; }
          100% { top: 110vh; opacity: 0; transform: translateX(60px) rotate(720deg); }
        }

        /* ── Tableau pile height ── */
        .sol-pile-inner {
          position: relative;
          width: 100%;
        }

        /* ── Instructions ── */
        .sol-instructions {
          width: 100%;
          max-width: 480px;
          margin-top: 24px;
          padding: 16px 18px;
          background: rgba(var(--accent-rgb), 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 14px;
        }
        .sol-inst-title {
          font-size: 0.68rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
          margin-bottom: 8px;
        }
        .sol-inst-body {
          font-size: 0.78rem;
          color: var(--fg);
          opacity: 0.72;
          line-height: 1.65;
        }

        /* ── Footer ── */
        .sol-footer {
          margin-top: 28px;
          font-size: 0.65rem;
          font-family: var(--font-mono);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.38;
          color: var(--fg);
          text-align: center;
        }

        /* ── Immersive hides long-form content ── */
        .sol-page.immersive .sol-instructions,
        .sol-page.immersive .sol-footer { display: none; }

        /* ── Responsive ── */
        @media (max-width: 380px) {
          .sol-title { font-size: 1.3rem; }
          .sol-score-box { min-width: 48px; padding: 4px 7px; }
          .card-center-suit { font-size: 0.8rem; }
          .card-rank-sm { font-size: 0.48rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .confetti-piece,
          .sol-win-overlay,
          .card { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Win overlay (outside main so it covers everything) */}
      {state.won && (
        <>
          <Confetti />
          <div className="sol-win-overlay" role="dialog" aria-modal aria-label="You Win">
            <div className="sol-win-card">
              <div className="sol-win-title">You Win!</div>
              <div className="sol-win-score">
                Score: {state.score} &nbsp;·&nbsp; Best: {state.best}
              </div>
              <div className="sol-win-btns">
                <button
                  type="button"
                  className="sol-btn sol-btn-primary"
                  onClick={() => dispatch({ type: "NEW_GAME" })}
                >
                  New Game
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <main
        className={`sol-page${immersive ? " immersive" : ""}`}
        data-no-ptr
        ref={shellRef}
      >
        {/* ── Top row ── */}
        <div className="sol-top-row">
          {immersive ? (
            <span />
          ) : (
            <Link href="/game" className="sol-back-link">
              <ArrowLeft size={14} strokeWidth={2.4} /> Games
            </Link>
          )}
          <button type="button" className="sol-fs-btn" onClick={toggleImmersive}>
            {immersive ? (
              <><Minimize2 size={14} strokeWidth={2.4} /> Exit</>
            ) : (
              <><Maximize2 size={14} strokeWidth={2.4} /> Fullscreen</>
            )}
          </button>
        </div>

        {/* ── Header ── */}
        <div className="sol-header">
          <div>
            <div className="sol-title">Solitaire</div>
            <div className="sol-subtitle">◈ By DummVinci · PTTS Praxis</div>
          </div>
          <div className="sol-score-area">
            <div className="sol-score-box">
              <div className="sol-score-label">Score</div>
              <div className="sol-score-val">{state.score}</div>
            </div>
            <div className="sol-score-box">
              <div className="sol-score-label">Best</div>
              <div className="sol-score-val">{state.best}</div>
            </div>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="sol-controls">
          <button
            type="button"
            className="sol-btn"
            disabled={!state.undoSnapshot}
            style={{ opacity: state.undoSnapshot ? 1 : 0.35 }}
            onClick={() => dispatch({ type: "UNDO" })}
          >
            Undo
          </button>
          <button
            type="button"
            className="sol-btn sol-btn-primary"
            onClick={() => dispatch({ type: "NEW_GAME" })}
          >
            New Game
          </button>
        </div>

        {/* ── Game area ── */}
        <div className="sol-game">

          {/* ── Top zone: stock | waste | spacer | foundations ── */}
          <div className="sol-top-zone">
            <div className="sol-stock-waste">
              {/* Stock */}
              {state.stock.length > 0 ? (
                <div style={{ position: "relative" }}>
                  <CardView
                    card={{ suit: "♠", rank: 1, faceUp: false }}
                    cardWidth={cardWidth}
                    onClick={handleStockClick}
                  />
                  {state.stock.length > 1 && (
                    <div style={{
                      position: "absolute",
                      bottom: -3,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: "0.55rem",
                      fontFamily: "var(--font-mono)",
                      opacity: 0.6,
                      color: "var(--fg)",
                      background: "var(--bg)",
                      padding: "0 3px",
                      borderRadius: 4,
                      pointerEvents: "none",
                    }}>
                      {state.stock.length}
                    </div>
                  )}
                </div>
              ) : (
                <EmptySlot
                  label="↺"
                  cardWidth={cardWidth}
                  onClick={handleStockClick}
                />
              )}

              {/* Waste */}
              {state.waste.length > 0 ? (
                <CardView
                  card={state.waste[state.waste.length - 1]}
                  selected={isSelected("waste", 0, state.waste.length - 1)}
                  cardWidth={cardWidth}
                  onClick={() =>
                    handleCardTap("waste", 0, state.waste.length - 1, state.waste[state.waste.length - 1])
                  }
                  onDoubleClick={() =>
                    dispatch({
                      type: "AUTO_MOVE_TO_FOUNDATION",
                      source: "waste",
                      pileIndex: 0,
                      cardIndex: state.waste.length - 1,
                    })
                  }
                />
              ) : (
                <EmptySlot cardWidth={cardWidth} />
              )}
            </div>

            <div className="sol-spacer" />

            {/* Foundations */}
            <div className="sol-foundations">
              {FOUNDATION_SUITS.map((suit, fi) => {
                const pile = state.foundations[fi];
                const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
                return topCard ? (
                  <CardView
                    key={suit}
                    card={topCard}
                    selected={isSelected("foundation", fi, pile.length - 1)}
                    cardWidth={cardWidth}
                    onClick={() =>
                      handleCardTap("foundation", fi, pile.length - 1, topCard)
                    }
                  />
                ) : (
                  <EmptySlot
                    key={suit}
                    label={suit}
                    cardWidth={cardWidth}
                    onClick={() => handleEmptyFoundationClick(fi)}
                  />
                );
              })}
            </div>
          </div>

          {/* ── Tableau ── */}
          <div className="sol-tableau">
            {state.tableau.map((pile, pi) => {
              const minHeight = cardHeight + 8;
              return (
                <div key={pi} className="sol-pile">
                  {pile.length === 0 ? (
                    <EmptySlot
                      cardWidth={cardWidth}
                      onClick={() => handleEmptyTableauClick(pi)}
                    />
                  ) : (
                    <div
                      className="sol-pile-inner"
                      style={{
                        height:
                          cardHeight +
                          pile
                            .slice(0, -1)
                            .reduce(
                              (acc, c) => acc + (c.faceUp ? Math.round(cardHeight * 0.32) : Math.round(cardHeight * 0.20)),
                              0,
                            ) +
                          8,
                        minHeight,
                      }}
                    >
                      {pile.map((card, ci) => {
                        let topOffset = 0;
                        for (let k = 0; k < ci; k++) {
                          topOffset += pile[k].faceUp
                            ? Math.round(cardHeight * 0.32)
                            : Math.round(cardHeight * 0.20);
                        }
                        const sel = isSelected("tableau", pi, ci);
                        return (
                          <div
                            key={`${pi}-${ci}-${card.rank}-${card.suit}`}
                            style={{
                              position: ci === 0 ? "relative" : "absolute",
                              top: ci === 0 ? 0 : topOffset,
                              left: 0,
                              zIndex: ci,
                            }}
                          >
                            <CardView
                              card={card}
                              selected={sel}
                              cardWidth={cardWidth}
                              onClick={() => {
                                if (!card.faceUp) {
                                  // Face-down: no selection, but don't block
                                  dispatch({ type: "DESELECT" });
                                  return;
                                }
                                handleCardTap("tableau", pi, ci, card);
                              }}
                              onDoubleClick={() => {
                                if (card.faceUp) {
                                  dispatch({
                                    type: "AUTO_MOVE_TO_FOUNDATION",
                                    source: "tableau",
                                    pileIndex: pi,
                                    cardIndex: ci,
                                  });
                                }
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Instructions ── */}
        <div className="sol-instructions">
          <div className="sol-inst-title">◈ How to play</div>
          <div className="sol-inst-body">
            <strong>Tap once</strong> to select a card (or a stack), then <strong>tap a destination</strong> to move it.
            Tap the same card again or an invalid spot to deselect.{" "}
            <strong>Double-tap</strong> any card to auto-send it to a foundation.
            <br />
            <strong>Tableau:</strong> place on opposite colour, one rank lower (King on empty).
            <strong> Foundations:</strong> build by suit from Ace to King.
            <br />
            <strong>Stock:</strong> tap the deck to flip a card to waste; tap the empty deck to recycle.
            <strong> Scoring:</strong> +10 foundation, +5 flip, +3 waste→tableau.
          </div>
        </div>

        <div className="sol-footer">PTTS Praxis — Break Room · By DummVinci</div>
      </main>
    </>
  );
}
