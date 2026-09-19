CREATE TABLE classroom_courses (
  classroomID TEXT PRIMARY KEY,
  courseLabel TEXT NOT NULL,
  sectionLabel TEXT NOT NULL,
  timeZone TEXT NOT NULL,
  defaultStudentWindowStart TEXT NOT NULL,
  defaultWalkthroughStart TEXT NOT NULL,
  defaultSessionClose TEXT NOT NULL,
  instructorHash TEXT NOT NULL UNIQUE,
  studentToken TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('active', 'disabled')),
  createdAt TEXT NOT NULL
);
-- Preserve historical rows/events. Legacy orphan sessions remain admin-readable,
-- but their old per-session accessHash no longer authorizes student requests.
ALTER TABLE classroom_sessions ADD COLUMN classroomID TEXT REFERENCES classroom_courses(classroomID);
CREATE INDEX classroom_session_parent ON classroom_sessions(classroomID, createdAt);
-- Expired rows are closed transactionally before the next activation. Upcoming
-- sessions reserve the slot too: there can never be two routable occurrences.
CREATE UNIQUE INDEX classroom_one_active ON classroom_sessions(classroomID)
WHERE status IN ('upcoming', 'open') AND classroomID IS NOT NULL;
