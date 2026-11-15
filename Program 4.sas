DATA WORK.FINAL_ML_DATA;
    SET WORK.ML_FEATURE_AUDIT_V2;

    /* Keep only valid non-negative target values */
    IF MISSING(target_energy) OR target_energy < 0 THEN DELETE;

    /* Log-transformed target for later model comparison */
    log_energy = LOG(1 + target_energy);
RUN;

PROC CONTENTS DATA=WORK.FINAL_ML_DATA;
    TITLE "Final ML Dataset Structure";
RUN;

PROC SQL;
    SELECT
        COUNT(*) AS total_observations,
        COUNT(DISTINCT id_job) AS unique_jobs,
        SUM(target_energy = 0) AS zero_energy_records
    FROM WORK.FINAL_ML_DATA;
QUIT;

TITLE;