
/* CARBONIQ - SAVE MEMBER 2 RANDOM FOREST MODEL */

%let project=/export/viya/homes/narayani.rajebhosale24@vit.edu/CarbonIQ-intelligent-energy-and-carbon-analytics.;

libname gpu "&project./member_2_module_1_gpu_energy";

proc hpforest
    data=gpu.ML_MODEL_READY
    (where=(upcase(data_split)='TRAIN'))
    maxtrees=200
    maxdepth=20
    leafsize=1
    seed=12345;

    target target_energy / level=interval;

    input cpus_req
          requested_gpu_count
          mem_req_kb_imp
          priority
          clean_timelimit_imp
          / level=interval;

    input memory_missing_flag
          timelimit_unspecified
          job_type
          partition
          / level=nominal;

    id id_job;

    save file=
"/export/viya/homes/narayani.rajebhosale24@vit.edu/rf_model_raw_200.bin";

run;
