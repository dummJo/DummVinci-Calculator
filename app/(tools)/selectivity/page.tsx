import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import SelectivityClient from "./selectivity-client";

export const metadata: Metadata = toolMetadata("selectivity");

export default function Page() {
  return <SelectivityClient />;
}
