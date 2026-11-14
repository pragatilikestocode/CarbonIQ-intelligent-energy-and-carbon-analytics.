/* CarbonIQ - Machine Learning Procedure Check */

proc forest data=carbon.national_carbon;
run;

proc gradboost data=carbon.national_carbon;
run;