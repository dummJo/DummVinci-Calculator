import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import IccClient from "./icc-client";

export const metadata: Metadata = toolMetadata("icc");

export default function Page() {
  return <IccClient />;
}
