import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Cpu, Zap, Leaf, AlertTriangle, Globe, TrendingUp, Activity, Database, Info, CheckCircle2 } from 'lucide-react';
import { apiService, OverviewData } from '../../services/apiService';

function fmt(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: dp, minimumFractionDigits: dp });
}

function KpiCard({ title, value, unit, icon: Icon, subtitle, accent = 'cyan' }: {
  title: string; value: string; unit?: string; icon: React.ElementType;
  subtitle?: string; accent?: 'cyan' | 'amber' | 'emerald' | 'violet' | 'red';
}) {
  const colors: Record<string, string> = {
    cyan: 'text-cyber-cyan border-cyber-cyan/30', amber: 'text-amber-400 border-amber-500/30',
    emerald: 'text-emerald-400 border-emerald-500/30', violet: 'text-violet-400 border-violet-500/30',
    red: 'text-red-400 border-red-500/30',
  };
  return (
    <div className={`glass-panel rounded-2xl p-5 border ${colors[accent]} flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{title}</span>
        <Icon className={`w-4 h-4 ${colors[accent].split(' ')[0]}`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">{value}</span>
        {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
      </div>
      {subtitle && <p className="text-[11px] text-slate-500 font-mono">{subtitle}</p>}
    </div>
  );
}

export const OverviewDashboard: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.overview().then(setData).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-slate-400">
      <div className="w-10 h-10 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin" />
      <p className="font-mono text-sm">Loading overview data from backend…</p>
    </div>
  );

  if (error || !data) return (
    <div className="glass-panel rounded-2xl p-8 border border-red-500/30 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-2">Could not load overview data</h2>
      <p className="text-sm text-slate-400 font-mono mb-4">{error}</p>
      <p className="text-xs text-slate-500">Start the backend: <code className="text-cyan-300">python -m uvicorn backend.main:app --port 8000</code> (from CarbonIQ-Repository/)</p>
    </div>
  );

  const compData = [
    { name: 'Baseline', value: +data.actual_emissions_kg.toFixed(1), fill: '#f59e0b' },
    { name: 'Hypothetical', value: +data.optimized_emissions_kg.toFixed(1), fill: '#10b981' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">CARBONIQ OVERVIEW</span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Connected to FastAPI Backend</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CarbonIQ Overview Dashboard</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">Integrated GPU Energy & Carbon Intelligence. All figures from real DCGM telemetry and SAS analysis outputs.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title="Total Workloads" value={data.workloads.toLocaleString()} icon={Cpu} subtitle={`${data.device_instances.toLocaleString()} GPU instances`} accent="cyan" />
        <KpiCard title="Recorded Energy" value={fmt(data.actual_energy_kwh, 1)} unit="kWh" icon={Zap} subtitle="DCGM measurements" accent="amber" />
        <KpiCard title="RF Predicted Energy" value={fmt(data.predicted_energy_kwh, 1)} unit="kWh" icon={TrendingUp} subtitle="Random Forest model" accent="cyan" />
        <KpiCard title="Scope 2 Emissions" value={fmt(data.actual_emissions_kg, 1)} unit="kg CO₂" icon={Leaf} subtitle="615.17 gCO₂/kWh grid" accent="emerald" />
        <KpiCard title="Anomalies" value={data.anomaly_count.toLocaleString()} icon={AlertTriangle} subtitle={`${data.anomaly_pct.toFixed(1)}% of workloads`} accent="red" />
        <KpiCard title="Grid Intensity" value={fmt(data.carbon_intensity, 2)} unit="gCO₂/kWh" icon={Globe} subtitle="India national avg" accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Activity className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">RF Energy Prediction Model</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Test MAE', val: data.model_perf.test_mae, isJ: true },
              { label: 'Test RMSE', val: data.model_perf.test_rmse, isJ: true },
              { label: 'Test R²', val: data.model_perf.test_r2, isJ: false },
              { label: 'Val R²', val: data.model_perf.val_r2, isJ: false },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <p className="text-[11px] text-slate-400 font-mono">{m.label}</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {m.val != null ? (m.isJ ? m.val.toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' J' : m.val.toFixed(4)) : '—'}
                </p>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-200 font-mono leading-relaxed">R² ≈ 0.35 reflects high variance in GPU energy consumption spanning 4 orders of magnitude.</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-800">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Carbon Optimization Scenario</h2>
          </div>
          <div className="p-2 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-[10px] font-mono text-amber-300">⚠ {data.optimization.label}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Hypothetical Saving</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{fmt(data.optimization.emissions_saved_kg, 1)} kg CO₂</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Reduction Target</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">{data.optimization.pct_reduced.toFixed(1)}%</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={compData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kg" width={62} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmt(v, 1) + ' kg CO₂', 'Emissions']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {compData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <Database className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="text-slate-400 font-semibold">Data sources:</span>{' '}
          outputs/carboniq_executive_summary.csv • outputs/module_1_gpu_energy/rf_model_performance.csv • outputs/module_2_carbon_intelligence/carbon_optimization_summary.csv
        </p>
      </div>
    </div>
  );
};
