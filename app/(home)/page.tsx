import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import HomeClient from "./home-client";

export const metadata: Metadata = toolMetadata("home");

export default function Page() {
  return <HomeClient />;
}
