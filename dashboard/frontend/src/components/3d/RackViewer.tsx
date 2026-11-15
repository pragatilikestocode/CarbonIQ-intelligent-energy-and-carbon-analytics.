import React from 'react';
import { ServerRack, GpuNode } from '../../types';
import {
  X,
  Cpu,
  Zap,
  Thermometer,
  Activity,
  Layers,
  ShieldAlert,
  Sliders,
  Download,
} from 'lucide-react';

interface RackViewerProps {
  rack: ServerRack | null;
  onClose: () => void;
}

export const RackViewer: React.FC<RackViewerProps> = ({ rack, onClose }) => {
  if (!rack) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl glass-panel-glow border-l border-cyber-cyan/40 p-6 overflow-y-auto backdrop-blur-2xl shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyber-cyan/20 text-cyber-cyan text-xs font-mono font-semibold border border-cyber-cyan/40">
                {rack.id}
              </span>
              <h3 className="text-xl font-bold text-white tracking-wide">{rack.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Cooling Architecture: <span className="text-slate-200">{rack.zone}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aggregate Rack Metrics */}
        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> TOTAL POWER
            </div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {rack.totalPowerKw} <span className="text-xs text-slate-400">kW</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" /> AVG TEMPERATURE
            </div>
            <div className={`text-lg font-bold font-mono mt-1 ${rack.avgTempCelsius > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {rack.avgTempCelsius}°C
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> PUE IMPACT
            </div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {rack.pueContribution}
            </div>
          </div>
        </div>

        {/* GPU Blades List (8 Nodes) */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              SXM5 GPU Blades (8x Nodes / 64x H100s)
            </h4>
            <span className="text-[11px] font-mono text-slate-500">Slot 1 - 8</span>
          </div>

          <div className="space-y-3">
            {rack.nodes.map((node, i) => (
              <div
                key={node.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyber-cyan/40 transition group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {node.id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                          node.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : node.status === 'warning'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {node.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {node.name} • 8x H100 SXM5
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      {node.powerDrawWatts} W
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono"> / 700W</span>
                    <div className={`text-xs font-mono font-semibold ${node.temperatureCelsius > 78 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {node.temperatureCelsius}°C
                    </div>
                  </div>
                </div>

                {/* Progress bars: Power & Utilization */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>SM Compute Util</span>
                      <span className="text-slate-200">{node.utilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyber-cyan h-full rounded-full transition-all duration-300"
                        style={{ width: `${node.utilizationPercent}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>HBM3 VRAM Util</span>
                      <span className="text-slate-200">{node.memoryUtilizationPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${node.memoryUtilizationPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Assigned Job & Workload */}
                {node.assignedJobId && (
                  <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400 truncate">
                      Job: <strong className="text-cyan-300">{node.assignedJobId}</strong>
                    </span>
                    <span className="text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800/40 text-[10px]">
                      {node.workloadType}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 mt-6 flex items-center gap-3">
        <button className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-medium flex items-center justify-center gap-2 transition">
          <Sliders className="w-4 h-4" />
          <span>Apply DVFS Power Cap (550W)</span>
        </button>
        <button className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-medium flex items-center gap-1.5 transition">
          <Download className="w-4 h-4" />
          <span>Export DCGM</span>
        </button>
      </div>
    </div>
  );
};

