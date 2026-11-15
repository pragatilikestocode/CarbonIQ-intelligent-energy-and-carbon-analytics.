import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { AlertTriangle, Shield, Info, Filter } from 'lucide-react';
import { apiService, AnomalySummary, WorkloadListResponse } from '../../services/apiService';

function LoadingBox() { return <div className="flex items-center justify-center h-40 text-slate-500 font-mono text-sm">Loading…</div>; }
function ErrorBox({ msg }: { msg: string }) { return <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">{msg}</div>; }

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444', HIGH: '#f59e0b', MEDIUM: '#00f5ff', LOW: '#a855f7', NORMAL: '#475569',
};
const TYPE_COLORS: Record<string, string> = {
  SENSOR_INTEGRAL_MISMATCH: '#00f5ff',
  ZERO_ENERGY_ACTIVE_POWER: '#f59e0b',
  ZOMBIE_IDLE_WORKLOAD: '#ef4444',
  PREDICTION_RESIDUAL_OUTLIER: '#a855f7',
  ZERO_POWER_POSITIVE_ENERGY: '#10b981',
};

const RULES = [
  { type: 'ZERO_ENERGY_ACTIVE_POWER', desc: 'Power draw > 0 W but energy = 0 J — indicates a sensor telemetry drop where the energy counter failed to register.', sev: 'HIGH' },
  { type: 'SENSOR_INTEGRAL_MISMATCH', desc: 'Recorded energy deviates > 100,000 J from the physical integral P_avg × t_exec — indicates meter drift or hardware reporting inconsistency.', sev: 'MEDIUM' },
  { type: 'PREDICTION_RESIDUAL_OUTLIER', desc: 'RF model residual > 3 × test RMSE (> 406,836 J) — workload energy far outside what the model expects for its features.', sev: 'MEDIUM' },
  { type: 'ZOMBIE_IDLE_WORKLOAD', desc: 'Power > 80 W, SM utilisation < 1%, runtime > 300 s — GPU allocated but performing no useful compute work.', sev: 'CRITICAL' },
  { type: 'ZERO_POWER_POSITIVE_ENERGY', desc: 'Energy counter > 0 J with zero power draw — energy counter increment without active power, suggesting a hardware counter glitch.', sev: 'LOW' },
];

export const AnomalyDetectionModule: React.FC = () => {
  const [summary, setSummary] = useState<AnomalySummary | null>(null);
  const [workloads, setWorkloads] = useState<WorkloadListResponse | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState('');
  const [filterSev, setFilterSev] = useState('');
  const [wlLoading, setWlLoading] = useState(false);

  useEffect(() => {
    apiService.anomalySummary().then(setSummary).catch((e: Error) => setErrs(p => ({ ...p, sum: e.message })));
  }, []);

  const fetchWorkloads = useCallback(() => {
    setWlLoading(true);
    const params: Record<string, string | number | undefined | null> = {
      limit: 50,
      anomaly_type: filterType || undefined,
      anomaly_severity: filterSev || undefined,
    };
    apiService.anomalyWorkloads(params)
      .then(setWorkloads)
      .catch((e: Error) => setErrs(p => ({ ...p, wl: e.message })))
      .finally(() => setWlLoading(false));
  }, [filterType, filterSev]);

  useEffect(() => { fetchWorkloads(); }, [fetchWorkloads]);

  const criticalHighCount = summary
    ? (summary.by_severity.find(s => s.severity === 'CRITICAL')?.count ?? 0) +
      (summary.by_severity.find(s => s.severity === 'HIGH')?.count ?? 0)
    : 0;

  const pieData = summary?.by_type ?? [];
  const severityData = summary?.by_severity.filter(s => s.severity !== 'NORMAL') ?? [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-red-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/40">ANOMALY DETECTION ENGINE</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Anomaly Detection</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Five-rule physical and statistical engine applied to 96,893 GPU device instances from DCGM telemetry.
            Anomalies flagged based on energy integral checks, power telemetry, and RF prediction residuals.
          </p>
        </div>
      </div>

      {/* KPIs */}
      {errs.sum ? <ErrorBox msg={errs.sum} /> : !summary ? <LoadingBox /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Anomalies', val: summary.total_anomalies.toLocaleString(), icon: AlertTriangle, accent: 'red' },
              { label: 'Anomaly Rate', val: summary.anomaly_pct.toFixed(1) + '%', icon: AlertTriangle, accent: 'amber' },
              { label: 'Normal Workloads', val: (summary.total_workloads - summary.total_anomalies).toLocaleString(), icon: Shield, accent: 'emerald' },
              { label: 'Critical + High', val: criticalHighCount.toLocaleString(), icon: AlertTriangle, accent: 'red' },
            ].map(k => {
              const Icon = k.icon;
              const colors: Record<string, string> = {
                red: 'text-red-400 border-red-500/30', amber: 'text-amber-400 border-amber-500/30', emerald: 'text-emerald-400 border-emerald-500/30',
              };
              return (
                <div key={k.label} className={`glass-panel rounded-2xl p-5 border ${colors[k.accent]} flex flex-col gap-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{k.label}</span>
                    <Icon className={`w-4 h-4 ${colors[k.accent].split(' ')[0]}`} />
                  </div>
                  <span className="text-2xl font-black text-white">{k.val}</span>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Anomalies by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, pct }) => `${pct.toFixed(1)}%`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={TYPE_COLORS[entry.type] ?? '#475569'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number, _: string, props: { payload: { type: string; count: number; pct: number } }) =>
                      [`${v.toLocaleString()} workloads (${props.payload.pct.toFixed(2)}%)`, props.payload.type]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {pieData.map(d => (
                  <span key={d.type} className="text-[10px] font-mono flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full" style={{ background: TYPE_COLORS[d.type] ?? '#475569' }} />
                    {d.type}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase mb-4">Anomalies by Severity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={severityData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="severity" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [v.toLocaleString() + ' workloads', '']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {severityData.map((e, i) => <Cell key={i} fill={SEVERITY_COLORS[e.severity] ?? '#475569'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Detection Rule Descriptions */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" /> Detection Rules Applied
        </h3>
        <div className="space-y-2">
          {RULES.map(r => (
            <div key={r.type} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex gap-3">
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border self-start mt-0.5 whitespace-nowrap ${
                r.sev === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                r.sev === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                r.sev === 'MEDIUM' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}>{r.sev}</span>
              <div>
                <p className="text-xs font-bold text-white font-mono">{r.type}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workload Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Filter className="w-4 h-4 text-red-400" /> Anomalous Workloads
          </h3>
          <div className="flex flex-wrap gap-2">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyber-cyan">
              <option value="">All Types</option>
              <option value="SENSOR_INTEGRAL_MISMATCH">SENSOR_INTEGRAL_MISMATCH</option>
              <option value="ZERO_ENERGY_ACTIVE_POWER">ZERO_ENERGY_ACTIVE_POWER</option>
              <option value="ZOMBIE_IDLE_WORKLOAD">ZOMBIE_IDLE_WORKLOAD</option>
              <option value="PREDICTION_RESIDUAL_OUTLIER">PREDICTION_RESIDUAL_OUTLIER</option>
            </select>
            <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyber-cyan">
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>
        </div>

        {errs.wl ? <ErrorBox msg={errs.wl} /> : wlLoading ? <LoadingBox /> : !workloads || workloads.items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-sm">No anomalies match selected filters.</div>
        ) : (
          <>
            <p className="text-[11px] text-slate-500 font-mono mb-3">{workloads.total.toLocaleString()} anomalous workloads — showing top 50</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    {['Job ID', 'Partition', 'Recorded Energy (kWh)', 'Anomaly Type', 'Severity', 'Exec Time (s)'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workloads.items.map(w => (
                    <tr key={w.id_job} className="border-b border-slate-900 hover:bg-slate-900/40 transition">
                      <td className="py-2 pr-4 text-cyan-300">{w.id_job}</td>
                      <td className="py-2 pr-4 text-slate-300">{w.partition}</td>
                      <td className="py-2 pr-4 text-amber-300">{(w.actual_energy_kwh ?? 0).toFixed(4)}</td>
                      <td className="py-2 pr-4 text-slate-200">{w.anomaly_type}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          w.anomaly_severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                          w.anomaly_severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                          'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        }`}>{w.anomaly_severity}</span>
                      </td>
                      <td className="py-2 pr-4 text-slate-400">{w.totalexecutiontime_sec?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
