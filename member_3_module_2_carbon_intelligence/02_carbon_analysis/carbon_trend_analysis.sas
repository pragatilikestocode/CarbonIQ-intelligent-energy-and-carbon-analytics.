/* CarbonIQ - National Carbon Trend Analysis */

proc sort data=carbon.national_carbon
          out=work.carbon_sorted;
    by date;
run;

/* Descriptive statistics */
proc means data=work.carbon_sorted
    n mean median std min max q1 q3;
    var value;
    title "Carbon Intensity - Descriptive Statistics";
run;

/* Monthly carbon intensity trend */
proc sgplot data=work.carbon_sorted;
    series x=date y=value /
        markers
        lineattrs=(thickness=2);
    xaxis label="Month" interval=year;
    yaxis label="Carbon Intensity (gCO2/kWh)";
    title "India - Monthly Carbon Intensity Trend";
run;

/* Year-wise summary */
proc sql;
    title "Year-wise Carbon Intensity Summary";
    select year,
           count(*) as Months,
           mean(value) as Average_Intensity,
           min(value) as Minimum_Intensity,
           max(value) as Maximum_Intensity
    from work.carbon_sorted
    group by year
    order by year;
quit;

title;