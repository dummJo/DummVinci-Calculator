"use client";

import { useState, useEffect } from "react";
import CalcShell from "@/components/calc/CalcShell";
import FieldNumber from "@/components/calc/FieldNumber";
import FieldSelect from "@/components/calc/FieldSelect";
import { useLang } from "@/lib/i18n";
import Footer from "@/components/nav/Footer";
import Footnote from "@/components/calc/Footnote";
import { simulatePid, EquipmentType, PidResult, SimPoint } from "@/lib/calc/pid";
import { Activity } from "lucide-react";

function PidChart({ data }: { data: SimPoint[] }) {
  if (!data || data.length === 0) return null;

  const w = 700;
  const h = 300;
  const padX = 40;
  const padY = 30;

  const maxT = data[data.length - 1].t;
  const maxPv = Math.max(...data.map(d => d.pv), ...data.map(d => d.sp)) * 1.2;
  const maxScale = Math.max(1, maxPv);

  const scaleX = (w - padX * 2) / maxT;
  const scaleY = (h - padY * 2) / maxScale;

  const ptX = (t: number) => padX + t * scaleX;
  const ptY = (v: number) => h - padY - v * scaleY;

  const pathPv = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${ptX(d.t)} ${ptY(d.pv)}`).join(" ");
  const pathSp = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${ptX(d.t)} ${ptY(d.sp)}`).join(" ");
  
  const scaleCvY = (h - padY * 2) / 100;
  const ptCvY = (v: number) => h - padY - v * scaleCvY;
  const pathCv = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${ptX(d.t)} ${ptCvY(d.cv)}`).join(" ");

  return (
    <div style={{ width: "100%", overflowX: "auto", margin: "16px 0", paddingBottom: 10 }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ background: "rgba(0,0,0,0.2)", borderRadius: 12, minWidth: 600, display: "block", margin: "0 auto" }}>
        {/* Grid and Axes */}
        <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="var(--border)" strokeWidth={1} />
        <line x1={padX} y1={padY} x2={padX} y2={h - padY} stroke="var(--border)" strokeWidth={1} />
        
        {/* Y Axis Labels (PV) */}
        <text x={padX - 8} y={padY} fill="var(--muted)" fontSize={10} textAnchor="end" alignmentBaseline="middle">{Math.round(maxScale)}</text>
        <text x={padX - 8} y={h - padY} fill="var(--muted)" fontSize={10} textAnchor="end" alignmentBaseline="middle">0</text>
        
        {/* X Axis Labels (Time) */}
        <text x={padX} y={h - padY + 16} fill="var(--muted)" fontSize={10} textAnchor="middle">0s</text>
        <text x={w - padX} y={h - padY + 16} fill="var(--muted)" fontSize={10} textAnchor="middle">{maxT}s</text>

        {/* Paths */}
        <path d={pathSp} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="4 4" />
        <path d={pathCv} fill="none" stroke="rgba(201,168,76,0.3)" strokeWidth={1.5} />
        <path d={pathPv} fill="none" stroke="var(--accent)" strokeWidth={3} />
        
        {/* Legends */}
        <text x={w - padX + 5} y={ptY(data[data.length-1].sp)} fill="rgba(255,255,255,0.6)" fontSize={11} fontWeight={600} alignmentBaseline="middle">SP</text>
        <text x={w - padX + 5} y={ptY(data[data.length-1].pv)} fill="var(--accent)" fontSize={11} fontWeight={800} alignmentBaseline="middle">PV</text>
        <text x={w - padX + 5} y={ptCvY(data[data.length-1].cv)} fill="rgba(201,168,76,0.8)" fontSize={11} fontWeight={600} alignmentBaseline="middle">CV</text>
      </svg>
    </div>
  );
}

export default function PidPage() {
  const { t } = useLang();
  const tp = t.pid;

  const [equipment, setEquipment] = useState<EquipmentType>("motor");
  const [motorKw, setMotorKw] = useState("11");
  const [setpoint, setSetpoint] = useState("50");
  
  // Tuning parameters
  const [kp, setKp] = useState("1.0");
  const [ki, setKi] = useState("0.5");
  const [kd, setKd] = useState("0.0");

  const [result, setResult] = useState<PidResult | null>(null);

  // Auto-run simulation when parameters change
  useEffect(() => {
    const res = simulatePid({
      equipment,
      motorKw: parseFloat(motorKw) || 1,
      setpoint: parseFloat(setpoint) || 50,
      kp: parseFloat(kp) || 0,
      ki: parseFloat(ki) || 0,
      kd: parseFloat(kd) || 0,
    });
    const tid = setTimeout(() => setResult(res), 0);
    return () => clearTimeout(tid);
  }, [equipment, motorKw, setpoint, kp, ki, kd]);

  return (
    <CalcShell
      label="Tuning"
      title={tp.title}
      subtitle={tp.subtitle}
      concept={tp.concept}
    >
      <div className="vinci-card" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        
        <div className="sec-label"><span>{tp.equipment}</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 10 }}>
          <FieldSelect
            label={tp.equipment} value={equipment} onChange={(v) => setEquipment(v as EquipmentType)}
            options={[
              { value: "motor", label: tp.eqMotor },
              { value: "pump", label: tp.eqPump },
              { value: "compressor", label: tp.eqCompressor },
            ]}
          />
          <FieldNumber
            label={tp.motorKw} value={motorKw} onChange={setMotorKw}
            hint={tp.motorKwHint} min={0.1} max={1000} step={0.1}
          />
          <FieldNumber
            label={tp.setpoint} value={setpoint} onChange={setSetpoint}
            min={1} max={100} step={1}
          />
        </div>

        <div style={{ height: 1, background: "var(--glass-border)", margin: "10px 0" }} />

        <div className="sec-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>PID TUNING GAINS</span>
          <Activity size={16} style={{ color: "var(--accent)" }} />
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <FieldNumber
            label={tp.kp} value={kp} onChange={setKp}
            min={0} max={100} step={0.1}
          />
          <FieldNumber
            label={tp.ki} value={ki} onChange={setKi}
            min={0} max={100} step={0.01}
          />
          <FieldNumber
            label={tp.kd} value={kd} onChange={setKd}
            min={0} max={100} step={0.01}
          />
        </div>

        {/* Real-time simulation feedback */}
        {result && (
          <div style={{
            marginTop: 24,
            padding: 24,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--r-md)",
          }}>
            <h3 style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--fg)", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.05em" }}>
              <Activity size={14} color="var(--accent)" />
              {tp.chartTitle}
            </h3>
            
            <PidChart data={result.data} />
            
            <div style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(201,168,76,0.1)",
              border: "1px solid rgba(201,168,76,0.3)",
              borderRadius: "var(--r-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--accent)",
              textAlign: "center",
              letterSpacing: "0.05em"
            }}>
              {tp.metrics}: {result.metricsText}
            </div>
          </div>
        )}

      </div>
      <Footnote />
      <Footer />
    </CalcShell>
  );
}
