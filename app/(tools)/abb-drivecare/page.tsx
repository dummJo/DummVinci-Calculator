import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import AbbDrivecareClient from "./abb-drivecare-client";

export const metadata: Metadata = toolMetadata("abbDrivecare");

export default function Page() {
  return <AbbDrivecareClient />;
}
