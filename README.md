# CODEX04 R51 — Sovereign Arena truth-repair candidate

This disposable repository starts from the byte-for-byte public HTML served by
the current Vercel production project on 2026-07-29. The production deployment
is a CLI/API prebuilt static artifact with no Git metadata; the stale dirty
authoring clone was not modified.

- Work order: `CODEX04-R51-SOVEREIGN-ARENA-TRUTH-REPAIR`
- Source deployment: `dpl_HvHdXyfam6V82vihvfc9X3DEbDzk`
- Baseline commit: `5105058ddf9450848b8fdc3b7af56f860edfecce`
- Baseline tree: `764a8c436ee82d0feb017eaaf5e6628bc41bfaad`
- Candidate branch: `codex04/r51-sovereign-arena-truth-repair`
- Production deployment: denied
- `can_trade=false`
- `capital_permission=DENY`

Run without installing dependencies:

```text
node tools/apply_truth_repair.mjs  # already applied in the candidate commit
npm run verify
```

`npm run verify` reapplies the idempotent final claim qualification, builds the
strict static deployment allowlist in `dist/`, and runs the dependency-free
test suite.
The deployment template in the return package keeps `approved=false`.
