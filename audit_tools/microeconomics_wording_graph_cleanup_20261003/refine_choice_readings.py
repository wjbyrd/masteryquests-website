from common import *
# CHOICE-05 has no point labels. Use clearly separated grid bands, not invented exact coordinates.
paired('42585','On IC2, compare the bundles at X=5 and X=20. Which Y readings and preference comparison are correct?',
 'First Y is between 15 and 20, then below 5; the consumer is indifferent between the bundles.',
 'First Y is between 10 and 15, then between 5 and 10; the consumer is indifferent between the bundles.',
 'First Y is between 15 and 20, then below 5; the bundle with more X must be preferred.',
 'First Y is between 10 and 15, then between 5 and 10; the bundle with more X must be preferred.',
 'IC2 is between Y=15 and 20 at X=5, and below Y=5 at X=20. Points on the same indifference curve have the same preference rank despite their different compositions.',
 'IC2 at X5: Y15–20; at X20: Y<5.','Interpret equal preference rank along an indifference curve.')
paired('42586','At X=10, compare IC1 and IC2. Assuming more of either good is preferred, which readings and explanation show why the curves cannot cross elsewhere?',
 'IC1 has Y below 5 and IC2 between 5 and 10; a crossing would contradict the ranking established by more Y at the same X.',
 'IC1 has Y between 5 and 10 and IC2 between 10 and 15; a crossing would contradict the ranking established by more Y at the same X.',
 'IC1 has Y below 5 and IC2 between 5 and 10; a shared bundle may consistently have two different preference ranks.',
 'IC1 has Y between 5 and 10 and IC2 between 10 and 15; a shared bundle may consistently have two different preference ranks.',
 'At X=10, IC1 is below Y=5 while IC2 is between Y=5 and 10, so the IC2 bundle is preferred. A common point would be indifferent to bundles on both curves. Transitivity would equate ranks that more-is-better distinguishes.',
 'At X10, IC1 Y<5, IC2 Y5–10.','Use monotonicity and transitivity to rule out crossing indifference curves.')
paired('42587','Along IC2, compare the average Y given up per additional X from X=5 to 10 and from X=10 to 20. Which approximate rates and interpretation are supported?',
 'Between 1 and 2 units of Y, then less than half a unit; willingness to give up Y for X diminishes.',
 'More than 2 units of Y, then between half a unit and 1; willingness to give up Y for X diminishes.',
 'Between 1 and 2 units of Y, then less than half a unit; willingness to give up Y for X increases.',
 'More than 2 units of Y, then between half a unit and 1; willingness to give up Y for X increases.',
 'IC2 is near (5,18), (10,9) and (20,4.5). The average tradeoffs are about 9/5=1.8 and 4.5/10=0.45 units of Y per additional X. These equal-utility tradeoffs illustrate diminishing willingness to give up Y as X becomes more abundant.',
 'Approximate IC2 readings (5,18),(10,9),(20,4.5); answers use broad rate bands.','Interpret changing equal-utility tradeoffs as diminishing MRS.','(18-9)/(10-5)≈1.8;(9-4.5)/(20-10)≈.45')
paired('42588','At X=10, compare IC2 and IC3. Which Y readings and interpretation of the curve labels are supported?',
 'IC2 is between Y=5 and 10, and IC3 between 15 and 20; the labels order preferences without measuring utility ratios.',
 'IC2 is between Y=10 and 15, and IC3 between 20 and 25; the labels order preferences without measuring utility ratios.',
 'IC2 is between Y=5 and 10, and IC3 between 15 and 20; the label 3 means three-halves as much utility as label 2.',
 'IC2 is between Y=10 and 15, and IC3 between 20 and 25; the label 3 means three-halves as much utility as label 2.',
 'At X=10, IC2 is near Y=9 and IC3 near Y=18. IC3 is preferred under more-is-better preferences. The numbers in the curve names identify ordinal ranks; their ratios and differences do not measure amounts of utility.',
 'At X10 IC2 Y5–10, IC3 Y15–20.','Distinguish ordinal preference rankings from cardinal utility comparisons.')
save()
