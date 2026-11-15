// ==========================================
// CarbonIQ Core Data Types & Interfaces
// ==========================================

export type DataSourceMode = 'demo' | 'mock-sas' | 'live-sas';

export interface ClusterTelemetry {
  totalGpus: number;
  activeGpus: number;
  offlineGpus: number;
  totalPowerDrawKw: number;
  peakPowerKw: number;
  averagePue: number;
  currentCarbonIntensity: number; // gCO2/kWh
  dailyEmissionsKg: number;
  efficiencyScore: number; // 0 - 100
  dataCenterHealth: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  activeJobsCount: number;
  lastUpdated: string;
}

export interface GpuNode {
  id: string;
  name: string;
  rackId: string;
  gpuModel: string;
  gpuCount: number;
  powerDrawWatts: number;
  maxPowerWatts: number;
  temperatureCelsius: number;
  utilizationPercent: number;
  memoryUtilizationPercent: number;
  status: 'active' | 'idle' | 'warning' | 'error';
  assignedJobId?: string;
  workloadType?: WorkloadType;
}

export interface ServerRack {
  id: string;
  name: string;
  zone: string;
  nodeCount: number;
  totalPowerKw: number;
  avgTempCelsius: number;
  pueContribution: number;
  nodes: GpuNode[];
}

// ------------------------------------------
// MEMBER 1: Data Cleaning & Preprocessing
// ------------------------------------------
export interface RawDataSample {
  timestamp: string;
  gpuId: string;
  rawPowerW: number | null;
  rawUtilPercent: number | null;
  rawTempC: number | null;
  statusFlag: string;
  cleanStatus: 'valid' | 'imputed' | 'filtered_outlier' | 'interpolated';
}

export interface DataCleaningSummary {
  rawTelemetryRecords: number;
  cleanedTelemetryRecords: number;
  schedulerJobRecords: number;
  mergedDatasetRows: number;
  missingValuesImputed: number;
  sensorAnomaliesFiltered: number;
  timestampAlignmentRate: number; // percentage
  overallDataQualityScore: number; // percentage e.g. 98.4%
  pipelineStages: {
    stage: string;
    description: string;
    status: 'completed' | 'processing' | 'standby';
    recordsProcessed: number;
    errorRate: number;
    durationMs: number;
  }[];
}

// ------------------------------------------
// MEMBER 2: GPU Energy Intelligence
// ------------------------------------------
export type WorkloadType = 'LLM Pretraining' | 'Fine-Tuning' | 'Inference Serving' | 'Computer Vision' | 'Scientific HPC';

export interface EnergyTimeSeriesPoint {
  timestamp: string;
  actualPowerKw: number;
  predictedPowerKw?: number;
  baselinePowerKw?: number;
  utilizationPercent: number;
  carbonIntensity: number;
}

export interface EnergyAnomaly {
  id: string;
  timestamp: string;
  nodeId: string;
  rackId: string;
  anomalyType: 'Power Spike' | 'Thermal Throttling' | 'Zombie Idle' | 'Memory Leak' | 'Sub-optimal Batching';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impactKwh: number;
  detectedBy: string; // e.g., 'SAS Viya Isolation Forest'
  status: 'active' | 'mitigated' | 'investigating';
  description: string;
}

export interface TopEnergyJob {
  jobId: string;
  jobName: string;
  userName: string;
  department: string;
  workloadType: WorkloadType;
  gpuCount: number;
  gpuModel: string;
  runtimeHours: number;
  totalEnergyKwh: number;
  totalCarbonKg: number;
  estimatedCostUsd: number;
  energyEfficiencyScore: number; // 0-100
}

export interface WorkloadDistribution {
  category: WorkloadType;
  sharePercent: number;
  energyShareKwh: number;
  avgPowerDrawKw: number;
  jobCount: number;
}

// ------------------------------------------
// MEMBER 3: Carbon Intelligence
// ------------------------------------------
export interface CarbonIntensityGridPoint {
  time: string;
  intensityGco2Kwh: number;
  renewableSharePercent: number;
  solarMw: number;
  windMw: number;
  fossilMw: number;
}

export interface RegionalGridOption {
  regionCode: string;
  regionName: string;
  country: string;
  currentIntensity: number;
  renewablePercentage: number;
  projectedCostPerMwh: number;
  status: 'low' | 'moderate' | 'high';
}

export interface WorkloadShiftSimulation {
  originalEmissionsKg: number;
  optimizedEmissionsKg: number;
  carbonReductionPercent: number;
  energyCostSavingsUsd: number;
  deferredJobsCount: number;
  maxDelayHours: number;
  recommendedSchedule: {
    timeSlot: string;
    gridCarbonIntensity: number;
    recommendedLoadMw: number;
    action: 'RUN_HEAVY' | 'STANDARD' | 'DEFER_BATCH' | 'LOW_POWER_STANDBY';
  }[];
}

export interface SustainabilityRecommendation {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Scheduling' | 'Cooling' | 'Hardware' | 'Workload';
  title: string;
  description: string;
  potentialCo2ReductionKgPerDay: number;
  potentialKwhSavingsPerDay: number;
  financialSavingsUsdPerMonth: number;
  implementationEffort: 'Immediate' | 'Low' | 'Moderate' | 'Complex';
  status: 'recommended' | 'applied' | 'ignored';
}

// ------------------------------------------
// SAS Viya Integration
// ------------------------------------------
export interface SasViyaConfig {
  serverUrl: string;
  reportUri: string;
  casServer: string;
  casLibrary: string;
  casTable: string;
  authToken?: string;
  mode: DataSourceMode;
}

export interface SasReportMeta {
  reportId: string;
  reportName: string;
  lastSync: string;
  elementCount: number;
  status: 'ready' | 'loading' | 'fallback';
}

