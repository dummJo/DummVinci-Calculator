import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import PanelClient from "./panel-client";

export const metadata: Metadata = toolMetadata("panel");

export default function Page() {
  return <PanelClient />;
}
