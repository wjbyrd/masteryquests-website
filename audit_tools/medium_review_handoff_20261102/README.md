# Medium review handoff

All 54 revisions from the November 2 flag pass were explicitly accepted by the
instructor. The offline review tool now opens on **Medium / Not yet marked**,
with a **Continue Medium review** shortcut. The saved queue contains 2,177
unmarked Medium questions and 118 accepted Medium questions. Existing reviews,
notes, answer history, and newer browser progress retain their existing merge
behavior. Other difficulty and status filters remain available.

`activate-medium.py` verifies the accepted revisions, retains the review data
unchanged, updates the external template, and rebuilds the offline HTML. It also
checks that the canonical bank and all seven PDF/Excel artifacts still match
the already delivered revisions. No question content or difficulty changes are
introduced by this handoff, and no website update-page entry is added.

`review-template.html` records the current template, and `handoff.json` records
the approvals and saved queue counts. The prior revision audit remains a record
of the delivery before approval. Baselines and browser inspection files stay
local and ignored. Run the activation script with the bundled Python runtime;
the external source and deliverable remain in
`Documents/Mastery Quests Website/Conference_Presentation`.
