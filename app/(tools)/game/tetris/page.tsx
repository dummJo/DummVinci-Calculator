import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import GameTetrisClient from "./tetris-client";

export const metadata: Metadata = toolMetadata("gameTetris");

export default function Page() {
  return <GameTetrisClient />;
}
