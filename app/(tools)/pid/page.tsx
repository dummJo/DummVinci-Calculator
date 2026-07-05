import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import PidClient from "./pid-client";

export const metadata: Metadata = toolMetadata("pid");

export default function Page() {
  return <PidClient />;
}
