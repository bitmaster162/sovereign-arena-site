import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { qualifyClaimsByFile } from "./qualify_claims.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteDir = path.join(root, "site");
const sourceDeployment = "dpl_HvHdXyfam6V82vihvfc9X3DEbDzk";
const qualificationTime = "2026-07-29T10:04:34Z";
const intakeUrl = "https://bitevoagentsite.vercel.app/intake";
const continuitySource = "https://github.com/bitmaster162/continuityos";

const routes = {
  "index.html": {
    status: "STATIC_DEMO",
    summary:
      "Каталог и числовые claims — опубликованный snapshot 2026-07-22. Эта страница не является live-телеметрией.",
  },
  "ai-audit.html": {
    status: "STATIC_DEMO",
    summary:
      "Описание услуги и датированный incident case. Текущую доступность Arena или ботов страница не утверждает.",
  },
  "boards.html": {
    status: "LIVE_DEGRADED",
    summary:
      "DuckDNS/Grafana endpoints и definitions отвечают, но freshness panel data не подтверждена. Все ссылки явно помечены degraded.",
  },
  "continuityos.html": {
    status: "STATIC_DEMO",
    summary:
      "Обзор продукта. Registry-install не квалифицирован; доступен только проверяемый GitHub source path.",
  },
  "grids.html": {
    status: "PAPER_ONLY",
    summary:
      "Учебный paper-сценарий. can_trade=false; capital_permission=DENY; ордера и ключи не используются.",
  },
  "guide.html": {
    status: "STATIC_DEMO",
    summary:
      "Карта продуктов — датированный snapshot. Счётчики не обновляются на этой странице.",
  },
  "pulse.html": {
    status: "LIVE_DEGRADED",
    summary:
      "Read-only Pulse producer не подтверждён. Страница показывает DATA_UNAVAILABLE вместо stale/fake-live значений.",
  },
  "research-log.html": {
    status: "PAPER_ONLY",
    summary:
      "Исторический research snapshot; текущего чтения arena_memento_reco нет, capital effect запрещён.",
  },
  "triage.html": {
    status: "STATIC_DEMO",
    summary:
      "Локальный browser-only self-check: ответы остаются во вкладке; backend и live data отсутствуют.",
  },
};

const truthCss = `<style id="r51-truth-css">
.r51-truth{border-bottom:1px solid #334155;background:#111827;color:#e5e7eb;font-family:Inter,"Space Grotesk",system-ui,sans-serif}
.r51-truth-in{max-width:1120px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.r51-status,.r51-link-state,.r51-card-state{display:inline-flex;align-items:center;border:1px solid currentColor;border-radius:999px;padding:3px 8px;font:700 11px/1.2 ui-monospace,SFMono-Regular,Consolas,monospace;letter-spacing:.04em;white-space:nowrap}
.r51-status{color:#fbbf24}.r51-truth-copy{flex:1;min-width:240px;color:#cbd5e1;font-size:13px}
.r51-truth-meta{color:#94a3b8;font-size:11px}
.r51-primary-cta{display:inline-flex;align-items:center;border-radius:8px;background:#22c55e;color:#04130a!important;padding:8px 12px;font-weight:800;font-size:13px;text-decoration:none!important}
.r51-link-state{color:#fbbf24;background:#422006;margin:2px 7px 2px 0}.r51-card-state{color:#fca5a5;background:#450a0a;margin:2px 7px 2px 0}
.r51-snapshot{max-width:1120px;margin:0 auto 18px;padding:12px 16px;border:1px solid #334155;border-radius:10px;background:#0f172a;color:#cbd5e1;font-size:13px}
.r51-policy{margin:24px 0;padding:20px;border:1px solid #f59e0b;border-radius:12px;background:#2a1b05;color:#fef3c7}
.r51-policy h2{margin-top:0}.r51-policy li{margin:8px 0}
.r51-offline-panel{max-width:960px;margin:36px auto;padding:20px;border:1px solid #7f1d1d;border-radius:12px;background:#260d12;color:#fecaca}
.r51-source-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px;margin:14px 0}
.r51-source-cell{border:1px solid #334155;border-radius:8px;padding:10px;background:#0f172a}
.r51-source-cell b{display:block;color:#e2e8f0}.r51-source-cell span{color:#94a3b8;font-size:12px}
@media(max-width:640px){.r51-truth-in{align-items:flex-start}.r51-primary-cta{width:100%;justify-content:center}.r51-truth-meta{width:100%}table{display:block;max-width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch}.r51-policy{padding:16px}body .install{max-width:100%;overflow-x:auto;flex-wrap:wrap}body .two{grid-template-columns:minmax(0,1fr)!important;max-width:100%;min-width:0}body .two>*{min-width:0}body pre{max-width:100%}}
</style>`;

function replaceAllRequired(text, from, to, label) {
  const count = text.split(from).length - 1;
  if (count === 0) {
    throw new Error(`Expected text not found for ${label}: ${from}`);
  }
  return text.split(from).join(to);
}

function replaceOptional(text, from, to) {
  return text.split(from).join(to);
}

function injectTruthBand(html, cfg) {
  if (html.includes('id="r51-truth-css"')) {
    throw new Error("Truth repair appears to have already been applied");
  }
  html = replaceAllRequired(
    html,
    "</head>",
    `${truthCss}</head>`,
    "truth stylesheet",
  );
  const navEnd = html.indexOf("</nav>");
  if (navEnd < 0) throw new Error("Navigation end not found");
  const band = `<section class="r51-truth" aria-label="Surface truth status" data-surface-status="${cfg.status}"><div class="r51-truth-in"><strong class="r51-status">${cfg.status}</strong><span class="r51-truth-copy">${cfg.summary}</span><span class="r51-truth-meta">source=${sourceDeployment} · observed=${qualificationTime}</span><a class="r51-primary-cta" href="${intakeUrl}" target="_blank" rel="noopener" data-cta-status="STATIC_DEMO" title="Client-only brief builder; no submission backend was verified">Operator Decision Sprint · prepare brief →</a></div></section>`;
  return `${html.slice(0, navEnd + 6)}${band}${html.slice(navEnd + 6)}`;
}

function qualifyArenaLinks(html) {
  return html.replace(
    /<a\b([^>]*?)href="https?:\/\/sovereign-arena\.duckdns\.org\/([^"]*)"([^>]*)>/gi,
    (_full, before, route, after) =>
      `<a${before}href="https://sovereign-arena.duckdns.org/${route}"${after} data-r51-link-status="LIVE_DEGRADED"><span class="r51-link-state">LIVE_DEGRADED</span>`,
  );
}

function applyGlobalTruthCopy(html) {
  const replacements = [
    ["Regime Radar live", "Regime Radar — LIVE_DEGRADED"],
    ["📟 Live Pulse", "📟 Pulse status"],
    ["Live League", "Paper League snapshot"],
    ["Живая лига", "Paper-лига (snapshot)"],
    ["live-данных Binance", "данных Binance в snapshot"],
    ["живых данных Binance", "данных Binance в snapshot"],
    ["ботов live 24/7", "ботов в опубликованном snapshot"],
    ["ботов live", "ботов в snapshot"],
    ["live-тикер сделок", "ticker snapshot сделок"],
    ["live-новости", "news snapshot"],
    ["Живая матрица", "Матрица snapshot"],
    ["Лаборатория стратегий live", "Лаборатория стратегий · STATIC snapshot"],
    [">live</a>", ">scanner endpoint</a>"],
  ];
  for (const [from, to] of replacements) html = replaceOptional(html, from, to);
  return html;
}

function repairIndex(html) {
  html = replaceAllRequired(
    html,
    'content="Прозрачная regime-aware лаборатория стратегий с публичными гонками ботов. 150+ ботов на live-данных Binance."',
    'content="Публичный paper-research snapshot Sovereign Arena. Текущая live-телеметрия не заявляется."',
    "index meta description",
  );
  html = replaceAllRequired(
    html,
    "150+ ботов на live-данных Binance, виртуальный капитал, все логи и поражения публичны.",
    "150+ конфигураций ботов — исторический paper snapshot 2026-07-22; текущая активность и свежесть здесь не подтверждаются.",
    "index hero live claim",
  );
  html = replaceAllRequired(
    html,
    "beta 0.1 · Edge Matrix · 8 live experiments · auto-verdict every 6h",
    "beta 0.1 · STATIC snapshot · 8 paper experiments · current verdict feed unavailable",
    "index experiment claim",
  );
  html = replaceAllRequired(html, "<b>81k+</b><span>paper-сделок в логе</span>", "<b>81k+*</b><span>paper-сделок · snapshot</span>", "81k count");
  html = replaceAllRequired(html, "<b>157</b><span>ботов live 24/7</span>", "<b>157*</b><span>конфигураций · snapshot</span>", "157 count");
  html = replaceAllRequired(html, "<b>90+</b><span>дней публичных логов</span>", "<b>90+*</b><span>дней логов · snapshot</span>", "90 day count");
  html = replaceAllRequired(html, "<b>5</b><span>режим-эджей в матрице</span>", "<b>5*</b><span>режим-эджей · snapshot</span>", "five edge count");
  html = replaceAllRequired(
    html,
    "</div> <div class=\"cta-row\">",
    '</div><div class="r51-snapshot"><b>* Count provenance:</b> значения перенесены из production artifact 2026-07-22 и не пересчитываются на этой странице. Они не являются текущей телеметрией.</div> <div class="cta-row">',
    "index snapshot provenance",
  );
  html = replaceOptional(
    html,
    "Рынок за 20 секунд: режим BTC, Fear and Greed, funding, OI, long/short, VPIN плюс KPI эпохи и live-новости.",
    "DuckDNS/Grafana endpoint отвечает, но panel-data freshness не подтверждена; режим, funding, OI и KPI не показываются как verified-fresh.",
  );
  html = replaceOptional(
    html,
    "Живая матрица что работает в каком режиме и 8 параллельных экспериментов с авто-вердиктом каждые 6 часов.",
    "Матрица и 8 paper-экспериментов сохранены как snapshot; текущий авто-вердикт не подключён.",
  );
  html = replaceOptional(
    html,
    "150+ ботов в публичной гонке: кто выживает, а не кто хайпит. Лидерборды Premier, Challenge, Lab, live-тикер сделок.",
    "150+ конфигураций в paper snapshot. Endpoint отвечает, но свежесть leaderboard/ticker не квалифицирована.",
  );
  html = replaceOptional(
    html,
    "46 000+ сделок, edge-матрица по режимам. JSON бесплатно, CSV-экспорт PRO 10 долларов в месяц.",
    "46 000+ — исторический snapshot. Endpoint /api/pricing отсутствует; API/CSV предложение сейчас OFFLINE.",
  );
  html = replaceOptional(
    html,
    '<a class="card" href="/api/pricing" target="_blank">',
    '<a class="card" href="/guide" data-r51-original-route="/api/pricing"><span class="r51-card-state">OFFLINE</span>',
  );
  html = replaceOptional(
    html,
    "93 карточки ботов:",
    "93 карточки (snapshot 2026-07-22):",
  );
  html = replaceOptional(
    html,
    '<a class="card" href="https://t.me/bitai1_bot" target="_blank"><h3>💎 Inner Circle</h3>',
    `<a class="card" href="${intakeUrl}" target="_blank" rel="noopener"><span class="r51-card-state">STATIC_DEMO</span><h3>💎 Inner Circle</h3>`,
  );
  html = replaceOptional(
    html,
    "Премиум TG-канал 299 долларов в месяц: ежедневный AI-разбор, Trend-Flex, Tilt Index, Delist EWS. 50 мест.",
    "Исторический offer snapshot: прежняя цена 299 долларов и count 50 мест не подтверждены как текущие. Актуальный scope — через Operator Decision Sprint.",
  );
  html = replaceOptional(
    html,
    "MCP-сервер (12 тулз), 18/18 тестов, gate 9/9. Уже на GitHub.",
    "Source repository доступен на GitHub; прежние counts 12 tools / 18 tests / 9 gates не перепроверялись этим site-кандидатом.",
  );
  html = replaceOptional(
    html,
    "150+ ботов это коррелированные вариации гипотез",
    "150+ конфигураций в snapshot — это коррелированные вариации гипотез",
  );
  return html;
}

function repairBoards(html) {
  html = replaceOptional(
    html,
    "Гайд · 18 досок · обновлено 2026-07-03",
    "Гайд · 18 досок в snapshot · каталог от 2026-07-03",
  );
  html = replaceOptional(
    html,
    "Пульт трейдера + навигатор.</b> Верх: живой контекст рынка",
    "Пульт трейдера + навигатор.</b> Описание market-context snapshot; текущие данные OFFLINE",
  );
  html = replaceOptional(
    html,
    "Каждый бот = стратегия×конфиг, торгует paper на данных Binance в snapshot.",
    "Каждый бот = стратегия×конфиг; здесь показано описание paper snapshot, текущая активность не подтверждена.",
  );
  html = replaceOptional(
    html,
    "C1 Claude живой; C2-C10 подключаются",
    "C1 Claude был отмечен active в snapshot 2026-07-03; текущий roster не проверен. C2-C10 были запланированы",
  );
  html = replaceOptional(
    html,
    "Лесенка лимиток в диапазоне: зарабатывает на боковике/волатильности, умирает на тренде без стопа.",
    "Paper-модель. Канон риска контекстный: spot inventory — loss budget + range exit; leveraged/derivatives — hard stop до входа. Полный канон на /grids.",
  );
  html = replaceOptional(
    html,
    "Сканер ~112 монет:",
    "Сканер ~112 монет в snapshot 2026-07-03:",
  );
  const panel = `<section id="dependency-status" class="r51-offline-panel"><h2>LIVE_DEGRADED — Arena dashboards</h2><p>Read-only qualification получила HTTP 200 от всех 18 public-dashboard URLs и реальные dashboard definitions от representative Grafana APIs. Но schema/source freshness panel data и heartbeat не квалифицированы. Ссылки доступны и явно помечены LIVE_DEGRADED; никакие данные не объявляются fresh.</p><p><b>can_trade=false · capital_permission=DENY</b></p></section>`;
  html = replaceAllRequired(html, "<footer ", `${panel}<footer `, "boards offline panel");
  return html;
}

function repairContinuity(html) {
  html = replaceAllRequired(
    html,
    '<div class="install" data-astro-cid-5qm3a57r><span data-astro-cid-5qm3a57r>$</span><code data-astro-cid-5qm3a57r>pip install continuityos</code></div>',
    `<div class="install" data-astro-cid-5qm3a57r><span data-astro-cid-5qm3a57r>source</span><code data-astro-cid-5qm3a57r>github.com/bitmaster162/continuityos</code></div>`,
    "ContinuityOS registry CTA",
  );
  html = replaceAllRequired(
    html,
    '<div class="cta-row" data-astro-cid-5qm3a57r> <a class="btn btn-main" href="#quickstart"',
    `<div class="cta-row" data-astro-cid-5qm3a57r> <a class="btn btn-main" href="${continuitySource}" target="_blank" rel="noopener" data-astro-cid-5qm3a57r>GitHub source →</a> <a class="btn btn-ghost" href="#quickstart"`,
    "ContinuityOS source CTA",
  );
  html = replaceOptional(
    html,
    "<h2 data-astro-cid-5qm3a57r>Quick start</h2>",
    '<h2 data-astro-cid-5qm3a57r>Source-first quick start</h2><p class="r51-snapshot">Package registry identity и install smoke не подтверждены в R51. Используйте проверяемый GitHub source/README; registry one-liner намеренно не рекламируется.</p>',
  );
  return html;
}

function repairGuide(html) {
  html = replaceOptional(
    html,
    "Sovereign Arena</b> (живая лаборатория: 150+ ботов торгуют paper 24/7 — форвард-пруф, не бэктест).",
    "Sovereign Arena</b> (paper research snapshot: 150+ конфигураций по состоянию на 2026-07-22; текущая активность не подтверждена).",
  );
  html = replaceOptional(html, "Живая арена и битвы", "Arena snapshot и paper-битвы");
  html = replaceOptional(
    html,
    "94 гайда по крипто-трейдингу",
    "94 гайда · snapshot 2026-07-02",
  );
  html = replaceOptional(
    html,
    "<code data-astro-cid-5tcejxga>pip install continuityos</code> · <a href=\"/continuityos\"",
    `<a href="${continuitySource}" target="_blank" rel="noopener" data-astro-cid-5tcejxga>GitHub source/README</a> · <a href="/continuityos"`,
  );
  html = replaceOptional(
    html,
    "150+ ботов на живых данных, paper-исполнение с реалистичными издержками.",
    "150+ конфигураций в paper snapshot 2026-07-22; current market feed не подтверждён.",
  );
  html = replaceOptional(
    html,
    '<code data-astro-cid-5tcejxga>pip install continuityos</code> → <code data-astro-cid-5tcejxga>cos remember "факт"</code> → <code data-astro-cid-5tcejxga>cos recall "вопрос"</code>',
    `<a href="${continuitySource}" target="_blank" rel="noopener" data-astro-cid-5tcejxga>Открой GitHub source/README</a>; registry install и CLI smoke этим кандидатом не квалифицированы`,
  );
  return html;
}

function repairGrids(html) {
  html = replaceOptional(
    html,
    'content="Как из арена-сканера получить готовый грид-сетап и запустить на бирже: выбор монет, диапазоны от волатильности, жёсткие правила риска."',
    'content="Paper-only reference по grid risk policy. Не является торговой инструкцией; can_trade=false."',
  );
  html = replaceOptional(
    html,
    "Как из арена-сканера получить готовый грид-сетап и запустить его на бирже. Без магии: живые цены, наши данные по ликвидности, жёсткие правила риска.",
    "Paper-only reference: исторический scanner snapshot и единый контекстный risk policy. Текущие цены/ликвидность не подключены; запуск ордеров запрещён.",
  );
  html = replaceOptional(
    html,
    "Главный риск — вылет цены из диапазона (особенно вниз), поэтому всегда стоит жёсткий стоп.",
    "Главный риск — выход из диапазона. Канон ниже различает unleveraged spot inventory и leveraged/derivatives; универсального правила «один стоп для всех» нет.",
  );
  html = replaceOptional(
    html,
    "~112 монет с метриками:",
    "~112 монет в snapshot 2026-07-02; current scanner OFFLINE. Исторические поля:",
  );
  html = replaceOptional(
    html,
    "Тул тянет живую цену и волатильность, отдаёт блок",
    "Не включённый в этот candidate tool по историческому описанию должен был читать цену/волатильность и отдавать блок",
  );
  html = replaceOptional(
    html,
    "Отдельно ставишь <b data-astro-cid-5uz45h3a>HARD STOP</b> из сетапа.",
    "Risk control выбирается по контекстному канону ниже; этот paper guide не создаёт ордер.",
  );
  const policy = `<section class="r51-policy" id="canonical-grid-risk-policy"><h2>5 · Канонический contextual risk policy</h2><p><b>Общий gate:</b> эта поверхность PAPER_ONLY; can_trade=false; capital_permission=DENY. План не является разрешением на ордер.</p><ul><li><b>Unleveraged spot inventory:</b> заранее фиксируются loss budget, нижняя граница диапазона и manual/kill-switch exit. Механический stop внутри normal grid range не обязателен, но выход по бюджету/границе обязателен.</li><li><b>Leveraged, margin, futures или short inventory:</b> hard stop и max-loss должны быть заданы до входа. Без атомарно enforceable stop исполнение <b>OFFLINE</b>.</li><li><b>Любой контекст:</b> отсутствие подтверждённых свежих price/liquidity/DRS данных блокирует setup. Никаких API keys, orders или auto-execution в R51.</li></ul></section>`;
  html = html.replace(
    /<div class="warn"[^>]*>\s*<h3[^>]*>5 · Правила риска — не нарушать<\/h3>.*?<\/ul>\s*<\/div>/s,
    policy,
  );
  if (!html.includes('id="canonical-grid-risk-policy"')) {
    throw new Error("Grid policy section was not replaced");
  }
  html = replaceOptional(
    html,
    "Цены живые — прогоняй тул перед каждым запуском.",
    "STATIC_DEMO: цены ниже — исторические примеры и не должны использоваться для ордера.",
  );
  html = replaceOptional(
    html,
    "Следующий шаг — executor-бот: читает уровни и сам перевыставляет ордера через API (ключи держишь ты). Это привязка «арена → реальная торговля»: арена валидирует эдж paper-ботами, executor исполняет.",
    "Executor и биржевые API находятся вне этого candidate и имеют статус OFFLINE. R51 не читает ключи, не создаёт ордера и не даёт capital permission.",
  );
  return html;
}

function repairPulse(html) {
  html = replaceOptional(html, "Sovereign Arena — Live Pulse", "Sovereign Arena — Pulse data status");
  html = replaceOptional(html, "🛰 SOVEREIGN ARENA — LIVE PULSE", "🛰 SOVEREIGN ARENA — PULSE DATA STATUS");
  const pulseScript = `<script type="module">
const required = ["schema_version","status","classification","source","observed_at","producer_heartbeat","freshness","metrics"];
const target = document.getElementById("upd");
const setUnavailable = (reason, schemaState = "invalid") => {
  target.textContent = "DATA_UNAVAILABLE · LIVE_DEGRADED";
  const truth = document.getElementById("pulse-truth");
  truth.dataset.schemaValid = schemaState;
  truth.querySelector("[data-reason]").textContent = reason;
  document.getElementById("market").innerHTML = '<div class="card"><b>—</b><span>market metrics unavailable</span></div>';
  document.getElementById("epoch").innerHTML = '<div class="card"><b>—</b><span>paper metrics unavailable</span></div>';
  document.querySelector("#exps tbody").innerHTML = '<tr><td colspan="4">DATA_UNAVAILABLE — no experiment telemetry</td></tr>';
  document.querySelector("#edges tbody").innerHTML = '<tr><td colspan="5">DATA_UNAVAILABLE — no edge telemetry</td></tr>';
  document.getElementById("fleet").textContent = "DATA_UNAVAILABLE — no fleet heartbeat";
};
try {
  const response = await fetch("/pulse-status.json", { cache: "no-store" });
  if (!response.ok) throw new Error("status document HTTP " + response.status);
  const data = await response.json();
  const schemaValid = required.every((key) => Object.prototype.hasOwnProperty.call(data, key))
    && data.schema_version === "arena.pulse.status.v1"
    && data.status === "DATA_UNAVAILABLE"
    && data.classification === "LIVE_DEGRADED"
    && data.metrics === null;
  if (!schemaValid) throw new Error("arena.pulse.status.v1 schema mismatch");
  document.querySelector("[data-source]").textContent = data.source.id + " · " + data.source.endpoint;
  document.querySelector("[data-observed]").textContent = data.observed_at;
  document.querySelector("[data-heartbeat]").textContent = data.producer_heartbeat ?? "UNAVAILABLE";
  document.querySelector("[data-freshness]").textContent = data.freshness;
  setUnavailable(data.reason, "true");
} catch (error) {
  setUnavailable("Status evidence failed: " + error.message, "false");
}
</script>`;
  const before = html;
  html = html.replace(
    /<script type="module">(?:(?!<\/script>)[\s\S])*fetch\("\/api\/pulse"(?:(?!<\/script>)[\s\S])*<\/script>/,
    pulseScript,
  );
  if (html === before || html.includes('fetch("/api/pulse"')) {
    throw new Error("Broken /api/pulse script was not removed");
  }
  const panel = `<section id="pulse-truth" class="r51-snapshot" data-schema-valid="pending"><strong>DATA_UNAVAILABLE</strong><div class="r51-source-grid"><div class="r51-source-cell"><b>Source identity</b><span data-source>loading status evidence…</span></div><div class="r51-source-cell"><b>Evidence observed_at</b><span data-observed>loading…</span></div><div class="r51-source-cell"><b>Producer heartbeat</b><span data-heartbeat>UNAVAILABLE</span></div><div class="r51-source-cell"><b>Freshness</b><span data-freshness>UNAVAILABLE</span></div></div><p data-reason>No telemetry is rendered before schema validation.</p></section>`;
  html = replaceAllRequired(
    html,
    '<div class="upd" id="upd" data-astro-cid-oxi3sj7z>загрузка…</div>',
    `<div class="upd" id="upd" data-astro-cid-oxi3sj7z>loading status evidence…</div>${panel}`,
    "Pulse truth panel",
  );
  html = replaceOptional(
    html,
    "Авто-обновление каждые 30с",
    "No auto-refresh · status evidence is loaded once",
  );
  html = replaceOptional(
    html,
    '>Grafana Hub</a>',
    '>Arena dashboard status</a>',
  );
  return html;
}

function repairResearch(html) {
  html = replaceOptional(
    html,
    "📡 Данные подтягиваются из <code>arena_memento_reco</code> (снимок обновляется каждый прогон). Значения выше — единственные OOS-подтверждённые классы на сегодня; остальное живёт в <a href=\"/\">Edge Matrix</a>.",
    "📦 STATIC snapshot из production artifact 2026-07-22. Эта страница не читает <code>arena_memento_reco</code>; heartbeat и текущие OOS-значения недоступны. Остальное — в paper-каталоге <a href=\"/\">Edge Matrix</a>.",
  );
  return html;
}

function repairAiAudit(html) {
  html = replaceOptional(
    html,
    "Живой кейс ниже",
    "Датированный кейс ниже",
  );
  html = replaceOptional(
    html,
    "Живой кейс — мы едим свою еду",
    "Датированный incident case — 2026-07-21",
  );
  html = replaceOptional(
    html,
    "Реальный инцидент на нашей же production-системе (арена, 150+ автономных ботов), 2026-07-21. Не гипотеза.",
    "Incident record от 2026-07-21 описывает production-систему и исторический count 150+; это не текущая live-проверка.",
  );
  return html;
}

const outputs = [];
for (const [file, cfg] of Object.entries(routes)) {
  const filePath = path.join(siteDir, file);
  let html = await readFile(filePath, "utf8");
  if (file === "index.html") html = repairIndex(html);
  if (file === "boards.html") html = repairBoards(html);
  if (file === "continuityos.html") html = repairContinuity(html);
  if (file === "guide.html") html = repairGuide(html);
  if (file === "grids.html") html = repairGrids(html);
  if (file === "pulse.html") html = repairPulse(html);
  if (file === "research-log.html") html = repairResearch(html);
  if (file === "ai-audit.html") html = repairAiAudit(html);
  html = applyGlobalTruthCopy(html);
  html = qualifyArenaLinks(html);
  html = injectTruthBand(html, cfg);
  html = qualifyClaimsByFile(file, html);
  outputs.push([filePath, html]);
}

for (const [filePath, html] of outputs) {
  await writeFile(filePath, html, "utf8");
}

console.log(
  JSON.stringify(
    {
      work_order: "CODEX04-R51-SOVEREIGN-ARENA-TRUTH-REPAIR",
      source_deployment: sourceDeployment,
      qualification_time: qualificationTime,
      repaired_routes: Object.keys(routes),
      can_trade: false,
      capital_permission: "DENY",
    },
    null,
    2,
  ),
);
