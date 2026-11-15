
/* STEP 1: Calculate medians using TRAINING DATA ONLY */

PROC SQL NOPRINT;
    SELECT
        MEDIAN(mem_req_kb),
        MEDIAN(clean_timelimit)
    INTO
        :MED_MEM,
        :MED_TIMELIMIT
    FROM WORK.ML_SPLIT_DATA
    WHERE data_split = "TRAIN";
QUIT;

%PUT Training Median Memory = &MED_MEM;
%PUT Training Median Time Limit = &MED_TIMELIMIT;


/* STEP 2: Create imputed features */

DATA WORK.ML_MODEL_READY;
    SET WORK.ML_SPLIT_DATA;

    /* Preserve original columns */

    mem_req_kb_imp = mem_req_kb;
    clean_timelimit_imp = clean_timelimit;

    /* Apply training-derived medians */

    IF MISSING(mem_req_kb_imp) THEN
        mem_req_kb_imp = &MED_MEM;

    IF MISSING(clean_timelimit_imp) THEN
        clean_timelimit_imp = &MED_TIMELIMIT;

RUN;


/* STEP 3: Verify missing values */

PROC MEANS DATA=WORK.ML_MODEL_READY
    N NMISS MIN MEDIAN MAX;

    CLASS data_split;

    VAR mem_req_kb_imp clean_timelimit_imp
        cpus_req requested_gpu_count priority
        target_energy;
        
    TITLE "ML Feature Missing Value Validation";
RUN;

TITLE;
