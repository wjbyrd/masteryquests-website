'use strict';
// Permit only the reviewed raw-UUID reader change in older HEAD preservation guards.
// All remaining transport behavior and all disclosure/UX checks stay protected.
const approvedReader = `
  function readActiveRunId(key) {
    // createRun/resumeRun persist a plain UUID, not a JSON string.
    try {
      const value = localStorage['getItem'](key);
      if (value === null) return "";
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) return value;
    } catch (_) {}
    memoryRemoteDisabled = true;
    return "";
  }
`;
exports.normalizeApprovedRefreshFix = s => s.replace(approvedReader, '').replace('activeRunId: readActiveRunId(ACTIVE_RUN_KEY),', 'activeRunId: readJSON(ACTIVE_RUN_KEY, "") || "",');
