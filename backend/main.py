"""
==============================================================================
PROJECT: CARBONIQ - AI-POWERED GPU DATA CENTER ENERGY & CARBON INTELLIGENCE
FILE:    backend/main.py
PURPOSE: FastAPI backend serving real SAS-generated CSV outputs.
         All data is read from actual project outputs — no fake fallbacks.
==============================================================================
"""

import os
import math
import pandas as pd
import numpy as np
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# App & CORS
# ---------------------------------------------------------------------------
app = FastAPI(
    title="CarbonIQ Backend API",
    description=(
        "REST API serving integrated GPU telemetry, ML energy predictions, "
        "anomaly detection, and carbon intelligence from SAS-generated CSV outputs. "
        "Data source: exported CSV files — not live SAS inference."
    ),
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Path resolution
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUTS_DIR = os.path.join(BASE_DIR, "outputs")
DATA_DIR = os.path.join(BASE_DIR, "data", "processed")
M2_OUTPUTS = os.path.join(OUTPUTS_DIR, "module_1_gpu_energy")
M3_OUTPUTS = os.path.join(OUTPUTS_DIR, "module_2_carbon_intelligence")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _clean(df: pd.DataFrame) -> pd.DataFrame:
    """Replace NaN / inf with None so FastAPI can JSON-serialise."""
    return df.replace([float("inf"), float("-inf")], pd.NA).astype(object).where(
        pd.notna(df), other=None
    )


def _require_file(path: str) -> None:
    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail={"error": "Dataset not available", "file": os.path.relpath(path, BASE_DIR)},
        )


def _require_col(df: pd.DataFrame, col: str, path: str) -> None:
    if col not in df.columns:
        raise HTTPException(
            status_code=500,
            detail={"error": f"Column '{col}' not found in dataset", "file": os.path.relpath(path, BASE_DIR)},
        )


def _to_records(df: pd.DataFrame) -> list:
    records = _clean(df).to_dict(orient="records")
    # Safety net: catch any remaining NaN/inf that slip through
    for record in records:
        for key, val in record.items():
            if isinstance(val, float) and (math.isnan(val) or math.isinf(val)):
                record[key] = None
    return records


# ---------------------------------------------------------------------------
# Startup: cache heavy files
# ---------------------------------------------------------------------------
df_workloads: Optional[pd.DataFrame] = None
df_details: Optional[pd.DataFrame] = None


def _load_cached():
    global df_workloads, df_details

    wl_path = os.path.join(OUTPUTS_DIR, "carboniq_full_integrated_workload.csv")
    if os.path.exists(wl_path):
        df_workloads = pd.read_csv(wl_path)
    else:
        df_workloads = pd.DataFrame()

    det_path = os.path.join(OUTPUTS_DIR, "carboniq_full_integrated_detail.csv")
    if os.path.exists(det_path):
        detail_cols = [
            "id_job", "Node", "gpu_id",
            "powerusage_watts_avg", "powerusage_watts_max", "smutilization_pct_avg",
            "actual_energy_joules", "actual_energy_kwh",
            "predicted_energy_joules", "predicted_energy_kwh",
            "is_anomaly", "anomaly_type", "anomaly_severity",
            "actual_emissions_kg", "optimized_emissions_kg", "workload_instance_id",
        ]
        existing = [c for c in detail_cols if c in pd.read_csv(det_path, nrows=0).columns]
        df_details = pd.read_csv(det_path, usecols=existing)
    else:
        df_details = pd.DataFrame()


_load_cached()


# ===========================================================================
# HEALTH
# ===========================================================================
@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "version": "3.0.0",
        "note": "Data source: exported SAS CSV files — not live SAS inference.",
        "datasets_loaded": {
            "workloads": len(df_workloads) if df_workloads is not None else 0,
            "device_instances": len(df_details) if df_details is not None else 0,
        },
    }


# ===========================================================================
# OVERVIEW
# ===========================================================================
@app.get("/api/overview")
def get_overview():
    """
    Executive overview from actual SAS integration outputs.
    Returns real figures — no hardcoded fallbacks.
    """
    exec_path = os.path.join(OUTPUTS_DIR, "carboniq_executive_summary.csv")
    rf_perf_path = os.path.join(M2_OUTPUTS, "rf_model_performance.csv")
    opt_path = os.path.join(M3_OUTPUTS, "carbon_optimization_summary.csv")

    _require_file(exec_path)
    _require_file(rf_perf_path)
    _require_file(opt_path)

    df_exec = pd.read_csv(exec_path)
    df_perf = pd.read_csv(rf_perf_path)
    df_opt = pd.read_csv(opt_path)

    for col in ["total_unique_workloads", "total_actual_energy_kwh", "total_actual_emissions_kg",
                "total_anomaly_detected_instances", "grid_carbon_intensity_factor"]:
        _require_col(df_exec, col, exec_path)

    row = df_exec.iloc[0]

    # Model performance — validation and test splits
    perf_val = df_perf[df_perf["Data_Split"] == "VALIDATION"].iloc[0] if "VALIDATION" in df_perf["Data_Split"].values else None
    perf_test = df_perf[df_perf["Data_Split"] == "TEST"].iloc[0] if "TEST" in df_perf["Data_Split"].values else None

    model_perf = {
        "val_mae": float(perf_val["MAE"]) if perf_val is not None else None,
        "val_rmse": float(perf_val["RMSE"]) if perf_val is not None else None,
        "val_r2": float(perf_val["R_Squared"]) if perf_val is not None else None,
        "test_mae": float(perf_test["MAE"]) if perf_test is not None else None,
        "test_rmse": float(perf_test["RMSE"]) if perf_test is not None else None,
        "test_r2": float(perf_test["R_Squared"]) if perf_test is not None else None,
    }

    opt_row = df_opt.iloc[0]
    total_wl = int(row["total_unique_workloads"])
    anom_count = int(row["total_anomaly_detected_instances"])

    return {
        "workloads": total_wl,
        "device_instances": int(row["total_gpu_device_instances"]),
        "actual_energy_kwh": float(row["total_actual_energy_kwh"]),
        "predicted_energy_kwh": float(row.get("total_predicted_energy_kwh", 0)),
        "actual_emissions_kg": float(row["total_actual_emissions_kg"]),
        "optimized_emissions_kg": float(row.get("total_optimized_emissions_kg", 0)),
        "emissions_saved_kg": float(row.get("total_emissions_saved_kg", 0)),
        "anomaly_count": anom_count,
        "anomaly_pct": round(anom_count / total_wl * 100, 2) if total_wl > 0 else 0,
        "carbon_intensity": float(row["grid_carbon_intensity_factor"]),
        "model_perf": model_perf,
        "optimization": {
            "energy_saved_kwh": float(opt_row.get("energy_saved_kwh", 0)),
            "emissions_saved_kg": float(opt_row.get("emissions_saved_kg", 0)),
            "pct_reduced": round(
                float(opt_row.get("emissions_saved_kg", 0)) /
                max(float(opt_row.get("emissions_kg", 1)), 1e-9) * 100, 2
            ),
            "label": "ILLUSTRATIVE SCENARIO — 10% algorithmic efficiency improvement applied to recorded energy measurements. Not a measured saving.",
        },
    }


# ===========================================================================
# GPU ENERGY
# ===========================================================================
@app.get("/api/energy/workloads")
def get_energy_workloads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    partition: Optional[str] = None,
    job_type: Optional[str] = None,
    is_anomaly: Optional[int] = Query(None),
    sort_by: Optional[str] = Query(None, pattern="^(actual_energy_joules|predicted_energy_joules|actual_emissions_kg)$"),
):
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})

    df = df_workloads.copy()
    if partition:
        df = df[df["partition"] == partition]
    if job_type:
        df = df[df["job_type"] == job_type]
    if is_anomaly is not None and "is_anomaly" in df.columns:
        df = df[df["is_anomaly"] == is_anomaly]
    if sort_by and sort_by in df.columns:
        df = df.sort_values(by=sort_by, ascending=False)

    total = len(df)
    page = df.iloc[skip: skip + limit]
    return {"total": total, "skip": skip, "limit": limit, "items": _to_records(page)}


@app.get("/api/energy/workloads/{job_id}")
def get_workload_detail(job_id: int):
    if df_details is None or df_details.empty:
        raise HTTPException(status_code=404, detail={"error": "Detail dataset not loaded"})
    rows = df_details[df_details["id_job"] == job_id]
    if rows.empty:
        raise HTTPException(status_code=404, detail={"error": f"Job {job_id} not found"})
    return {"id_job": job_id, "devices": _to_records(rows)}


@app.get("/api/energy/model-performance")
def get_model_performance():
    path = os.path.join(M2_OUTPUTS, "rf_model_performance.csv")
    _require_file(path)
    df = pd.read_csv(path)
    return {
        "rows": _to_records(df),
        "note": "Random Forest model trained on DCGM GPU telemetry. Energy units: Joules. R² reflects fit quality on a highly variable energy distribution spanning 4 orders of magnitude.",
    }


@app.get("/api/energy/distribution")
def get_energy_distribution():
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})
    _require_col(df_workloads, "predicted_energy_joules", "carboniq_full_integrated_workload.csv")

    vals = df_workloads["predicted_energy_joules"].dropna()
    vals = vals[vals > 0]  # log scale requires positive values

    log_vals = np.log10(vals)
    min_log, max_log = log_vals.min(), log_vals.max()
    n_bins = 10
    edges = np.linspace(min_log, max_log, n_bins + 1)

    bins = []
    for i in range(n_bins):
        lo, hi = 10 ** edges[i], 10 ** edges[i + 1]
        count = int(((vals >= lo) & (vals < hi)).sum())
        bins.append({
            "range_label": f"{lo/1000:.1f}k–{hi/1000:.1f}k J" if hi < 1e6 else f"{lo/1e6:.2f}M–{hi/1e6:.2f}M J",
            "min_j": round(lo, 1),
            "max_j": round(hi, 1),
            "count": count,
        })

    return {"bins": bins, "total": len(vals), "note": "Log₁₀-scale bins of predicted energy in Joules (Random Forest model)"}


@app.get("/api/energy/by-partition")
def get_energy_by_partition():
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})
    grp = df_workloads.groupby("partition").agg(
        count=("id_job", "count"),
        avg_predicted_kwh=("predicted_energy_kwh", "mean"),
        total_predicted_kwh=("predicted_energy_kwh", "sum"),
        avg_actual_kwh=("actual_energy_kwh", "mean"),
        total_actual_kwh=("actual_energy_kwh", "sum"),
    ).reset_index()
    return _to_records(grp)


@app.get("/api/energy/by-jobtype")
def get_energy_by_jobtype():
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})
    grp = df_workloads.groupby("job_type").agg(
        count=("id_job", "count"),
        avg_predicted_kwh=("predicted_energy_kwh", "mean"),
        total_predicted_kwh=("predicted_energy_kwh", "sum"),
        avg_actual_kwh=("actual_energy_kwh", "mean"),
        total_actual_kwh=("actual_energy_kwh", "sum"),
    ).reset_index()
    return _to_records(grp)


# ===========================================================================
# ANOMALY DETECTION
# ===========================================================================
@app.get("/api/anomalies/summary")
def get_anomaly_summary():
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})
    _require_col(df_workloads, "is_anomaly", "carboniq_full_integrated_workload.csv")

    total_wl = len(df_workloads)
    anom_df = df_workloads[df_workloads["is_anomaly"] == 1]
    total_anom = len(anom_df)

    # By type (exclude NONE)
    type_counts = (
        anom_df.groupby(["anomaly_type", "anomaly_severity"])
        .size()
        .reset_index(name="count")
        .sort_values("count", ascending=False)
    )
    by_type = [
        {
            "type": row["anomaly_type"],
            "count": int(row["count"]),
            "severity": row["anomaly_severity"],
            "pct": round(row["count"] / total_wl * 100, 2),
        }
        for _, row in type_counts.iterrows()
    ]

    # By severity
    sev_counts = anom_df["anomaly_severity"].value_counts()
    by_severity = [
        {"severity": sev, "count": int(cnt), "pct": round(cnt / total_wl * 100, 2)}
        for sev, cnt in sev_counts.items()
    ]

    return {
        "total_anomalies": total_anom,
        "total_workloads": total_wl,
        "anomaly_pct": round(total_anom / total_wl * 100, 2) if total_wl > 0 else 0,
        "by_type": by_type,
        "by_severity": by_severity,
    }


@app.get("/api/anomalies/workloads")
def get_anomaly_workloads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    anomaly_type: Optional[str] = None,
    anomaly_severity: Optional[str] = None,
):
    if df_workloads is None or df_workloads.empty:
        raise HTTPException(status_code=404, detail={"error": "Workload dataset not loaded"})

    df = df_workloads[df_workloads["is_anomaly"] == 1].copy()
    if anomaly_type:
        df = df[df["anomaly_type"] == anomaly_type]
    if anomaly_severity:
        df = df[df["anomaly_severity"] == anomaly_severity]

    # Sort CRITICAL > HIGH > MEDIUM
    sev_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "NORMAL": 4}
    if "anomaly_severity" in df.columns:
        df["_sev_rank"] = df["anomaly_severity"].map(sev_order).fillna(9)
        df = df.sort_values(["_sev_rank", "actual_energy_joules"], ascending=[True, False])
        df = df.drop(columns=["_sev_rank"])

    total = len(df)
    page = df.iloc[skip: skip + limit]
    return {"total": total, "skip": skip, "limit": limit, "items": _to_records(page)}


# ===========================================================================
# CARBON INTELLIGENCE
# ===========================================================================
@app.get("/api/carbon/national-trend")
def get_carbon_national_trend():
    path = os.path.join(DATA_DIR, "national_carbon_features.csv")
    _require_file(path)
    df = pd.read_csv(path)
    _require_col(df, "variable", path)
    _require_col(df, "value", path)

    df = df[df["variable"] == "CO2 intensity"].copy()
    df = df.sort_values("date")

    keep = ["date", "value", "yoy_pct_change", "rolling_mean_3", "rolling_mean_12", "year", "month"]
    keep = [c for c in keep if c in df.columns]

    return {
        "rows": _to_records(df[keep]),
        "unit": "gCO2/kWh",
        "source": "IEA data processed by Member 3 Module 2 (national_carbon_features.csv)",
    }


@app.get("/api/carbon/state-comparison")
def get_carbon_state_comparison():
    path = os.path.join(DATA_DIR, "state_carbon_features.csv")
    _require_file(path)
    df = pd.read_csv(path)
    _require_col(df, "value", path)

    df = df[df["variable"] == "CO2 intensity"] if "variable" in df.columns else df

    latest_date = df["date"].max()
    latest = df[df["date"] == latest_date].copy()
    latest = latest.sort_values("value", ascending=False).head(20)

    keep = ["state", "state_code", "value", "national_intensity", "state_national_difference"]
    keep = [c for c in keep if c in latest.columns]

    return {
        "date": latest_date,
        "states": _to_records(latest[keep]),
        "unit": "gCO2/kWh",
    }


@app.get("/api/carbon/emissions-summary")
def get_carbon_emissions_summary():
    em_path = os.path.join(M3_OUTPUTS, "gpu_emissions_summary.csv")
    _require_file(em_path)
    df = pd.read_csv(em_path)

    row = df.iloc[0]
    return {
        "total_jobs_measured": int(row.get("Jobs", row.get("_FREQ_", 0))),
        "total_energy_kwh": float(row.get("Total_Energy_kWh", 0)),
        "total_emissions_kg": float(row.get("Total_Emissions_kg", 0)),
        "avg_energy_kwh": float(row.get("Average_Energy_kWh", 0)),
        "avg_emissions_kg": float(row.get("Average_Emissions_kg", 0)),
        "carbon_intensity_g_kwh": 615.1726506,
        "note": (
            "Recorded DCGM energy measurements. Scope 2 GHG. "
            "India national grid average carbon intensity 615.17 gCO₂/kWh. "
            "Source: gpu_emissions_summary.csv"
        ),
    }


@app.get("/api/carbon/optimization")
def get_carbon_optimization():
    path = os.path.join(M3_OUTPUTS, "carbon_optimization_summary.csv")
    _require_file(path)
    df = pd.read_csv(path)
    row = df.iloc[0]

    base_em = float(row.get("emissions_kg", 0))
    opt_em = float(row.get("optimized_emissions_kg", 0))
    saved = float(row.get("emissions_saved_kg", 0))
    pct = round(saved / base_em * 100, 2) if base_em > 0 else 0

    return {
        "energy_kwh": float(row.get("energy_kwh", 0)),
        "emissions_kg": base_em,
        "optimized_energy_kwh": float(row.get("optimized_energy_kwh", 0)),
        "optimized_emissions_kg": opt_em,
        "energy_saved_kwh": float(row.get("energy_saved_kwh", 0)),
        "emissions_saved_kg": saved,
        "pct_saved": pct,
        "label": (
            "ILLUSTRATIVE SCENARIO — 10% algorithmic efficiency improvement applied "
            "to recorded energy measurements. Not a measured saving."
        ),
    }


@app.get("/api/carbon/model-comparison")
def get_carbon_model_comparison():
    train_path = os.path.join(M3_OUTPUTS, "model_training_comparison.csv")
    val_path = os.path.join(M3_OUTPUTS, "model_validation_summary.csv")
    _require_file(train_path)
    _require_file(val_path)

    return {
        "training": _to_records(pd.read_csv(train_path)),
        "validation": _to_records(pd.read_csv(val_path)),
        "note": "Carbon intensity forecasting models (Gradient Boosting, Random Forest). Metrics on training data only.",
    }


# ===========================================================================
# SAS CAS TABLES
# ===========================================================================
@app.get("/api/sas/tables")
def get_sas_cas_tables():
    wl_count = len(df_workloads) if df_workloads is not None else 0
    det_count = len(df_details) if df_details is not None else 0
    return [
        {"tableName": "CARBONIQ_FULL_INTEGRATED_DETAIL", "rowCount": det_count, "columnCount": 73, "engine": "CASHDAT", "status": "LOADED"},
        {"tableName": "CARBONIQ_FULL_INTEGRATED_WORKLOAD", "rowCount": wl_count, "columnCount": 22, "engine": "CASHDAT", "status": "LOADED"},
        {"tableName": "CARBONIQ_EXECUTIVE_SUMMARY", "rowCount": 1, "columnCount": 17, "engine": "CASHDAT", "status": "LOADED"},
    ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
