import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Flame,
  Activity,
  Layers,
  Sparkles,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { StatCard } from '../common/StatCard';

const COLORS = ['#00f5ff', '#38bdf8', '#818cf8', '#a855f7', '#00ff88'];

export const EnergyIntelligenceModule: React.FC = () => {
  const energyTimeSeries = dataService.getEnergyTimeSeries();
  const predictions = dataService.getEnergyPredictions();
  const anomalies = dataService.getEnergyAnomalies();
  const topJobs = dataService.getTopEnergyJobs();
  const workloadDist = dataService.getWorkloadDistribution();
  const stats = dataService.getEnergyStatistics();

  const [activeChartTab, setActiveChartTab] = useState<'historical' | 'prediction'>('historical');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Member 2 • Module 1: GPU Energy Intelligence
              </span>
              <span className="text-xs font-mono text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> High-Resolution Energy Telemetry
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              GPU Energy & Power Intelligence Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Real-time power consumption decomposition, statistical load profiling, isolation-forest anomaly detection, and machine-learning energy prediction for 2,048x NVIDIA H100 GPUs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300">
              24h Total Energy: <strong className="text-cyan-300">{stats.total24hEnergyMwh} MWh</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Mean GPU Power Draw"
          value={stats.meanPowerWatts}
          unit="Watts / GPU"
          icon={Zap}
          change="Median: 495.0W"
          changeType="neutral"
          description="SXM5 700W TDP Limit"
          accentColor="cyan"
          gaugePercent={(stats.meanPowerWatts / 700) * 100}
        />
        <StatCard
          title="P95 Peak Power"
          value={stats.p95PowerWatts}
          unit="Watts"
          icon={Flame}
          change="P99: 698.0W"
          changeType="negative"
          description="Under Heavy All-Reduce Gradient"
          accentColor="amber"
          gaugePercent={(stats.p95PowerWatts / 700) * 100}
        />
        <StatCard
          title="Active Energy Anomalies"
          value={anomalies.filter((a) => a.status === 'active').length}
          unit="Alerts"
          icon={AlertTriangle}
          change="-2 Mitigated"
          changeType="positive"
          description="Isolation Forest Anomaly Model"
          accentColor="violet"
        />
        <StatCard
          title="Standard Deviation"
          value={stats.stdDevWatts}
          unit="Watts"
          icon={Activity}
          change="Kurtosis: 2.14"
          changeType="neutral"
          description="Skewness: -0.42"
          accentColor="neon"
        />
      </div>

      {/* Main Charts: 24h Power Consumption & 24h ML Energy Forecaster */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyber-cyan" />
              {activeChartTab === 'historical'
                ? '24-Hour Actual Power Draw vs Baseline Curve (kW)'
                : 'Machine Learning GPU Energy Forecasting (+24h Lookahead)'}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              {activeChartTab === 'historical'
                ? 'Empirical cluster load showing peak demand windows and baseline comparison'
                : 'SAS Viya Gradient Boosting / LSTM predictor with 95% confidence bounds'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveChartTab('historical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeChartTab === 'historical'
                  ? 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/40 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              24h Power Profile
            </button>
            <button
              onClick={() => setActiveChartTab('prediction')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                activeChartTab === 'prediction'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-glow-violet'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ML Prediction Horizon
            </button>
          </div>
        </div>

        {/* Chart Rendering */}
        <div className="h-[360px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'historical' ? (
              <AreaChart data={energyTimeSeries} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00f5ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="baselineColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} domain={[900, 1800]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 19, 38, 0.95)',
                    borderColor: 'rgba(0, 245, 255, 0.3)',
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="actualPowerKw"
                  name="Actual Power (kW)"
                  stroke="#00f5ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#actualColor)"
                />
                <Area
                  type="monotone"
                  dataKey="baselinePowerKw"
                  name="Unoptimized Baseline (kW)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#baselineColor)"
                />
                <Line
                  type="monotone"
                  dataKey="predictedPowerKw"
                  name="ML Forecaster Target (kW)"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            ) : (
              <AreaChart data={predictions} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="ciRangeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} domain={[1000, 1800]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(13, 19, 38, 0.95)',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  name="95% CI Upper Bound (kW)"
                  stroke="#8b5cf6"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  fill="url(#ciRangeColor)"
                />
                <Line
                  type="monotone"
                  dataKey="mlPredicted"
                  name="Predicted Load (kW)"
                  stroke="#00f5ff"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="carbonOptimized"
                  name="Carbon-Optimized Schedule (kW)"
                  stroke="#00ff88"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="baseline"
                  name="Standard Baseline (kW)"
                  stroke="#f43f5e"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workload Analysis & Statistical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workload Distribution Donut */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider mb-2">
              Workload Category Energy Shares
            </h3>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Breakdown across Foundation Pretraining, Fine-Tuning, and Serving.
            </p>

            <div className="h-[220px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workloadDist}
                    dataKey="sharePercent"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {workloadDist.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 19, 38, 0.95)',
                      borderColor: 'rgba(0, 245, 255, 0.3)',
                      borderRadius: '0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs font-mono">
            {workloadDist.map((item, idx) => (
              <div key={item.category} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  {item.category}
                </span>
                <span className="text-white font-bold">{item.sharePercent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Outliers & Anomalies */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Detected Energy Outliers & Hardware Anomalies
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Isolation Forest and auto-regression detecting inefficient execution patterns.
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-cyber-cyan/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-white">{anom.anomalyType}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        anom.severity === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : anom.severity === 'high'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {anom.severity}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400">{anom.nodeId}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    +{anom.impactKwh} kWh Waste
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  {anom.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Engine: {anom.detectedBy}</span>
                  <span className="text-slate-500">{anom.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 5 Energy Consuming Jobs Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyber-cyan" />
              Top Energy-Consuming GPU Cluster Jobs (Slurm Traces)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Ranked by aggregate kWh consumption with carbon attribution and efficiency scoring.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3">Job ID</th>
                <th className="py-3 px-3">Workload Name</th>
                <th className="py-3 px-3">User & Lab</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">GPU Allocation</th>
                <th className="py-3 px-3">Runtime</th>
                <th className="py-3 px-3">Energy (kWh)</th>
                <th className="py-3 px-3">Carbon (kg CO₂)</th>
                <th className="py-3 px-3">Cost ($)</th>
                <th className="py-3 px-3">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {topJobs.map((job) => (
                <tr key={job.jobId} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-3 font-bold text-cyan-300">{job.jobId}</td>
                  <td className="py-3 px-3 font-medium text-white">{job.jobName}</td>
                  <td className="py-3 px-3 text-slate-400">{job.userName} • {job.department}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300">
                      {job.workloadType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-200">{job.gpuCount}x {job.gpuModel.split(' ')[1]}</td>
                  <td className="py-3 px-3 text-slate-300">{job.runtimeHours} hrs</td>
                  <td className="py-3 px-3 font-bold text-amber-300">{job.totalEnergyKwh.toLocaleString()} kWh</td>
                  <td className="py-3 px-3 font-bold text-rose-300">{job.totalCarbonKg.toLocaleString()} kg</td>
                  <td className="py-3 px-3 text-slate-200">${job.estimatedCostUsd.toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {job.energyEfficiencyScore}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

