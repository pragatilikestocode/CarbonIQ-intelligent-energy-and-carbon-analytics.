import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import {
  ClipboardList, Cpu, Zap, Leaf, AlertTriangle,
  TrendingDown, Activity, Database, Info, Download,
  CheckCircle2, RefreshCw, Globe, ShieldCheck,
} from 'lucide-react';
import { apiService, ExecutiveSummary } from '../../services/apiService';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function f(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { minimumFractionDigits: dp, maximumFractionDigits: dp });
}
function big(n: number | null | undefined): string {
  if (n == null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return n.toLocaleString();
}

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#00f5ff', LOW: '#a855f7',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionHeading({ icon: Icon, label, color = 'text-cyber-cyan' }: {
  icon: React.ElementType; label: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
      <Icon className={`w-4 h-4 ${color}`} />
      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">{label}</h2>
    </div>
  );
}

function KpiCard({ title, value, unit, sub, accent = 'cyan', icon: Icon }: {
  title: string; value: string; unit?: string; sub?: string;
  accent?: 'cyan' | 'amber' | 'emerald' | 'violet' | 'red'; icon: React.ElementType;
}) {
  const border: Record<string, string> = {
    cyan: 'border-cyber-cyan/30', amber: 'border-amber-500/30',
    emerald: 'border-emerald-500/30', violet: 'border-violet-500/30', red: 'border-red-500/30',
  };
  const text: Record<string, string> = {
    cyan: 'text-cyber-cyan', amber: 'text-amber-400',
    emerald: 'text-emerald-400', violet: 'text-violet-400', red: 'text-red-400',
  };
  return (
    <div className={`glass-panel rounded-2xl p-5 border ${border[accent]} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className={`w-4 h-4 ${text[accent]}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>
      {sub && <p className="text-[11px] text-slate-500 font-mono">{sub}</p>}
    </div>
  );
}

function DisclaimerBox({ text }: { text: string }) {
  return (
    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
      <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-[11px] text-amber-200 font-mono leading-relaxed">{text}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export const ExecutiveSummaryReport: React.FC = () => {
  const [data, setData]       = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true); setError(null);
    apiService.summary()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // ---- Print / export as PDF via browser ----------------------------------
  const handlePrint = () => window.print();

  // ---- Loading ------------------------------------------------------------
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-slate-400">
      <div className="w-10 h-10 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin" />
      <p className="font-mono text-sm">Compiling executive summary from backend…</p>
    </div>
  );

  // ---- Error --------------------------------------------------------------
  if (error || !data) return (
    <div className="glass-panel rounded-2xl p-8 border border-red-500/30 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-2">Could not load summary</h2>
      <p className="text-sm text-slate-400 font-mono mb-4">{error}</p>
      <button onClick={load}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-mono text-xs">
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  );

  const d = data;

  // ---- Derived chart data -------------------------------------------------
  // Partition bar chart
  const partData = d.energy.by_partition.map(p => ({
    name: p.partition,
    actual: +p.total_actual_kwh.toFixed(2),
    jobs:   p.count,
  }));

  // Emissions baseline vs scenario
  const emCompare = [
    { name: 'Baseline', value: +d.optimization.baseline_emissions_kg.toFixed(1), fill: '#f59e0b' },
    { name: 'Scenario', value: +d.optimization.scenario_emissions_kg.toFixed(1),  fill: '#10b981' },
  ];

  // Anomaly pie
  const anomPie = (d.anomalies.by_type ?? []).map(a => ({
    name:  a.anomaly_type,
    value: a.count,
    fill:  SEV_COLOR[a.anomaly_severity] ?? '#475569',
  }));

  // Carbon model comparison
  const carbonModelBar = d.carbon_models.map(m => ({
    name: String(m.Model).replace('_', ' '),
    RMSE: +m.RMSE.toFixed(4),
    MAE:  +m.MAE.toFixed(4),
  }));

  // RF performance radar (normalised 0-100 scale for display only)
  const radarData = [
    { metric: 'Test R²',   value: +(( (d.energy.rf_test_r2 ?? 0) ) * 100).toFixed(1) },
    { metric: 'Val R²',    value: +(( (d.energy.rf_val_r2  ?? 0) ) * 100).toFixed(1) },
    { metric: 'Normal wl', value: +( (1 - d.anomalies.pct / 100) * 100 ).toFixed(1) },
    { metric: 'Opt saving',value: +d.optimization.pct_saved.toFixed(1) },
    { metric: 'Data cov',  value: 100 },
  ];

  const genDate = new Date(d.generated_at).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ---- Render -------------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-300" id="executive-summary-report">

      {/* ══════════════ HEADER ══════════════════════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/3 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
                CARBONIQ — EXECUTIVE SUMMARY REPORT
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All data from real SAS outputs
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              CarbonIQ Executive Summary
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              AI-Powered GPU Data Center Energy &amp; Carbon Intelligence.
              Integrated findings across all three member modules — data preprocessing,
              GPU energy prediction, and carbon intelligence.
            </p>
            <p className="text-xs font-mono text-slate-500 mt-2">
              Generated: {genDate} &nbsp;|&nbsp;
              Source: SAS-integrated CSV exports &nbsp;|&nbsp;
              Scope: {big(d.workloads.unique_jobs)} GPU workloads, {big(d.workloads.device_instances)} device instances
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={load}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono tracking-wide transition hover:opacity-95"
            >
              <Download className="w-3.5 h-3.5" />
              Export / Print
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════ SECTION 1 — TOP-LEVEL KPIs ══════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <SectionHeading icon={ClipboardList} label="Section 1 — Project Scale & Key Metrics" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard title="Unique Workloads"      value={big(d.workloads.unique_jobs)}        icon={Cpu}           accent="cyan"    sub={`${big(d.workloads.device_instances)} GPU instances`} />
          <KpiCard title="Recorded Energy"       value={f(d.energy.actual_kwh, 1)}           unit="kWh"           icon={Zap}           accent="amber"   sub="DCGM measurements" />
          <KpiCard title="RF Predicted Energy"   value={f(d.energy.predicted_kwh, 1)}        unit="kWh"           icon={Activity}      accent="cyan"    sub="Random Forest model" />
          <KpiCard title="Scope 2 Emissions"     value={f(d.emissions.total_actual_kg, 1)}   unit="kg CO₂"        icon={Leaf}          accent="emerald" sub="Recorded energy only" />
          <KpiCard title="Anomalies Detected"    value={big(d.anomalies.total)}               icon={AlertTriangle} accent="red"     sub={`${d.anomalies.pct.toFixed(1)}% of workloads`} />
          <KpiCard title="Grid Carbon Intensity" value={f(d.emissions.carbon_intensity_g_kwh,2)} unit="gCO₂/kWh"  icon={Globe}         accent="violet"  sub="India national avg" />
        </div>
        <div className="mt-4">
          <DisclaimerBox text="Scope 2 emissions are calculated from recorded DCGM energy measurements only. Predicted-energy emissions are excluded — the prediction model's energy units require further validation before emission calculations are appropriate." />
        </div>
      </div>

      {/* ══════════════ SECTION 2 — MEMBER 1 ═══════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-blue-500/20">
        <SectionHeading icon={Database} label="Section 2 — Member 1: Data Preprocessing & Integration" color="text-blue-400" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Unique GPU Workloads</p>
            <p className="text-2xl font-black text-white mt-1">{d.workloads.unique_jobs.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Slurm scheduler job traces</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">GPU Device Instances</p>
            <p className="text-2xl font-black text-white mt-1">{d.workloads.device_instances.toLocaleString()}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">DCGM telemetry records merged</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Partitions</p>
            <p className="text-2xl font-black text-white mt-1">{d.energy.by_partition.length}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {d.energy.by_partition.map(p => p.partition).join(', ')}
            </p>
          </div>
        </div>

        {/* Energy by partition */}
        {partData.length > 0 && (
          <>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">Recorded Energy by Scheduler Partition (kWh)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={partData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kWh" width={68} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number, name: string) => [
                    name === 'actual' ? f(v, 2) + ' kWh' : v.toLocaleString() + ' jobs', ''
                  ]} />
                <Bar dataKey="actual" name="Recorded Energy (kWh)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* ══════════════ SECTION 3 — MEMBER 2 ═══════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/20">
        <SectionHeading icon={Zap} label="Section 3 — Member 2: GPU Energy Intelligence (Random Forest)" color="text-amber-400" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Test MAE</p>
            <p className="text-xl font-black text-white mt-1">{big(d.energy.rf_test_mae_j ?? 0)}<span className="text-xs text-slate-400 ml-1">J</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Test RMSE</p>
            <p className="text-xl font-black text-white mt-1">{big(d.energy.rf_test_rmse_j ?? 0)}<span className="text-xs text-slate-400 ml-1">J</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Test R²</p>
            <p className="text-xl font-black text-white mt-1">{d.energy.rf_test_r2?.toFixed(4) ?? '—'}</p>
            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.max(0, (d.energy.rf_test_r2 ?? 0) * 100).toFixed(0)}%` }} />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Test Observations</p>
            <p className="text-xl font-black text-white mt-1">{d.energy.rf_test_obs?.toLocaleString() ?? '—'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* R² context */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">Model Performance Context</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">R² = {d.energy.rf_test_r2?.toFixed(4) ?? '—'} on test set</p>
                  <p className="text-[11px] text-slate-400 font-mono">GPU workload energy spans 4 orders of magnitude. High variability inherently limits R² on a single numeric target.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Total predicted energy: {f(d.energy.predicted_kwh, 2)} kWh</p>
                  <p className="text-[11px] text-slate-400 font-mono">vs {f(d.energy.actual_kwh, 2)} kWh recorded — {f(Math.abs(d.energy.predicted_kwh - d.energy.actual_kwh), 2)} kWh difference ({f(Math.abs((d.energy.predicted_kwh - d.energy.actual_kwh) / d.energy.actual_kwh) * 100, 2)}%).</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">Avg predicted energy: {big(d.energy.avg_predicted_j)} J per instance</p>
                  <p className="text-[11px] text-slate-400 font-mono">Across {d.workloads.device_instances.toLocaleString()} GPU device instances.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Radar */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">System Performance Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Score" dataKey="value" stroke="#00f5ff" fill="#00f5ff" fillOpacity={0.18} />
              </RadarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-slate-600 font-mono text-center">Values normalised to 0–100 scale for display</p>
          </div>
        </div>

        <div className="mt-4">
          <DisclaimerBox text="Energy predictions are in Joules. The unit of predicted energy has not been fully validated for emission calculations. Predicted-energy emissions are therefore not shown." />
        </div>
      </div>

      {/* ══════════════ SECTION 4 — ANOMALY DETECTION ══════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-red-500/20">
        <SectionHeading icon={AlertTriangle} label="Section 4 — Anomaly Detection Engine" color="text-red-400" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <KpiCard title="Total Anomalies"  value={big(d.anomalies.total)}           icon={AlertTriangle} accent="red"
            sub={`${d.anomalies.pct.toFixed(1)}% of workloads`} />
          <KpiCard title="Normal Workloads" value={big(d.workloads.unique_jobs - d.anomalies.total)} icon={ShieldCheck} accent="emerald"
            sub={`${(100 - d.anomalies.pct).toFixed(1)}% of workloads`} />
          <KpiCard title="Anomaly Types"    value={String(d.anomalies.by_type?.length ?? 0)} icon={Activity} accent="amber"
            sub="Distinct rule types" />
          <KpiCard title="Critical Anomalies" value={big(d.anomalies.by_type?.find(t => t.anomaly_severity === 'CRITICAL')?.count ?? 0)}
            icon={AlertTriangle} accent="red" sub="ZOMBIE_IDLE_WORKLOAD" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anomaly type breakdown table */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">Anomaly Breakdown by Type</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    {['Type', 'Severity', 'Count', '% of WLs'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(d.anomalies.by_type ?? []).map((r, i) => {
                    const pct = (r.count / d.workloads.unique_jobs * 100).toFixed(2);
                    return (
                      <tr key={i} className="border-b border-slate-900">
                        <td className="py-2 pr-4 text-slate-200 text-[10px]">{r.anomaly_type}</td>
                        <td className="py-2 pr-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            r.anomaly_severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                            r.anomaly_severity === 'HIGH'     ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>{r.anomaly_severity}</span>
                        </td>
                        <td className="py-2 pr-4 text-white font-semibold">{r.count.toLocaleString()}</td>
                        <td className="py-2 pr-4 text-slate-400">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Anomaly pie chart */}
          {anomPie.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">Anomaly Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={anomPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {anomPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number, _n: string, p: { payload: { name: string } }) => [v.toLocaleString() + ' workloads', p.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {anomPie.map(a => (
                  <span key={a.name} className="text-[10px] font-mono flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: a.fill }} />
                    {a.name.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════ SECTION 5 — MEMBER 3: CARBON INTELLIGENCE ══════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/20">
        <SectionHeading icon={Leaf} label="Section 5 — Member 3: Carbon Intelligence" color="text-emerald-400" />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Total Emissions (Recorded)</p>
            <p className="text-xl font-black text-white mt-1">{f(d.emissions.total_actual_kg, 2)}<span className="text-xs text-slate-400 ml-1">kg CO₂</span></p>
            <p className="text-[11px] text-slate-500 font-mono">{f(d.emissions.total_actual_tonnes, 4)} tonnes</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Avg Emissions / Job</p>
            <p className="text-xl font-black text-white mt-1">{f(d.emissions.avg_per_job_kg, 5)}<span className="text-xs text-slate-400 ml-1">kg CO₂</span></p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Grid Intensity</p>
            <p className="text-xl font-black text-white mt-1">{f(d.emissions.carbon_intensity_g_kwh, 2)}<span className="text-xs text-slate-400 ml-1">gCO₂/kWh</span></p>
            <p className="text-[11px] text-slate-500 font-mono">India national avg</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <p className="text-[11px] text-slate-400 font-mono uppercase">Trend Coverage</p>
            <p className="text-xl font-black text-white mt-1">{d.national_trend?.total_months ?? '—'}<span className="text-xs text-slate-400 ml-1">months</span></p>
            <p className="text-[11px] text-slate-500 font-mono">
              {d.national_trend?.first_date?.slice(0, 7)} – {d.national_trend?.last_date?.slice(0, 7)}
            </p>
          </div>
        </div>

        {/* Carbon model comparison */}
        {carbonModelBar.length > 0 && (
          <>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">
              Carbon Intensity Forecasting — Model Comparison (Training Data)
            </h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={carbonModelBar} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v.toFixed(4), '']} />
                <Bar dataKey="RMSE" name="RMSE" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="MAE"  name="MAE"  fill="#00f5ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Gradient Boosting outperforms Random Forest on carbon intensity forecasting (lower RMSE and MAE).
            </p>
          </>
        )}

        <div className="mt-4">
          <DisclaimerBox text="National average carbon intensity (615.17 gCO₂/kWh) is a proxy figure. It is not a real-time, workload-specific, or location-specific measurement." />
        </div>
      </div>

      {/* ══════════════ SECTION 6 — OPTIMIZATION ═══════════════════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-teal-500/20">
        <SectionHeading icon={TrendingDown} label="Section 6 — Optimization Scenario" color="text-teal-400" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Baseline Energy',     val: f(d.optimization.baseline_energy_kwh, 2),    unit: 'kWh',    color: 'text-amber-400' },
                { label: 'Scenario Energy',     val: f(d.optimization.scenario_energy_kwh, 2),    unit: 'kWh',    color: 'text-cyan-400'  },
                { label: 'Energy Saved',        val: f(d.optimization.energy_saved_kwh, 2),        unit: 'kWh',    color: 'text-emerald-400' },
                { label: 'Reduction',           val: d.optimization.pct_saved.toFixed(1),          unit: '%',      color: 'text-emerald-400' },
                { label: 'Baseline Emissions',  val: f(d.optimization.baseline_emissions_kg, 2),   unit: 'kg CO₂', color: 'text-amber-400' },
                { label: 'Scenario Emissions',  val: f(d.optimization.scenario_emissions_kg, 2),   unit: 'kg CO₂', color: 'text-emerald-400' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono uppercase">{m.label}</p>
                  <p className={`text-lg font-black ${m.color} mt-0.5`}>
                    {m.val}<span className="text-xs text-slate-400 ml-1">{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>
            <DisclaimerBox text={d.optimization.label} />
          </div>

          {/* Emissions bar comparison */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 font-mono uppercase mb-3">Emissions: Baseline vs Hypothetical Scenario</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={emCompare} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kg" width={62} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [f(v, 2) + ' kg CO₂', 'Emissions']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {emCompare.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ══════════════ SECTION 7 — DATA SOURCES & LIMITATIONS ═════════════ */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <SectionHeading icon={Info} label="Section 7 — Data Sources, Limitations & Methodology" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] font-mono text-slate-400 leading-relaxed">
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-300 font-semibold mb-1">Primary datasets</p>
              <ul className="space-y-0.5 text-slate-500">
                <li>• <code className="text-cyan-300">carboniq_executive_summary.csv</code></li>
                <li>• <code className="text-cyan-300">carboniq_full_integrated_workload.csv</code> ({d.workloads.unique_jobs.toLocaleString()} rows)</li>
                <li>• <code className="text-cyan-300">carboniq_full_integrated_detail.csv</code> ({d.workloads.device_instances.toLocaleString()} rows)</li>
                <li>• <code className="text-cyan-300">rf_model_performance.csv</code></li>
                <li>• <code className="text-cyan-300">gpu_emissions_summary.csv</code></li>
                <li>• <code className="text-cyan-300">carbon_optimization_summary.csv</code></li>
                <li>• <code className="text-cyan-300">national_carbon_features.csv</code> ({d.national_trend?.total_months ?? '—'} months)</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-300 font-semibold mb-1">Integration program</p>
              <p className="text-slate-500"><code className="text-cyan-300">integration/carboniq_full_integration.sas</code> — central SAS pipeline that merged DCGM telemetry with Slurm scheduler data, applied the Random Forest scoring, and computed Scope 2 emissions.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-300 font-semibold mb-1">Known limitations</p>
              <ul className="space-y-0.5 text-slate-500">
                <li>• Predicted-energy emissions are excluded — energy unit validation required.</li>
                <li>• National carbon intensity is an annual average proxy, not real-time.</li>
                <li>• The 10% optimization saving is an illustrative algorithmic scenario, not a measured result.</li>
                <li>• RF R² ≈ 0.35 reflects high variance in GPU energy across workload types.</li>
                <li>• Timestamps in the dataset show 1970 dates — these are artefacts of the HPC export format and do not indicate incorrect records.</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-slate-300 font-semibold mb-1">Team contribution</p>
              <ul className="space-y-0.5 text-slate-500">
                <li><span className="text-blue-400">Member 1:</span> DCGM + Slurm preprocessing pipeline</li>
                <li><span className="text-amber-400">Member 2:</span> Random Forest GPU energy prediction</li>
                <li><span className="text-emerald-400">Member 3:</span> Carbon intelligence, emissions, optimisation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ PRINT FOOTER ════════════════════════════════════════ */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 font-mono">
          <span className="text-slate-300 font-semibold">CarbonIQ</span> — AI-Powered Data Center Energy &amp; Carbon Intelligence &nbsp;|&nbsp;
          Academic Project &nbsp;|&nbsp; Generated {genDate}
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyber-cyan/50 font-mono text-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          Export / Print
        </button>
      </div>

    </div>
  );
};
