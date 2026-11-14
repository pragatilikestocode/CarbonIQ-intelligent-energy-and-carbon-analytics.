
/* CARBONIQ - MEMBER 2 DATA IMPORT */

%let project=/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics.;

/* Module 1 permanent library */
libname gpu "&project./member_2_module_1_gpu_energy";

/* Import ML_MODEL_READY.csv */
proc import
    datafile="&project./member_2_module_1_gpu_energy/01_data_preparation/ML_MODEL_READY.csv"
    out=gpu.ML_MODEL_READY
    dbms=csv
    replace;
    guessingrows=max;
    getnames=yes;
run;

/* Import FINAL_ML_DATA.csv */
proc import
    datafile="&project./member_2_module_1_gpu_energy/01_data_preparation/FINAL_ML_DATA.csv"
    out=gpu.FINAL_ML_DATA
    dbms=csv
    replace;
    guessingrows=max;
    getnames=yes;
run;

/* Verify imported datasets */
proc contents data=gpu.ML_MODEL_READY;
run;

proc contents data=gpu.FINAL_ML_DATA;
run;

/* Check record counts */
proc sql;
    select count(*) as ML_MODEL_READY_Rows
    from gpu.ML_MODEL_READY;

    select count(*) as FINAL_ML_DATA_Rows
    from gpu.FINAL_ML_DATA;
quit;
