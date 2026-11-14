
/* CARBONIQ - GPU ENERGY TARGET INSPECTION */

proc means data=gpu.ML_MODEL_READY
    n mean median std min p25 p75 max maxdec=4;

    var target_energy;
run;

proc contents data=gpu.ML_MODEL_READY;
run;
