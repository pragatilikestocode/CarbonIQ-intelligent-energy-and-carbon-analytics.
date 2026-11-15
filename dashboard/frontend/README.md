# CarbonIQ – AI-Powered Data Center Energy & Carbon Intelligence

> **High-Performance Frontend & Digital Twin Command Center**
> Built for monitoring, analyzing, predicting, and optimizing GPU data-center energy consumption and carbon emissions.

---

## 🌟 Key Features

### 🏢 1. 3D High-Density Data Center Digital Twin (Command Center)
- **Interactive 3D WebGL Scene**: Built with Three.js, React Three Fiber, and Drei.
- **Server Rack Exploration**: 8 DGX H100 SXM5 server cabinets arranged in cold and hot aisles with realistic server blade activity LEDs and thermal convection airflow particles.
- **Thermal Heatmap View**: Real-time shader transition between cyber-matrix cyan and thermal infrared gradient (cool `<50°C` to critical throttled `>78°C`).
- **Interactive Node Drawer**: Click any server rack to inspect its 8x NVIDIA H100 SXM5 blades, per-GPU wattage, temperature, SM compute utilization, HBM3 VRAM saturation, and assigned Slurm job IDs.

### 🧹 2. Member 1: Data Cleaning & Preprocessing Engine
- **DCGM Telemetry Cleaning**: High-throughput ingestion of 10-second polling data (4.84M+ records) with IQR outlier detection and boundary filtering (`Power [10W-750W]`, `Temp [15-105°C]`).
- **Scheduler Data Cleaning**: Slurm/Kubernetes trace normalization, ISO-8601 UTC timestamp reconciliation, and node allocation verification.
- **Sliding-Window Temporal Alignment**: Sub-second temporal join linking DCGM hardware counters to Slurm job IDs and user models.
- **Data Validation & CAS Export**: Live quality scoring (98.92%) and 1-click export to SAS CAS table `CARBONIQ_CAS.DCGM_SCHEDULER_INTEGRATED`.

### ⚡ 3. Member 2: Module 1 – GPU Energy Intelligence
- **Power & Energy Time Series**: 24-hour actual power draw vs unoptimized baseline vs ML forecast target.
- **Statistical Profiling**: Mean power (478.2W), Median (495.0W), P95 peak (684.5W), Standard Deviation (82.4W), Kurtosis (2.14), and Skewness (-0.42).
- **Isolation Forest Anomaly Detection**: Real-time detection of thermal throttling, gradient synchronization power spikes, zombie idle GPU leaks, and microbatch bubble overhead.
- **Workload Classification**: Donut breakdown across LLM Pretraining (48%), Fine-Tuning (22%), Inference Serving (16%), Computer Vision (9%), and Scientific HPC (5%).
- **Top 5 Energy-Consuming Jobs**: Ranked Slurm jobs (Llama-3-70B, Stable Diffusion 3, ESM-3 protein folding) with kWh, carbon kg, and dollar cost attribution.
- **ML Energy Forecaster**: +24h lookahead predictive curve with 95% confidence intervals and carbon-optimized schedule.

### 🍃 4. Member 3: Module 2 – Carbon Intelligence
- **Real-Time Grid Carbon Processing**: 24h timeline tracking marginal emissions factors (gCO₂/kWh) against Solar MW and Wind MW output.
- **Interactive Workload Shifting Simulator**: User slider (`±0h` to `±12h` buffer) demonstrating simulated GHG emissions reduction (up to `-41.7%`) and avoided peaker tariff savings without SLA disruption.
- **Dual-Reporting Framework**: Location-Based Scope 2 (11,245.8 kg CO₂e) vs Market-Based Contractual PPA accounting (6,488.2 kg CO₂e).
- **Multi-Region Carbon Arbitrage**: Regional grid comparisons across US-PJM, US-CAISO, EU-Nordic, US-ERCOT, and EU-Central.
- **Actionable Sustainability Recommendations**: Priority-ranked interventions with quantifiable daily CO₂ reduction and monthly financial ROI.

### 📊 5. SAS Viya Integration Bridge & Studio
- **Decoupled Architecture**: Complete frontend functions independently using realistic synthetic demonstration data.
- **SAS Viya Gateway Configurator**: Connect to SAS Viya server URL, CAS Server, CAS Library (`CARBONIQ_CAS`), and SAS VA Report URIs.
- **CAS In-Memory Tables Explorer**: Inspect registered CASHDAT tables (`DCGM_CLEANED_TELEMETRY`, `GPU_ENERGY_MODELS_PREDICTION`, `CARBON_INTENSITY_REGIONAL_GRID`).
- **SAS VA Report Component Simulator**: High-fidelity interactive report fallbacks for Executive Sustainability Brief, Cluster Thermals, and Peak Shifting ROI.
- **SAS Script Exporter**: Pre-generated `CarbonIQ_Ingestion.sas` program with `PROC CAS`, `PROC FOREST`, and `PROC OPTMODEL`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js `v18+` or `v20+` (tested on Node v22.19.0)
- npm `v9+` or `v10+`

### Installation
```bash
# Navigate to the frontend directory
cd CarbonIQ-Repository/dashboard/frontend

# Dependencies are already installed! If running on a new clone:
npm install
```

### Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Creates an optimized production bundle in `dist/` with code-split vendor chunks (`three-vendor`, `chart-vendor`, `ui-vendor`).

### Preview Production Build
```bash
npm run preview
```

---

## 🎨 Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Styling**: Tailwind CSS with custom cyber glassmorphic theme
- **Visual Analytics**: Recharts
- **Icons**: Lucide React
- **Integration**: SAS Viya JavaScript SDK / `@sassoftware/va-report-components` architecture

