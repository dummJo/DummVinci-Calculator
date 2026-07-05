import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import TutorialsClient from "./tutorials-client";

export const metadata: Metadata = toolMetadata("tutorials");

export default function Page() {
  return <TutorialsClient />;
}
