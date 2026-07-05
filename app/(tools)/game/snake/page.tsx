import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import GameSnakeClient from "./snake-client";

export const metadata: Metadata = toolMetadata("gameSnake");

export default function Page() {
  return <GameSnakeClient />;
}
