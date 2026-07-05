import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import ConvertClient from "./convert-client";

export const metadata: Metadata = toolMetadata("convert");

export default function Page() {
  return <ConvertClient />;
}
