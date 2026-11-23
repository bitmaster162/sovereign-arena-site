import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const html = await readFile(new URL("../dist/pulse.html", import.meta.url), "utf8");
const status = JSON.parse(await readFile(new URL("../dist/pulse-status.json", import.meta.url), "utf8"));
const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];

async function renderStatus(response, clock = Date) {
  const nodes = new Map();
  const urls = [];
  function element(selector) {
    if (!nodes.has(selector)) {
      nodes.set(selector, { dataset: {}, textContent: "", innerHTML: "", querySelector: element });
    }
    return nodes.get(selector);
  }

  assert.ok(script, "built Pulse module exists");
  await runInNewContext("(async () => {" + script + "})()", {
    Date: clock,
    document: { getElementById: element, querySelector: element },
    fetch: async (url) => {
      urls.push(url);
      return response;
    },
  });
  assert.deepEqual(urls, ["/pulse-status.json"]);
  assert.match(element("market").innerHTML, /metrics unavailable/);
  assert.match(element("epoch").innerHTML, /metrics unavailable/);
  assert.match(element("fleet").textContent, /no fleet heartbeat/);
  return element;
}

test("built Pulse HTML marks the feed OFFLINE before JavaScript runs", () => {
  assert.match(html, /id="upd"[^>]*>Pulse — OFFLINE<\/div>/);
  assert.match(html, /<strong>Телеметрия недоступна<\/strong>/);
});

test("built Pulse script accepts the unavailable status and shows its observation", async () => {
  const element = await renderStatus({ ok: true, json: async () => status });
  assert.equal(element("pulse-truth").dataset.schemaValid, "true");
  assert.equal(element("[data-observed]").textContent, status.observed_at);
  assert.equal(element("[data-source]").textContent, status.source.id + " · /pulse-status.json");
  assert.equal(element("[data-heartbeat]").textContent, "UNAVAILABLE");
  assert.match(element("[data-reason]").textContent, /подтверждает недоступность/);
});

test("built Pulse script hides telemetry for malformed evidence or an unavailable status file", async () => {
  const cases = [
    { ok: true, json: async () => ({ ...status, classification: "Свежесть не подтверждена" }) },
    { ok: false, status: 404 },
  ];
  for (const response of cases) {
    const element = await renderStatus(response);
    assert.equal(element("pulse-truth").dataset.schemaValid, "false");
    assert.equal(element("[data-observed]").textContent, "");
    assert.match(element("[data-reason]").textContent, /недоступен или не прошёл проверку/);
  }
});

test("Pulse accepts observations at or before the clock and hides future observations", async () => {
  const now = Date.parse("2026-11-24T02:00:00.000Z");
  class FixedDate extends Date {
    static now() { return now; }
  }
  for (const offset of [-1, 0, 1]) {
    const observed_at = new Date(now + offset).toISOString();
    const response = { ok: true, json: async () => ({ ...status, observed_at }) };
    const element = await renderStatus(response, FixedDate);
    assert.equal(element("pulse-truth").dataset.schemaValid, String(offset <= 0));
    assert.equal(element("[data-observed]").textContent, offset <= 0 ? observed_at : "");
  }
});
