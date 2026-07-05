import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import VsdClient from "./vsd-client";

export const metadata: Metadata = toolMetadata("vsd");

export default function Page() {
  return <VsdClient />;
}
