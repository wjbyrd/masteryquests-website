import { qrcodegen } from './vendor/qrcodegen.js';

const $ = id => document.getElementById(id);
let instructorToken = '', activeSession = null;
const message = text => { $('message').textContent = text; };
async function api(action, body = {}) {
  const response = await fetch('/api/econnections-classroom/instructor/' + action, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + instructorToken },
    body: JSON.stringify(body), credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', redirect: 'error', signal: AbortSignal.timeout(8000),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401) { instructorToken = ''; $('console').hidden = true; $('access').hidden = false; $('heading').textContent = 'Instructor access'; }
    throw Object.assign(new Error(response.status === 401 ? 'Instructor access was not accepted. Enter the current classroom token.' : result.error || 'Classroom request failed.'), { status: response.status });
  }
  return result;
}
function showQR(url) {
  const qr = qrcodegen.QrCode.encodeText(url, qrcodegen.QrCode.Ecc.MEDIUM), border = 4, size = qr.size + border * 2;
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'QR code for the permanent student classroom link');
  svg.setAttribute('shape-rendering', 'crispEdges');
  const background = document.createElementNS(ns, 'rect'); background.setAttribute('width', size); background.setAttribute('height', size); background.setAttribute('fill', '#fff');
  let d = '';
  for (let y = 0; y < qr.size; y++) for (let x = 0; x < qr.size; x++) if (qr.getModule(x, y)) d += `M${x + border},${y + border}h1v1h-1z`;
  const pixels = document.createElementNS(ns, 'path'); pixels.setAttribute('d', d); pixels.setAttribute('fill', '#000');
  svg.append(background, pixels); $('qr').replaceChildren(svg);
}
function render(data, defaults = false) {
  const c = data.classroom;
  $('heading').textContent = c.courseLabel;
  $('classroom-label').textContent = c.sectionLabel + ' · ' + c.timeZone;
  const url = new URL(data.studentPath, location.origin).href;
  $('student-url').href = url; $('student-url').textContent = url; showQR(url);
  $('access').hidden = true; $('console').hidden = false;
  activeSession = data.activeSession;
  $('active').hidden = !activeSession; $('activate').hidden = !!activeSession;
  if (defaults) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: c.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(data.serverTimestamp)).map(p => [p.type, p.value]));
    $('date').value = `${parts.year}-${parts.month}-${parts.day}`;
    $('timezone').value = c.timeZone; $('window').value = c.defaultStudentWindowStart; $('walkthrough').value = c.defaultWalkthroughStart; $('close').value = c.defaultSessionClose;
  }
  if (activeSession) {
    const s = activeSession, format = new Intl.DateTimeFormat(undefined, { timeZone: s.timeZone, dateStyle: 'medium', timeStyle: 'short' });
    $('active-status').textContent = s.status === 'upcoming' ? 'SESSION READY · OPENS SOON' : 'SESSION ACTIVE';
    $('active-puzzle').textContent = s.puzzleID.endsWith(':micro') ? 'Micro' : 'Macro';
    $('active-details').replaceChildren();
    for (const [label, value] of [['Open', format.format(new Date(s.studentWindowStart))], ['Walkthrough', format.format(new Date(s.walkthroughStart))], ['Close', format.format(new Date(s.sessionClose))], ['Timezone', s.timeZone]]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; $('active-details').append(dt, dd);
    }
  }
}
async function action(button, work) {
  button.disabled = true; message('');
  try { await work(); }
  catch (error) { message(error.status ? error.message : 'The request could not be confirmed. Refresh status before trying again.'); }
  finally { button.disabled = false; }
}
$('access').addEventListener('submit', event => {
  event.preventDefault(); instructorToken = $('instructor-token').value.trim(); $('instructor-token').value = '';
  void action(event.submitter, async () => { render(await api('open'), true); message('Classroom opened. The student QR stays the same for every session.'); });
});
$('activate').addEventListener('submit', event => {
  event.preventDefault();
  void action(event.submitter, async () => {
    try { render(await api('activate', Object.fromEntries(new FormData($('activate'))))); message('Session activated. Students use the same classroom QR.'); }
    catch (error) { if (error.status === 409) render(await api('open')); throw error; }
  });
});
$('refresh').addEventListener('click', event => { void action(event.currentTarget, async () => { render(await api('open')); message('Session status refreshed.'); }); });
$('end').addEventListener('click', event => { void action(event.currentTarget, async () => { render(await api('close', { sessionID: activeSession.sessionID })); message('Session ended. You may activate another session with this same QR.'); }); });
$('logout').addEventListener('click', () => { instructorToken = ''; location.reload(); });
window.addEventListener('pagehide', () => { instructorToken = ''; });
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('student-url').href); message('Student link copied.'); }
  catch { message('Copy the student link shown below the QR.'); $('student-url').focus(); }
});
