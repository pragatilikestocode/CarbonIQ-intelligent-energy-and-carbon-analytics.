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
  BarChart,
  Bar,
} from 'recharts';
import {
  Leaf,
  Globe,
  Sliders,
  CheckCircle2,
  TrendingDown,
  DollarSign,
  Sun,
  Wind,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { StatCard } from '../common/StatCard';

export const CarbonIntelligenceModule: React.FC = () => {
  const carbonTimeline = dataService.getCarbonTimeline();
  const regionalGrids = dataService.getRegionalGrids();
  const recommendations = dataService.getSustainabilityRecommendations();

  // Interactive slider for workload shift flexibility
  const [shiftHours, setShiftHours] = useState(6);
  const simulation = dataService.getOptimizationSimulation(shiftHours);

  // Recommendation status toggles
  const [appliedRecs, setAppliedRecs] = useState<Record<string, boolean>>({
    'REC-04': true,
  });

  const toggleApplyRec = (id: string) => {
    setAppliedRecs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-cyber-cyan/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                Member 3 • Module 2: Carbon Intelligence
              </span>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" /> Scope 2 GHG Compliance Ready
              </span>
            </div>
            <h1 className="text-2xl font-black text-white mt-2 tracking-tight">
              Grid Carbon Intelligence & Dynamic Workload Shifter
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
              Integrating real-time marginal grid emissions factors to compute high-precision Scope 2 carbon footprint, forecast green energy windows, and simulate carbon-aware job shifting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs font-mono text-slate-300">
              Primary Grid: <strong className="text-emerald-400">PJM Regional (318.5 gCO₂/kWh)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Daily Carbon Footprint"
          value={simulation.originalEmissionsKg.toLocaleString()}
          unit="kg CO₂e"
          icon={Leaf}
          change="-27.8% Potential"
          changeType="positive"
          description="Location-Based Scope 2 Accounting"
          accentColor="neon"
          gaugePercent={72}
        />
        <StatCard
          title="Simulated Carbon Reduction"
          value={`-${simulation.carbonReductionPercent}%`}
          icon={TrendingDown}
          change={`-${(simulation.originalEmissionsKg - simulation.optimizedEmissionsKg).toFixed(0)} kg CO₂`}
          changeType="positive"
          description={`With ±${shiftHours}h Shift Flexibility`}
          accentColor="cyan"
          gaugePercent={simulation.carbonReductionPercent * 2}
        />
        <StatCard
          title="Energy Cost Savings"
          value={`$${simulation.energyCostSavingsUsd.toLocaleString()}`}
          unit="/ mo"
          icon={DollarSign}
          change="Off-Peak Arbitrage"
          changeType="positive"
          description="Avoided Peaker Tariff Rates"
          accentColor="violet"
        />
        <StatCard
          title="Green Energy Matching"
          value="68%"
          icon={Sun}
          change="Peak at 13:00 UTC"
          changeType="positive"
          description="Solar & Wind Co-location Index"
          accentColor="amber"
          gaugePercent={68}
        />
      </div>

      {/* Grid Carbon Intensity & Renewable Generation Horizon */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyber-cyan" />
              Regional Grid Carbon Intensity & Renewable Generation Mix (24h)
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Highlighting the optimal midday solar window (11:00 - 15:00 UTC) vs evening fossil-fuel peaker ramp.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Carbon Intensity (gCO₂/kWh)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <Sun className="w-3.5 h-3.5" /> Solar Generation
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Wind className="w-3.5 h-3.5" /> Wind Generation
            </span>
          </div>
        </div>

        <div className="h-[340px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={carbonTimeline} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} domain={[150, 450]} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(13, 19, 38, 0.95)',
                  borderColor: 'rgba(0, 245, 255, 0.3)',
                  borderRadius: '0.75rem',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="intensityGco2Kwh"
                name="Grid Carbon Intensity (gCO₂/kWh)"
                stroke="#00f5ff"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#carbonGradient)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="solarMw"
                name="Solar Output (MW)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="windMw"
                name="Wind Output (MW)"
                stroke="#00ff88"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Carbon-Aware Workload Shifting Simulator */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Interactive Carbon-Aware Workload Shifting Simulator
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Simulate deferring non-urgent LLM batch training into surplus green renewable generation windows.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Flexibility Horizon:</span>
            <span className="text-sm font-mono font-bold text-emerald-400 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              ±{shiftHours} Hours
            </span>
          </div>
        </div>

        {/* Slider Controls */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Rigid Real-Time (0h)</span>
            <span className="text-emerald-400 font-semibold">Current Setting: ±{shiftHours}h Shift Buffer</span>
            <span>Max Green Deferral (12h)</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={shiftHours}
            onChange={(e) => setShiftHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Live Simulation Results Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Baseline Daily Emissions</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              {simulation.originalEmissionsKg.toLocaleString()} <span className="text-xs text-slate-400">kg CO₂</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Standard FIFO Queue</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <span className="text-[11px] font-mono text-emerald-300 uppercase">Optimized Carbon Schedule</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {simulation.optimizedEmissionsKg.toLocaleString()} <span className="text-xs text-slate-400">kg CO₂</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-mono mt-1">
              -{simulation.carbonReductionPercent}% Net GHG Savings
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Deferred Batch Jobs</span>
            <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
              {simulation.deferredJobsCount} <span className="text-xs text-slate-400">Training Jobs</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Zero SLA Deadlines Missed</p>
          </div>
        </div>

        {/* 24-Hour Load Shifting Schedule Visualizer */}
        <div className="mt-6">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-3">
            Recommended 24-Hour Load Dispatch Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {simulation.recommendedSchedule.map((slot) => {
              const isHeavy = slot.action === 'RUN_HEAVY';
              const isStandby = slot.action === 'LOW_POWER_STANDBY';
              const isDefer = slot.action === 'DEFER_BATCH';

              return (
                <div
                  key={slot.timeSlot}
                  className={`p-3 rounded-xl border text-xs font-mono transition ${
                    isHeavy
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : isStandby
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                      : isDefer
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-[11px] font-bold text-white">{slot.timeSlot}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {slot.gridCarbonIntensity} gCO₂/kWh
                  </div>
                  <div className="mt-2 text-xs font-bold font-mono">
                    {slot.recommendedLoadMw} MW Target
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 border border-white/10">
                      {slot.action.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Regional Grid Comparison & Carbon Arbitrage */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-cyber-cyan" />
          Multi-Region Carbon Arbitrage & Workload Migration Targets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {regionalGrids.map((grid) => (
            <div
              key={grid.regionCode}
              className={`p-4 rounded-xl bg-slate-950/70 border transition ${
                grid.status === 'low'
                  ? 'border-emerald-500/30 hover:border-emerald-400'
                  : grid.status === 'high'
                  ? 'border-rose-500/30 hover:border-rose-400'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">{grid.regionCode}</span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                    grid.status === 'low'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : grid.status === 'high'
                      ? 'bg-rose-500/20 text-rose-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                >
                  {grid.status} Carbon
                </span>
              </div>

              <div className="text-xs font-medium text-slate-300 mt-2">{grid.regionName}</div>

              <div className="mt-3 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Intensity:</span>
                  <span className="text-white font-bold">{grid.currentIntensity} g/kWh</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Renewable:</span>
                  <span className="text-emerald-400 font-bold">{grid.renewablePercentage}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Power Cost:</span>
                  <span className="text-slate-200">${grid.projectedCostPerMwh}/MWh</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable Sustainability Recommendations */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Actionable Data Center Sustainability Recommendations
        </h2>

        <div className="space-y-3">
          {recommendations.map((rec) => {
            const isApplied = appliedRecs[rec.id];

            return (
              <div
                key={rec.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyber-cyan/40 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        rec.priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : rec.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {rec.priority}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">{rec.category}</span>
                    <h3 className="text-sm font-bold text-white">{rec.title}</h3>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
                    <span>
                      CO₂ Savings: <strong className="text-emerald-400">+{rec.potentialCo2ReductionKgPerDay} kg/day</strong>
                    </span>
                    <span>
                      Power Savings: <strong className="text-cyan-400">+{rec.potentialKwhSavingsPerDay} kWh/day</strong>
                    </span>
                    <span>
                      Financial ROI: <strong className="text-amber-400">+${rec.financialSavingsUsdPerMonth}/mo</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => toggleApplyRec(rec.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 ${
                      isApplied
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Policy Active' : 'Apply Policy'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

