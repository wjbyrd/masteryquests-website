 await check('Classroom hub: four private links, disclosure, desktop/mobile without overflow',async()=>{
  const context=await browser.newContext();const page=await context.newPage();await page.goto(origin+'/play/managerial-directorate-classroom/');
  for(const width of [1440,390]){await page.setViewportSize({width,height:844});await noOverflow(page);assert.equal(await page.locator('nav a').count(),4);await page.locator('summary').click();assert.ok((await page.locator('body').innerText()).includes('It does not collect your name'));await shot(page,'hub-'+width);await page.locator('summary').click();}
  assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow,noarchive');
  for(const href of await page.locator('nav a').evaluateAll(nodes=>nodes.map(n=>n.href)))assert.ok(href.startsWith(origin+'/play/managerial-directorate-classroom/'));
  await context.close();
 });
 await check('POC remains diagnostic and synthetic; classroom and POC storage stay separate',async()=>{
  const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());const page=await context.newPage();
  await page.goto(origin+'/play/managerial-directorate-telemetry-poc/cost-directive/?telemetryDebug=1&telemetrySynthetic=1');
  assert.equal(await page.locator('#anonymousTelemetryDebug').count(),1);await page.evaluate(()=>{localStorage.setItem('classroom-isolation-sentinel','poc');startNewRun();});
  await page.waitForFunction(()=>AnonymousTelemetryPOC.getRunId());await page.evaluate(()=>AnonymousTelemetryPOC.flush());await page.waitForTimeout(100);
  const pocEvents=[...harness.received.values()].filter(e=>e.buildId==='managerial-directorate-telemetry-poc');assert.ok(pocEvents.length);assert.ok(pocEvents.every(e=>e.synthetic===true));
  await page.goto(origin+'/play/managerial-directorate-classroom/cost-directive/');assert.equal(await page.evaluate(()=>localStorage.getItem('classroom-isolation-sentinel')),null);assert.equal(await page.evaluate(()=>localStorage.getItem('anonymousTelemetry:clientId:v1')),null);
  await context.close();
 });
 await check('Existing Worker stores classroom synthetic=0; build-scoped CSV includes classroom and excludes synthetic POC',async()=>{
  const classroomRows=harness.db.prepare("SELECT * FROM telemetry_runs WHERE build_id='managerial-directorate-classroom'").all();assert.ok(classroomRows.length>=28);assert.ok(classroomRows.every(r=>r.synthetic===0));
  const normal=await(await harness.call('/v1/admin/export.csv?buildId=managerial-directorate-classroom',{admin:true})).text();const all=await(await harness.call('/v1/admin/export.csv?includeSynthetic=1',{admin:true})).text();
  assert.ok(normal.includes('managerial-directorate-classroom'));assert.ok(!normal.includes('managerial-directorate-telemetry-poc'));assert.ok(all.includes('managerial-directorate-telemetry-poc'));const pocDefault=await(await harness.call('/v1/admin/export.csv?buildId=managerial-directorate-telemetry-poc',{admin:true})).text();assert.ok(!pocDefault.includes('managerial-directorate-telemetry-poc'));assert.ok(all.length>pocDefault.length);
  const events=[...harness.received.values()].filter(e=>e.buildId==='managerial-directorate-classroom');
  const response=await harness.call('/api/anonymous-telemetry-poc/v1/events',{events:events.slice(0,1)});const ack=await response.json();assert.equal(ack.accepted,0);assert.equal(ack.duplicates,1);
  const forbidden=['name','email','studentId','lmsId','schoolId','accountId','ip','fingerprint','freeResponse'];for(const e of events)for(const key of forbidden)assert.ok(!Object.hasOwn(e,key));
  fs.writeFileSync(path.join(out,'worker_evidence.json'),JSON.stringify({classroomRuns:classroomRows.length,classroomEvents:events.length,syntheticValues:[...new Set(classroomRows.map(r=>r.synthetic))],errors:harness.errors,classroomBuildScopedExportIncludesClassroom:true,defaultExportExcludesSyntheticPOC:true},null,2)+'\n');
  assert.deepEqual(harness.errors,[]);
 });
