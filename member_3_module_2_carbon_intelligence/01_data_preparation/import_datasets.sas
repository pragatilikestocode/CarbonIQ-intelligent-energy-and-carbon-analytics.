
/* ============================================================
   CarbonIQ - MODULE 2
   PROGRAM: DATA IMPORT
   PURPOSE: Import cleaned carbon and GPU datasets
   ============================================================ */

options validvarname=any;

/* Project paths */
%let project_root=/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics.;

%let processed_path=&project_root/data/processed;

/* Create permanent SAS library */
libname carbon "&project_root/member_3_module_2_carbon_intelligence";

/* Import national carbon intensity data */
proc import
    datafile="&processed_path/national_carbon_features.csv"
    out=carbon.national_carbon
    dbms=csv
    replace;
    guessingrows=max;
    getnames=yes;
run;

/* Import integrated GPU dataset */
proc import
    datafile="&processed_path/master_dataset_integrated.csv"
    out=carbon.gpu_data
    dbms=csv
    replace;
    guessingrows=max;
    getnames=yes;
run;

/* Verify imported datasets */
proc contents data=carbon.national_carbon;
    title "CarbonIQ - National Carbon Dataset";
run;

proc contents data=carbon.gpu_data;
    title "CarbonIQ - GPU Dataset";
run;

/* Verify record counts */
proc sql;
    title "CarbonIQ - Dataset Import Summary";

    select "National Carbon" as Dataset,
           count(*) as Total_Records
    from carbon.national_carbon

    union all

    select "GPU Data" as Dataset,
           count(*) as Total_Records
    from carbon.gpu_data;
quit;

title;
