import { ClusterTelemetry, ServerRack, GpuNode, WorkloadType } from '../types';

export const mockTelemetry: ClusterTelemetry = {
  totalGpus: 2048,
  activeGpus: 1912,
  offlineGpus: 136,
  totalPowerDrawKw: 1468.4,
  peakPowerKw: 1720.0,
  averagePue: 1.14,
  currentCarbonIntensity: 318.5, // gCO2/kWh (PJM Interconnection Grid)
  dailyEmissionsKg: 11245.8,
  efficiencyScore: 94.8,
  dataCenterHealth: 'OPTIMAL',
  activeJobsCount: 428,
  lastUpdated: new Date().toISOString(),
};

const workloadOptions: WorkloadType[] = [
  'LLM Pretraining',
  'Fine-Tuning',
  'Inference Serving',
  'Computer Vision',
  'Scientific HPC',
];

export const generateMockRacks = (): ServerRack[] => {
  const racks: ServerRack[] = [];
  const zones = ['Zone A (Direct Liquid)', 'Zone B (Rear Door Heat Exchanger)', 'Zone C (Air Cooled)', 'Zone D (Hybrid)'];

  for (let r = 1; r <= 8; r++) {
    const rackId = `RCK-${String(r).padStart(2, '0')}`;
    const zone = zones[(r - 1) % zones.length];
    const nodes: GpuNode[] = [];
    let rackPower = 0;
    let tempSum = 0;

    for (let n = 1; n <= 8; n++) {
      const nodeId = `${rackId}-NODE-${String(n).padStart(2, '0')}`;
      const isWarning = (r === 3 && n === 4) || (r === 6 && n === 2);
      const isIdle = (r === 7 && n > 5);
      const status = isWarning ? 'warning' : isIdle ? 'idle' : 'active';
      const util = isIdle ? 4 + Math.random() * 5 : isWarning ? 98 + Math.random() * 2 : 68 + Math.random() * 28;
      const memUtil = isIdle ? 8 : 72 + Math.random() * 25;
      const power = isIdle ? 180 + Math.random() * 40 : isWarning ? 685 + Math.random() * 15 : 490 + Math.random() * 170;
      const temp = isIdle ? 34 + Math.random() * 3 : isWarning ? 84 + Math.random() * 4 : 52 + Math.random() * 18;

      rackPower += power;
      tempSum += temp;

      nodes.push({
        id: nodeId,
        name: `DGX-H100-SXM5 #${(r - 1) * 8 + n}`,
        rackId,
        gpuModel: 'NVIDIA H100 80GB SXM5',
        gpuCount: 8,
        powerDrawWatts: Math.round(power),
        maxPowerWatts: 700,
        temperatureCelsius: Math.round(temp),
        utilizationPercent: Math.round(util),
        memoryUtilizationPercent: Math.round(memUtil),
        status,
        assignedJobId: isIdle ? undefined : `JOB-SLURM-${104820 + (r * 10 + n)}`,
        workloadType: isIdle ? undefined : workloadOptions[(r + n) % workloadOptions.length],
      });
    }

    racks.push({
      id: rackId,
      name: `Rack Alpha-${r}`,
      zone,
      nodeCount: nodes.length,
      totalPowerKw: Number((rackPower / 1000).toFixed(2)),
      avgTempCelsius: Math.round(tempSum / nodes.length),
      pueContribution: Number((1.11 + (r % 4) * 0.02).toFixed(2)),
      nodes,
    });
  }

  return racks;
};

export const mockRacks: ServerRack[] = generateMockRacks();

