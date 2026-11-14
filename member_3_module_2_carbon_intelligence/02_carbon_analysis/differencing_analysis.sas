proc arima data=work.carbon_ts;
    identify var=value(1)
        stationarity=(adf=4)
        nlag=12;
run;
quit;