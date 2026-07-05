import type { Metadata } from "next";
import { toolMetadata } from "@/lib/seo";
import BrakingResistorClient from "./braking-resistor-client";

export const metadata: Metadata = toolMetadata("brakingResistor");

export default function Page() {
  return <BrakingResistorClient />;
}
