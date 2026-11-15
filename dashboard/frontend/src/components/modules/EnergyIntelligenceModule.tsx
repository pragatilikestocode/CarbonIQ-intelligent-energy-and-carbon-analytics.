import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Zap, AlertTriangle, Info, Filter, TrendingUp } from 'lucide-react';
import { apiService, ModelPerfResponse, DistributionResponse, PartitionStat, JobTypeStat, WorkloadListResponse } from '../../services/apiService';

function fmt(n: number | null | undefined, dp = 4): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: dp, minimumFractionDigits: dp });
}

function LoadingBox() {
  return <div className="flex items-center justify-center h-40 text-slate-500 font-mono text-sm">Loading…</div>;
}
function ErrorBox({ msg }: { msg: string }) {
  return <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">{msg}</div>;
}

export const EnergyIntelligenceModule: React.FC = () => {
  const [modelPerf, setModelPerf] = useState<ModelPerfResponse | null>(null);
  const [dist, setDist] = useState<DistributionResponse | null>(null);
  const [byPartition, setByPartition] = useState<PartitionStat[]>([]);
  const [byJobType, setByJobType] = useState<JobTypeStat[]>([]);
  const [workloads, setWorkloads] = useState<WorkloadListResponse | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});

  // Filter state
  const [filterPartition, setFilterPartition] = useState('');
  const [filterJobType, setFilterJobType] = useState('');
  const [filterAnomaly, setFilterAnomaly] = useState('');
  const [wlLoading, setWlLoading] = useState(false);

  useEffect(() => {
    apiService.energyModelPerformance().then(setModelPerf).catch((e: Error) => setErrs(p => ({ ...p, perf: e.message })));
    apiService.energyDistribution().then(setDist).catch((e: Error) => setErrs(p => ({ ...p, dist: e.message })));
    apiService.energyByPartition().then(setByPartition).catch((e: Error) => setErrs(p => ({ ...p, part: e.message })));
    apiService.energyByJobType().then(setByJobType).catch((e: Error) => setErrs(p => ({ ...p, jtype: e.message })));
  }, []);

  const fetchWorkloads = useCallback(() => {
    setWlLoading(true);
    const params: Record<string, string | number | undefined | null> = {
      limit: 50,
      sort_by: 'actual_energy_joules',
      partition: filterPartition || undefined,
      job_type: filterJobType || undefined,
      is_anomaly: filterAnomaly !== '' ? parseInt(filterAnomaly) : undefined,
    };
    apiService.energyWorkloads(params)
      .then(setWorkloads)
      .catch((e: Error) => setErrs(p => ({ ...p, wl: e.message })))
      .finally(() => setWlLoading(false));
  }, [filterPartition, filterJobType, filterAnomaly]);

  useEffect(() => { fetchWorkloads(); }, [fetchWorkloads]);

  const testRow = modelPerf?.rows.find(r => r.Data_Split === 'TEST');
  const valRow = modelPerf?.rows.find(r => r.Data_Split === 'VALIDATION');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-amber-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">MEMBER 2 — MODULE 1: GPU ENERGY INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">GPU Energy Intelligence</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Random Forest model trained on DCGM GPU telemetry. Predicted energy in Joules.
            96,893 device instances across 74,849 unique workloads.
          </p>
        </div>
      </div>

      {/* Model Performance KPIs */}
      {errs.perf ? <ErrorBox msg={errs.perf} /> : !modelPerf ? <LoadingBox /> : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Test MAE', val: testRow?.MAE, unit: 'J' },
              { label: 'Test RMSE', val: testRow?.RMSE, unit: 'J' },
              { label: 'Test R²', val: testRow?.R_Squared, unit: '' },
            ].map(m => (
              <div key={m.label} className="glass-panel rounded-2xl p-5 border border-amber-500/20 flex flex-col gap-1">
                <span className="text-xs font-mono text-slate-400 uppercase">{m.label}</span>
                <span className="text-2xl font-black text-white">
                  {m.val != null ? (m.unit === 'J' ? m.val.toLocaleString(undefined, { maximumFractionDigits: 0 }) : m.val.toFixed(4)) : '—'}
                  {m.unit && <span className="text-sm text-slate-400 ml-1">{m.unit}</span>}
                </span>
                {m.label === 'Test R²' && m.val != null && (
                  <div className="mt-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.max(0, m.val * 100).toFixed(0)}%` }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-200 font-mono leading-relaxed">
              <strong>Model note:</strong> R² ≈ {testRow?.R_Squared?.toFixed(3)} on test set ({testRow?.Observations?.toLocaleString()} samples).
              Validation MAE = {valRow?.MAE?.toLocaleString(undefined, { maximumFractionDigits: 0 })} J, RMSE = {valRow?.RMSE?.toLocaleString(undefined, { maximumFractionDigits: 0 })} J.
              {modelPerf.note}
            </div>
          </div>
        </>
      )}

      {/* Energy by Partition and Job Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Energy by Partition
          </h3>
          {errs.part ? <ErrorBox msg={errs.part} /> : byPartition.length === 0 ? <LoadingBox /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byPartition} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="partition" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kWh" width={68} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [fmt(v, 2) + ' kWh', '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total_actual_kwh" name="Recorded (kWh)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total_predicted_kwh" name="Predicted (kWh)" fill="#00f5ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> Energy by Job Type
          </h3>
          {errs.jtype ? <ErrorBox msg={errs.jtype} /> : byJobType.length === 0 ? <LoadingBox /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byJobType} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="job_type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" kWh" width={68} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [fmt(v, 2) + ' kWh', '']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="total_actual_kwh" name="Recorded (kWh)" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="total_predicted_kwh" name="Predicted (kWh)" fill="#00f5ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Predicted Energy Distribution */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono uppercase mb-1 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" /> Predicted Energy Distribution (Log₁₀ Bins)
        </h3>
        {errs.dist ? <ErrorBox msg={errs.dist} /> : !dist ? <LoadingBox /> : (
          <>
            <p className="text-[11px] text-slate-500 font-mono mb-4">{dist.note} — {dist.total.toLocaleString()} workloads</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dist.bins}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range_label" tick={{ fill: '#94a3b8', fontSize: 9 }} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [v.toLocaleString() + ' workloads', '']} />
                <Bar dataKey="count" fill="#00f5ff" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Workload Table with Filters */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" /> Top 50 Workloads by Recorded Energy
          </h3>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterPartition}
              onChange={e => setFilterPartition(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyber-cyan"
            >
              <option value="">All Partitions</option>
              <option value="normal">normal</option>
              <option value="gaia">gaia</option>
              <option value="test">test</option>
            </select>
            <select
              value={filterJobType}
              onChange={e => setFilterJobType(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyber-cyan"
            >
              <option value="">All Job Types</option>
              <option value="OTHER">OTHER</option>
              <option value="LLSUB:BATCH">LLSUB:BATCH</option>
              <option value="LLSUB:INTERACTIVE">LLSUB:INTERACTIVE</option>
              <option value="LLMAPREDU CE:MAP">LLMAPREDU CE:MAP</option>
            </select>
            <select
              value={filterAnomaly}
              onChange={e => setFilterAnomaly(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 outline-none focus:border-cyber-cyan"
            >
              <option value="">All</option>
              <option value="0">Normal Only</option>
              <option value="1">Anomalies Only</option>
            </select>
          </div>
        </div>

        {errs.wl ? <ErrorBox msg={errs.wl} /> : wlLoading ? <LoadingBox /> : !workloads || workloads.items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-sm">No workloads match the selected filters.</div>
        ) : (
          <>
            <p className="text-[11px] text-slate-500 font-mono mb-3">{workloads.total.toLocaleString()} total matching — showing top 50</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    {['Job ID', 'Partition', 'Job Type', 'Recorded (kWh)', 'Predicted (kWh)', 'Emissions (kg CO₂)', 'Anomaly'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workloads.items.map(w => (
                    <tr key={w.id_job} className="border-b border-slate-900 hover:bg-slate-900/40 transition">
                      <td className="py-2 pr-4 text-cyan-300">{w.id_job}</td>
                      <td className="py-2 pr-4 text-slate-300">{w.partition}</td>
                      <td className="py-2 pr-4 text-slate-400">{w.job_type}</td>
                      <td className="py-2 pr-4 text-amber-300">{(w.actual_energy_kwh ?? 0).toFixed(4)}</td>
                      <td className="py-2 pr-4 text-cyan-300">{(w.predicted_energy_kwh ?? 0).toFixed(4)}</td>
                      <td className="py-2 pr-4 text-emerald-300">{(w.actual_emissions_kg ?? 0).toFixed(4)}</td>
                      <td className="py-2 pr-4">
                        {w.is_anomaly === 1 ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            w.anomaly_severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                            w.anomaly_severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                            'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          }`}>{w.anomaly_type}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">Normal</span>
                        )}
                      </td>
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
