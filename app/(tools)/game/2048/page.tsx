import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import Game2048Client from "./2048-client";

export const metadata: Metadata = toolMetadata("game2048");

export default function Page() {
  return <Game2048Client />;
}
