/* CarbonIQ - Random Forest Model */

/* Prepare model input data */
proc sort data=carbon.national_carbon
          out=work.rf_data;
    by date;
run;

/* Remove rows without complete lag features */
data work.rf_data;
    set work.rf_data;
    if nmiss(value, lag_1, lag_3, lag_6,
             lag_12, month, quarter,
             month_sin, month_cos)=0;
run;

/* Train Random Forest */
proc forest data=work.rf_data
    seed=12345
    maxdepth=5
    ntree=200;

    input lag_1 lag_3 lag_6 lag_12
          month quarter month_sin month_cos
          / level=interval;

    target value / level=interval;

    ods output FitStatistics=work.rf_fit;
run;