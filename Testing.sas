
/* ==========================================
   GITHUB CONNECTION TEST - SAS
   ========================================== */

/* STEP 1: Create a sample dataset */

data github_test;
    input Student_ID Name $ Marks Department $;
    datalines;
101 Pragati 95 IT
102 Rahul 88 CSE
103 Ananya 92 ENTC
104 Rohan 76 IT
105 Sneha 89 CSE
;
run;

/* STEP 2: Display the dataset */

proc print data=github_test;
    title "GitHub Connection Test Dataset";
run;

/* STEP 3: Check dataset information */

proc contents data=github_test;
run;

/* STEP 4: Export dataset as CSV */

proc export data=github_test
    outfile="github_test.csv"
    dbms=csv
    replace;
run;

/* STEP 5: Save SAS source code */

filename sascode "github_test.sas";

data _null_;
    file sascode;
    put "data github_test;";
    put "input Student_ID Name $ Marks Department $;";
    put "datalines;";
    put "101 Pragati 95 IT";
    put "102 Rahul 88 CSE";
    put "103 Ananya 92 ENTC";
    put "104 Rohan 76 IT";
    put "105 Sneha 89 CSE";
    put ";";
    put "run;";
run;

filename sascode clear;

/* STEP 6: Confirmation */

%put ======================================;
%put SAS DATASET CREATED SUCCESSFULLY;
%put CSV AND SAS FILE GENERATED;
%put ======================================;
