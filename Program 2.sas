
/* STEP 1: CREATE CANDIDATE ML FEATURE DATASET */

DATA WORK.ML_FEATURE_AUDIT;

    SET WORK.GPU_DATA;

    /* Target variable */
    target_energy = energyconsumed_joules;

    /* Extract requested GPU count from GRES request */
    LENGTH requested_gpu_count 8;

    IF NOT MISSING(gres_req) THEN
        requested_gpu_count =
            INPUT(SCAN(STRIP(gres_req), -1, ':'), BEST32.);
    ELSE
        requested_gpu_count = .;

    /* Memory request missing indicator */
    memory_missing_flag = mem_req_unspecified;

    /* Time-limit sentinel indicator */
    IF timelimit = 4294967295 THEN
        timelimit_unspecified = 1;
    ELSE
        timelimit_unspecified = 0;

    /* Preserve actual time limit only when valid */
    IF timelimit_unspecified = 1 THEN
        clean_timelimit = .;
    ELSE
        clean_timelimit = timelimit;

    KEEP id_job
         target_energy
         cpus_req
         requested_gpu_count
         mem_req_kb
         memory_missing_flag
         job_type
         partition
         priority
         clean_timelimit
         timelimit_unspecified;

RUN;


/* STEP 1A: CHECK DATASET STRUCTURE */

PROC CONTENTS DATA=WORK.ML_FEATURE_AUDIT;
    TITLE "Candidate ML Feature Dataset Structure";
RUN;


/* STEP 1B: NUMERIC FEATURE SUMMARY */

PROC MEANS DATA=WORK.ML_FEATURE_AUDIT
    N NMISS MEAN MEDIAN MIN MAX MAXDEC=2;

    VAR target_energy
        cpus_req
        requested_gpu_count
        mem_req_kb
        priority
        clean_timelimit;

    TITLE "Candidate ML Numeric Feature Summary";
RUN;


/* STEP 1C: CATEGORICAL FEATURE DISTRIBUTIONS */

PROC FREQ DATA=WORK.ML_FEATURE_AUDIT;

    TABLES job_type
           partition
           memory_missing_flag
           timelimit_unspecified
           requested_gpu_count / MISSING;

    TITLE "Candidate ML Categorical Feature Distributions";
RUN;


/* STEP 1D: VERIFY TARGET */

PROC SQL;

    SELECT
        COUNT(*) AS total_records,
        COUNT(DISTINCT id_job) AS unique_jobs,
        SUM(MISSING(target_energy)) AS missing_targets,
        SUM(target_energy = 0) AS zero_energy_records,
        SUM(target_energy < 0) AS negative_energy_records

    FROM WORK.ML_FEATURE_AUDIT;

QUIT;

TITLE;
