import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import PlcClient from "./plc-client";

export const metadata: Metadata = toolMetadata("plc");

export default function Page() {
  return <PlcClient />;
}
