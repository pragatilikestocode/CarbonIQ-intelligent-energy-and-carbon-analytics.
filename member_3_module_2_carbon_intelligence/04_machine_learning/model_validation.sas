
/*===========================================================
  CarbonIQ - Module 2: Carbon Intelligence
  Program: Model Validation
  Models: Gradient Boosting and Random Forest
===========================================================*/

/* 1. Assign permanent library */

libname carbon
"/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./member_3_module_2_carbon_intelligence";


/* 2. Prepare chronological dataset */

proc sort data=carbon.national_carbon
          out=work.carbon_sorted;
    by date;
run;


/* 3. Keep observations with complete model features */

data work.carbon_model_data;
    set work.carbon_sorted;

    if nmiss(value, lag_1, lag_3, lag_6, lag_12,
             month, quarter, month_sin, month_cos)=0;
run;


/* 4. Split into training and testing data */

data work.carbon_train work.carbon_test;
    set work.carbon_model_data nobs=total;

    if _n_ <= total-12 then output work.carbon_train;
    else output work.carbon_test;
run;


/* 5. Verify split */

proc sql;
    title "CarbonIQ - Training and Testing Data";

    select "Training" as Dataset,
           count(*) as Observations
    from work.carbon_train

    union all

    select "Testing",
           count(*)
    from work.carbon_test;
quit;


/*===========================================================
  MODEL 1: GRADIENT BOOSTING
===========================================================*/

proc gradboost data=work.carbon_train
    seed=12345
    ntrees=200
    maxdepth=3;

    input lag_1 lag_3 lag_6 lag_12
          month quarter month_sin month_cos
          / level=interval;

    target value / level=interval;

    output out=work.gb_train_scored;

    savestate rstore=carbon.gb_model;

    ods output FitStatistics=work.gb_fit;
run;


/* 6. Gradient Boosting training metrics */

proc sql;
    create table work.gb_train_metrics as
    select
        sqrt(mean(_Residual_ * _Residual_)) as RMSE,
        mean(abs(_Residual_)) as MAE,
        mean(_Residual_ * _Residual_) as MSE
    from work.gb_train_scored;
quit;

title "Gradient Boosting - Training Metrics";

proc print data=work.gb_train_metrics;
run;


/* 7. Gradient Boosting variable importance and fit */

title "Gradient Boosting Fit Statistics";

proc print data=work.gb_fit;
run;


/*===========================================================
  MODEL 2: RANDOM FOREST
===========================================================*/

proc forest data=work.carbon_train
    seed=12345
    maxdepth=5
    ntree=200;

    input lag_1 lag_3 lag_6 lag_12
          month quarter month_sin month_cos
          / level=interval;

    target value / level=interval;

    output out=work.rf_train_scored;

    savestate rstore=carbon.rf_model;

    ods output FitStatistics=work.rf_fit;
run;


/* 8. Random Forest training metrics */

proc sql;
    create table work.rf_train_metrics as
    select
        sqrt(mean(_Residual_ * _Residual_)) as RMSE,
        mean(abs(_Residual_)) as MAE,
        mean(_Residual_ * _Residual_) as MSE
    from work.rf_train_scored;
quit;

title "Random Forest - Training Metrics";

proc print data=work.rf_train_metrics;
run;


/* 9. Random Forest fit statistics */

title "Random Forest Fit Statistics";

proc print data=work.rf_fit;
run;


/*===========================================================
  10. Save training metric comparison
===========================================================*/

data carbon.model_training_comparison;
    length Model $30;

    set work.gb_train_metrics(in=gb)
        work.rf_train_metrics(in=rf);

    if gb then Model="Gradient Boosting";
    if rf then Model="Random Forest";
run;

title "CarbonIQ - Model Training Comparison";

proc print data=carbon.model_training_comparison
           noobs;
run;


/*===========================================================
  11. Export training metrics
===========================================================*/

proc export data=carbon.model_training_comparison
    outfile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./outputs/module_2_carbon_intelligence/model_training_comparison.csv"
    dbms=csv
    replace;
run;


/*===========================================================
  END OF PROGRAM
===========================================================*/

title;
proc print data=work.rf_train_metrics;
    title "Random Forest Training Metrics";
run;
proc print data=work.gb_train_metrics;
    title "Gradient Boosting Training Metrics";
run;

proc contents data=carbon.gb_model;
run;

proc contents data=carbon.rf_model;
run;
proc setinit;
run;
proc gradboost data=work.carbon_train
    seed=12345
    ntrees=200
    maxdepth=3;

    input lag_1 lag_3 lag_6 lag_12
          month quarter month_sin month_cos
          / level=interval;

    target value / level=interval;

    savestate rstore=work.gb_store;
run;

proc astore;
    describe rstore=work.gb_store;
    score data=work.carbon_test
          rstore=work.gb_store
          out=work.gb_test_scored;
run;

proc contents data=work.gb_test_scored;
run;
proc astore;
    score data=work.carbon_test
          rstore=work.gb_store
          out=work.gb_test_scored
          copyvars=(value date);
run;
proc sql;
    create table work.gb_test_metrics as
    select
        sqrt(mean((value-P_value)**2)) as RMSE,
        mean(abs(value-P_value)) as MAE,
        mean((value-P_value)**2) as MSE
    from work.gb_test_scored;
quit;

proc print data=work.gb_test_metrics;
    title "Gradient Boosting Test Metrics";
run;