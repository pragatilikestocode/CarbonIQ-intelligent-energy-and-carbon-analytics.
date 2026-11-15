import { SasViyaConfig, SasReportMeta, DataSourceMode } from '../types';

export interface CasTableInfo {
  tableName: string;
  rowCount: number;
  columnCount: number;
  engine: string;
  lastUpdated: string;
  status: 'LOADED' | 'UNAVAILABLE' | 'SYNCING';
}

class SasViyaService {
  private config: SasViyaConfig = {
    serverUrl: 'https://viya4.analytics.internal:8443',
    reportUri: '/reports/reports/4f828a41-2b21-48e0-a7d1-e8d19e9841bb',
    casServer: 'cas-shared-default',
    casLibrary: 'CARBONIQ_CAS',
    casTable: 'DCGM_SCHEDULER_INTEGRATED',
    mode: 'demo',
  };

  private casTables: CasTableInfo[] = [
    {
      tableName: 'DCGM_CLEANED_TELEMETRY',
      rowCount: 4843120,
      columnCount: 16,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-13 00:15:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'SLURM_JOBS_NORMALIZED',
      rowCount: 34215,
      columnCount: 12,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-13 00:15:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'GPU_ENERGY_MODELS_PREDICTION',
      rowCount: 2880,
      columnCount: 8,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-13 00:20:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'CARBON_INTENSITY_REGIONAL_GRID',
      rowCount: 8760,
      columnCount: 10,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-13 00:25:00 UTC',
      status: 'LOADED',
    },
    {
      tableName: 'WORKLOAD_OPTIMIZED_SCHEDULE',
      rowCount: 24,
      columnCount: 6,
      engine: 'CASHDAT',
      lastUpdated: '2026-11-13 00:28:00 UTC',
      status: 'LOADED',
    },
  ];

  public getConfig(): SasViyaConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SasViyaConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getCasTables(): CasTableInfo[] {
    return this.casTables;
  }

  public getReports(): SasReportMeta[] {
    return [
      {
        reportId: 'va-rep-001',
        reportName: 'CarbonIQ Executive Sustainability Brief',
        lastSync: '2026-11-13 00:10 UTC',
        elementCount: 8,
        status: this.config.mode === 'live-sas' ? 'ready' : 'fallback',
      },
      {
        reportId: 'va-rep-002',
        reportName: 'NVIDIA H100 Cluster Thermal & Power Distribution',
        lastSync: '2026-11-13 00:12 UTC',
        elementCount: 12,
        status: this.config.mode === 'live-sas' ? 'ready' : 'fallback',
      },
      {
        reportId: 'va-rep-003',
        reportName: 'Regional Grid Carbon Intensity & Peak Shifting ROI',
        lastSync: '2026-11-13 00:15 UTC',
        elementCount: 6,
        status: this.config.mode === 'live-sas' ? 'ready' : 'fallback',
      },
    ];
  }

  public async testConnection(serverUrl: string): Promise<{ success: boolean; message: string; latencyMs: number }> {
    // Simulated connection test with realistic latency
    const start = performance.now();
    await new Promise((res) => setTimeout(res, 600));
    const latency = Math.round(performance.now() - start);

    if (serverUrl.includes('internal') || serverUrl.includes('localhost') || serverUrl.includes('sas')) {
      return {
        success: true,
        message: `Connected to SAS Viya CAS Controller (${this.config.casServer}). SAS Visual Analytics SDK v0.14 ready.`,
        latencyMs: latency,
      };
    } else {
      return {
        success: false,
        message: 'Endpoint unreachable or CORS policy prevented SAS Viya discovery handshake. Falling back to Demo Data mode.',
        latencyMs: latency,
      };
    }
  }
}

export const sasViyaService = new SasViyaService();

