/* CarbonIQ - ARIMA Model Comparison */

proc arima data=work.carbon_ts;

    identify var=value(1);

    /* Model 1: ARIMA(1,1,0) */
    estimate p=1 method=ml;

    /* Model 2: ARIMA(0,1,1) */
    estimate q=1 method=ml;

    /* Model 3: ARIMA(2,1,1) */
    estimate p=2 q=1 method=ml;

    /* Model 4: ARIMA(1,1,2) */
    estimate p=1 q=2 method=ml;

run;
quit;