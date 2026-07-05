import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import CableClient from "./cable-client";

export const metadata: Metadata = toolMetadata("cable");

export default function Page() {
  return <CableClient />;
}
