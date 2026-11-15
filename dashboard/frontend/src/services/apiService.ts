/**
 * CarbonIQ API Service
 * Typed fetch wrapper for all backend endpoints.
 */

export const API_BASE = 'http://localhost:8000';

export interface OverviewData {
  workloads: number;
  device_instances: number;
  actual_energy_kwh: number;
  predicted_energy_kwh: number;
  actual_emissions_kg: number;
  optimized_emissions_kg: number;
  emissions_saved_kg: number;
  anomaly_count: number;
  anomaly_pct: number;
  carbon_intensity: number;
  model_perf: {
    val_mae: number | null; val_rmse: number | null; val_r2: number | null;
    test_mae: number | null; test_rmse: number | null; test_r2: number | null;
  };
  optimization: { energy_saved_kwh: number; emissions_saved_kg: number; pct_reduced: number; label: string };
}

export interface WorkloadRow {
  id_job: number; partition: string; job_type: string; priority: number;
  cpus_req: number; nodes_alloc: number; total_gpus_allocated: number;
  totalexecutiontime_sec: number; powerusage_watts_avg: number;
  actual_energy_joules: number; actual_energy_kwh: number;
  predicted_energy_joules: number; predicted_energy_kwh: number;
  actual_emissions_kg: number; actual_emissions_tonnes: number;
  is_anomaly: number; anomaly_type: string; anomaly_severity: string;
}

export interface WorkloadListResponse { total: number; skip: number; limit: number; items: WorkloadRow[]; }
export interface AnomalySummary {
  total_anomalies: number; total_workloads: number; anomaly_pct: number;
  by_type: Array<{ type: string; count: number; severity: string; pct: number }>;
  by_severity: Array<{ severity: string; count: number; pct: number }>;
}
export interface CarbonTrendRow { date: string; value: number; yoy_pct_change: number | null; rolling_mean_3: number | null; rolling_mean_12: number | null; year: number; month: number; }
export interface CarbonTrendResponse { rows: CarbonTrendRow[]; unit: string; source: string; }
export interface EmissionsSummary { total_jobs_measured: number; total_energy_kwh: number; total_emissions_kg: number; avg_energy_kwh: number; avg_emissions_kg: number; carbon_intensity_g_kwh: number; note: string; }
export interface OptimizationData { energy_kwh: number; emissions_kg: number; optimized_energy_kwh: number; optimized_emissions_kg: number; energy_saved_kwh: number; emissions_saved_kg: number; pct_saved: number; label: string; }
export interface DistributionBin { range_label: string; min_j: number; max_j: number; count: number; }
export interface DistributionResponse { bins: DistributionBin[]; total: number; note: string; }
export interface PartitionStat { partition: string; count: number; avg_predicted_kwh: number; total_predicted_kwh: number; avg_actual_kwh: number; total_actual_kwh: number; }
export interface JobTypeStat { job_type: string; count: number; avg_predicted_kwh: number; total_predicted_kwh: number; avg_actual_kwh: number; total_actual_kwh: number; }
export interface ModelPerfRow { Data_Split: string; Observations: number; MAE: number; RMSE: number; R_Squared: number; }
export interface ModelPerfResponse { rows: ModelPerfRow[]; note: string; }
export interface StateRow { state: string; state_code: string; value: number; national_intensity: number | null; state_national_difference: number | null; }
export interface CarbonStateResponse { date: string; states: StateRow[]; unit: string; }

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const url = new URL(API_BASE + path);
  if (params) Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, String(v)); });
  return url.toString();
}

async function apiFetch<T>(url: string): Promise<T> {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!r.ok) { const text = await r.text(); throw new Error(`API ${r.status}: ${text.slice(0, 200)}`); }
  return r.json() as Promise<T>;
}

export const apiService = {
  health: () => apiFetch<Record<string, unknown>>(buildUrl('/api/health')),
  overview: () => apiFetch<OverviewData>(buildUrl('/api/overview')),
  energyWorkloads: (p?: Record<string, string | number | undefined | null>) => apiFetch<WorkloadListResponse>(buildUrl('/api/energy/workloads', p)),
  energyModelPerformance: () => apiFetch<ModelPerfResponse>(buildUrl('/api/energy/model-performance')),
  energyDistribution: () => apiFetch<DistributionResponse>(buildUrl('/api/energy/distribution')),
  energyByPartition: () => apiFetch<PartitionStat[]>(buildUrl('/api/energy/by-partition')),
  energyByJobType: () => apiFetch<JobTypeStat[]>(buildUrl('/api/energy/by-jobtype')),
  anomalySummary: () => apiFetch<AnomalySummary>(buildUrl('/api/anomalies/summary')),
  anomalyWorkloads: (p?: Record<string, string | number | undefined | null>) => apiFetch<WorkloadListResponse>(buildUrl('/api/anomalies/workloads', p)),
  carbonNationalTrend: () => apiFetch<CarbonTrendResponse>(buildUrl('/api/carbon/national-trend')),
  carbonStateComparison: () => apiFetch<CarbonStateResponse>(buildUrl('/api/carbon/state-comparison')),
  carbonEmissionsSummary: () => apiFetch<EmissionsSummary>(buildUrl('/api/carbon/emissions-summary')),
  carbonOptimization: () => apiFetch<OptimizationData>(buildUrl('/api/carbon/optimization')),
  carbonModelComparison: () => apiFetch<{ training: Record<string, unknown>[]; validation: Record<string, unknown>[]; note: string }>(buildUrl('/api/carbon/model-comparison')),
};
