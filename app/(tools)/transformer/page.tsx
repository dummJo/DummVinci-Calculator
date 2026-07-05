import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import TransformerClient from "./transformer-client";

export const metadata: Metadata = toolMetadata("transformer");

export default function Page() {
  return <TransformerClient />;
}
