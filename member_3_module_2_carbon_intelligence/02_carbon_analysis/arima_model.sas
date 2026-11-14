/* CarbonIQ - ARIMA(1,1,1) Model */

proc arima data=work.carbon_ts;
    identify var=value(1);
    estimate p=1 q=1 method=ml;
    forecast lead=12
        id=date
        interval=month
        out=carbon.arima_forecast;
    title "CarbonIQ - ARIMA(1,1,1) Forecast";
run;
quit;

title;