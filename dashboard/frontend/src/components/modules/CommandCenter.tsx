import React, { useEffect, useState } from 'react';
import {
  Zap,
  AlertTriangle,
  Cpu,
  Activity,
  Leaf,
  Info,
  Database,
} from 'lucide-react';
import { ServerRack } from '../../types';
import { StatCard } from '../common/StatCard';
import { DataCenterScene } from '../3d/DataCenterScene';
import { RackViewer } from '../3d/RackViewer';
import { mockRacks } from '../../mock/mockClusterData';
import { apiService, OverviewData, WorkloadListResponse } from '../../services/apiService';

function fmt(n: number | null | undefined, dp = 1): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: dp, minimumFractionDigits: dp });
}

export const CommandCenter: React.FC = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [anomalies, setAnomalies] = useState<WorkloadListResponse | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [selectedRack, setSelectedRack] = useState<ServerRack | null>(null);

  useEffect(() => {
    apiService.overview().then(setOverview).catch((e: Error) => setErrs(p => ({ ...p, ov: e.message })));
    apiService.anomalyWorkloads({ limit: 8 }).then(setAnomalies).catch((e: Error) => setErrs(p => ({ ...p, anom: e.message })));
  }, []);

  const racks = mockRacks;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="relative rounded-2xl p-6 glass-panel border border-cyber-cyan/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
              3D DIGITAL TWIN
            </span>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Real KPIs from FastAPI
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CarbonIQ Digital Twin &amp; Telemetry Hub</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Interactive 3D data center visualization. KPIs and anomaly data are fetched live from the FastAPI backend.
            The 3D rack layout is an illustrative representation — see note below.
          </p>
        </div>
      </div>

      {/* Real KPI cards from API */}
      {errs.ov ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
          Could not load overview: {errs.ov}
        </div>
      ) : !overview ? (
        <div className="flex items-center justify-center h-40 text-slate-500 font-mono text-sm">Loading overview data…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Workloads"
            value={overview.workloads.toLocaleString()}
            icon={Cpu}
            description={`${overview.device_instances.toLocaleString()} GPU instances`}
            accentColor="cyan"
          />
          <StatCard
            title="Recorded Energy"
            value={fmt(overview.actual_energy_kwh)}
            unit="kWh"
            icon={Zap}
            description="DCGM measurements"
            accentColor="amber"
          />
          <StatCard
            title="Scope 2 Emissions"
            value={fmt(overview.actual_emissions_kg)}
            unit="kg CO₂"
            icon={Leaf}
            description={`${fmt(overview.carbon_intensity, 2)} gCO₂/kWh grid`}
            accentColor="neon"
          />
          <StatCard
            title="Anomalies Detected"
            value={overview.anomaly_count.toLocaleString()}
            icon={AlertTriangle}
            description={`${overview.anomaly_pct.toFixed(1)}% of workloads`}
            accentColor="violet"
          />
        </div>
      )}

      {/* 3D Digital Twin Scene */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              3D GPU Data Center Digital Twin
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Interactive 3D scene — click any rack to inspect GPU blades. Toggle thermal heatmap mode.
            </p>
          </div>
        </div>

        <DataCenterScene
          racks={racks}
          selectedRack={selectedRack}
          onSelectRack={(rack) => setSelectedRack(rack)}
        />

        {/* Illustrative data disclaimer */}
        <div className="glass-panel rounded-xl p-3 border border-amber-500/20 flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 font-mono leading-relaxed">
            <strong>Illustrative 3D Visualization:</strong> The rack layout, temperatures, and power figures shown in the
            3D scene are representative of a high-density GPU data center environment. The KPI cards above display
            real metrics from the CarbonIQ SAS-integrated dataset (96,893 GPU instances, 74,849 workloads).
          </p>
        </div>
      </div>

      {/* Real anomaly feed from API */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Top Anomalous Workloads
            </h3>
          </div>
          {overview && (
            <span className="text-xs font-mono text-amber-400">
              {overview.anomaly_count.toLocaleString()} total anomalies
            </span>
          )}
        </div>

        {errs.anom ? (
          <div className="p-4 mt-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">
            {errs.anom}
          </div>
        ) : !anomalies ? (
          <div className="flex items-center justify-center h-32 text-slate-500 font-mono text-sm">Loading anomalies…</div>
        ) : anomalies.items.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-sm">No anomalous workloads found.</div>
        ) : (
          <div className="space-y-3 mt-4">
            {anomalies.items.map((anom) => (
              <div
                key={anom.id_job}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyber-cyan/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      anom.anomaly_severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                      anom.anomaly_severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {anom.anomaly_severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{anom.anomaly_type}</span>
                    <span className="text-[11px] font-mono text-cyan-400">Job: {anom.id_job}</span>
                    <span className="text-[11px] font-mono text-slate-500">{anom.partition}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    Recorded energy: {(anom.actual_energy_kwh ?? 0).toFixed(4)} kWh •
                    Predicted: {(anom.predicted_energy_kwh ?? 0).toFixed(4)} kWh •
                    Exec time: {anom.totalexecutiontime_sec?.toFixed(0) ?? '—'}s
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between text-right flex-shrink-0">
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    {(anom.actual_emissions_kg ?? 0).toFixed(4)} kg CO₂
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data source footer */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-start gap-3">
        <Database className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="text-slate-400 font-semibold">Data sources:</span>{' '}
          outputs/carboniq_executive_summary.csv • outputs/carboniq_full_integrated_workload.csv
        </p>
      </div>

      {/* Selected Rack Drawer */}
      <RackViewer
        rack={selectedRack}
        onClose={() => setSelectedRack(null)}
      />
    </div>
  );
};
