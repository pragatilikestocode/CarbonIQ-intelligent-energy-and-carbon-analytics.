libname carbon
"/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./member_3_module_2_carbon_intelligence";

/* Prepare GPU energy data */
data work.gpu_optimization;
    set carbon.gpu_data;

    energy_kwh = energyconsumed_joules / 3600000;

    if energyconsumed_joules > 0
       and not missing(energyconsumed_joules);

    /* National average carbon intensity proxy */
    carbon_intensity = 615.1726506;

    emissions_kg =
        energy_kwh * carbon_intensity / 1000;

    /* Illustrative 10% energy reduction scenario */
    optimized_energy_kwh = energy_kwh * 0.90;

    optimized_emissions_kg =
        optimized_energy_kwh * carbon_intensity / 1000;

    energy_saved_kwh =
        energy_kwh - optimized_energy_kwh;

    emissions_saved_kg =
        emissions_kg - optimized_emissions_kg;
run;

/* Summarize optimization results */
proc means data=work.gpu_optimization sum mean;
    var energy_kwh emissions_kg
        optimized_energy_kwh optimized_emissions_kg
        energy_saved_kwh emissions_saved_kg;
    title "CarbonIQ GPU Energy Optimization Analysis";
run;

/* Save permanent results */
data carbon.gpu_optimization;
    set work.gpu_optimization;
run;
proc means data=carbon.gpu_optimization
    noprint;
    var energy_kwh emissions_kg
        optimized_energy_kwh optimized_emissions_kg
        energy_saved_kwh emissions_saved_kg;
    output out=work.optimization_summary
        sum=;
run;

proc export data=work.optimization_summary
    outfile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./outputs/module_2_carbon_intelligence/carbon_optimization_summary.csv"
    dbms=csv replace;
run;