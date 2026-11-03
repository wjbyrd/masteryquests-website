from pathlib import Path
HERE=Path(__file__).resolve().parent;OLD=HERE.parent/'medium_complete_review_20261103'
s=(OLD/'verify-exports.py').read_text(encoding='utf8')
start=s.index('samples = ');end=s.index('\n\nresult =',start)
s=s[:start]+"samples = {'general':['P52A-SCAR-B2-002'], 'micro':['42363','42833','ECON-MG-HARD-274'], 'macro':['ECON-SP-MEDIUM-146','LG-Q-9057','ECON-EC-MEDIUMBOSS-18010']}"+s[end:]
s=s.replace("assert row['Difficulty'].lower() == 'medium'", "assert row['Difficulty'].lower() == ('' if q['canonicalDifficulty']=='unknown' else q['canonicalDifficulty'])")
(HERE/'verify-exports.py').write_text(s,encoding='utf8')
s=(OLD/'verify-workbook-scope.py').read_text(encoding='utf8').replace('(revised and 7 <= a.column <= 13)','(revised and (a.column in [4,6] or 7 <= a.column <= 13))')
(HERE/'verify-workbook-scope.py').write_text(s,encoding='utf8')
(HERE/'preserve-sheet-visibility.py').write_text((OLD/'preserve-sheet-visibility.py').read_text(encoding='utf8'),encoding='utf8')
s=(OLD/'preview-macro.mjs').read_text(encoding='utf8').replace('ECON-EC-MEDIUMBOSS-18010','ECON-SP-MEDIUM-146')
(HERE/'preview-macro.mjs').write_text(s,encoding='utf8')
print('Prepared export content, workbook scope, and formatting checks.')
