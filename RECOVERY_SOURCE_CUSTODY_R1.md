# Sovereign Arena source custody — R1

Status: `RECOVERY_BRANCH / NO_MERGE / NO_PRODUCTION_PROMOTION / NO_RUNTIME_WRITE`

## Fresh live baselines

GitHub writer repository:

```text
repo = bitmaster162/sovereign-arena-site
default branch = main
main HEAD = f070fe0587a4222b993b7e8fc9b8f2726ca414d9
main tree = 51043155abf8d7208bb34c8df448b4cb386c1751
main source state = legacy Astro source, older than current public production
```

Current Vercel production:

```text
project = sovereign-arena-site
project_id = prj_yp0tLCr4MWGQUvTuJrW28bwu3EcF
latest production deployment = dpl_9xeifLftSads4yq7F1osw1URjgX9
state = READY
target = production
meta = {}
source identity = not Git-bound in deployment metadata
```

Verified historical R51 preview:

```text
deployment = dpl_CkBcC5hGyL1mLj5xW8CsmQZTQVic
state = READY
target = preview / null
source = cli
workOrder = CODEX05-R52C-SOVEREIGN-ARENA-PREVIEW-RELEASE
candidateHead = 5c7549bd6fc2bb7e33f714a3596e238864d573d5
```

## Physically recovered R51 strict return

```text
archive = CODEX04_R51_SOVEREIGN_ARENA_TRUTH_REPAIR_RETURN.zip
SHA-256 = 998fdec799988c3dc92836909c7cf1ebda03b7052c4a85bcbd5bf262a3891006
bundle candidate HEAD = 5c7549bd6fc2bb7e33f714a3596e238864d573d5
bundle candidate tree = 0c88a23f39769eb95f5a37d5fe366d074a1e3dcc
bundle baseline HEAD = 5105058ddf9450848b8fdc3b7af56f860edfecce
bundle baseline tree = 764a8c436ee82d0feb017eaaf5e6628bc41bfaad
bundle verification = PASS / complete history
```

Fresh local replay from the recovered candidate:

```text
npm run build  = PASS
npm run verify = PASS
9 tests / 9 passed / 0 failed
external dependencies installed = 0
can_trade = false
capital_permission = DENY
```

## Custody decision

The existing `main` branch is preserved as legacy evidence and is **not** the content authority for R-next. The current Vercel production artifact is also **not** imported wholesale because its later generation contains useful UX improvements mixed with verified truth regressions.

The reconstruction branch is:

```text
recovery/r51-canonical-rnext
```

It is intentionally created from the live GitHub main only to preserve repository continuity. The **content authority** imported into this branch is the physically recovered, bundle-verified R51 candidate, with later changes reapplied only through explicit evidence-bound overlays.

Precedence:

```text
R51 verified truth boundaries
+ explicitly retained later UX/IA
+ current BitEvo ecosystem/product doctrine
+ new exact source/build/readback receipts
- false-green runtime assumptions
- unverified currentness/pricing/installability claims
- trading/capital-boundary drift
= Arena R-next candidate
```

## Non-effect boundary

This branch creation and source-custody record do not authorize or perform:

- merge to `main`;
- Vercel production promotion;
- DNS/domain/canonical-origin changes;
- runtime/service/scheduler changes;
- credential changes;
- exchange/order/wallet/capital effects;
- outreach or paid offer publication.

`can_trade=false` and `capital_permission=DENY` are invariant.
