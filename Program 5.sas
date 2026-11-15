
/* STEP 1: Extract unique job IDs */

PROC SORT DATA=WORK.FINAL_ML_DATA
          OUT=WORK.UNIQUE_JOBS(KEEP=id_job)
          NODUPKEY;
    BY id_job;
RUN;


/* STEP 2: Assign each job to a dataset split */

DATA WORK.JOB_SPLIT;
    SET WORK.UNIQUE_JOBS;

    CALL STREAMINIT(20261114);

    random_value = RAND("UNIFORM");

    LENGTH data_split $10;

    IF random_value < 0.70 THEN
        data_split = "TRAIN";

    ELSE IF random_value < 0.85 THEN
        data_split = "VALIDATION";

    ELSE
        data_split = "TEST";

    DROP random_value;
RUN;


/* STEP 3: Merge split assignments into original observations */

PROC SORT DATA=WORK.FINAL_ML_DATA
          OUT=WORK.FINAL_ML_SORTED;
    BY id_job;
RUN;

PROC SORT DATA=WORK.JOB_SPLIT;
    BY id_job;
RUN;

DATA WORK.ML_SPLIT_DATA;
    MERGE WORK.FINAL_ML_SORTED(IN=A)
          WORK.JOB_SPLIT(IN=B);
    BY id_job;

    IF A AND B;
RUN;


/* STEP 4: Check observation distribution */

PROC FREQ DATA=WORK.ML_SPLIT_DATA;
    TABLES data_split;
    TITLE "Train Validation Test Distribution";
RUN;


/* STEP 5: Check unique jobs in each split */

PROC SQL;
    SELECT
        data_split,
        COUNT(*) AS observations,
        COUNT(DISTINCT id_job) AS unique_jobs
    FROM WORK.ML_SPLIT_DATA
    GROUP BY data_split;
QUIT;

TITLE;
