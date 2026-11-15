import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import {
  TrendingDown, Zap, Leaf, Info, AlertTriangle, Database,
} from 'lucide-react';
import { apiService, OptimizationData, EmissionsSummary } from '../../services/apiService';

function fmt(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: dp, minimumFractionDigits: dp });
}

export const OptimizationModule: React.FC = () => {
  const [opt, setOpt] = useState<OptimizationData | null>(null);
  const [emissions, setEmissions] = useState<EmissionsSummary | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.carbonOptimization().then(setOpt).catch((e: Error) => setErrs(p => ({ ...p, opt: e.message }))),
      apiService.carbonEmissionsSummary().then(setEmissions).catch((e: Error) => setErrs(p => ({ ...p, em: e.message }))),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4 text-slate-400">
      <div className="w-10 h-10 rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan animate-spin" />
      <p className="font-mono text-sm">Loading optimization data from backend…</p>
    </div>
  );

  const hasError = errs.opt || errs.em;

  if (hasError && !opt) return (
    <div className="glass-panel rounded-2xl p-8 border border-red-500/30 text-center">
      <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <h2 className="text-lg font-bold text-white mb-2">Could not load optimization data</h2>
      <p className="text-sm text-slate-400 font-mono mb-4">{errs.opt || errs.em}</p>
      <p className="text-xs text-slate-500">Start the backend: <code className="text-cyan-300">python -m uvicorn backend.main:app --port 8000</code></p>
    </div>
  );

  if (!opt) return (
    <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center">
      <p className="text-sm text-slate-400 font-mono">No optimization data available.</p>
    </div>
  );

  const compData = [
    { name: 'Baseline', value: +opt.emissions_kg.toFixed(1), fill: '#f59e0b', label: 'Recorded emissions' },
    { name: 'Hypothetical', value: +opt.optimized_emissions_kg.toFixed(1), fill: '#10b981', label: 'After 10% efficiency' },
  ];

  const energyCompData = [
    { name: 'Baseline', value: +opt.energy_kwh.toFixed(2), fill: '#f59e0b' },
    { name: 'Hypothetical', value: +opt.optimized_energy_kwh.toFixed(2), fill: '#00f5ff' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              OPTIMIZATION RECOMMENDATIONS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Optimization Recommendations</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Energy efficiency scenario applied to recorded DCGM energy measurements.
            All figures derived from SAS-integrated carbon optimization outputs.
          </p>
        </div>
      </div>

      {/* Scenario disclaimer */}
      <div className="glass-panel rounded-2xl p-4 border border-amber-500/30 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-200 font-mono leading-relaxed">
          <strong>⚠ {opt.label}</strong>
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Baseline Energy</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{fmt(opt.energy_kwh, 2)}</span>
            <span className="text-xs text-slate-400 font-mono">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Recorded DCGM measurements</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Scenario Energy</span>
            <Zap className="w-4 h-4 text-cyber-cyan" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{fmt(opt.optimized_energy_kwh, 2)}</span>
            <span className="text-xs text-slate-400 font-mono">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">After 10% efficiency improvement</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Energy Saved</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400">{fmt(opt.energy_saved_kwh, 2)}</span>
            <span className="text-xs text-slate-400 font-mono">kWh</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Potential saving (illustrative)</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Emissions Avoided</span>
            <Leaf className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400">{fmt(opt.emissions_saved_kg, 2)}</span>
            <span className="text-xs text-slate-400 font-mono">kg CO₂</span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono">{opt.pct_saved.toFixed(1)}% reduction (illustrative)</p>
        </div>
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emissions comparison */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Emissions: Baseline vs Hypothetical</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kg" width={62} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmt(v, 2) + ' kg CO₂', 'Emissions']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {compData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Baseline Emissions</p>
              <p className="text-lg font-bold text-amber-400">{fmt(opt.emissions_kg, 2)} kg CO₂</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Hypothetical Emissions</p>
              <p className="text-lg font-bold text-emerald-400">{fmt(opt.optimized_emissions_kg, 2)} kg CO₂</p>
            </div>
          </div>
        </div>

        {/* Energy comparison */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
            <Zap className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Energy: Baseline vs Hypothetical</h2>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={energyCompData} barSize={48}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kWh" width={62} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmt(v, 2) + ' kWh', 'Energy']} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {energyCompData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Baseline Energy</p>
              <p className="text-lg font-bold text-amber-400">{fmt(opt.energy_kwh, 2)} kWh</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Scenario Energy</p>
              <p className="text-lg font-bold text-cyan-400">{fmt(opt.optimized_energy_kwh, 2)} kWh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emissions context from recorded data */}
      {emissions && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
            <Database className="w-4 h-4 text-cyber-cyan" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recorded Emissions Context</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Jobs Measured</p>
              <p className="text-lg font-bold text-white">{emissions.total_jobs_measured.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Total Energy (kWh)</p>
              <p className="text-lg font-bold text-amber-400">{fmt(emissions.total_energy_kwh, 2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Total Emissions (kg CO₂)</p>
              <p className="text-lg font-bold text-emerald-400">{fmt(emissions.total_emissions_kg, 2)}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <p className="text-[11px] text-slate-400 font-mono">Grid Intensity (gCO₂/kWh)</p>
              <p className="text-lg font-bold text-violet-400">{fmt(emissions.carbon_intensity_g_kwh, 2)}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-3">{emissions.note}</p>
        </div>
      )}

      {/* Data source footer */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <Database className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="text-slate-400 font-semibold">Data sources:</span>{' '}
          outputs/module_2_carbon_intelligence/carbon_optimization_summary.csv • outputs/module_2_carbon_intelligence/gpu_emissions_summary.csv
        </p>
      </div>
    </div>
  );
};
