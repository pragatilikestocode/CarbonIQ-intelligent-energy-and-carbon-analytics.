/* CarbonIQ - ARIMA and Stationarity Analysis */

proc sort data=carbon.national_carbon
          out=work.carbon_ts;
    by date;
run;

/* Check stationarity and autocorrelation */
proc arima data=work.carbon_ts;
    identify var=value
        stationarity=(adf=4)
        nlag=12;
    title "Carbon Intensity - ADF Stationarity Test";
run;
quit;

title;