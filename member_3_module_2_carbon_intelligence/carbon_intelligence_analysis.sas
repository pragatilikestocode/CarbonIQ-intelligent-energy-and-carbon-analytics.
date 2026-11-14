/* CARBONIQ - NATIONAL CARBON DATA IMPORT */

proc import
    datafile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./data/processed/national_carbon_features.csv"
    out=work.national_carbon
    dbms=csv
    replace;
    guessingrows=max;
    getnames=yes;
run;

/* Check dataset structure */
proc contents data=work.national_carbon;
run;

/* Display first 10 observations */
proc print data=work.national_carbon(obs=10);
run;
/* CARBON INTENSITY DATA QUALITY CHECK */

proc means data=work.national_carbon
    n nmiss mean median std min max;
    var value;
run;

/* Check monthly records */
proc freq data=work.national_carbon;
    tables year / missing;
run;

/* Check missing carbon intensity values */
proc print data=work.national_carbon;
    where missing(value) or value=0;
run;
/* CARBON INTENSITY TREND */

proc sgplot data=work.national_carbon;
    series x=date y=value /
        markers
        lineattrs=(thickness=2);
    xaxis label="Month";
    yaxis label="Carbon Intensity (gCO2/kWh)";
    title "India Monthly Carbon Intensity Trend";
run;
/* IMPORT GPU DATASET */

proc import
    datafile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./data/processed/master_dataset_integrated.csv"
    out=work.gpu_data
    dbms=csv
    replace;
    guessingrows=1000;
    getnames=yes;
run;


/* ==========================================
   CARBONIQ - GPU TIMESTAMP INVESTIGATION
   ========================================== */

/* Step 1: Check GPU dataset structure */
proc contents data=work.gpu_data;
run;

/* Step 2: Display first 10 records of all timestamps */
proc print data=work.gpu_data(obs=10);
    var time_submit
        time_eligible
        time_start
        time_end;
    format time_submit
           time_eligible
           time_start
           time_end datetime20.;
run;

/* Step 3: Check timestamp ranges */
proc means data=work.gpu_data
    min max mean n nmiss;
    var time_submit
        time_eligible
        time_start
        time_end;
run;

/* Step 4: Check execution time */
proc means data=work.gpu_data
    min max mean;
    var totalexecutiontime_sec
        queue_time_sec
        scheduler_runtime_sec;
run;

/* Check GPU timestamp duration against execution time */

data work.gpu_time_check;
    set work.gpu_data;

    timestamp_duration_sec = time_end - time_start;
run;

proc means data=work.gpu_time_check
    min max mean n nmiss;
    var timestamp_duration_sec
        totalexecutiontime_sec;
run;

proc print data=work.gpu_time_check(obs=10);
    var time_start
        time_end
        timestamp_duration_sec
        totalexecutiontime_sec;
run;
/* GPU ENERGY DATA QUALITY ANALYSIS */

proc means data=work.gpu_data
    n nmiss mean median std min max;
    var energyconsumed_joules
        powerusage_watts_avg
        totalexecutiontime_sec;
run;

/* Check missing GPU energy values */

proc print data=work.gpu_data(obs=10);
    var id_job
        energyconsumed_joules
        powerusage_watts_avg
        totalexecutiontime_sec;
run;
proc sql;
    select
        count(*) as Total_Records,

        sum(energyconsumed_joules = 0)
            as Zero_Energy,

        sum(powerusage_watts_avg = 0)
            as Zero_Power,

        sum(totalexecutiontime_sec = 0)
            as Zero_Execution_Time

    from work.gpu_data;
quit;
proc sql;
    select
        sum(energyconsumed_joules = 0
            and powerusage_watts_avg = 0)
            as Both_Zero,

        sum(energyconsumed_joules = 0
            and powerusage_watts_avg > 0)
            as Zero_Energy_Positive_Power,

        sum(energyconsumed_joules > 0
            and powerusage_watts_avg = 0)
            as Positive_Energy_Zero_Power

    from work.gpu_data;
quit;
proc means data=work.gpu_data
    n mean median min max;
    where energyconsumed_joules = 0
      and powerusage_watts_avg > 0;

    var totalexecutiontime_sec
        powerusage_watts_avg;
run;
data work.gpu_energy_validation;
    set work.gpu_data;

    estimated_energy_joules =
        powerusage_watts_avg * totalexecutiontime_sec;

    energy_difference =
        energyconsumed_joules - estimated_energy_joules;
run;

proc means data=work.gpu_energy_validation
    n mean median min max;
    var energyconsumed_joules
        estimated_energy_joules
        energy_difference;
run;
proc sql;
    select
        count(*) as Total_Records,

        sum(estimated_energy_joules >
            2 * energyconsumed_joules)
            as Estimated_Above_Twice,

        sum(energyconsumed_joules >
            2 * estimated_energy_joules)
            as Recorded_Above_Twice,

        sum(abs(energy_difference) > 100000)
            as Difference_Above_100000_J

    from work.gpu_energy_validation;
quit;
proc contents data=work.national_carbon_features;
run;

proc print data=work.national_carbon_features(obs=5);
run;
data work.gpu_energy_kwh;
    set work.gpu_data;

    if energyconsumed_joules > 0 then
        energy_kwh = energyconsumed_joules / 3600000;
    else energy_kwh = .;

    if energyconsumed_joules = 0 then
        energy_quality_flag = "ZERO ENERGY";
    else energy_quality_flag = "VALID";
run;

proc means data=work.gpu_energy_kwh
    n nmiss mean min max;
    var energy_kwh;
run;
proc means data=work.national_carbon
    min max n nmiss;
    var date value;
    format date date9.;
run;
/* CARBONIQ - CARBON INTENSITY ANALYSIS */

proc means data=work.national_carbon
    n mean median std min max;
    var value;
    title "India Carbon Intensity Statistics";
run;

/* Monthly trend */
proc sgplot data=work.national_carbon;
    series x=date y=value / markers lineattrs=(thickness=2);
    xaxis label="Month";
    yaxis label="Carbon Intensity (gCO2/kWh)";
    title "India Monthly Carbon Intensity Trend";
run;

/* Highest and lowest carbon intensity months */
proc sort data=work.national_carbon
    out=work.carbon_sorted;
    by value;
run;

title "Lowest Carbon Intensity Months";
proc print data=work.carbon_sorted(obs=5);
    var date value;
    format date monyy7.;
run;

proc sort data=work.national_carbon
    out=work.carbon_high;
    by descending value;
run;

title "Highest Carbon Intensity Months";
proc print data=work.carbon_high(obs=5);
    var date value;
    format date monyy7.;
run;

title;
/* CARBONIQ - GPU CARBON EMISSIONS ESTIMATION */

data work.gpu_carbon_emissions;
    set work.gpu_energy_kwh;

    national_avg_intensity = 615.1726506;

    if not missing(energy_kwh) then
        estimated_emissions_kg =
            energy_kwh * national_avg_intensity / 1000;
    else estimated_emissions_kg = .;
run;

/* Summary of estimated emissions */
proc means data=work.gpu_carbon_emissions
    n sum mean min max;
    var energy_kwh estimated_emissions_kg;
    title "CarbonIQ - Estimated GPU Carbon Emissions";
run;

/* Export results */
proc export data=work.gpu_carbon_emissions
    outfile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./outputs/module_2_carbon_intelligence/analysis/gpu_carbon_emissions.csv"
    dbms=csv
    replace;
run;

title;
/* CARBONIQ - MONTHLY CARBON INTENSITY FORECAST */

proc sort data=work.national_carbon
    out=work.carbon_forecast_input;
    by date;
run;

proc esm data=work.carbon_forecast_input
    outfor=work.carbon_forecast;
    id date interval=month;
    forecast value / model=linear;
run;

proc print data=work.carbon_forecast(obs=15);
    title "CarbonIQ - Carbon Intensity Forecast";
run;

title;
/* CARBONIQ - 12 MONTH FUTURE FORECAST */

proc esm data=work.national_carbon
    outfor=work.carbon_forecast_12m
    lead=12;
    id date interval=month;
    forecast value / model=linear;
run;

/* Display future predictions */
proc print data=work.carbon_forecast_12m;
    where actual = .;
    var date predict lower upper;
    format date monyy7.;
    title "CarbonIQ - Next 12 Months Carbon Intensity Forecast";
run;

title;
/* CARBONIQ - CARBON AWARE OPTIMIZATION */

/* Rank months by carbon intensity */
proc sort data=work.national_carbon
    out=work.carbon_optimization;
    by value;
run;

data work.carbon_optimization;
    set work.carbon_optimization;
    month_rank = _N_;
run;

/* Calculate potential reduction versus national average */
proc sql;
    create table work.carbon_savings as
    select
        mean(value) as average_intensity,
        min(value) as lowest_intensity,
        (mean(value)-min(value))/mean(value)*100
            as potential_reduction_pct
    from work.national_carbon;
quit;

title "CarbonIQ - Potential Carbon Optimization";
proc print data=work.carbon_savings;
run;

title "CarbonIQ - Recommended Lower Carbon Months";
proc print data=work.carbon_optimization(obs=10);
    var date value month_rank;
    format date monyy7.;
run;

title;