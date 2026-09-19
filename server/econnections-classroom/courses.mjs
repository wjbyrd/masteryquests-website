import { SESSION_FIELDS, TOKEN, exactKeys, requireValue, validateSession } from '../../games/econnections/classroom-contract.js';
import { createPuzzle } from '../../games/econnections/engine.js';
import { zonedInstant } from './timing.mjs';

export const COURSE_FIELDS = ['courseLabel', 'sectionLabel', 'timeZone', 'defaultStudentWindowStart', 'defaultWalkthroughStart', 'defaultSessionClose'];
export const ACTIVATION_FIELDS = ['sessionDate', 'domain', 'timeZone', 'studentWindowStart', 'walkthroughStart', 'sessionClose'];
export const randomToken = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
export const studentPath = course => '/games/econnections/?classroom=' + course.studentToken;
export const sessionMetadata = row => Object.fromEntries(SESSION_FIELDS.map(key => [key, row[key]]));
const error = (status, code) => { throw Object.assign(new Error('Classroom request rejected'), { status, code }); };
const wallTime = value => requireValue(typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value));

export function validateCourse(input) {
  exactKeys(input, COURSE_FIELDS);
  for (const key of ['courseLabel', 'sectionLabel']) requireValue(typeof input[key] === 'string' && input[key].length > 0 && input[key].length <= 100 && !/[\x00-\x1f]/.test(input[key]));
  requireValue(typeof input.timeZone === 'string' && input.timeZone.includes('/') && input.timeZone.length < 80);
  new Intl.DateTimeFormat('en', { timeZone: input.timeZone });
  for (const key of COURSE_FIELDS.slice(3)) wallTime(input[key]);
  requireValue(input.defaultStudentWindowStart <= input.defaultWalkthroughStart && input.defaultWalkthroughStart < input.defaultSessionClose);
  return input;
}
export async function currentSession(db, course, receipt) {
  return db.prepare("SELECT * FROM classroom_sessions WHERE classroomID=? AND status != 'closed' AND sessionClose > ?").bind(course.classroomID, receipt).first();
}
export async function instructorView(db, course, receipt) {
  const active = await currentSession(db, course, receipt);
  return { classroom: { classroomID: course.classroomID, ...Object.fromEntries(COURSE_FIELDS.map(key => [key, course[key]])) },
    studentPath: studentPath(course), serverTimestamp: receipt,
    activeSession: active ? { ...sessionMetadata(active), status: receipt < active.studentWindowStart ? 'upcoming' : 'open' } : null };
}
export async function provisionCourse(db, input, receipt, digest) {
  try { validateCourse(input); } catch { error(400); }
  const instructorToken = randomToken(), course = { classroomID: crypto.randomUUID(), ...input, studentToken: randomToken(), status: 'active', createdAt: receipt };
  await db.prepare(`INSERT INTO classroom_courses(classroomID, ${COURSE_FIELDS.join(',')}, instructorHash, studentToken, status, createdAt) VALUES(${Array(11).fill('?').join(',')})`)
    .bind(course.classroomID, ...COURSE_FIELDS.map(key => course[key]), await digest(instructorToken), course.studentToken, course.status, receipt).run();
  return { ...(await instructorView(db, course, receipt)), instructorToken };
}
export async function instructorCourse(db, request, digest) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  if (!TOKEN.test(token)) error(401);
  const course = await db.prepare("SELECT * FROM classroom_courses WHERE instructorHash=? AND status='active'").bind(await digest(token)).first();
  if (!course) error(401);
  return course;
}
export async function activate(db, course, input, receipt) {
  let session;
  try {
    exactKeys(input, ACTIVATION_FIELDS);
    for (const key of ['studentWindowStart', 'walkthroughStart', 'sessionClose']) wallTime(input[key]);
    const puzzle = createPuzzle(input.domain, input.sessionDate);
    session = validateSession({ sessionID: crypto.randomUUID(), courseLabel: course.courseLabel, sectionLabel: course.sectionLabel,
      sessionDate: input.sessionDate, timeZone: input.timeZone,
      scheduledClassTime: zonedInstant(input.sessionDate + 'T' + input.walkthroughStart, input.timeZone),
      studentWindowStart: zonedInstant(input.sessionDate + 'T' + input.studentWindowStart, input.timeZone),
      walkthroughStart: zonedInstant(input.sessionDate + 'T' + input.walkthroughStart, input.timeZone),
      sessionClose: zonedInstant(input.sessionDate + 'T' + input.sessionClose, input.timeZone),
      puzzleID: puzzle.puzzleId, puzzleVersion: puzzle.poolVersion, status: 'open', mode: 'classroom', createdAt: receipt });
  } catch { error(400, 'invalid_window'); }
  try {
    await db.batch([
      db.prepare("UPDATE classroom_sessions SET status='closed' WHERE classroomID=? AND sessionClose <= ?").bind(course.classroomID, receipt),
      // accessHash is a deprecated NOT NULL column. An inert marker preserves the
      // additive migration; no token is issued, hashed or resolved for a session.
      db.prepare(`INSERT INTO classroom_sessions(${SESSION_FIELDS.join(',')}, accessHash, classroomID) VALUES(${Array(SESSION_FIELDS.length + 2).fill('?').join(',')})`)
        .bind(...SESSION_FIELDS.map(key => session[key]), 'retired:' + session.sessionID, course.classroomID),
    ]);
  } catch (cause) {
    if (await currentSession(db, course, receipt)) error(409, 'active_session_exists');
    throw cause;
  }
  return instructorView(db, course, receipt);
}
export async function closeSession(db, course, input, receipt) {
  try { exactKeys(input, ['sessionID']); requireValue(typeof input.sessionID === 'string'); } catch { error(400); }
  const row = await db.prepare("UPDATE classroom_sessions SET status='closed' WHERE classroomID=? AND sessionID=? RETURNING sessionID").bind(course.classroomID, input.sessionID).first();
  if (!row) error(404);
  return instructorView(db, course, receipt);
}
