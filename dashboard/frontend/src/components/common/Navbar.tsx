import React, { useEffect, useState } from 'react';
import {
  Cpu,
  LayoutDashboard,
  Zap,
  AlertTriangle,
  Leaf,
  TrendingDown,
  Box,
  BarChart3,
  ClipboardList,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiService } from '../../services/apiService';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'overview',     label: 'Overview',               icon: LayoutDashboard },
  { id: 'energy',       label: 'GPU Energy',              icon: Zap },
  { id: 'anomalies',    label: 'Anomaly Detection',       icon: AlertTriangle },
  { id: 'carbon',       label: 'Carbon Intelligence',     icon: Leaf },
  { id: 'optimization', label: 'Optimization',            icon: TrendingDown },
  { id: 'twin',         label: '3D Digital Twin',         icon: Box },
  { id: 'sas',          label: 'SAS Visual Analytics',    icon: BarChart3 },
  { id: 'report',       label: 'Executive Summary',       icon: ClipboardList },
];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const check = () => {
      apiService
        .health()
        .then(() => mounted && setBackendOnline(true))
        .catch(() => mounted && setBackendOnline(false));
    };
    check();
    const interval = setInterval(check, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyber-cyan/20 backdrop-blur-xl">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border border-cyber-cyan/40 shadow-glow-cyan">
            <Cpu className="w-5 h-5 text-cyber-cyan animate-pulse-slow" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyber-neon shadow-glow-neon" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white">
                CARBON<span className="text-cyber-cyan glow-text-cyan">IQ</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30">
                v2.0
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              AI GPU Energy &amp; Carbon Intelligence
            </p>
          </div>
        </div>

        {/* Tab Links */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap ${
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

        {/* Backend Status Indicator */}
        <div className="flex-shrink-0 hidden md:flex items-center gap-2">
          {backendOnline === null ? (
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
              Checking…
            </span>
          ) : backendOnline ? (
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              API Connected
            </span>
          ) : (
            <span className="text-[11px] font-mono text-red-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              API Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
