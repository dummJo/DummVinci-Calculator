import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import UnifiedClient from "./unified-client";

export const metadata: Metadata = toolMetadata("unified");

export default function Page() {
  return <UnifiedClient />;
}
