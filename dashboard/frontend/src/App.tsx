import React, { useState } from 'react';
import { Navbar } from './components/common/Navbar';
import { CommandCenter } from './components/modules/CommandCenter';
import { OverviewDashboard } from './components/modules/OverviewDashboard';
import { EnergyIntelligenceModule } from './components/modules/EnergyIntelligenceModule';
import { AnomalyDetectionModule } from './components/modules/AnomalyDetectionModule';
import { CarbonIntelligenceModule } from './components/modules/CarbonIntelligenceModule';
import { OptimizationModule } from './components/modules/OptimizationModule';
import { SasViyaStudio } from './components/modules/SasViyaStudio';
import { Layers, Zap, Leaf, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="min-h-screen bg-carbon-bg text-slate-100 flex flex-col justify-between bg-cyber-grid bg-[size:40px_40px] selection:bg-cyber-cyan selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {activeTab === 'overview' && <OverviewDashboard />}
        {activeTab === 'energy' && <EnergyIntelligenceModule />}
        {activeTab === 'anomalies' && <AnomalyDetectionModule />}
        {activeTab === 'carbon' && <CarbonIntelligenceModule />}
        {activeTab === 'optimization' && <OptimizationModule />}
        {activeTab === 'twin' && <CommandCenter />}
        {activeTab === 'sas' && <SasViyaStudio />}
      </main>

      {/* Futuristic Enterprise Footer */}
      <footer className="w-full glass-panel border-t border-slate-800/80 mt-12 py-8 px-6 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand Info & Academic Project Attribution */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white tracking-wider">
                CARBON<span className="text-cyber-cyan">IQ</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                Academic Project Platform
              </span>
            </div>
            <p className="text-slate-400 text-[11px] max-w-md">
              AI-Powered Data Center Energy &amp; Carbon Intelligence. Monitoring, predicting, and optimizing high-density GPU computing infrastructure.
            </p>
          </div>

          {/* 3 Team Member Module Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Member 1: Data Preprocessing</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Member 2: GPU Energy Intel</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Member 3: Carbon Intelligence</span>
            </div>
          </div>

          {/* System Provenance */}
          <div className="text-right space-y-1">
            <div className="text-[11px] text-slate-400 flex items-center md:justify-end gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyber-neon" />
              <span>Architecture: Standalone Decoupled (SAS Viya Ready)</span>
            </div>
            <div className="text-[10px] text-slate-500">
              Calibration: NVIDIA DGX H100
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
