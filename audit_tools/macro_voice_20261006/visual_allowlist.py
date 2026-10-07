import json
from pathlib import Path
H=Path(__file__).resolve().parent
records={r['id']:r for r in json.loads((H/'records.json').read_text(encoding='utf-8'))}
patches=json.loads((H/'patches.json').read_text(encoding='utf-8'))
reasons={}
def group(ids,reason):
 for id in ids.split():reasons[id]=reason
group('PMOE-NCO-L-006 PMOE-NCO-B3-001 43082 43089 ECON-NL-LEGENDARY-9000 ECON-NL-HARD-201 PMOE-TX-L-004 PMOE-TX-L-006 PMOE-TX-B3-001 ECON-NL-MEDIUMBOSS-3002 P52B-S2-LSG-B1-002 ECON-EC-MEDIUMBOSS-18006 P52A-MARG-EL-003 PMOE-POL-L-003 P62C-CPS-B3-008 P62E-COP-L-028 42790','Figure/figures means the numerical values supplied in the stem, not an attached illustration.')
group('ECON-SP-READ-AD-AS-EQUILIBRIUM-5086','Conceptual definition of the AD–SRAS intersection; no plotted coordinates are requested.')
group('ECON-SP-IDENTIFY-NATURAL-OUTPUT-5076','Conceptual identification of natural output as potential output, independent of a particular drawing.')
group('ECON-SP-READ-AD-AS-AXES-5085','Asks which variable belongs on the standard AD–AS vertical axis, not for an observed axis label.')
group('P52A-AD-EL-002 P52A-AS-EL-001','Asks how the stated economic shocks would be represented by shifts or movements; does not ask the student to inspect a supplied plot.')
group('PM2A-LRPC-EB-012 PM2A-LRPC-FB-017','Conceptual contrast between a shift of LRPC and movement along it; the entire scenario is stated in words.')
group('ECON-SP-NATURAL-RATE-HYPOTHESIS-5052','Conceptual direction of movement along any downward-sloping SRPC, without specific points to inspect.')
group('P62C-CPS-E-021 P62C-CPS-E-022','Asks for the conceptual region defining surplus on a standard graph, not a numerical area on an attached image.')
group('PMS-CPS-BR-010','The text supplies both surplus values; the described market graph adds no information needed to sum them.')
group('P62E-COP-EL-012','Asks why the standard cost curves have the stated intersection order; it supplies that order in words.')
group('P62E-COP-B1-017','Answer alternatives name types of curves; asks which economic graph relates labor to total output, not which attached picture is correct.')
group('P62B-ELAS-L-046','Conceptual warning about comparing slopes measured in different units; no particular plotted values are required.')
group('ECON-EC-EASYBOSS-17009','Discusses why economists use simplified models; the diagram is a conceptual example described in the stem.')
group('P62G-MON-R-007','Asks for the conceptual steps in solving a monopoly graph; no specific graph coordinates are requested.')
group('P62F-PC-R-004','The text gives the entire D=AR=MR label and horizontal-line description needed to identify the economic relationship.')
result={id:{'reason':reason,'allowedStems':list(dict.fromkeys([records[id]['q']['q'],patches.get(id,{}).get('q',records[id]['q']['q'])]))} for id,reason in reasons.items()}
(H/'visual-allowlist.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
