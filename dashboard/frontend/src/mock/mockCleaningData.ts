import { DataCleaningSummary, RawDataSample } from '../types';

export const mockCleaningSummary: DataCleaningSummary = {
  rawTelemetryRecords: 4892400,
  cleanedTelemetryRecords: 4843120,
  schedulerJobRecords: 34215,
  mergedDatasetRows: 4843120,
  missingValuesImputed: 28410,
  sensorAnomaliesFiltered: 20870,
  timestampAlignmentRate: 99.84,
  overallDataQualityScore: 98.92,
  pipelineStages: [
    {
      stage: 'Stage 1: DCGM Telemetry Ingestion',
      description: 'Ingesting raw NVIDIA DCGM field IDs (Power, SM Util, Mem Util, PCIe, Temp) at 10s intervals',
      status: 'completed',
      recordsProcessed: 4892400,
      errorRate: 0.42,
      durationMs: 3410,
    },
    {
      stage: 'Stage 2: Sensor Glitch & Boundary Filtering',
      description: 'Rejecting physical impossibilities (Power > 750W, Temp > 105C, negative utilization values)',
      status: 'completed',
      recordsProcessed: 4892400,
      errorRate: 0.38,
      durationMs: 1820,
    },
    {
      stage: 'Stage 3: Time Series Interpolation & Imputation',
      description: 'Hermite spline & forward-fill for missing sensor polling intervals (< 30s gap window)',
      status: 'completed',
      recordsProcessed: 4871530,
      errorRate: 0.05,
      durationMs: 2450,
    },
    {
      stage: 'Stage 4: Slurm Scheduler Trace Normalization',
      description: 'ISO-8601 UTC timestamp reconciliation, node allocation mapping, job exit code parsing',
      status: 'completed',
      recordsProcessed: 34215,
      errorRate: 0.12,
      durationMs: 890,
    },
    {
      stage: 'Stage 5: High-Precision Temporal Alignment & Merge',
      description: 'Sliding interval join linking DCGM hardware counters to Slurm Job IDs, users, and ML models',
      status: 'completed',
      recordsProcessed: 4843120,
      errorRate: 0.02,
      durationMs: 5120,
    },
    {
      stage: 'Stage 6: SAS Viya CAS Table Staging',
      description: 'Formatting into SAS CASHDAT schema with indexed time horizons for SAS Visual Analytics',
      status: 'completed',
      recordsProcessed: 4843120,
      errorRate: 0.0,
      durationMs: 2190,
    },
  ],
};

export const mockRawDataSamples: RawDataSample[] = [
  {
    timestamp: '2026-11-13T00:15:00Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: 482.4,
    rawUtilPercent: 94.2,
    rawTempC: 64.1,
    statusFlag: 'DCGM_ST_OK',
    cleanStatus: 'valid',
  },
  {
    timestamp: '2026-11-13T00:15:10Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: 999.9, // Sensor glitch spike
    rawUtilPercent: 95.0,
    rawTempC: 64.5,
    statusFlag: 'DCGM_ST_OUT_OF_BOUNDS',
    cleanStatus: 'filtered_outlier',
  },
  {
    timestamp: '2026-11-13T00:15:20Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: null, // Missed polling tick
    rawUtilPercent: null,
    rawTempC: 64.8,
    statusFlag: 'DCGM_ST_TIMEOUT',
    cleanStatus: 'imputed',
  },
  {
    timestamp: '2026-11-13T00:15:30Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: 491.2,
    rawUtilPercent: 96.1,
    rawTempC: 65.0,
    statusFlag: 'DCGM_ST_OK',
    cleanStatus: 'valid',
  },
  {
    timestamp: '2026-11-13T00:15:40Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: -12.0, // Sensor negative glitch
    rawUtilPercent: -5.0,
    rawTempC: 65.2,
    statusFlag: 'DCGM_ST_CALIBRATION_ERR',
    cleanStatus: 'filtered_outlier',
  },
  {
    timestamp: '2026-11-13T00:15:50Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: 504.8,
    rawUtilPercent: 98.4,
    rawTempC: 65.8,
    statusFlag: 'DCGM_ST_OK',
    cleanStatus: 'valid',
  },
  {
    timestamp: '2026-11-13T00:16:00Z',
    gpuId: 'GPU-RCK02-N03-G0',
    rawPowerW: 508.1,
    rawUtilPercent: 99.1,
    rawTempC: 66.2,
    statusFlag: 'DCGM_ST_OK',
    cleanStatus: 'valid',
  },
];

export const mockValidationRules = [
  {
    field: 'power_draw_watts',
    rule: 'Range [10.0W - 750.0W]',
    violationsCaught: 9412,
    action: 'Clipped & Filtered by IQR Outlier Detector',
    status: 'ACTIVE',
  },
  {
    field: 'sm_active_utilization',
    rule: 'Percentage [0.0% - 100.0%]',
    violationsCaught: 4120,
    action: 'Rejected negative telemetry, Cubic Spline Imputed',
    status: 'ACTIVE',
  },
  {
    field: 'gpu_temperature_celsius',
    rule: 'Range [15.0C - 105.0C]',
    violationsCaught: 2480,
    action: 'Sensor NaN Imputation via Kalman Filter',
    status: 'ACTIVE',
  },
  {
    field: 'scheduler_timestamp_sync',
    rule: 'Delta <= 10.0 seconds',
    violationsCaught: 1840,
    action: 'Temporal Window Nearest-Neighbor Alignment',
    status: 'ACTIVE',
  },
  {
    field: 'job_state_integrity',
    rule: 'Foreign Key (job_id ∈ Slurm_db)',
    violationsCaught: 518,
    action: 'Orphaned metrics assigned to System Baseline',
    status: 'ACTIVE',
  },
];

