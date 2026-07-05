import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import StarterClient from "./starter-client";

export const metadata: Metadata = toolMetadata("starter");

export default function Page() {
  return <StarterClient />;
}
