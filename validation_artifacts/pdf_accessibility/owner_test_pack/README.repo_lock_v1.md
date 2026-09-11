# Owner PDF reader / assistive-technology test pack

Status: **PENDING**. These files are experimental, not approved learner handouts. Seven candidate PDFs are included; `UNREMEDIATED-MICRO-49.pdf` is the unchanged table baseline because its candidate was rejected. The pack demonstrates every structural pattern selected for this pilot; it is not proof that all library patterns have been exhaustively covered.

Record tester, date, operating system, actual screen-reader name/version, PDF-reader name/version, settings, filename and SHA-256. An intended combination is NVDA with Adobe Acrobat Reader; substitute the owner's actual supported combination and record it. No combination was operated during this run. Browser text extraction, tag inspection and generated transcripts are not screen-reader testing.

1. Open each file in the recorded PDF reader. Confirm the document title and language are exposed. Read continuously from the start. Confirm title, review code, timing, stated outcome, difficulty, warnings, examples, checks and closing instruction are available once.
2. Use the screen reader's heading commands/list. Check a coherent H1 then H2 sequence; MACRO-42 also has the H3 formula-card heading. Move between headings and resume reading without losing paragraphs or repeating icons.
3. Navigate recognition lists item by item. Confirm list item count and boundaries. Decorative section icons must not announce stray plus, question-mark or exclamation characters.
4. Read the worked examples with figures. Axis labels must not interleave with adjacent prose. In MICRO-04 verify C=(30,12), B=(60,8), A=(90,4), then read both percentage fractions and the B-to-A self-check. Confirm no additional answer was supplied by the description.
5. For MACRO-23 and MACRO-24, confirm money supply 2,500 to 5,000, points a and b, value of money 2 to 1, and the distinction between velocity V and one divided by P. Confirm the equations, grouping, fraction signs and 100% increase are understandable. Inline Formula tagging is still pending: record failures rather than assuming correct pronunciation from raw characters.
6. For MACRO-29 verify left-to-right panel relationships: MS1 to MS2 contracts money, r1 to r2 rises; AD1 to AD2 shifts left, Y1 to Y2 falls at P1. Variable/subscript pronunciation must be unambiguous.
7. For MICRO-54 verify the units in millions, the $6 gap and the 160/$15 versus 240/$12 intersections. Do not approve this candidate until its font embedding and contrast issues are fixed.
8. For MACRO-42 read all five formula-card alternatives and the worked arithmetic, including negative public saving. Verify each expression is announced once and signs/grouping remain correct. Inline prose mathematics and font/contrast fixes remain outstanding.
9. MICRO-49 is an expected failure at this stage. After a proper table candidate exists, navigate rows/columns with table commands; require announced X/Y column headers and A/B row headers, payoff order and all four cells. Do not mark table navigation PASS for the supplied baseline image.
10. Try keyboard traversal. No real links exist in these pilot PDFs; the printed return instruction must not become a guessed link. Record no-focusable-content as N/A. If a future sheet has links, verify meaningful labels, retained targets and tab order separately.
11. Test 200% and 400% zoom and the reader's available reflow mode. Check clipping, legibility, raster graph labels, color-independent interpretation, and text contrast. Record settings and observed limitations.

For each check record PASS, FAIL or NOT TESTED, observations and reproduction steps. Human results remain PENDING until a real tester supplies evidence. Passing this sample does not certify every PDF or every reader combination.
