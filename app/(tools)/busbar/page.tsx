import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import BusbarClient from "./busbar-client";

export const metadata: Metadata = toolMetadata("busbar");

export default function Page() {
  return <BusbarClient />;
}
