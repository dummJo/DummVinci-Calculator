import { describe, it, expect } from "vitest";
import { simulatePid } from "./pid";

describe("PID Loop Simulation (FOPDT step response)", () => {
  it("should produce a full time-series that tracks toward the setpoint", () => {
    const result = simulatePid({
      kp: 2,
      ki: 0.5,
      kd: 0.1,
      equipment: "pump",
      motorKw: 15,
      setpoint: 50,
    });

    // dt=0.1, duration=60 → 600 samples
    expect(result.data.length).toBe(600);
    expect(result.data[0].sp).toBe(50);
    // PV starts at zero
    expect(result.data[0].pv).toBe(0);
    // Control variable saturates within 0–100%
    for (const p of result.data) {
      expect(p.cv).toBeGreaterThanOrEqual(0);
      expect(p.cv).toBeLessThanOrEqual(100);
    }
  });

  it("should settle close to the setpoint for a well-tuned loop", () => {
    const result = simulatePid({
      kp: 1.5,
      ki: 0.4,
      kd: 0.05,
      equipment: "motor",
      motorKw: 5.5,
      setpoint: 40,
    });

    // Integral action should drive steady-state error small
    expect(Math.abs(result.steadyStateError)).toBeLessThan(2);
    expect(result.settlingTime).toBeGreaterThan(0);
    expect(result.overshoot).toBeGreaterThanOrEqual(0);
    expect(result.metricsText).toContain("Overshoot");
  });

  it("should scale inertia with motor size (larger kW → slower response)", () => {
    const common = { kp: 1, ki: 0.2, kd: 0, setpoint: 50 } as const;
    const small = simulatePid({ ...common, equipment: "compressor", motorKw: 1 });
    const large = simulatePid({ ...common, equipment: "compressor", motorKw: 200 });

    // Larger inertia → PV at a fixed early time is lower (slower to rise).
    const idx = 100; // t = 10 s
    expect(large.data[idx].pv).toBeLessThan(small.data[idx].pv);
  });
});
