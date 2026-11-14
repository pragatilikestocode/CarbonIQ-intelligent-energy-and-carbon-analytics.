
/* CARBONIQ - RANDOM FOREST PERFORMANCE METRICS */

%let project=/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics.;

libname gpu "&project./member_2_module_1_gpu_energy";

/* Score validation data */
proc hp4score
    data=gpu.ML_MODEL_READY
    (where=(upcase(data_split)='VALIDATION'));
    score file="/export/viya/homes/narayani.rajebhosale24@vit.edu/rf_model_raw_200.bin"
    out=work.rf_validation_scored;
run;

/* Score test data */
proc hp4score
    data=gpu.ML_MODEL_READY
    (where=(upcase(data_split)='TEST'));
    score file="/export/viya/homes/narayani.rajebhosale24@vit.edu/rf_model_raw_200.bin"
    out=work.rf_test_scored;
run;

/* Calculate metrics for each dataset */
%macro metrics(input=, split=);

data work.errors;
    set &input;
    residual=target_energy-P_target_energy;
    absolute_error=abs(residual);
    squared_error=residual**2;
run;

proc sql noprint;
    select mean(target_energy)
    into :actual_mean
    from work.errors;
quit;

proc sql;
    create table work.metric_&split as
    select
        "&split" as Data_Split length=12,
        count(*) as Observations,
        mean(absolute_error) as MAE,
        sqrt(mean(squared_error)) as RMSE,
        case
            when sum((target_energy-&actual_mean)**2)>0
            then 1-sum(squared_error)/
                 sum((target_energy-&actual_mean)**2)
            else .
        end as R_Squared
    from work.errors;
quit;

%mend;

%metrics(input=work.rf_validation_scored,split=VALIDATION);
%metrics(input=work.rf_test_scored,split=TEST);

/* Final results */
data gpu.rf_model_performance;
    set work.metric_VALIDATION work.metric_TEST;
run;

title "Member 2 - Random Forest Performance";

proc print data=gpu.rf_model_performance noobs;
    format MAE RMSE comma18.4 R_Squared 10.5;
run;

/* Export performance results */
proc export data=gpu.rf_model_performance
    outfile="&project./outputs/module_1_gpu_energy/rf_model_performance.csv"
    dbms=csv replace;
run;

/* Save test predictions permanently */
data gpu.rf_test_predictions;
    set work.rf_test_scored;
run;

proc export data=gpu.rf_test_predictions
    outfile="&project./outputs/module_1_gpu_energy/rf_test_predictions.csv"
    dbms=csv replace;
run;
