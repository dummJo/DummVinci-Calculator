import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import CapacitorKvarClient from "./capacitor-kvar-client";

export const metadata: Metadata = toolMetadata("capacitorKvar");

export default function Page() {
  return <CapacitorKvarClient />;
}
