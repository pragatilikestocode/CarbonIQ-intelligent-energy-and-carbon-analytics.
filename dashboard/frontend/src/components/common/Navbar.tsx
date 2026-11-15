import React from 'react';
import {
  Cpu,
  Zap,
  Leaf,
  Activity,
  Layers,
  BarChart3,
  Flame,
  FileSpreadsheet,
  Globe,
  Settings,
} from 'lucide-react';
import { ClusterTelemetry, DataSourceMode } from '../../types';
import { DemoDataBadge } from './DemoDataBadge';

interface NavbarProps {
  telemetry: ClusterTelemetry;
  activeTab: string;
  onTabChange: (tab: string) => void;
  dataSourceMode: DataSourceMode;
  onModeChange: (mode: DataSourceMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  telemetry,
  activeTab,
  onTabChange,
  dataSourceMode,
  onModeChange,
}) => {
  const navItems = [
    { id: 'command', label: 'Command Center (3D)', icon: Activity },
    { id: 'cleaning', label: 'M1: Data Cleaning', icon: Layers },
    { id: 'energy', label: 'M2: GPU Energy', icon: Zap },
    { id: 'carbon', label: 'M3: Carbon Intelligence', icon: Leaf },
    { id: 'sas', label: 'SAS Viya Studio', icon: BarChart3 },
    { id: 'reports', label: 'Executive Reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyber-cyan/20 backdrop-blur-xl">
      {/* Top Telemetry Ticker */}
      <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-950/80 border-b border-slate-800/80 text-[11px] font-mono">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            CLUSTER: <strong className="text-white">US-EAST-DGX-ALPHA</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3 h-3 text-cyan-400" />
            GPUS: <strong className="text-white">{telemetry.activeGpus.toLocaleString()} / {telemetry.totalGpus.toLocaleString()}</strong> (SXM5)
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Zap className="w-3 h-3 text-amber-400" />
            POWER DRAW: <strong className="text-white">{telemetry.totalPowerDrawKw.toFixed(1)} kW</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Flame className="w-3 h-3 text-cyan-300" />
            PUE: <strong className="text-emerald-400">{telemetry.averagePue.toFixed(2)}</strong>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Leaf className="w-3 h-3 text-emerald-400" />
            GRID INTENSITY: <strong className="text-white">{telemetry.currentCarbonIntensity.toFixed(1)} gCO₂/kWh</strong>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-slate-400 flex items-center gap-1">
            EFFICIENCY: <strong className="text-cyan-300">{telemetry.efficiencyScore}%</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold tracking-wider text-[10px]">
            {telemetry.dataCenterHealth}
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyber-cyan/40 shadow-glow-cyan">
            <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyber-neon shadow-glow-neon" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">
                CARBON<span className="text-cyber-cyan glow-text-cyan">IQ</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                v1.4
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight hidden sm:block">
              AI GPU Energy & Carbon Intelligence
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-cyber-cyan/15 text-white border border-cyber-cyan/50 shadow-glow-cyan font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyber-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Demo Data Badge & Controls */}
        <div className="flex items-center gap-3">
          <DemoDataBadge currentMode={dataSourceMode} onModeChange={onModeChange} />
        </div>
      </div>
    </header>
  );
};

