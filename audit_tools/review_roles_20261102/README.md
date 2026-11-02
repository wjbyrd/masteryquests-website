# Show question roles in the review tool

The bank already identifies repair and bridge questions. This change exposes that information on question cards, in a Question role filter with live counts, and in the review CSV's appended Question role column. Repair seed remains an explicit subtype. Ordinary source-pool labels are displayed as Main question; boss roles display as Boss/checkpoint.

Review support questions opens unmarked questions with unspecified difficulty. The role filter then separates Repair, Bridge, and Repair seed. The default view remains Medium / Not yet marked. Queue shortcuts clear the role filter so it cannot accidentally hide the intended questions.

The 703 unspecified questions comprise 416 Repair (411 unmarked), 279 Bridge, and eight Repair seed. All question content, difficulty classifications, approvals, notes, answers, and review history remain unchanged. The source review JSON is verified byte-for-byte; the rebuilt embedded data differs only by the added presentation role. No website update-page entry is added.

The external template and builder are updated in place. Their final versions and a narrowly scoped update script are retained here; prior baselines and screenshots stay local and ignored.
