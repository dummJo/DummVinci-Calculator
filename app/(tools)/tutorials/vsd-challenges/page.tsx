import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import VsdChallengesClient from "./vsd-challenges-client";

export const metadata: Metadata = toolMetadata("vsdChallenges");

export default function Page() {
  return <VsdChallengesClient />;
}
