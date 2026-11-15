import React, { useState } from 'react';
import { Database, AlertTriangle, ShieldCheck, ExternalLink, ChevronDown, RefreshCw } from 'lucide-react';
import { DataSourceMode } from '../../types';
import { dataService } from '../../services/dataService';

interface DemoDataBadgeProps {
  currentMode: DataSourceMode;
  onModeChange: (mode: DataSourceMode) => void;
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({ currentMode, onModeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState(dataService.getBackendApiUrl() || 'http://localhost:8000/api/v1');

  const getBadgeStyle = () => {
    switch (currentMode) {
      case 'demo':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:border-amber-400 shadow-glow-amber';
      case 'mock-sas':
        return 'bg-cyber-cyan/10 text-cyber-cyan border-cyber-cyan/30 hover:border-cyber-cyan shadow-glow-cyan';
      case 'live-sas':
        return 'bg-cyber-neon/10 text-cyber-neon border-cyber-neon/30 hover:border-cyber-neon shadow-glow-neon';
    }
  };

  const getLabel = () => {
    switch (currentMode) {
      case 'demo':
        return 'DEMO DATA ACTIVE';
      case 'mock-sas':
        return 'SAS VIYA MOCK BRIDGE';
      case 'live-sas':
        return 'SAS VIYA CAS CONNECTED';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono font-medium tracking-wider transition-all duration-300 ${getBadgeStyle()}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <Database className="w-3.5 h-3.5" />
        <span>{getLabel()}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-xl glass-panel-glow p-4 text-slate-200 z-50 border border-cyber-cyan/30 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="font-semibold text-sm text-white tracking-wide">Data Source & Provenance</h4>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
            >
              ✕
            </button>
          </div>

          <div className="my-3 text-xs text-slate-300 leading-relaxed space-y-2">
            <p className="bg-amber-950/40 border border-amber-500/20 rounded p-2 text-amber-200">
              <strong>Academic Transparency Notice:</strong> The analytical backend and SAS Visual Analytics models are in active development. All metrics currently rendered use realistic synthetic datasets modeled on 2,048x NVIDIA H100 SXM5 GPU cluster telemetry.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Active Data Adapter Mode
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => {
                  onModeChange('demo');
                  dataService.setMode('demo');
                }}
                className={`flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition border ${
                  currentMode === 'demo'
                    ? 'bg-amber-500/15 border-amber-500/50 text-white'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-amber-300">Standalone Demo Mode</div>
                  <div className="text-[11px] text-slate-400">
                    Preloaded high-fidelity datasets for Member 1 (DCGM), Member 2 (Energy), and Member 3 (Carbon).
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onModeChange('mock-sas');
                  dataService.setMode('mock-sas');
                }}
                className={`flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition border ${
                  currentMode === 'mock-sas'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-white'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-cyan-300">SAS Viya Mock Adapter</div>
                  <div className="text-[11px] text-slate-400">
                    Simulates SAS CAS table fetching, SAS Visual Analytics SDK element wrappers, and CAS action sets.
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  onModeChange('live-sas');
                  dataService.setMode('live-sas');
                }}
                className={`flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition border ${
                  currentMode === 'live-sas'
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                    : 'bg-slate-900/40 border-slate-700/40 text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="mt-0.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-emerald-300">Live SAS Viya CAS Gateway</div>
                  <div className="text-[11px] text-slate-400">
                    Attempts handshake with CAS library <code className="text-emerald-300">CARBONIQ_CAS</code> and renders live VA Web Components.
                  </div>
                </div>
              </button>
            </div>

            {currentMode === 'live-sas' && (
              <div className="mt-3 p-2.5 bg-slate-900/70 rounded-lg border border-slate-700/60 space-y-2">
                <label className="text-[11px] font-mono text-slate-400">Backend API / CAS Endpoint</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    className="flex-1 bg-slate-950 px-2.5 py-1 text-xs rounded border border-slate-700 text-white font-mono focus:border-cyber-cyan outline-none"
                    placeholder="https://viya4.analytics.internal"
                  />
                  <button
                    onClick={() => dataService.setBackendApiUrl(apiUrl)}
                    className="px-2.5 py-1 bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan rounded border border-cyber-cyan/40 text-xs font-mono"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-neon" />
              Dataset version: <strong className="text-slate-300 font-mono">v1.4.2-synthetic</strong>
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-cyber-cyan hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

