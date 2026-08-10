from playwright.sync_api import sync_playwright
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import json,time
root=Path('/mnt/data/phase_M4_work/validation_artifacts/macro_m4_final_release')
files=['macroNormal.html','macroWithSupplement.html','fullMacroArea.html']
Handler=partial(SimpleHTTPRequestHandler,directory=str(root))
server=ThreadingHTTPServer(('127.0.0.1',0),Handler);port=server.server_address[1]
thread=Thread(target=server.serve_forever,daemon=True);thread.start()
results={}
try:
 with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/lib/chromium/chromium', args=['--no-sandbox','--disable-dev-shm-usage','--disable-gpu'])
    for name in files:
        page=browser.new_page(viewport={'width':1440,'height':1000})
        logs=[]; page_errors=[]
        page.on('console', lambda msg, logs=logs: logs.append({'type':msg.type,'text':msg.text}))
        page.on('pageerror', lambda exc, errs=page_errors: errs.append(str(exc)))
        t=time.time(); status='PASS'; error=None
        try:
            resp=page.goto(f'http://127.0.0.1:{port}/{name}', wait_until='domcontentloaded', timeout=60000)
            page.wait_for_timeout(1200)
            if not resp or not resp.ok:
                raise RuntimeError(f'HTTP response {resp.status if resp else None}')
            start_visible=page.locator('#startScreen').count()>0
            mode_screen=page.locator('#modeSelectScreen').count()>0
            if page.locator('button.start-btn').count():
                page.locator('button.start-btn').first.click(timeout=5000)
                page.wait_for_timeout(250)
            modes=[x.inner_text().strip() for x in page.locator('.mode-card-title').all()]
            required=['Standard Campaign','Timed Trial','Exam Drill','Legendary Mode','Score Attack']
            if not start_visible or not mode_screen or any(x not in modes for x in required):
                status='FAIL'; error=f'UI missing start={start_visible} modeScreen={mode_screen} modes={modes}'
        except Exception as e:
            status='FAIL'; error=str(e)
        severe=[x for x in logs if x['type'] in ('error','warning') and 'favicon' not in x['text'].lower()]
        if page_errors or severe:
            status='FAIL'
            if not error: error='console/page errors present'
        results[name]={'status':status,'elapsedSeconds':round(time.time()-t,2),'error':error,'consoleWarningsErrors':severe,'pageErrors':page_errors,'consoleCount':len(logs)}
        page.close()
    browser.close()
finally:
 server.shutdown();server.server_close()
(root/'browser_results.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
