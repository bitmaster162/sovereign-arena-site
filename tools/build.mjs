import {
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "site");
const output = path.join(root, "dist");
const expected = [
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

const visitorSnapshotDate = "2026-07-29";
const visitorSnapshotPrefix = `Данные — снимок от ${visitorSnapshotDate}.`;

function cleanCta(anchor) {
  return anchor.replace(/\sdata-cta-status="[^"]*"/g, "");
}

function visitorBadgeCopy(status) {
  if (status === "LIVE_DEGRADED") return "Свежесть не подтверждена";
  if (status === "OFFLINE") return "Текущая доступность не опубликована";
  if (status === "LIVE_VERIFIED") return "Проверено на момент снимка";
  return "Исторический snapshot";
}

function sanitizeVisitorVocabulary(text) {
  return text
    .replaceAll("DuckDNS/Grafana", "внешний dashboard endpoint")
    .replaceAll("DuckDNS", "внешний endpoint")
    .replaceAll("Grafana", "dashboard")
    .replaceAll("current verdict feed unavailable", "текущий авто-вердикт не подтверждён")
    .replaceAll("Count provenance", "Источник чисел")
    .replaceAll("LIVE_DEGRADED", "Свежесть не подтверждена")
    .replaceAll("STATIC_DEMO", "Исторический снимок");
}

function sanitizeDependencyLinks(html) {
  return html.replace(
    /href="https?:\/\/sovereign-arena\.duckdns\.org\/[^"]*"/gi,
    'href="/boards#dependency-status"',
  );
}

function sanitizePublicHtml(input, name) {
  let html = input;

  const r51Band = html.match(/<section class="r51-truth"[\s\S]*?<\/section>/);
  const surfaceBand = html.match(/<section class="surface-truth"[\s\S]*?<\/section>/);
  const band = r51Band?.[0] || surfaceBand?.[0];
  if (!band) throw new Error(`${name}: internal truth band missing`);

  let summary;
  let cta = "";
  let safety = "";

  if (r51Band) {
    summary = band.match(/<span class="r51-truth-copy">([\s\S]*?)<\/span>/)?.[1];
    const ctaMatch = band.match(/<a class="r51-primary-cta"[\s\S]*?<\/a>/);
    if (ctaMatch) cta = cleanCta(ctaMatch[0]);
  } else {
    summary = band.match(/<div class="surface-truth-in">\s*<strong>[\s\S]*?<\/strong>\s*<span>([\s\S]*?)<\/span>/)?.[1];
    const ctaMatch = band.match(/<a\b[\s\S]*?<\/a>/);
    if (ctaMatch) cta = cleanCta(ctaMatch[0]);
    safety = band.match(/<small>([\s\S]*?)<\/small>/)?.[0] || "";
  }

  if (!summary) throw new Error(`${name}: visitor snapshot summary missing`);
  const publicBand = `<section class="r51-snapshot" aria-label="Снимок данных"><p><strong>${visitorSnapshotPrefix}</strong> ${sanitizeVisitorVocabulary(summary)}</p>${cta}${safety}</section>`;
  html = html.replace(band, publicBand);

  html = html.replace(/\sdata-(?:surface-status|cta-status|r51-link-status)="[^"]*"/g, "");
  html = html.replace(
    /<span class="r51-link-state">([^<]*)<\/span>/g,
    (_full, status) => `<span>${visitorBadgeCopy(status.trim())}</span>`,
  );
  html = html.replace(
    /<span class="r51-card-state">([^<]*)<\/span>/g,
    (_full, status) => `<span>${visitorBadgeCopy(status.trim())}</span>`,
  );
  html = html.replace(/<strong class="r51-status">[\s\S]*?<\/strong>/g, "");
  html = html.replace(/<span class="r51-truth-meta">[\s\S]*?<\/span>/g, "");
  html = sanitizeDependencyLinks(html);
  html = sanitizeVisitorVocabulary(html);

  const forbidden = [
    /data-surface-status=/,
    /data-cta-status=/,
    /data-r51-link-status=/,
    /class="r51-status"/,
    /class="r51-truth-meta"/,
    /class="r51-link-state"/,
    /class="r51-card-state"/,
    /source=dpl_/i,
    /observed=/i,
    /STATIC_DEMO/i,
    /LIVE_DEGRADED/i,
    /DuckDNS/i,
    /Grafana/i,
    /current verdict feed unavailable/i,
    /Count provenance/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(html)) throw new Error(`${name}: public debug marker survived: ${pattern}`);
  }
  if (html.split(visitorSnapshotPrefix).length - 1 !== 1) {
    throw new Error(`${name}: expected exactly one visitor snapshot line`);
  }
  return html;
}

const actual = (await readdir(source)).sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(
    `Strict deployment allowlist mismatch.\nExpected: ${expected.join(", ")}\nActual: ${actual.join(", ")}`,
  );
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of expected) {
  const sourcePath = path.join(source, name);
  if (!(await stat(sourcePath)).isFile()) throw new Error(`${name} is not a file`);
  const sourceText = await readFile(sourcePath, "utf8");
  const canonicalText = sourceText.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const publicText = name.endsWith(".html") ? sanitizePublicHtml(canonicalText, name) : canonicalText;
  await writeFile(path.join(output, name), publicText, {
    encoding: "utf8",
    flag: "wx",
  });
}

console.log(
  JSON.stringify(
    {
      result: "PASS",
      source: "site",
      output: "dist",
      deployment_files: expected.length,
      build_model: "static-prebuilt-allowlist",
      text_encoding: "UTF-8",
      line_endings: "LF",
      external_dependencies: 0,
      approved: false,
      can_trade: false,
      capital_permission: "DENY",
    },
    null,
    2,
  ),
);
