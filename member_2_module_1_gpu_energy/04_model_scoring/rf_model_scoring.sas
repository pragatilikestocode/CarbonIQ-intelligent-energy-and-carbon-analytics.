
libname gpu "/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics./member_2_module_1_gpu_energy";

proc hp4score data=gpu.FINAL_ML_DATA_READY;
    score file="/export/viya/homes/narayani.rajebhosale24@vit.edu/rf_model_raw_200.bin"
          out=gpu.ENERGY_PREDICTIONS;
run;

proc contents data=gpu.ENERGY_PREDICTIONS;
run;

proc print data=gpu.ENERGY_PREDICTIONS(obs=10);
run;