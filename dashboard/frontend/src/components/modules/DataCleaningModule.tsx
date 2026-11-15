import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Filter,
  RefreshCw,
  Download,
  FileCheck,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { StatCard } from '../common/StatCard';

export const DataCleaningModule: React.FC = () => {
  const summary = dataService.getDataCleaningSummary();
  const rawSamples = dataService.getRawDataSamples();
  const validationRules = dataService.getValidationRules();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'filtered_outlier' | 'imputed' | 'valid'>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const filteredSamples = rawSamples.filter((sample) => {
    if (selectedFilter === 'all') return true;
    return sample.cleanStatus === selectedFilter;
  });

  const handleExportToSasCas = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                Member 1 • Data Engineering & Ingestion
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Status: Certified Clean
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              DCGM Telemetry & Slurm Scheduler Integration Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              High-throughput ingestion pipeline performing outlier rejection, sensor glitch filtering, timestamp harmonization, and sliding-window temporal joins for SAS Viya CAS tables.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportToSasCas}
              disabled={isExporting}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs font-mono tracking-wide shadow-glow-cyan hover:opacity-95 transition flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>{isExporting ? 'Exporting to SAS CAS...' : 'Export to SAS Viya CAS'}</span>
            </button>
          </div>
        </div>

        {exportSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Successfully synced 4,843,120 rows to CAS library: <strong>CARBONIQ_CAS.DCGM_SCHEDULER_INTEGRATED</strong></span>
          </div>
        )}
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Raw Telemetry Ingested"
          value={(summary.rawTelemetryRecords / 1000000).toFixed(2)}
          unit="M Records"
          icon={Layers}
          change="+480k / hr"
          changeType="neutral"
          description="10s DCGM Sensor Polling"
          accentColor="cyan"
        />
        <StatCard
          title="Cleaned Records Produced"
          value={(summary.cleanedTelemetryRecords / 1000000).toFixed(2)}
          unit="M Records"
          icon={FileCheck}
          change="98.99% Retention"
          changeType="positive"
          description="Ready for ML & SAS Analysis"
          accentColor="neon"
        />
        <StatCard
          title="Scheduler Jobs Mapped"
          value={summary.schedulerJobRecords.toLocaleString()}
          unit="Slurm Traces"
          icon={Sliders}
          change="99.84% Synced"
          changeType="positive"
          description="User & Model Metadata Merged"
          accentColor="violet"
        />
        <StatCard
          title="Overall Data Quality Score"
          value={`${summary.overallDataQualityScore}%`}
          icon={ShieldCheck}
          change="+1.4% Post-Cleaning"
          changeType="positive"
          description="IQR + Kalman Filtered"
          accentColor="cyan"
          gaugePercent={summary.overallDataQualityScore}
        />
      </div>

      {/* 6-Stage Cleaning Pipeline Visualizer */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-cyber-cyan" />
          End-to-End Preprocessing & Integration Pipeline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.pipelineStages.map((stage, idx) => (
            <div
              key={stage.stage}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyber-cyan/40 transition relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-cyber-cyan">
                  STEP 0{idx + 1}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2 group-hover:text-cyber-cyan transition">
                {stage.stage.split(': ')[1]}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {stage.description}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>{stage.recordsProcessed.toLocaleString()} records</span>
                <span className="text-emerald-400 font-semibold">{stage.durationMs} ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw vs Cleaned Telemetry Inspector Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyber-cyan" />
              Raw DCGM Telemetry vs Cleaned Sample Records
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live stream inspection demonstrating sensor outlier rejection, null imputation, and physical boundary clamping.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {(['all', 'valid', 'imputed', 'filtered_outlier'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-medium capitalize border transition ${
                  selectedFilter === filter
                    ? 'bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50 shadow-glow-cyan'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {filter.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">Timestamp (UTC)</th>
                <th className="py-3 px-3">GPU Identifier</th>
                <th className="py-3 px-3">Raw Power (W)</th>
                <th className="py-3 px-3">Raw Util (%)</th>
                <th className="py-3 px-3">Raw Temp (°C)</th>
                <th className="py-3 px-3">DCGM Hardware Flag</th>
                <th className="py-3 px-3">Cleaning Transformation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSamples.map((sample, i) => (
                <tr key={i} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3 text-slate-300">{sample.timestamp}</td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">{sample.gpuId}</td>
                  <td className="py-3 px-3">
                    {sample.rawPowerW !== null ? (
                      <span className={sample.rawPowerW > 700 || sample.rawPowerW < 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {sample.rawPowerW.toFixed(1)} W
                      </span>
                    ) : (
                      <span className="text-amber-400 italic">NULL / Missed</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {sample.rawUtilPercent !== null ? (
                      <span className={sample.rawUtilPercent < 0 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {sample.rawUtilPercent.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-amber-400 italic">NULL</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    {sample.rawTempC !== null ? `${sample.rawTempC.toFixed(1)} °C` : 'N/A'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
                      {sample.statusFlag}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        sample.cleanStatus === 'valid'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : sample.cleanStatus === 'imputed'
                          ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {sample.cleanStatus === 'valid'
                        ? 'Passed Validation'
                        : sample.cleanStatus === 'imputed'
                        ? 'Spline Imputed'
                        : 'Outlier Filtered'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Rules Checklist Engine */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-cyber-neon" />
          Active Telemetry Validation & Sanitation Rules
        </h2>

        <div className="space-y-3">
          {validationRules.map((rule) => (
            <div
              key={rule.field}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-300 font-bold">{rule.field}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px]">
                    {rule.status}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Enforcement: <span className="text-slate-200">{rule.rule}</span> • Action: <span className="text-slate-300">{rule.action}</span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">
                  {rule.violationsCaught.toLocaleString()}
                </span>
                <span className="text-slate-500 text-[11px] ml-1">violations rectified</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

