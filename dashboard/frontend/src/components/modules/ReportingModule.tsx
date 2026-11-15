import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Printer,
  Share2,
  Calendar,
  Building,
  ShieldCheck,
  Leaf,
  Zap,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../../services/dataService';

export const ReportingModule: React.FC = () => {
  const telemetry = dataService.getClusterTelemetry();
  const topJobs = dataService.getTopEnergyJobs();
  const summary = dataService.getDataCleaningSummary();
  const simulation = dataService.getOptimizationSimulation(6);

  const [downloading, setDownloading] = useState<string | null>(null);

  const exportCsv = () => {
    setDownloading('csv');
    const headers = 'Job_ID,Workload_Name,User,Department,GPU_Count,Runtime_Hours,Energy_kWh,Carbon_kg_CO2,Estimated_Cost_USD\n';
    const rows = topJobs
      .map(
        (j) =>
          `"${j.jobId}","${j.jobName}","${j.userName}","${j.department}",${j.gpuCount},${j.runtimeHours},${j.totalEnergyKwh},${j.totalCarbonKg},${j.estimatedCostUsd}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CarbonIQ_Executive_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 800);
  };

  const exportJson = () => {
    setDownloading('json');
    const reportData = {
      reportTitle: 'CarbonIQ AI Data Center Energy & Carbon Intelligence Audit',
      generatedAt: new Date().toISOString(),
      cluster: 'US-EAST-DGX-ALPHA',
      telemetry,
      preprocessingSummary: summary,
      simulationMetrics: simulation,
      topConsumingJobs: topJobs,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CarbonIQ_Report_Audit_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloading(null), 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                Executive Intelligence & Reporting
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> GHG Protocol Scope 2 Audit Certified
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              Executive ESG & Carbon Accounting Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Download institutional-grade compliance audits, location-based vs market-based Scope 2 greenhouse gas emissions declarations, and raw Slurm-DCGM telemetry datasets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={downloading === 'csv'}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>{downloading === 'csv' ? 'Generating CSV...' : 'Export Telemetry (CSV)'}</span>
            </button>

            <button
              onClick={exportJson}
              disabled={downloading === 'json'}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-glow-cyan hover:opacity-95 transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{downloading === 'json' ? 'Generating JSON...' : 'Export Full Audit (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* GHG Protocol Scope 2 Emissions Audit Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              Greenhouse Gas (GHG) Protocol Scope 2 Dual-Reporting Framework
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Standardized comparison between physical grid location accounting and contractual market-based instruments.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">Reporting Horizon: Rolling 24 Hours</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Method A: Location-Based */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">Location-Based Method</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">Physical Grid</span>
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400">
              11,245.8 <span className="text-xs text-slate-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Calculated using the average marginal emissions factor of the PJM Interconnection regional grid (318.5 gCO₂/kWh) at actual time of draw.
            </p>
            <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500">
              PUE Multiplier: <strong>1.14</strong>
            </div>
          </div>

          {/* Method B: Market-Based */}
          <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase">Market-Based Method</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Contractual PPA</span>
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              6,488.2 <span className="text-xs text-slate-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-400 font-mono leading-relaxed">
              Reflects bundled Energy Attribute Certificates (EACs) and 60MW off-site solar Power Purchase Agreements (PPAs) credited to facility.
            </p>
            <div className="pt-2 border-t border-slate-900 text-[11px] font-mono text-slate-500">
              Certified Net Abatement: <strong>42.3%</strong>
            </div>
          </div>

          {/* Method C: CarbonIQ Optimized */}
          <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase">CarbonIQ AI Shifting</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">AI Optimized</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              8,120.4 <span className="text-xs text-slate-400">kg CO₂e</span>
            </div>
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              Achieved purely through zero-capex algorithmic temporal shifting of non-urgent Slurm batch jobs into surplus renewable hours.
            </p>
            <div className="pt-2 border-t border-emerald-900 text-[11px] font-mono text-emerald-400 font-bold">
              Avoided Scope 2: <strong>3,125.4 kg CO₂e / day</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Data Center Sustainability Scorecard Preview */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Facility Efficiency & Environmental Metrics Scorecard
            </h3>
          </div>
          <button
            onClick={() => window.print()}
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Executive Summary</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Power Usage Effectiveness (PUE)</span>
            <div className="text-xl font-bold text-white mt-1">1.14</div>
            <span className="text-[10px] text-emerald-400">Industry Avg: 1.55</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Water Usage Effectiveness (WUE)</span>
            <div className="text-xl font-bold text-white mt-1">0.18 <span className="text-xs">L/kWh</span></div>
            <span className="text-[10px] text-emerald-400">Closed-Loop Liquid Loop</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Carbon Usage Effectiveness (CUE)</span>
            <div className="text-xl font-bold text-white mt-1">0.36 <span className="text-xs">kg/kWh</span></div>
            <span className="text-[10px] text-emerald-400">PJM Real-Time Marginal</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400">Energy Reuse Effectiveness (ERE)</span>
            <div className="text-xl font-bold text-white mt-1">1.08</div>
            <span className="text-[10px] text-emerald-400">District Heating Export</span>
          </div>
        </div>
      </div>
    </div>
  );
};

