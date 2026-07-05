import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import PanelLayoutClient from "./panel-layout-client";

export const metadata: Metadata = toolMetadata("panelLayout");

export default function Page() {
  return <PanelLayoutClient />;
}
