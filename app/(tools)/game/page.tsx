import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import GameClient from "./game-client";

export const metadata: Metadata = toolMetadata("game");

export default function Page() {
  return <GameClient />;
}
