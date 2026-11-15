import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Flame,
  Leaf,
  Cpu,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ClusterTelemetry, ServerRack } from '../../types';
import { StatCard } from '../common/StatCard';
import { DataCenterScene } from '../3d/DataCenterScene';
import { RackViewer } from '../3d/RackViewer';
import { dataService } from '../../services/dataService';

interface CommandCenterProps {
  telemetry: ClusterTelemetry;
  onNavigateTab: (tabId: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({ telemetry, onNavigateTab }) => {
  const racks = dataService.getRacks();
  const [selectedRack, setSelectedRack] = useState<ServerRack | null>(null);
  const anomalies = dataService.getEnergyAnomalies().filter((a) => a.status === 'active');
  const workloadDist = dataService.getWorkloadDistribution();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome & Mission Banner */}
      <div className="relative rounded-2xl p-6 glass-panel-glow border border-cyber-cyan/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI CLUSTER COMMAND CORE
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" /> Real-Time Telemetry Polling (10s)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
              CarbonIQ Digital Twin & Telemetry Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              AI-driven multi-objective optimization coordinating DCGM GPU performance, dynamic cooling load, grid carbon intensity, and intelligent job scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('carbon')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-glow-cyan hover:opacity-95 transition flex items-center gap-2"
            >
              <Leaf className="w-4 h-4" />
              <span>Launch Carbon Optimizer</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Cluster Power Draw"
          value={telemetry.totalPowerDrawKw.toFixed(1)}
          unit="kW"
          icon={Zap}
          change="-4.2% vs Peak"
          changeType="positive"
          description="1.47 MW of 1.72 MW Cap"
          accentColor="cyan"
          gaugePercent={(telemetry.totalPowerDrawKw / telemetry.peakPowerKw) * 100}
        />
        <StatCard
          title="Average Data Center PUE"
          value={telemetry.averagePue.toFixed(2)}
          icon={Flame}
          change="-0.03 MoM"
          changeType="positive"
          description="Top 2% Tier Green Efficiency"
          accentColor="neon"
          gaugePercent={88}
        />
        <StatCard
          title="Grid Carbon Intensity"
          value={telemetry.currentCarbonIntensity.toFixed(1)}
          unit="gCO₂/kWh"
          icon={Leaf}
          change="+8.4% Morning Peak"
          changeType="negative"
          description="PJM Interconnection (Marginal)"
          accentColor="amber"
          gaugePercent={62}
        />
        <StatCard
          title="Data Center Efficiency"
          value={`${telemetry.efficiencyScore}%`}
          icon={Activity}
          change="Optimal"
          changeType="positive"
          description="2,048x NVIDIA H100 SXM5 Online"
          accentColor="violet"
          gaugePercent={telemetry.efficiencyScore}
        />
      </div>

      {/* 3D Digital Twin Data Center Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              3D High-Density GPU Data Center Floor
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Live spatial twin showing thermal distribution, liquid cooling manifolds, and per-blade GPU wattage.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
            Zone A & B: Direct Liquid Cooling • Zone C & D: Rear Door Heat Exchanger
          </span>
        </div>

        <DataCenterScene
          racks={racks}
          selectedRack={selectedRack}
          onSelectRack={(rack) => setSelectedRack(rack)}
        />
      </div>

      {/* Secondary Row: Active Anomalies & Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active AI Anomalies Feed (Member 2 output) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Real-Time Anomaly & Outlier Watch ({anomalies.length} Active)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('energy')}
              className="text-xs text-cyber-cyan hover:underline font-mono flex items-center gap-1"
            >
              <span>View In Energy Intelligence</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 mt-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-cyber-cyan/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        anom.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">{anom.anomalyType}</span>
                    <span className="text-[11px] font-mono text-cyan-400">Node: {anom.nodeId}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">{anom.description}</p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-right flex-shrink-0">
                  <span className="text-xs font-mono font-semibold text-rose-400">
                    +{anom.impactKwh} kWh Waste
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{anom.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workload Distribution Quick Card */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Active Workload Shares
              </h3>
              <span className="text-[11px] font-mono text-cyan-400">428 Active Jobs</span>
            </div>

            <div className="space-y-3 mt-4">
              {workloadDist.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="text-white font-bold">{item.sharePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full"
                      style={{ width: `${item.sharePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5">
                    <span>{item.jobCount} Jobs</span>
                    <span>{item.avgPowerDrawKw} kW avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => onNavigateTab('cleaning')}
              className="w-full py-2 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 text-xs font-mono transition flex items-center justify-center gap-2"
            >
              <span>Inspect Raw DCGM Telemetry Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Rack Drawer */}
      <RackViewer
        rack={selectedRack}
        onClose={() => setSelectedRack(null)}
      />
    </div>
  );
};

