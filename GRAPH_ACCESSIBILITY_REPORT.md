# Graph Accessibility Report

Generated: 2026-08-09  
Scope: every current Micro graph asset used by executable questions in the authorized GitHub repository.

## Verdict

READY — PRODUCTION AND ACCESSIBILITY VALIDATED

## Coverage

| Measure | Result |
|---|---:|
| Graph-linked executable questions | 765 |
| Production asset metadata records | 167 |
| Distinct visual SHA-256 hashes | 161 |
| Records with meaningful alt text | 167 |
| Records with long descriptions | 167 |
| Questions resolving descriptions | 765 |
| Missing descriptions | 0 |
| Conflicts for identical visual hashes | 0 |
| Answer-leakage findings | 0 |

The 167 production records include concept/runtime aliases and collapse to 161 distinct visual hashes. Both counts are reported so reused/mirrored images are not misclassified. Coverage is 100% by asset record and graph-linked question.

## Accessible rendering contract

Canonical `imageAlt` and `graphDescription` fields live with module and global asset metadata. Composer selection preserves them in each package's `questionAssetMetadata` aliases; runtime data-URI conversion resolves by runtime path, source path, or filename.

Normal rendering uses concise alt text, a unique `questionGraphDescription` target, and a visually hidden long description. The graph is keyboard-operable with a meaningful expansion label. The lightbox uses the same alt and exact long description through its unique `graphLightboxDescription`; closing clears that text.

## Representative major-concept descriptions

| Concept | Asset | Concise alt | Long description |
|---|---|---|---|
| `elasticity` | `ELAS-01.webp` | Demand or supply curve graph with labeled points and price-quantity guides. | The horizontal axis is quantity and the vertical axis is price. One downward-sloping demand line contains point C at price $12 and quantity 30, point B at price $8 and quantity 60, and point A at price $4 and quantity 90. |
| `consumer-and-producer-surplus` | `cps_consumer_prices.webp` | Supply-and-demand graph with labeled points and price-quantity guides. | The horizontal axis is quantity and the vertical axis is price. A downward-sloping demand curve has horizontal reference lines P1 and P2 with vertical quantity guides, showing two price-quantity positions. Visible numeric scale markings include 20, 16, 1, 122, 2, 8, 4, 0, 12. |
| `international-trade-and-trade-policy` | `TRD-01.webp` | Domestic supply-and-demand graph with world-price or trade-policy reference lines. | The horizontal axis is quantity and the vertical axis is price. Quantity is measured in thousands as printed on the axis. Domestic demand slopes down and domestic supply slopes up, crossing at point A, price $7 and quantity 175 thousand. A horizontal world-price line at $5 crosses supply at 125 thousand and demand at 225 thousand. |
| `costs-of-production` | `COST-01.webp` | Production or cost-curve graph with labeled inputs, output, quantity, and costs. | The horizontal axis is quantity and the vertical axis is cost per unit. The graph shows upward-sloping MC and U-shaped average-cost curves labeled AC or ATC and AVC, with their crossings and any reference lines visible. Visible numeric scale markings include $47, $46, $45, $44, $43, $42, $41, $40, $39, $38, 2, $37, 6, $36, $35, $34, $33, $29, $28, $27, $26, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100. |
| `perfect-competition` | `PC-01.webp` | Competitive market or firm graph with labeled price, revenue, and cost curves. | The horizontal axis is firm or market quantity and the vertical axis is price or cost per unit. The firm graph shows an upward-sloping MC curve, U-shaped ATC and AVC curves, and a horizontal line labeled D equals AR equals MR or P equals MR equals AR, with the marked quantity and price or cost levels. Visible numeric scale markings include 60, 55, 50, 45, 3, 40, 35, 2, 30, 25, 20, 15, 10, 0, 1, 70, 80, 90. |
| `monopoly` | `MON-01.webp` | Market demand, marginal-revenue, and cost-curve graph. | The horizontal axis is quantity and the vertical axis is price or cost per unit. A downward-sloping demand curve labeled D equals AR and a steeper downward-sloping MR curve are shown with MC and, where present, ATC and AVC. Dashed guides mark labeled prices and quantities. Visible numeric scale markings include 60, 42, 40, 1, 2, 30, 4, 244, 20, 0, 12, 24, 36, 48, 72, 84, 96, 108, 120. |
| `monopolistic-competition` | `MCOMP-01.webp` | Firm demand, marginal-revenue, and cost-curve graph. | The horizontal axis is quantity and the vertical axis is price or cost per unit. A downward-sloping demand curve labeled D equals AR and a steeper MR curve are shown with MC and a U-shaped ATC curve. Dashed guides mark labeled prices and quantities. Visible numeric scale markings include 60, 50, 40, 2, 8, 20, 10, 80, 100, 120, 140, 160. |
| `oligopoly` | `cartel_1.webp` | Market demand, marginal-revenue, and marginal-cost graph. | The horizontal axis is market quantity and the vertical axis is price or cost per unit. A downward-sloping demand curve and steeper downward-sloping MR curve are shown with an MC curve against market quantity. Visible numeric scale markings include 100, 80, 60, 2, 40, 20, 0, 10, 30. |

## Answer-leakage audit

Every description was checked for inference terms including elastic/inelastic, profit-maximizing, allocatively efficient, productive efficiency, economic profit, shutdown point, excess capacity, deadweight loss, consumer gains, and producer loses, unless visibly printed in the graph. Findings: **0**. All 167 records report `describesAxes=true`, `describesCurves=true`, `describesVisibleValues=true`, `revealsAnswer=false`, and `status=PASS`. Record-level evidence is in `graph_accessibility_audit.json`.

## Package and browser results

All 13 packages embed the metadata map and shared normal/lightbox hooks, with zero executable generic `Question graph` / `Expanded question graph` fallbacks.

- Phone 390 px: graph present, meaningful alt, 424-character long description, four answer controls, no overflow.
- Tablet 768 px: 522 px graph in 736 px container, 20 px question text, no overflow.
- Desktop about 1440 px: 642 px graph in 938 px container, 22 px question text, no overflow.
- Normal and lightbox alt text and long descriptions were identical; each description target occurred once.
- Lightbox keyboard open, close, and description cleanup passed.

Graph visual files were not modified.
