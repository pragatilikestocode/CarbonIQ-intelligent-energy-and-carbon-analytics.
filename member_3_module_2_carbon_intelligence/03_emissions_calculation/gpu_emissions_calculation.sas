libname carbon
"/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./member_3_module_2_carbon_intelligence";

/* Calculate GPU energy and carbon emissions */
data carbon.gpu_emissions;
    set carbon.gpu_data;

    energy_kwh = energyconsumed_joules / 3600000;

    if missing(energyconsumed_joules)
       or energyconsumed_joules <= 0 then delete;

    carbon_intensity = 615.1726506;

    emissions_kg =
        energy_kwh * carbon_intensity / 1000;

    emissions_tonnes = emissions_kg / 1000;
run;

/* Emissions summary */
proc means data=carbon.gpu_emissions
    n sum mean min max maxdec=4;
    var energy_kwh emissions_kg emissions_tonnes;
    title "CarbonIQ GPU Energy and Emissions Summary";
run;

/* Export emissions summary */
proc means data=carbon.gpu_emissions noprint;
    var energy_kwh emissions_kg emissions_tonnes;
    output out=work.emissions_summary
        n=Jobs
        sum=Total_Energy_kWh Total_Emissions_kg Total_Emissions_Tonnes
        mean=Average_Energy_kWh Average_Emissions_kg Average_Emissions_Tonnes;
run;

proc export data=work.emissions_summary
    outfile="/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./outputs/module_2_carbon_intelligence/gpu_emissions_summary.csv"
    dbms=csv replace;
run;