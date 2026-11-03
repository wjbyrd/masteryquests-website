from pathlib import Path
HERE=Path(__file__).resolve().parent;OLD=HERE.parent/'hard_editorial_20261102';ROOT=HERE.parents[1]
for name in ['validate.cjs','verify-browser.cjs','verify-exports.py','verify-workbook-scope.py','preserve-sheet-visibility.py','verify-delivery.py']:
    s=(OLD/name).read_text(encoding='utf8').replace('Hard','Medium').replace('hard','medium')
    if name=='validate.cjs':
        s=s.replace('2159','1586')
        s=s.replace("const screen=require('./screening.json')", "const seed=require('./baseline/personal-review-list-data.json').reviewSeed;for(const item of inventory.items)assert.equal(seed[item.id].status,'unknown');assert.equal([...now.values()].filter(q=>q.canonicalDifficulty==='medium').length,3117);\nconst screen=require('./screening.json')")
    if name=='verify-browser.cjs':
        s=s.replace('P62C-CPS-H-001','P62G-MON-M-002').replace('P62G-MON-H-002','P62H-MCMP-M-031').replace('P52A-OPPC-B3-001','42146')
        s=s.replace("await page.locator('#reviewLegendaryRevisions').click();", "await page.locator('#reviewHardRevisions').click();assert.equal(await page.locator('#difficulty').inputValue(),'hard');assert.equal(await page.locator('#status').inputValue(),'hardPending');await page.locator('#reviewLegendaryRevisions').click();")
    if name=='verify-exports.py':
        start=s.index('samples = {');end=s.index('\nresult =',start)
        s=s[:start]+"samples = {'general':['P52A-OPPC-M-003','P52A-MARG-M-003'], 'micro':['P62G-MON-M-002','P62H-MCMP-L-041','P62F-PC-M-003','P62I-OLI-B2-032'], 'macro':['LG-Q-3007','P52B-S3-MFM-B2-001','P52A-FISCAD-B2-001']}\n"+s[end:]
    if name=='verify-delivery.py':s=s.replace("'mediumPoolScreened':2159,'topics':92", "'mediumPoolScreened':1586,'topics':66")
    s=s.replace('medium-20261102-','medium-editorial-20261102-')
    (HERE/name).write_text(s,encoding='utf8')
test=ROOT/'build/faculty-build-composer/tests'
adapter=(test/'hard-editorial-revisions.js').read_text(encoding='utf8').replace(" current=require('./medium-editorial-revisions.js').beforeMediumEditorial(current);\n",'').replace('Hard','Medium').replace('hard','medium')
(test/'medium-editorial-revisions.js').write_text(adapter,encoding='utf8')
s=(test/'hard-editorial-revisions.js').read_text(encoding='utf8');line=" current=require('./medium-editorial-revisions.js').beforeMediumEditorial(current);"
if line not in s:s=s.replace('function beforeHardEditorial(current){','function beforeHardEditorial(current){\n'+line)
(test/'hard-editorial-revisions.js').write_text(s,encoding='utf8')
s=(test/'faculty-validation-revisions.js').read_text(encoding='utf8');line="module.exports=require('./medium-editorial-revisions.js').wrap(module.exports);"
if line not in s:s+='\n'+line+'\n'
(test/'faculty-validation-revisions.js').write_text(s,encoding='utf8')
print('Prepared Medium checks and regression adapters.')
