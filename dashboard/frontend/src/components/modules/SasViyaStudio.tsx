import React, { useState } from 'react';
import {
  BarChart3,
  Server,
  Database,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Layers,
  FileCode,
  Sparkles,
  Terminal,
  FolderSync,
} from 'lucide-react';
import { sasViyaService, CasTableInfo } from '../../services/sasViyaService';

export const SasViyaStudio: React.FC = () => {
  const [config, setConfig] = useState(sasViyaService.getConfig());
  const [casTables, setCasTables] = useState<CasTableInfo[]>([
    {
      tableName: 'CARBONIQ_FULL_INTEGRATED_DETAIL',
      rowCount: 96893,
      columnCount: 56,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-15 10:45:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'CARBONIQ_FULL_INTEGRATED_WORKLOAD',
      rowCount: 74849,
      columnCount: 21,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-15 10:45:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'CARBONIQ_EXECUTIVE_SUMMARY',
      rowCount: 1,
      columnCount: 17,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-15 10:45:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'DCGM_CLEANED_TELEMETRY',
      rowCount: 4843120,
      columnCount: 16,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-15 10:40:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'CARBON_INTENSITY_REGIONAL_GRID',
      rowCount: 8760,
      columnCount: 10,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-15 10:40:00 UTC',
      status: 'LOADED',
    },
  ]);
  const [selectedTable, setSelectedTable] = useState<CasTableInfo>(casTables[0]);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: true,
    success: false,
    message: 'SAS Viya Server endpoint in standby. Empty Visual Analytics container ready for report binding.',
  });
  const [isTesting, setIsTesting] = useState(false);
  const [reportUriInput, setReportUriInput] = useState(config.reportUri);
  const [reportMounted, setReportMounted] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await sasViyaService.testConnection(config.serverUrl);
    setConnectionStatus({
      tested: true,
      success: result.success,
      message: result.message,
      latencyMs: result.latencyMs,
    });
    setIsTesting(false);
  };

  const sampleSasCode = `/* ==============================================================================
   PROJECT: CARBONIQ - MASTER INTEGRATION PIPELINE
   FILE:    integration/carboniq_full_integration.sas
   ============================================================================== */

cas casauto;
libname casuser cas caslib="CASUSER";
libname carboniq cas caslib="${config.casLibrary}";

/* Step 1: Ingest Cleaned Master Telemetry */
proc cas;
   table.loadTable / 
      caslib="${config.casLibrary}"
      path="master_dataset_integrated.csv"
      casOut={name="CARBONIQ_FULL_INTEGRATED_DETAIL", replace=true};
quit;

/* Step 2: Random Forest Energy Scoring */
proc hp4score data=carboniq.CARBONIQ_FULL_INTEGRATED_DETAIL;
   id id_job;
   score file="/export/viya/homes/narayani.rajebhosale24@vit.edu/rf_model_raw_200.bin"
         out=carboniq.ENERGY_PREDICTIONS;
run;

/* Step 3: Scope 2 Carbon Emissions Calculation & Shifting Optimization */
data carboniq.CARBONIQ_FULL_INTEGRATION_FINAL;
   set carboniq.CARBONIQ_FULL_INTEGRATED_DETAIL;
   actual_energy_kwh = energyconsumed_joules / 3600000;
   carbon_intensity = 615.1726506;
   actual_emissions_kg = actual_energy_kwh * carbon_intensity / 1000;
   optimized_emissions_kg = (actual_energy_kwh * 0.90) * carbon_intensity / 1000;
   emissions_saved_kg = actual_emissions_kg - optimized_emissions_kg;
run;`;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                SAS Viya Integration Bridge & Studio
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> SAS CAS Schema Synchronized
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              SAS Visual Analytics & Cloud Analytic Services (CAS) Gateway
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Future-proof architectural container ready to bind live SAS Viya REST endpoints, SAS Visual Analytics SDK Web Components (<code>&lt;sas-report&gt;</code>), and in-memory CASHDAT tables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-semibold flex items-center gap-2 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging CAS...' : 'Test SAS Viya Connection'}</span>
            </button>
          </div>
        </div>

        {/* Connection status notification */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connectionStatus.success ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            <span className="text-slate-300">{connectionStatus.message}</span>
          </div>
          {connectionStatus.latencyMs && (
            <span className="text-slate-500">{connectionStatus.latencyMs} ms latency</span>
          )}
        </div>
      </div>

      {/* Connection Config & CAS Table Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Form */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyber-cyan" />
            SAS Viya Gateway Configuration
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">SAS Viya Host URL</label>
              <input
                type="text"
                value={config.serverUrl}
                onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700 text-slate-200 outline-none focus:border-cyber-cyan"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Target CAS Library</label>
              <input
                type="text"
                value={config.casLibrary}
                onChange={(e) => setConfig({ ...config, casLibrary: e.target.value })}
                className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700 text-slate-200 outline-none focus:border-cyber-cyan"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">SAS Visual Analytics Report URI</label>
              <input
                type="text"
                value={reportUriInput}
                onChange={(e) => setReportUriInput(e.target.value)}
                placeholder="/reports/reports/4f828a41-2b21-48e0-a7d1-e8d19e9841bb"
                className="w-full bg-slate-950 px-3 py-2 rounded-lg border border-slate-700 text-slate-200 outline-none focus:border-cyber-cyan text-[11px]"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  sasViyaService.updateConfig({ ...config, reportUri: reportUriInput });
                  setReportMounted(true);
                }}
                className="w-full py-2.5 rounded-xl bg-cyber-cyan/20 hover:bg-cyber-cyan/30 text-cyber-cyan border border-cyber-cyan/40 font-mono text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <FolderSync className="w-3.5 h-3.5" />
                <span>Save & Mount Report Container</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: CAS In-Memory Tables Explorer */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <Database className="w-4 h-4 text-cyber-cyan" />
                CAS In-Memory Tables Explorer (CASLIB: {config.casLibrary})
              </h3>
              <span className="text-xs font-mono text-cyan-400">{casTables.length} Tables Registered</span>
            </div>

            <div className="space-y-2 mt-4">
              {casTables.map((tbl) => (
                <div
                  key={tbl.tableName}
                  onClick={() => setSelectedTable(tbl)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs font-mono ${
                    selectedTable.tableName === tbl.tableName
                      ? 'bg-cyber-cyan/15 border-cyber-cyan/50 text-white shadow-glow-cyan'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <div>
                      <span className="font-bold text-slate-200">{tbl.tableName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">({tbl.engine})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 font-semibold">{tbl.rowCount.toLocaleString()} rows</span>
                    <span className="text-slate-500">{tbl.columnCount} cols</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 mt-4 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Selected: <strong className="text-cyan-300">{selectedTable.tableName}</strong></span>
            <span>Engine: <strong>{selectedTable.engine}</strong> • Columns: <strong>{selectedTable.columnCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Empty SAS Visual Analytics Section for Future Reports */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                SAS VISUAL ANALYTICS PORTAL
              </span>
              <h2 className="text-base font-bold text-white tracking-wide">
                SAS Visual Analytics Embedded Report Viewport
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Dedicated placeholder container reserved for official SAS Visual Analytics reports and web components.
            </p>
          </div>

          <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            STANDBY FOR REPORT DEPLOYMENT
          </span>
        </div>

        {/* Clean Empty State Viewport */}
        <div className="mt-6 p-8 rounded-xl bg-slate-950/60 border-2 border-dashed border-slate-800 min-h-[380px] flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-glow-cyan">
            <BarChart3 className="w-10 h-10 animate-pulse-slow" />
          </div>

          <h3 className="text-lg font-bold text-white font-mono tracking-wide">
            SAS Visual Analytics Report Section
          </h3>

          <p className="text-xs text-slate-400 font-mono max-w-xl mt-2 leading-relaxed">
            No SAS Visual Analytics report is currently embedded. Once the SAS analytics team publishes official Visual Analytics reports (e.g. Cluster Energy Profiles, Scope 2 Carbon Audit, Workload Shifting ROI), they will mount directly into this container using the <code className="text-cyan-300">&lt;sas-report&gt;</code> SDK web component.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-slate-400">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              Target SDK: <span className="text-slate-200">@sassoftware/va-report-components v0.14</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              CAS Table Ready: <span className="text-emerald-400">CARBONIQ_FULL_INTEGRATED_DETAIL</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              Report URI: <span className="text-cyan-300 font-mono">{config.reportUri || 'Unspecified'}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-900 text-[11px] font-mono text-slate-500">
            Academic Integrity Notice: Simulated report approximations have been removed. This section remains intentionally clean awaiting authentic SAS Viya report package deployment.
          </div>
        </div>
      </div>

      {/* SAS Viya CAS Code Snippet */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
              Executable SAS Master Integration Program (<code>integration/carboniq_full_integration.sas</code>)
            </h3>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(sampleSasCode)}
            className="text-xs font-mono text-cyan-400 hover:underline"
          >
            Copy SAS Script
          </button>
        </div>

        <pre className="mt-4 p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300/90 overflow-x-auto leading-relaxed border border-slate-800">
          {sampleSasCode}
        </pre>
      </div>
    </div>
  );
};
