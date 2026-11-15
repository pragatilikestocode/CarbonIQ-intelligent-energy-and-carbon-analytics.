import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
} from 'recharts';
import { Leaf, Globe, AlertCircle, Database, Info } from 'lucide-react';
import {
  apiService, CarbonTrendResponse, CarbonStateResponse, EmissionsSummary,
} from '../../services/apiService';

function fmt(n: number | null | undefined, dp = 2): string {
  if (n == null) return '—';
  return n.toLocaleString(undefined, { maximumFractionDigits: dp, minimumFractionDigits: dp });
}
function LoadingBox() { return <div className="flex items-center justify-center h-40 text-slate-500 font-mono text-sm">Loading…</div>; }
function ErrorBox({ msg }: { msg: string }) { return <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs">{msg}</div>; }

export const CarbonIntelligenceModule: React.FC = () => {
  const [trend, setTrend] = useState<CarbonTrendResponse | null>(null);
  const [states, setStates] = useState<CarbonStateResponse | null>(null);
  const [emissions, setEmissions] = useState<EmissionsSummary | null>(null);
  const [models, setModels] = useState<{ training: Record<string, unknown>[]; validation: Record<string, unknown>[]; note: string } | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});

  useEffect(() => {
    apiService.carbonNationalTrend().then(setTrend).catch((e: Error) => setErrs(p => ({ ...p, trend: e.message })));
    apiService.carbonStateComparison().then(setStates).catch((e: Error) => setErrs(p => ({ ...p, states: e.message })));
    apiService.carbonEmissionsSummary().then(setEmissions).catch((e: Error) => setErrs(p => ({ ...p, em: e.message })));
    apiService.carbonModelComparison().then(setModels).catch((e: Error) => setErrs(p => ({ ...p, models: e.message })));
  }, []);

  // Thin trend data for label readability (every 6th point)
  const trendRows = trend?.rows ?? [];
  const tickIndexes = trendRows.map((_, i) => i).filter(i => i % 6 === 0);

  const latestTrend = trendRows[trendRows.length - 1];
  const nationalRef = states?.states[0]?.national_intensity ?? null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">MEMBER 3 — MODULE 2: CARBON INTELLIGENCE</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Carbon Intelligence</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            India power sector CO₂ intensity analysis. Scope 2 GHG emissions from recorded DCGM GPU energy measurements.
          </p>
        </div>
      </div>

      {/* Emissions KPIs */}
      {errs.em ? <ErrorBox msg={errs.em} /> : !emissions ? <LoadingBox /> : (
        <>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-200 font-mono leading-relaxed">
              <strong>⚠ Emissions source:</strong> Calculated from <strong>recorded DCGM energy measurements only</strong>.
              Predicted energy emissions are NOT shown — the prediction model energy units require further validation before emission calculations are appropriate.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Emissions', val: fmt(emissions.total_emissions_kg, 1) + ' kg CO₂', icon: Leaf, accent: 'emerald' },
              { label: 'Recorded Energy', val: fmt(emissions.total_energy_kwh, 1) + ' kWh', icon: Database, accent: 'amber', sub: 'From DCGM telemetry' },
              { label: 'Avg Emissions/Job', val: fmt(emissions.avg_emissions_kg, 4) + ' kg CO₂', icon: Globe, accent: 'cyan' },
              { label: 'Grid Intensity', val: fmt(emissions.carbon_intensity_g_kwh, 2) + ' gCO₂/kWh', icon: Globe, accent: 'violet', sub: 'India national avg' },
            ].map(k => {
              const Icon = k.icon;
              const colors: Record<string, string> = {
                emerald: 'text-emerald-400 border-emerald-500/30', amber: 'text-amber-400 border-amber-500/30',
                cyan: 'text-cyber-cyan border-cyber-cyan/30', violet: 'text-violet-400 border-violet-500/30',
              };
              return (
                <div key={k.label} className={`glass-panel rounded-2xl p-5 border ${colors[k.accent]} flex flex-col gap-2`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{k.label}</span>
                    <Icon className={`w-4 h-4 ${colors[k.accent].split(' ')[0]}`} />
                  </div>
                  <span className="text-xl font-black text-white">{k.val}</span>
                  {k.sub && <span className="text-[11px] text-slate-500 font-mono">{k.sub}</span>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* National Trend */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-mono uppercase flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" /> India Power Sector CO₂ Intensity — Monthly Trend
            </h3>
            {trend && <p className="text-[11px] text-slate-500 font-mono mt-0.5">{trend.source} • {trend.unit}</p>}
          </div>
          {latestTrend && (
            <div className="text-right">
              <p className="text-[11px] text-slate-400 font-mono">Latest ({latestTrend.date.slice(0, 7)})</p>
              <p className="text-lg font-bold text-emerald-400">{fmt(latestTrend.value, 2)} gCO₂/kWh</p>
            </div>
          )}
        </div>
        {errs.trend ? <ErrorBox msg={errs.trend} /> : !trend ? <LoadingBox /> : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendRows} margin={{ right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={v => v.slice(0, 7)}
                ticks={tickIndexes.map(i => trendRows[i]?.date).filter(Boolean)}
                angle={-20} textAnchor="end" height={40}
              />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" g" width={52} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number, name: string) => [fmt(v, 2) + ' gCO₂/kWh', name === 'value' ? 'Monthly intensity' : '12-month avg']}
                labelFormatter={l => `Date: ${l?.toString().slice(0, 7)}`}
              />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} name="value" />
              <Line type="monotone" dataKey="rolling_mean_12" stroke="#6366f1" strokeWidth={1.5} dot={false} strokeDasharray="5 3" name="rolling_mean_12" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* State Comparison */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono uppercase mb-1 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> State-Level CO₂ Intensity Comparison
          {states && <span className="text-slate-500 font-normal normal-case text-[10px]">({states.date?.slice(0, 7)})</span>}
        </h3>
        {errs.states ? <ErrorBox msg={errs.states} /> : !states ? <LoadingBox /> : (
          <>
            <p className="text-[11px] text-slate-500 font-mono mb-4">Top 20 Indian states by CO₂ intensity. Dashed line = national average.</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={states.states} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="state_code" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} unit=" g" width={50} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number, _: string, props: { payload: { state: string } }) =>
                    [fmt(v, 2) + ' gCO₂/kWh', props.payload.state]} />
                {nationalRef && <ReferenceLine y={nationalRef} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: 'National avg', fill: '#f59e0b', fontSize: 10 }} />}
                <Bar dataKey="value" fill="#00f5ff" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Forecasting Models */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800">
        <h3 className="text-sm font-bold text-white font-mono uppercase mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" /> Carbon Intensity Forecasting Models
        </h3>
        {errs.models ? <ErrorBox msg={errs.models} /> : !models ? <LoadingBox /> : (
          <>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    {['Model', 'RMSE', 'MAE', 'MSE'].map(h => (
                      <th key={h} className="text-left py-2 pr-6 font-semibold uppercase tracking-wider text-[10px]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {models.training.map((r, i) => (
                    <tr key={i} className="border-b border-slate-900">
                      <td className="py-2 pr-6 text-slate-200">{String(r.Model)}</td>
                      <td className="py-2 pr-6 text-cyan-300">{fmt(Number(r.RMSE), 4)}</td>
                      <td className="py-2 pr-6 text-amber-300">{fmt(Number(r.MAE), 4)}</td>
                      <td className="py-2 pr-6 text-slate-300">{fmt(Number(r.MSE), 4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">{models.note}</p>
          </>
        )}
      </div>
    </div>
  );
};
