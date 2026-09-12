# Canonical template pilot audit — NOT a release approval

## Canonical Reference
GEN-ECON-01: `3901424bba74d606a1ead9e6d271e110fdfbd4e13015cb99e0e97b400892f2e0`. Resolved from the accepted v3 candidate manifest and matched to its staged source by SHA-256. Its maintained path is retained reviewed authoring input, then deterministic source-aware tagging; no full native GEN-ECON-01 renderer was found.

## Extracted Visual Tokens
Coordinates are PDF points from the bottom-left; RGB values are the actual PDF operands. The specification also retains original Bezier paths, icon bounds, source image fingerprints and font maps.

| Component | Extracted values |
|---|---|
| Page | 612 x 792 |
| Header | x=15.84, y=695.52, w=580.32, h=82.08; rounded upper corners, square lower corners; RGB (0.031, 0.157, 0.373) |
| Logo card | (37.44, 709.20) to (92.16, 763.92); original retained logo |
| Domain title | Arimo Bold 27; baseline 727.1973; x=105.12 |
| Resource card | (449.961, 717.159) to (574.56, 755.96); stroke 1.5; RGB (0.094, 0.816, 0.780); radius 9 |
| Metadata strip | x=29.52, y=642.24, w=552.96, h=45.36; white fill; stroke 0.75; radius 10 |
| Metadata dividers | x=167.82 and 397.47; y=642.99 through 686.85 |
| Time | Retained hourglass; bold 10.3995-point label at x=64.47, baseline 660.0951 |
| Outcome | Retained target; bold 8.55-point label; x=202.02; 10-point leading |
| Difficulty | Bold 9.89925-point label; dots centered (465,663.6), (473.2,663.6), (481.4,663.6), radius 3.05; value 9.55 points |
| Title | Arimo Bold 32; centered; baseline 599.3574; long-title exceptions explicit |
| Icon rail | Center x=50.76; original role-specific artwork; height 38.16; original aspect ratios retained |
| Main sections | Text x=80.44365; Arimo Bold 16.2; teal rule width=503.28, thickness=0.9 |
| Watch / Worked / Check cards | x=79.92, width=503.28; radius 8; stroke=1.05; body inset x~91.77 |
| Card fills and borders | Watch/Check fill RGB (0.918,0.973,0.973), border (0.071,0.686,0.663); Worked white/navy |
| Card headings | Arimo Bold 16; Watch/Check RGB (0.027451,0.560784,0.564706) |
| Body | Arimo Regular 10.45; canonical leading 13.376; measured worked-text variants retained in typography inventory |
| Footer | x=16,y=15,w=580,h=41; radius 8; RGB (0.043137,0.180392,0.403922) |
| Footer contents | White arrow-circle centered (92,35.5), radius 9.5, stroke 1.4; READY? teal 16-point Bold at (109,28.5); return text white 11.5-point Bold at (207,30.3) |
| Rhythm | Measured header/metadata/title positions; 24-point canonical card gaps; content-driven compact exceptions recorded, never silently accepted |

Machine specification: `audit_tools/pdf_accessibility/canonical_components/specification.json`. Extraction: `audit_tools/pdf_accessibility/canonical_extract.py`. The retained font outlines are unchanged. Unicode cmap normalization supports table painting without substituting Vera. Additional curly-quote glyphs come from existing reviewed same-family Arimo subsets, with provenance in the specification.

## Pilot Comparison
| Resource | Result |
|---|---|
| GEN-ECON-01 | Accepted canonical control, unchanged |
| MICRO-49 | Accepted unique-Nash/payoff-table control, unchanged |
| MACRO-11 | Experimental: PDF/UA-1 and semantics pass; not promoted |
| MACRO-13 | Experimental: PDF/UA-1 and semantics pass; not promoted |
| MACRO-16 | BLOCKED: Canonical readable layout does not fit MACRO-16: 519.665 |
| MACRO-20 | BLOCKED: Canonical readable layout does not fit MACRO-20: 526.0699999999999 |
| MICRO-52 | BLOCKED: Canonical readable layout does not fit MICRO-52: 500.895 |
| GEN-ECON-09 | Experimental: PDF/UA-1 and semantics pass; not promoted |

Equal-scale comparisons are in `comparisons/`; see `comparisons.json` for file hashes and labels. For blocked resources these show the existing v3 PDF, explicitly labeled CURRENT V3 ONLY, not a restored candidate.

## Renderer Architecture
The proposed shared implementation is `audit_tools/pdf_accessibility/canonical_components/pilot_renderer.py`. It uses the same extracted component specification for General Economics and Macro pilot sheets; domain label and resource code are data. It is isolated pending pilot acceptance. The accepted v3 renderer, `qa_template.py`, was restored byte-for-byte to its preflight version and remains the operational renderer. No claim is made that all domains have switched to the canonical system yet.

## Exceptions
GEN-ECON-09 uses a measured 9.55-point body, a reduced long-title size and compact gaps. MACRO-13 has compact gaps. These are recorded experimental exceptions, not blanket approval for other sheets. MACRO-16, MACRO-20 and MICRO-52 exceed the current prototype's readable height budget. The side-by-side graph approach also makes labels too small; a readable graph interior must be implemented before adoption. MICRO-52 additionally needs its long-title composition fully validated.

## Human Review
PENDING. Three experimental pages were visually inspected by Codex. No owner or human AT approval occurred. The full pilot is BLOCKED and batching is prohibited.
