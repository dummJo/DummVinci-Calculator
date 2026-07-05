import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import GameSolitaireClient from "./solitaire-client";

export const metadata: Metadata = toolMetadata("gameSolitaire");

export default function Page() {
  return <GameSolitaireClient />;
}
