# Sovereign Arena Transport Authority Quarantine R1

Observed against recovery PR #1 baseline `bd09a6f358b20167e7184f8e7fd9f2490a43adae` on 2026-08-20.

## Purpose

This document prevents transport/deployment helper branches from being mistaken for canonical Sovereign Arena source authority.

`SOURCE != BUILD != DEPLOYMENT != READBACK != EXTERNAL EFFECT`

A transport branch may corroborate a deployment or payload observation. It does not become canonical source merely because a deployment exists or returns READY/HTTP 200.

## Hard quarantine — confirmed foreign payload identity

### `transport/r68-exact-vercel-mirror-20260816`

Classification: `QUARANTINED_CONFIRMED_FOREIGN_AI_SKILL_LAB_R68_PAYLOAD`.

Observed commit: `35018cbb63347e6a2ac0951c8254cf70e858614d`.

The transport payload asserts identities belonging to `bitmaster162/ai-skill-lab` R68 rather than Sovereign Arena:

- foreign release head `e5c4554516dbc61e139d15b2e08508b7c7360894`;
- foreign tree `7ced4f5e1f4fa17b86d8f8faf1eedf2744ed52ca`;
- foreign payload SHA-256 `569ce21a2db436332adb1133a856bb93ae773dd11c248d52af0943d8a22a7069`;
- foreign archive SHA-256 `c6c62dd106ba63012dcc3be54a73c93f551148bbf56898039f094a4313efe9b3`;
- foreign static path signatures including `kids.html`, `parents.html`, `curriculum.html`, `phuket.html`, `pricing.html` and `lab-command.js`.

This branch MUST NOT participate in Arena source-authority resolution.

### `transport/r68-exact-repair-20260816-v2`

Classification: `QUARANTINED_MIXED_ARENA_SOURCE_PLUS_FOREIGN_AI_SKILL_LAB_R68_PAYLOAD_AT_REST`.

The branch root contains ordinary Arena Astro source, but `r68_exact/` contains the same foreign AI Skill Lab R68 static payload signature set. A historical READY deployment from this branch built the normal Arena Astro source; therefore repository-at-rest contamination and served-output identity are separate facts.

This branch MUST NOT participate in Arena source-authority resolution until an exact clean source/tree identity is independently reconstructed and verified.

## Non-authority transport refs — no foreign payload proven at current ref

The following current branch-name reads showed ordinary Arena Astro root files and no confirmed foreign payload in the inspected root:

- `transport/r68-live-20260816`;
- `transport/r68-exact-repair-20260816`.

Classification: `NON_AUTHORITY_TRANSPORT`. This is deliberately weaker than `CLEAN`.

These refs may be used only as corroborating transport/readback evidence. They MUST NOT be elevated to canonical source authority without exact SHA/tree comparison against an accepted Arena source baseline.

## Fail-closed identity gate

Any future Arena transport/recovery candidate must fail closed if it contains or asserts any known AI Skill Lab R68 identity above, a foreign project release manifest, or the foreign static path signature set.

A candidate may proceed only when all of the following are explicit and mutually consistent:

1. repository identity = `bitmaster162/sovereign-arena-site`;
2. exact Arena source commit SHA and tree are bound;
3. release/payload manifest identifies Sovereign Arena rather than another BitEvo project;
4. served/readback payload is derived from that exact source identity;
5. source, build, deployment and readback receipts are recorded separately.

## Current release blockers unchanged

This quarantine does not solve the existing release blockers:

- production `dpl_9xeifLftSads4yq7F1osw1URjgX9` remains direct-upload with source binding unknown;
- legacy `main` still exposes plain-HTTP raw-IP rewrites to `34.70.171.152:8091` and `:8092`;
- recovery PR #1 still does not contain the prepared R-next multi-file source import.

## Authority / safety boundary

This document is provenance and recovery governance only.

- no branch deletion or force-push;
- no merge;
- no production promotion;
- no DNS or credential mutation;
- no runtime/control mutation;
- `can_trade=false`;
- `capital_permission=DENY`.
