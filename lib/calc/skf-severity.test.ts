import { describe, it, expect } from "vitest";
import {
  getMachineSeverityZone,
  getGeneralSeverityZone,
  getBearingStage,
  getDiagnosticFlow,
  recommendGeFilter,
} from "./skf-severity";

describe("SKF Microlog Severity Assessment (ISO 20816 / Figure 13)", () => {
  it("should classify a machine-specific velocity into the correct zone", () => {
    // "Motor / Generator" "Direct coupled": alarm1 5.5, alarm2 8.0 mm/s
    const good = getMachineSeverityZone(3.0, "Direct coupled");
    const warn = getMachineSeverityZone(6.5, "Direct coupled");
    const fault = getMachineSeverityZone(10.0, "Direct coupled");

    expect(good?.zone).toBe("Good");
    expect(warn?.zone).toBe("Alarm1");
    expect(fault?.zone).toBe("Alarm2");
    expect(good?.machine.alarm2).toBe(8.0);
  });

  it("should return null for an unknown machine subtype", () => {
    expect(getMachineSeverityZone(5, "Nonexistent Machine")).toBeNull();
  });

  it("should raise the thresholds when an isolator adjustment is applied", () => {
    const base = getMachineSeverityZone(5, "Direct coupled");
    const isolated = getMachineSeverityZone(5, "Direct coupled", { isolator: true });
    // Isolator multiplies thresholds by 1.4 → higher Alarm1/Alarm2
    expect(isolated!.alarm1Adj).toBeGreaterThan(base!.alarm1Adj);
    expect(isolated!.alarm2Adj).toBeCloseTo(base!.alarm2Adj * 1.4, 5);
  });

  it("should map ISO 20816 general zones by velocity threshold", () => {
    expect(getGeneralSeverityZone(2.0).zone).toBe("A"); // < 2.8
    expect(getGeneralSeverityZone(3.5).zone).toBe("B"); // 2.8–4.5
    expect(getGeneralSeverityZone(6.0).zone).toBe("C"); // 4.5–7.1
    expect(getGeneralSeverityZone(9.0).zone).toBe("D"); // > 7.1
  });

  it("should assess gE bearing stages by urgency", () => {
    expect(getBearingStage(0.3).urgency).toBe("normal");   // < 0.5
    expect(getBearingStage(0.8).urgency).toBe("monitor");  // 0.5–1.0
    expect(getBearingStage(1.5).urgency).toBe("plan");     // 1.0–2.0
    expect(getBearingStage(3.0).urgency).toBe("immediate");// > 2.0
  });

  it("should diagnose rising velocity with steady gE as NOT a bearing fault", () => {
    const flow = getDiagnosticFlow("rising", "ok");
    expect(flow.diagnosis).toContain("NOT bearing");
    const healthy = getDiagnosticFlow("ok", "ok");
    expect(healthy.diagnosis).toBe("Healthy");
  });

  it("should recommend a gE bandpass filter band by RPM", () => {
    expect(recommendGeFilter(50).lowHz).toBe(5);       // < 100 RPM
    expect(recommendGeFilter(300).lowHz).toBe(50);     // 100–500 RPM
    expect(recommendGeFilter(1500).lowHz).toBe(500);   // standard industrial
    expect(recommendGeFilter(15000).lowHz).toBe(5000); // high-speed
  });
});
