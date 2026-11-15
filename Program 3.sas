
/* Validate requested GPU count against gres_req */

DATA WORK.GPU_REQUEST_VALIDATION;
    SET WORK.GPU_DATA;

    LENGTH requested_gpu_count 8;
    LENGTH gres_gpu_count 8;

    /* Extract GPU count from gres_req */
    requested_gpu_count = gpu_count;

    IF NOT MISSING(gres_req) THEN DO;
        gres_gpu_count = INPUT(
            SCAN(gres_req, -1, ':'),
            BEST32.
        );
    END;
    ELSE gres_gpu_count = .;

    IF NOT MISSING(gres_gpu_count) AND
       NOT MISSING(requested_gpu_count) THEN
        allocation_match =
            (requested_gpu_count = gres_gpu_count);
    ELSE allocation_match = .;
RUN;

PROC FREQ DATA=WORK.GPU_REQUEST_VALIDATION;
    TABLES allocation_match / MISSING;
    TITLE "GPU Request Count Validation";
RUN;

PROC SQL;
    SELECT
        COUNT(*) AS total_records,
        SUM(allocation_match = 1) AS matching_records,
        SUM(allocation_match = 0) AS mismatching_records,
        SUM(MISSING(allocation_match)) AS unvalidated_records
    FROM WORK.GPU_REQUEST_VALIDATION;
QUIT;

TITLE;
