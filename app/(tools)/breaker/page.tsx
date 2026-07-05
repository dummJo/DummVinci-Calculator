import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import BreakerClient from "./breaker-client";

export const metadata: Metadata = toolMetadata("breaker");

export default function Page() {
  return <BreakerClient />;
}
