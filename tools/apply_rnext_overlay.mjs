import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "site");
const registry = JSON.parse(await readFile(path.join(root, "data/ecosystem-registry.json"), "utf8"));
const byId = new Map(registry.entries.map((entry) => [entry.id, entry]));

const required = ["guide","ai-audit","research-log","triage","pulse","grids","arb-radar","grid-vip","boards","continuityos","bitevo","crypto-guides","channel","contact"];
for (const id of required) if (!byId.has(id)) throw new Error(`registry missing ${id}`);

const link = (id, label, extra = "") => {
  const entry = byId.get(id);
  const external = !entry.internal;
  return `<a href="${entry.href}"${external ? ' target="_blank" rel="noopener"' : ""}${extra}>${label}</a>`;
};

const nav = `<nav class="sa-topnav"><div class="sa-topnav-in"><a class="sa-brand" href="/">⚡ Sovereign Arena</a><div class="sa-links">${[
  link("guide","🗺️ Путеводитель"),
  link("ai-audit","🎯 AI-Audit"),
  link("research-log","📓 Research Log"),
  link("triage","🛠️ Triage"),
  link("pulse","📟 Pulse"),
  link("grids","🟢 Грид"),
  link("arb-radar","⚖️ Арб-радар"),
  link("grid-vip","🟢 Грид-копитрейд"),
  link("boards","📊 Доски"),
  link("continuityos","🧠 ContinuityOS"),
  '<span class="sa-sep"></span>',
  link("bitevo","🤖 BitEvo"),
  link("crypto-guides","📚 Crypto Guides"),
  link("channel","✈️ Канал"),
  link("contact","🔒 @BiTFormer"),
].join("")}</div></div></nav>`;

const footer = `<footer class="sa-footer"><div class="sa-foot-in"><div class="sa-eco-row">${[
  '<a href="/">🏁 Sovereign Arena</a>',
  link("bitevo","🤖 BitEvo"),
  link("crypto-guides","📚 Crypto Guides"),
  link("arb-radar","⚖️ Арб-радар"),
  link("grid-vip","🟢 Грид-копитрейд"),
  link("guide","🗺️ Путеводитель"),
  link("pulse","📟 Pulse"),
  link("grids","🟢 Грид"),
  link("continuityos","🧠 ContinuityOS"),
  link("channel","✈️ @BitmasterTm"),
  link("contact","🔒 @BiTFormer"),
].join("")}</div><div class="sa-disc">Sovereign Arena · BitEvo · paper/research evidence lab · can_trade=false · capital_permission=DENY · not financial advice</div></div></footer>`;

const intakeUrl = "https://bitevoagentsite.vercel.app/audit-intake";
const canonicalAudit = "https://bitevoagentsite.vercel.app/agent-authority-audit";
const channelUrl = byId.get("channel").href;

for (const name of (await readdir(siteDir)).filter((name) => name.endsWith(".html"))) {
  const file = path.join(siteDir, name);
  let html = await readFile(file, "utf8");

  html = html.replace(/<nav class="sa-topnav">[\s\S]*?<\/nav>/, nav);
  html = html.replace(/<footer class="sa-footer">[\s\S]*?<\/footer>/, footer);
  html = html.replaceAll("https://bitevoagentsite.vercel.app/intake", intakeUrl);
  html = html.replaceAll("Operator Decision Sprint", "Agent Authority & Evidence Audit");
  html = html.replaceAll("Agent Authority & Evidence Audit · prepare brief →", "Agent Authority & Evidence Audit · prepare scope →");
  html = html.replaceAll("Client-only brief builder; no submission backend was verified", "Local scope builder; testing authorization remains NOT GRANTED");
  html = html.replaceAll("https://t.me/bitai1_bot", channelUrl);
  html = html.replaceAll("@bitai1_bot", "@BitmasterTm");
  html = html.replaceAll("✈️ Telegram", "✈️ Канал");

  if (name === "guide.html") {
    html = html.replace(
      "94 гайда · snapshot 2026-07-02",
      "Crypto Guides · restored corpus under review",
    );
    html = html.replace(
      "Грид-торговля по шагам",
      "Грид-исследование · paper-only",
    );
  }

  if (name === "ai-audit.html") {
    html = html.replaceAll("Prepare intake brief →", "Open canonical BitEvo audit scope →");
    html = html.replaceAll("Prepare brief →", "Open canonical BitEvo audit scope →");
    html = html.replace(
      '<h1>AI-Agent Reliability Audit</h1>',
      `<h1>AI-Agent Reliability Audit · historical Arena surface</h1><p class="sub">Current commercial authority: <a href="${canonicalAudit}" target="_blank" rel="noopener">BitEvo Agent Authority & Evidence Audit</a>. This Arena page preserves a bounded historical incident/research view.</p>`,
    );
  }

  await writeFile(file, html, "utf8");
}

console.log(JSON.stringify({
  result: "PASS",
  overlay: "R-next-local-1",
  registry_entries: registry.entries.length,
  canonical_audit: canonicalAudit,
  intake: intakeUrl,
  channel: channelUrl,
  can_trade: false,
  capital_permission: "DENY"
}, null, 2));
