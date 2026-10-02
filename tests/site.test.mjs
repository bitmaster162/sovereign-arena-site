import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { startStaticServer } from "../tools/static_server.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = path.join(root, "site");
const dist = path.join(root, "dist");
const routes = [
  ["/", "STATIC_DEMO"],
  ["/ai-audit", "STATIC_DEMO"],
  ["/boards", "LIVE_DEGRADED"],
  ["/continuityos", "STATIC_DEMO"],
  ["/grids", "PAPER_ONLY"],
  ["/guide", "STATIC_DEMO"],
  ["/pulse", "LIVE_DEGRADED"],
  ["/research-log", "PAPER_ONLY"],
  ["/sovereign-twin", "STATIC_DEMO"],
  ["/triage", "STATIC_DEMO"],
];
const allowedStatuses = new Set([
  "LIVE_VERIFIED",
  "LIVE_DEGRADED",
  "STATIC_DEMO",
  "PAPER_ONLY",
  "OFFLINE",
]);
const cryptoRiskDisclaimer = "Здесь — личная практика и исследования автора. Это не инвестиционный совет и не предложение управлять чужими средствами. Торговля криптоактивами может привести к потере всех вложенных денег; прошлые результаты не гарантируют будущих.";
assert.equal(createHash("sha256").update(cryptoRiskDisclaimer, "utf8").digest("hex"), "6dd6a7500f9265a42e1f35bf0981cfdf1da0217bffcd0e01dc8af5e6d7b232dc");
const visitorSnapshotPrefix = "Снимок данных:";
assert.equal(createHash("sha256").update(visitorSnapshotPrefix, "utf8").digest("hex"), "b1ea223400d328d0cc09818bf45db6b3e432d0735d6e8c8aae08552752aac12a");

function routeFile(route) {
  return route === "/" ? "index.html" : `${route.slice(1)}.html`;
}

function extractInternalSummary(html) {
  const r51 = html.match(/<span class="r51-truth-copy">([\s\S]*?)<\/span>/)?.[1];
  if (r51) return r51;
  const surface = html.match(/<section class="surface-truth"[\s\S]*?<div class="surface-truth-in">\s*<strong>[\s\S]*?<\/strong>\s*<span>([\s\S]*?)<\/span>/)?.[1];
  assert.ok(surface, "internal route summary exists");
  return surface;
}

let server;
let origin;

before(async () => {
  ({ server, origin } = await startStaticServer(dist));
});

after(async () => {
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
});

test("strict prebuilt output contains only approved deployment files", async () => {
  const expectedFiles = [
    "ai-audit.html",
    "boards.html",
    "continuityos.html",
    "grids.html",
    "guide.html",
    "index.html",
    "pulse-status.json",
    "pulse.html",
    "research-log.html",
    "sovereign-twin.html",
    "triage.html",
    "vercel.json",
  ];
  assert.deepEqual((await readdir(dist)).sort(), expectedFiles);
  for (const name of expectedFiles) {
    const text = await readFile(path.join(dist, name), "utf8");
    assert.doesNotMatch(text, /\r/, `${name} canonical LF output`);
  }
});

test("internal classifications stay in source while public routes expose one visitor snapshot", async () => {
  for (const [route, expected] of routes) {
    const file = routeFile(route);
    const sourceHtml = await readFile(path.join(site, file), "utf8");
    const sourceMatches = [...sourceHtml.matchAll(/data-surface-status="([^"]+)"/g)];
    assert.equal(sourceMatches.length, 1, `${route} internal classification count`);
    assert.ok(allowedStatuses.has(sourceMatches[0][1]), route);
    assert.equal(sourceMatches[0][1], expected, route);
    const summary = extractInternalSummary(sourceHtml);

    const response = await fetch(origin + route, { redirect: "manual" });
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.equal(html.split(visitorSnapshotPrefix).length - 1, 1, `${route} visitor snapshot count`);
    assert.ok(html.includes(summary), `${route} preserves internal route summary verbatim`);
    assert.doesNotMatch(html, /data-(?:surface-status|cta-status|r51-link-status)=/i, `${route} public status attrs removed`);
    assert.doesNotMatch(html, /class="(?:r51-status|r51-truth-meta|r51-link-state|r51-card-state)"/i, `${route} public debug badge classes removed`);
    assert.doesNotMatch(html, /source=dpl_|observed=/i, `${route} source deployment debug metadata removed`);
    assert.match(html, /Agent Authority & Evidence Audit/);
    assert.match(html, /href="https:\/\/bitevoagentsite\.vercel\.app\/audit-intake"/, `${route} canonical BitEvo audit-intake CTA`);
    assert.equal(html.split(cryptoRiskDisclaimer).length - 1, 1, `${route} exact crypto disclaimer once`);
    assert.doesNotMatch(html, /мы не получаем доступа к вашим средствам|we never get access to your funds/i, `${route} unconfirmed funds-access claim omitted`);
    assert.match(html, /can_trade=false|can_trade: false|paper-only/i);
  }
});

test("Pulse status request is 200, schema-valid, and contains no metrics", async () => {
  const response = await fetch(origin + "/pulse-status.json");
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.schema_version, "arena.pulse.status.v1");
  assert.equal(data.status, "DATA_UNAVAILABLE");
  assert.equal(data.classification, "LIVE_DEGRADED");
  assert.deepEqual(data.source, {
    id: "sovereign-arena-pulse-status-evidence",
    endpoint: "/pulse-status.json",
    availability: "AVAILABLE",
    evidence_http: 200,
    failed_predecessor_endpoint: "/api/pulse",
    failed_predecessor_observation: "HTTP_404",
  });
  assert.ok(Number.isFinite(Date.parse(data.observed_at)));
  assert.equal(data.freshness, "UNAVAILABLE");
  assert.equal(data.producer_heartbeat, null);
  assert.equal(data.metrics, null);
  assert.equal(typeof data.reason, "string");
  assert.ok(data.reason.length > 0);
  assert.equal(data.can_trade, false);
  assert.equal(data.capital_permission, "DENY");
});

test("Pulse machine evidence artifact is unchanged by public HTML sanitization", async () => {
  const sourceData = JSON.parse(await readFile(path.join(site, "pulse-status.json"), "utf8"));
  const distData = JSON.parse(await readFile(path.join(dist, "pulse-status.json"), "utf8"));
  assert.deepEqual(distData, sourceData);
});

test("Pulse no longer requests the missing /api/pulse and keeps fail-closed data handling", async () => {
  const html = await readFile(path.join(dist, "pulse.html"), "utf8");
  assert.doesNotMatch(html, /fetch\(["']\/api\/pulse/);
  assert.match(html, /fetch\(["']\/pulse-status\.json/);
  assert.match(html, /DATA_UNAVAILABLE/);
  assert.match(html, /Producer heartbeat/);
  assert.match(html, /Freshness/);
  assert.match(html, /schemaValid|schema-valid|schema validation/i);
  assert.match(html, /data\.source\.endpoint === "\/pulse-status\.json"/);
  assert.match(html, /data\.source\.failed_predecessor_endpoint === "\/api\/pulse"/);
  assert.match(html, /data\.producer_heartbeat === null/);
  assert.match(html, /data\.can_trade === false/);
  assert.match(html, /data\.capital_permission === "DENY"/);
  const oldEndpoint = await fetch(origin + "/api/pulse");
  assert.equal(oldEndpoint.status, 404);
});

test("ContinuityOS does not advertise an unqualified registry install", async () => {
  for (const name of ["continuityos.html", "guide.html"]) {
    const html = await readFile(path.join(dist, name), "utf8");
    assert.doesNotMatch(html, /pip\s+install\s+continuityos/i, name);
    assert.match(html, /https:\/\/github\.com\/bitmaster162\/continuityos/i, name);
  }
});

test("Grid policy is contextual, paper-only, and denies capital effect", async () => {
  const html = await readFile(path.join(dist, "grids.html"), "utf8");
  assert.match(html, /canonical-grid-risk-policy/);
  assert.match(html, /Unleveraged spot inventory/);
  assert.match(html, /Leveraged, margin, futures/);
  assert.match(html, /hard stop/i);
  assert.match(html, /can_trade=false/);
  assert.match(html, /capital_permission=DENY/);
});

test("Every DuckDNS destination uses visitor-facing freshness copy and no missing pricing CTA remains", async () => {
  let duckDnsLinks = 0;
  let freshnessNotes = 0;
  for (const name of (await readdir(dist)).filter((name) => name.endsWith(".html"))) {
    const html = await readFile(path.join(dist, name), "utf8");
    assert.doesNotMatch(html, /href="http:\/\/sovereign-arena\.duckdns\.org/i, name);
    for (const match of html.matchAll(/<a\b[^>]*href="https:\/\/sovereign-arena\.duckdns\.org\/[^"]*"[^>]*>/gi)) {
      duckDnsLinks += 1;
      assert.doesNotMatch(match[0], /data-r51-link-status=/i, name);
    }
    freshnessNotes += html.split("Свежесть не подтверждена").length - 1;
    assert.doesNotMatch(html, /href="\/api\/pricing"/i, name);
  }
  assert.equal(duckDnsLinks, 39);
  assert.equal(freshnessNotes, 39);
});

test("conflicting product counts and historical offers are visibly qualified", async () => {
  const index = await readFile(path.join(dist, "index.html"), "utf8");
  assert.doesNotMatch(index, /6 ИИ-оркестраторов \(/);
  assert.doesNotMatch(index, /100 событий бесплатно/);
  assert.doesNotMatch(index, /реальные коллы для VIP/);
  assert.doesNotMatch(index, />299\/мес →/);
  assert.doesNotMatch(index, /A\/B-лаборатория грид-стратегий: 3 плотности/);
  assert.match(index, /exact\/current count не подтверждён/);
  assert.match(index, /Offer snapshot · verify scope/);

  const guide = await readFile(path.join(dist, "guide.html"), "utf8");
  assert.doesNotMatch(guide, /живая торговая арена/i);
  assert.doesNotMatch(guide, /Battle of AI: 10\+ моделей соревнуются/);
  assert.match(guide, /нереконсилированные roster claims \(6 и 10\+\)/);

  const boards = await readFile(path.join(dist, "boards.html"), "utf8");
  assert.doesNotMatch(boards, /Пока 1 сделка/);
  assert.doesNotMatch(boards, /ИИ \(10 оркестраторов\)/);
  assert.doesNotMatch(boards, /v900-гриды = 100% WR/);
  assert.doesNotMatch(boards, /Реальные сделки Robert vs/);
  assert.doesNotMatch(boards, /ловушка 74\.9%/);
  assert.match(boards, /exact\/current count не подтверждён/);

  const audit = await readFile(path.join(dist, "ai-audit.html"), "utf8");
  assert.doesNotMatch(audit, /Живой кейс:/);
  assert.doesNotMatch(audit, /<div class="amt">\$0 · 72ч<\/div>/);
  assert.doesNotMatch(audit, /<div class="amt">от \$1\.5k<\/div>/);
  assert.doesNotMatch(
    audit,
    /class="btn btn-(?:main|ghost)" href="https:\/\/t\.me\/bitai1_bot"/,
  );
  assert.match(audit, /Historical offer snapshot/);
  assert.doesNotMatch(audit, /data-cta-status=/);
  assert.match(audit, /Снимок данных:/);
});

test("all internal page links resolve in the candidate", async () => {
  const hrefs = new Set();
  for (const name of (await readdir(dist)).filter((name) => name.endsWith(".html"))) {
    const html = await readFile(path.join(dist, name), "utf8");
    for (const match of html.matchAll(/href="(\/[^"#?]*)/g)) hrefs.add(match[1]);
  }
  for (const href of hrefs) {
    const response = await fetch(origin + href, { redirect: "manual" });
    assert.equal(response.status, 200, href);
  }
});

test("R-next overlay is registry-driven and does not inherit stale navigation/product authority", async () => {
  const claims = JSON.parse(await readFile(path.join(root, "data/claim-dispositions.json"), "utf8"));
  assert.equal(claims.invariants.can_trade, false);
  assert.equal(claims.invariants.capital_permission, "DENY");
  assert.ok(claims.claims.some((claim) => claim.id === "arena.pulse.live" && claim.disposition === "LIVE_DEGRADED" && claim.render_live_value === false));
  assert.ok(claims.claims.some((claim) => claim.id === "arena.audit.commercial" && claim.disposition === "HISTORICAL_ONLY"));

  for (const name of (await readdir(dist)).filter((name) => name.endsWith(".html"))) {
    const html = await readFile(path.join(dist, name), "utf8");
    assert.match(html, /https:\/\/sovereign-arb-radar\.vercel\.app/);
    assert.match(html, /https:\/\/sovereign-grid-vip\.vercel\.app/);
    assert.match(html, /https:\/\/t\.me\/BitmasterTm/);
    assert.doesNotMatch(html, /t\.me\/bitai1_bot/);
    assert.doesNotMatch(html, /Operator Decision Sprint/);
    assert.doesNotMatch(html, /bitevoagentsite\.vercel\.app\/intake"/);
    assert.match(html, /can_trade=false|can_trade: false|paper-only/i);
    assert.match(html, /href="\/sovereign-twin"/);
  }

  const guide = await readFile(path.join(dist, "guide.html"), "utf8");
  assert.doesNotMatch(guide, /94 гайда/);
  assert.match(guide, /Crypto Guides · restored corpus under review/);

  const audit = await readFile(path.join(dist, "ai-audit.html"), "utf8");
  assert.match(audit, /historical Arena surface/);
  assert.match(audit, /https:\/\/bitevoagentsite\.vercel\.app\/agent-authority-audit/);
});
