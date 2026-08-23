# CODEX04 R51 causal spine

1. Vercel identifies current production as
   `dpl_HvHdXyfam6V82vihvfc9X3DEbDzk`, a 10-file CLI/API prebuilt deployment
   with empty Git metadata.
2. The local GitHub clone at `C:\PROJECTS\sovereign-arena-site` is older and
   dirty. It was kept read-only and rejected as the writer root.
3. Nine public route bodies were recovered byte-for-byte from the current
   production alias. Together with the documented `{"cleanUrls":true}`
   configuration they form the exact deployed-artifact baseline committed as
   `5105058ddf9450848b8fdc3b7af56f860edfecce`.
4. `/pulse` fetched `/api/pulse`, but the prebuilt artifact contains no API
   implementation and production returned HTTP 404. The candidate removes that
   fetch and serves `/pulse-status.json` with schema
   `arena.pulse.status.v1`, HTTP 200, `metrics=null`, no heartbeat, freshness
   `UNAVAILABLE`, and a visible `DATA_UNAVAILABLE` state.
5. Unqualified live labels and numeric counters were converted to explicit
   snapshots. The contradictory Battle roster claims (6 versus 10+) and
   historical offer claims ($0, $299, from $1.5k, 100 events/$15) are now
   visibly `UNVERIFIED`, not current prices or counts. Every major route now
   has exactly one allowed truth label.
6. All 18 DuckDNS/Grafana dashboard URLs returned HTTP 200, and representative
   public APIs returned dashboard definitions. Panel-data freshness and
   heartbeat were not proven, so all 39 occurrences remain usable but are
   visibly classified `LIVE_DEGRADED`.
7. Grid copy mixed universal hard-stop language with inventory behavior. The
   canonical policy is now contextual: unleveraged spot inventory uses a
   predeclared loss budget and range exit; leveraged, margin, futures, or short
   inventory requires a pre-entry hard stop. No fresh data means no setup.
8. ContinuityOS package identity and install smoke were not established, so the
   registry CTA was removed and replaced with the source repository path.
9. The missing `/api/pricing` CTA was removed. Count provenance is visible, and
   the primary conversion path is the Operator Decision Sprint intake. That
   destination is HTTP 200 but is a client-only brief builder, so its workflow
   is explicitly `STATIC_DEMO`, not a verified submission backend.
10. Dependency-free build and regression tests pass 9/9. Nine routes pass
    desktop/mobile visual smoke; mobile overflow defects found during the run
    were fixed and reverified. The strict prebuilt canonicalizes text to UTF-8
    with LF line endings so the committed source rebuild is byte-identical
    across Windows checkout policies.
11. No production deployment, alias change, credential access, service change,
    trading, or capital effect occurred.

`can_trade=false`; `capital_permission=DENY`.
