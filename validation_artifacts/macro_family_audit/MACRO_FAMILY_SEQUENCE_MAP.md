# Macro Family Sequence Map

This is a dependency map, not a mandatory textbook order. Multiple entry points are valid; arrows identify high-value Bridge directions.

```mermaid
flowchart LR
  GDP["GDP Measurement"] --> GDPC["GDP Components"] --> RNGDP["Real vs Nominal GDP"] --> GDPL["Limits of GDP"]
  CPI["CPI and Inflation"] --> DEF["CPI vs GDP Deflator"]
  CPI --> BIAS["CPI Bias"] --> IDX["Indexing and Real Values"] --> RIR["Real vs Nominal Interest Rates"]
  PROD["Productivity Measurement"] --> SRC["Sources of Productivity"] --> GROW["Living Standards and Growth"] --> GPOL["Growth Policy"]
  UM["Unemployment Measurement"] --> UT["Types"] --> NRU["Natural Rate"] --> LMI["Labor Institutions"]
  MONEY["Money Functions and Measures"] --> BANK["Bank Money Creation"] --> FED["Central Bank / Fed"] --> TOOLS["Monetary Policy Tools"] --> LIMITS["Limits of Monetary Control"]
  TOOLS --> MM["Money Market"] --> TRANS["Policy Transmission"] --> AD["Aggregate Demand"]
  QTM["Quantity Theory"] --> NEUT["Monetary Neutrality"] --> FISH["Fisher Effect"] --> COST["Inflation Costs / Tax / Deflation"]
  AD --> EQ["Macro Equilibrium and Shocks"]
  AS["Aggregate Supply"] --> EQ --> LR["Long-Run Adjustment"]
  FP["Fiscal Policy and AD"] --> MULT["Multipliers and Crowding Out"] --> STAB["Stabilization Policy"] --> EQ
  SRPC["Short-Run Phillips Curve"] --> EXP["Expectations"] --> LRPC["Long-Run Phillips Curve"] --> SAC["Sacrifice Ratio"] --> DIS["Disinflation and Policy"]
  EQ --> INT["Integrated Macro Analysis"]
  TRANS --> INT
  STAB --> INT
  DIS --> INT
```

## Cross-family joins

- Real/nominal GDP and CPI/deflator jointly support real-value interpretation.
- Real interest links Inflation Measurement to Fisher and money-market transmission.
- Unemployment/natural rate links Labor to Phillips curves and long-run adjustment.
- Monetary tools link Fed Operations to Money Market/Transmission.
- AD-AS links monetary and fiscal policy to equilibrium, shocks, and Phillips outcomes.
- Integrated Macro Analysis should sit after at least two of AD-AS, transmission, fiscal stabilization, or Phillips/disinflation are active.

Future Bridge questions should name or metadata-tag both source and destination skill, make the connection itself the task, and route back to a synthesis retest.
