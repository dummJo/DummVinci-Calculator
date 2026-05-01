/**
 * PID Loop Simulation Logic
 * Simulates a step response for a First Order Plus Dead Time (FOPDT) system.
 * Used to demonstrate the effects of P, I, and D parameters on different
 * industrial equipment profiles (motor, pump, compressor).
 */

export type EquipmentType = "motor" | "pump" | "compressor";

export interface PidParams {
  kp: number;      // Proportional Gain
  ki: number;      // Integral Gain
  kd: number;      // Derivative Gain
  equipment: EquipmentType;
  motorKw: number; // Used to scale inertia
  setpoint: number;
}

export interface SimPoint {
  t: number;
  pv: number; // Process Variable
  cv: number; // Control Variable (Controller Output)
  sp: number; // Setpoint
}

export interface PidResult {
  data: SimPoint[];
  overshoot: number;
  settlingTime: number;
  steadyStateError: number;
  metricsText: string;
}

export function simulatePid(params: PidParams): PidResult {
  const { kp, ki, kd, equipment, motorKw, setpoint } = params;

  // 1. Define FOPDT parameters based on equipment
  // K: Process Gain, Tau: Time Constant (inertia), Theta: Dead Time (delay)
  let baseTau = 1;
  let baseTheta = 0;
  const processGain = 1;

  switch (equipment) {
    case "motor":
      baseTau = 0.5;
      baseTheta = 0.1;
      break;
    case "pump":
      baseTau = 2.0;
      baseTheta = 0.5;
      break;
    case "compressor":
      baseTau = 5.0;
      baseTheta = 2.0;
      break;
  }

  // Scale inertia by motor size (larger motor -> more inertia)
  // log10(kW) gives a nice scaling factor. kW = 1 -> x1. kW = 100 -> x2.
  const inertiaScale = 1 + Math.log10(Math.max(1, motorKw)) * 0.5;
  const tau = baseTau * inertiaScale;
  const theta = baseTheta;

  // Simulation settings
  const dt = 0.1; // 100ms step
  const duration = 60; // Simulate 60 seconds
  const steps = Math.floor(duration / dt);

  const data: SimPoint[] = [];

  // State variables
  let pv = 0; // Process variable
  let integral = 0;
  let prevError = 0;
  
  // History buffer for dead time (theta)
  const deadTimeSteps = Math.max(1, Math.floor(theta / dt));
  const cvHistory: number[] = new Array(deadTimeSteps).fill(0);

  let maxPv = 0;
  let settlingTime = -1;

  for (let i = 0; i < steps; i++) {
    const t = i * dt;
    const error = setpoint - pv;

    // PID calculations
    integral += error * dt;
    const derivative = (error - prevError) / dt;

    let cv = kp * error + ki * integral + kd * derivative;

    // Saturation (anti-windup could be added, but simple saturation for output 0-100%)
    if (cv > 100) {
      cv = 100;
      // Simple clamping anti-windup
      integral -= error * dt; 
    } else if (cv < 0) {
      cv = 0;
      integral -= error * dt;
    }

    prevError = error;

    // Process Model Update (Euler method for FOPDT)
    // Delayed CV
    const delayedCv = cvHistory.shift()!;
    cvHistory.push(cv);

    // tau * (dPV/dt) + PV = K * delayedCv
    // dPV/dt = (K * delayedCv - PV) / tau
    const dPv = (processGain * delayedCv - pv) / tau;
    pv += dPv * dt;

    if (pv > maxPv) maxPv = pv;

    // Check settling time (within 2% of setpoint)
    if (settlingTime === -1 && i > deadTimeSteps) {
      // We will refine settling time below by checking backwards from end.
    }

    data.push({ t, pv, cv, sp: setpoint });
  }

  // Calculate metrics
  const steadyStateError = setpoint - pv;
  const overshoot = maxPv > setpoint ? ((maxPv - setpoint) / setpoint) * 100 : 0;

  // Better settling time calc: look backwards from the end
  let lastUnsettledIdx = steps - 1;
  for (let i = steps - 1; i >= 0; i--) {
    if (Math.abs(data[i].pv - setpoint) > setpoint * 0.02) {
      lastUnsettledIdx = i;
      break;
    }
  }
  
  if (lastUnsettledIdx < steps - 1) {
    settlingTime = data[lastUnsettledIdx + 1].t;
  } else {
    // Never settled
    settlingTime = -1;
  }

  let metricsText = `Overshoot: ${overshoot.toFixed(1)}%. SS Error: ${steadyStateError.toFixed(1)} unit.`;
  if (settlingTime > 0) {
    metricsText += ` Settling Time: ${settlingTime.toFixed(1)}s.`;
  } else {
    metricsText += ` Unstable / Not Settled.`;
  }

  return {
    data,
    overshoot,
    settlingTime,
    steadyStateError,
    metricsText,
  };
}
