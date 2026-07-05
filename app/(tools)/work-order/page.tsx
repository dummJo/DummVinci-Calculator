import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import WorkOrderClient from "./work-order-client";

export const metadata: Metadata = toolMetadata("workOrder");

export default function Page() {
  return <WorkOrderClient />;
}
