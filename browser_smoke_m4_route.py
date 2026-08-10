from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time
root=Path('/mnt/data/phase_M4_work/validation_artifacts/macro_m4_final_release'); files=['macroNormal.html','macroWithSupplement.html','fullMacroArea.html'];results={}
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/lib/chromium/chromium',args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
 for name in files:
  page=b.new_page(viewport={'width':1440,'height':1000});logs=[];errs=[];page.on('console',lambda m,logs=logs:logs.append({'type':m.type,'text':m.text}));page.on('pageerror',lambda e,errs=errs:errs.append(str(e)))
  html=(root/name).read_text();page.route('https://m4.test/**',lambda route,html=html:route.fulfill(status=200,content_type='text/html',body=html))
  t=time.time();status='PASS';error=None
  try:
   page.goto(f'https://m4.test/{name}',wait_until='domcontentloaded',timeout=60000);page.wait_for_timeout(1000)
   start=page.locator('#startScreen').count()>0;modes=[x.inner_text().strip() for x in page.locator('.mode-card-title').all()];req=['Standard Campaign','Timed Trial','Exam Drill','Legendary Mode','Score Attack']
   if page.locator('button.start-btn').count():page.locator('button.start-btn').first.click(timeout=5000);page.wait_for_timeout(250)
   if not start or any(x not in modes for x in req):status='FAIL';error=f'UI missing start={start} modes={modes}'
  except Exception as e:status='FAIL';error=str(e)
  severe=[x for x in logs if x['type'] in ('warning','error')]
  if severe or errs:status='FAIL';error=error or 'console/page errors present'
  results[name]={'status':status,'elapsedSeconds':round(time.time()-t,2),'error':error,'consoleWarningsErrors':severe,'pageErrors':errs,'consoleCount':len(logs)};page.close()
 b.close()
(root/'browser_results.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(results,indent=2))
