/* CarbonIQ - Gradient Boosting Model */

proc gradboost data=work.rf_data
    seed=12345
    ntrees=200
    maxdepth=3;

    input lag_1 lag_3 lag_6 lag_12
          month quarter month_sin month_cos
          / level=interval;

    target value / level=interval;

    ods output FitStatistics=work.gb_fit;
run;