import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import GameMinesweeperClient from "./minesweeper-client";

export const metadata: Metadata = toolMetadata("gameMinesweeper");

export default function Page() {
  return <GameMinesweeperClient />;
}
