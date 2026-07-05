import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import SkfMicrologClient from "./skf-microlog-client";

export const metadata: Metadata = toolMetadata("skfMicrolog");

export default function Page() {
  return <SkfMicrologClient />;
}
