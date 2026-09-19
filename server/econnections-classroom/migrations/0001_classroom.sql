PRAGMA foreign_keys = ON;
CREATE TABLE classroom_sessions (
  sessionID TEXT PRIMARY KEY,
  accessHash TEXT NOT NULL UNIQUE,
  courseLabel TEXT NOT NULL,
  sectionLabel TEXT NOT NULL,
  sessionDate TEXT NOT NULL,
  scheduledClassTime TEXT NOT NULL,
  studentWindowStart TEXT NOT NULL,
  walkthroughStart TEXT NOT NULL,
  sessionClose TEXT NOT NULL,
  timeZone TEXT NOT NULL,
  puzzleID TEXT NOT NULL,
  puzzleVersion TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('upcoming','open','closed')),
  mode TEXT NOT NULL CHECK(mode = 'classroom'),
  createdAt TEXT NOT NULL
);
CREATE TABLE classroom_runs (
  runID TEXT PRIMARY KEY,
  sessionID TEXT NOT NULL REFERENCES classroom_sessions(sessionID) ON DELETE CASCADE,
  playerID TEXT NOT NULL,
  UNIQUE(sessionID, playerID),
  UNIQUE(runID, sessionID, playerID)
);
CREATE TABLE classroom_events (
  eventID TEXT PRIMARY KEY,
  sessionID TEXT NOT NULL,
  runID TEXT NOT NULL,
  playerID TEXT NOT NULL,
  sequenceNumber INTEGER NOT NULL CHECK(sequenceNumber BETWEEN 1 AND 256),
  eventType TEXT NOT NULL CHECK(eventType IN ('session_start','group_attempt','group_solved','puzzle_complete')),
  serverTimestamp TEXT NOT NULL,
  elapsedMs INTEGER NOT NULL CHECK(elapsedMs BETWEEN 0 AND 86400000),
  selectedTileIds TEXT NOT NULL CHECK(json_valid(selectedTileIds)),
  correct INTEGER CHECK(correct IN (0,1)),
  oneAway INTEGER NOT NULL CHECK(oneAway IN (0,1)),
  groupID TEXT,
  groupsSolvedCount INTEGER NOT NULL CHECK(groupsSolvedCount BETWEEN 0 AND 4),
  schemaVersion TEXT NOT NULL CHECK(schemaVersion = 'econnections-classroom/1'),
  payload TEXT NOT NULL CHECK(json_valid(payload)),
  UNIQUE(runID, sequenceNumber),
  FOREIGN KEY(runID, sessionID, playerID) REFERENCES classroom_runs(runID, sessionID, playerID) ON DELETE CASCADE
);
CREATE UNIQUE INDEX classroom_one_start ON classroom_events(runID) WHERE eventType = 'session_start';
CREATE UNIQUE INDEX classroom_one_completion ON classroom_events(runID) WHERE eventType = 'puzzle_complete';
CREATE INDEX classroom_session_type ON classroom_events(sessionID, eventType, serverTimestamp);
CREATE INDEX classroom_player ON classroom_events(playerID, serverTimestamp);
CREATE INDEX classroom_timestamp ON classroom_events(serverTimestamp);
CREATE INDEX classroom_type ON classroom_events(eventType);
-- Also protects against concurrent writers between validation and insertion.
CREATE TRIGGER classroom_contiguous BEFORE INSERT ON classroom_events
WHEN NEW.sequenceNumber != COALESCE((SELECT MAX(sequenceNumber) + 1 FROM classroom_events WHERE runID = NEW.runID), 1)
BEGIN SELECT RAISE(ABORT, 'sequence conflict'); END;
