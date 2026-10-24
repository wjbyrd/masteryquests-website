# Approved public question-bank publication layer

The manifest contains exact edits to already-public runtime bank source. It does not contain faculty PDFs, private review inventories, answer-index ledgers, or instructional materials.

The Directorate and Macro publishers validate their historical layers before applying these approved source edits. Whole-bank fingerprints reject unreviewed drift before publication. Replaying an already-current bank is idempotent.

Run `python audit_tools/approved_question_banks/replay.py` to verify the eight installed sources, reverse/forward replay, idempotence, and drift rejection. Continue running the existing Directorate and Macro publication and gameplay checks.
