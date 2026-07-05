import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import AbbSupportClient from "./abb-support-client";

export const metadata: Metadata = toolMetadata("abbSupport");

export default function Page() {
  return <AbbSupportClient />;
}
