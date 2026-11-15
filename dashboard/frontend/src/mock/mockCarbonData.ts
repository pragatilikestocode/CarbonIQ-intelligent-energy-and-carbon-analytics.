import { CarbonIntensityGridPoint, RegionalGridOption, WorkloadShiftSimulation, SustainabilityRecommendation } from '../types';

export const mockCarbonIntensityTimeline: CarbonIntensityGridPoint[] = [
  { time: '00:00', intensityGco2Kwh: 260, renewableSharePercent: 54, solarMw: 0, windMw: 3200, fossilMw: 2700 },
  { time: '02:00', intensityGco2Kwh: 245, renewableSharePercent: 58, solarMw: 0, windMw: 3450, fossilMw: 2500 },
  { time: '04:00', intensityGco2Kwh: 230, renewableSharePercent: 62, solarMw: 0, windMw: 3700, fossilMw: 2270 },
  { time: '06:00', intensityGco2Kwh: 285, renewableSharePercent: 48, solarMw: 400, windMw: 2800, fossilMw: 3400 },
  { time: '08:00', intensityGco2Kwh: 345, renewableSharePercent: 39, solarMw: 1800, windMw: 1900, fossilMw: 5800 },
  { time: '10:00', intensityGco2Kwh: 320, renewableSharePercent: 46, solarMw: 3900, windMw: 1600, fossilMw: 6400 },
  { time: '12:00', intensityGco2Kwh: 220, renewableSharePercent: 65, solarMw: 5800, windMw: 1800, fossilMw: 4100 }, // Peak Solar Green Window
  { time: '14:00', intensityGco2Kwh: 210, renewableSharePercent: 68, solarMw: 5950, windMw: 2000, fossilMw: 3700 }, // Ultra-green
  { time: '16:00', intensityGco2Kwh: 290, renewableSharePercent: 51, solarMw: 4100, windMw: 2200, fossilMw: 6050 },
  { time: '18:00', intensityGco2Kwh: 410, renewableSharePercent: 28, solarMw: 900, windMw: 1900, fossilMw: 7200 }, // Peaker plants dirty spike
  { time: '20:00', intensityGco2Kwh: 380, renewableSharePercent: 33, solarMw: 0, windMw: 2400, fossilMw: 4800 },
  { time: '22:00', intensityGco2Kwh: 310, renewableSharePercent: 45, solarMw: 0, windMw: 2900, fossilMw: 3500 },
];

export const mockRegionalGrids: RegionalGridOption[] = [
  {
    regionCode: 'US-PJM',
    regionName: 'US Mid-Atlantic (PJM Primary Hub)',
    country: 'United States',
    currentIntensity: 318.5,
    renewablePercentage: 42.1,
    projectedCostPerMwh: 48.5,
    status: 'moderate',
  },
  {
    regionCode: 'US-CAISO',
    regionName: 'US West (California CAISO)',
    country: 'United States',
    currentIntensity: 184.2,
    renewablePercentage: 71.4,
    projectedCostPerMwh: 64.2,
    status: 'low',
  },
  {
    regionCode: 'EU-NORDIC',
    regionName: 'Nordic Clean Zone (Hydro & Wind)',
    country: 'Norway/Sweden',
    currentIntensity: 34.0,
    renewablePercentage: 96.8,
    projectedCostPerMwh: 39.0,
    status: 'low',
  },
  {
    regionCode: 'US-ERCOT',
    regionName: 'US South (Texas ERCOT Grid)',
    country: 'United States',
    currentIntensity: 432.0,
    renewablePercentage: 29.5,
    projectedCostPerMwh: 41.2,
    status: 'high',
  },
  {
    regionCode: 'EU-CENTRAL',
    regionName: 'Central Europe (Germany/TenneT)',
    country: 'Germany',
    currentIntensity: 298.0,
    renewablePercentage: 54.0,
    projectedCostPerMwh: 78.4,
    status: 'moderate',
  },
];

export const mockOptimizationSimulation: WorkloadShiftSimulation = {
  originalEmissionsKg: 11245.8,
  optimizedEmissionsKg: 8120.4,
  carbonReductionPercent: 27.8,
  energyCostSavingsUsd: 1420.5,
  deferredJobsCount: 18,
  maxDelayHours: 6,
  recommendedSchedule: [
    { timeSlot: '00:00 - 04:00', gridCarbonIntensity: 240, recommendedLoadMw: 1.65, action: 'RUN_HEAVY' },
    { timeSlot: '04:00 - 08:00', gridCarbonIntensity: 290, recommendedLoadMw: 1.35, action: 'STANDARD' },
    { timeSlot: '08:00 - 11:00', gridCarbonIntensity: 340, recommendedLoadMw: 1.05, action: 'DEFER_BATCH' },
    { timeSlot: '11:00 - 15:00', gridCarbonIntensity: 215, recommendedLoadMw: 1.70, action: 'RUN_HEAVY' },
    { timeSlot: '15:00 - 18:00', gridCarbonIntensity: 320, recommendedLoadMw: 1.25, action: 'STANDARD' },
    { timeSlot: '18:00 - 21:00', gridCarbonIntensity: 405, recommendedLoadMw: 0.90, action: 'LOW_POWER_STANDBY' },
    { timeSlot: '21:00 - 24:00', gridCarbonIntensity: 310, recommendedLoadMw: 1.30, action: 'STANDARD' },
  ],
};

export const mockSustainabilityRecommendations: SustainabilityRecommendation[] = [
  {
    id: 'REC-01',
    priority: 'CRITICAL',
    category: 'Scheduling',
    title: 'Shift 18 Non-Urgent LLM Pre-training Jobs to Solar Peak Window',
    description: 'Grid carbon intensity drops to 210 gCO2/kWh between 11:00 and 15:00 UTC due to surplus utility solar. Deferring flexible batch queue reduces carbon footprint without missing SLA.',
    potentialCo2ReductionKgPerDay: 3125.4,
    potentialKwhSavingsPerDay: 480.0,
    financialSavingsUsdPerMonth: 4260.0,
    implementationEffort: 'Immediate',
    status: 'recommended',
  },
  {
    id: 'REC-02',
    priority: 'HIGH',
    category: 'Hardware',
    title: 'Enable Dynamic Voltage & Frequency Scaling (DVFS) on Memory-Bound Nodes',
    description: 'DCGM analysis reveals 42 inference nodes are memory-bandwidth bottlenecked with SM tensor cores idling 44% of the time. Capping GPU core power to 500W saves 14% energy without throughput degradation.',
    potentialCo2ReductionKgPerDay: 1240.0,
    potentialKwhSavingsPerDay: 1890.0,
    financialSavingsUsdPerMonth: 3150.0,
    implementationEffort: 'Low',
    status: 'recommended',
  },
  {
    id: 'REC-03',
    priority: 'HIGH',
    category: 'Cooling',
    title: 'Optimize Liquid Coolant Flow in Rack 03 & Rack 06 Manifolds',
    description: 'Rack 03 is operating at 84C due to low differential pressure in the secondary CDU loop. Raising inlet temperature by 1.5C and balancing flow reduces chiller compressor workload.',
    potentialCo2ReductionKgPerDay: 840.5,
    potentialKwhSavingsPerDay: 960.0,
    financialSavingsUsdPerMonth: 1600.0,
    implementationEffort: 'Moderate',
    status: 'recommended',
  },
  {
    id: 'REC-04',
    priority: 'MEDIUM',
    category: 'Workload',
    title: 'Automated Zombie Process Reclamation & Idle Power Down',
    description: '3 orphan Jupyter kernel sessions on Rack 07 are retaining GPU VRAM allocations for > 4 hours post-execution. Enforce 60-minute automatic idle eviction rule.',
    potentialCo2ReductionKgPerDay: 410.2,
    potentialKwhSavingsPerDay: 620.0,
    financialSavingsUsdPerMonth: 890.0,
    implementationEffort: 'Immediate',
    status: 'applied',
  },
];

