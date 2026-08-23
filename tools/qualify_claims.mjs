import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const intakeUrl = "https://bitevoagentsite.vercel.app/intake";

function replaceQualified(text, from, to, label) {
  if (text.includes(from)) return text.split(from).join(to);
  if (text.includes(to)) return text;
  const fromCrlf = from.replaceAll("\n", "\r\n");
  const toCrlf = to.replaceAll("\n", "\r\n");
  if (text.includes(fromCrlf)) return text.split(fromCrlf).join(toCrlf);
  if (text.includes(toCrlf)) return text;
  throw new Error(`Expected current or qualified text not found for ${label}`);
}

export function qualifyClaimsByFile(file, input) {
  let html = input;

  if (file === "guide.html") {
    html = replaceQualified(
      html,
      'content="Карта экосистемы: живая торговая арена, battles, ContinuityOS, гайды, Inner Circle. Куда идти за чем и как этим пользоваться."',
      'content="Карта экосистемы: датированный paper-research snapshot, reference products and links. Текущая live-телеметрия не заявляется."',
      "guide meta live claim",
    );
    html = replaceQualified(
      html,
      "Battle of AI: 10+ моделей соревнуются на одинаковых данных, решения в hash-chain — не подделать задним числом. Battle of Traders: торгуешь paper-BTC против ботов и ИИ, лидерборд общий.",
      "Battle of AI: production artifact содержит нереконсилированные roster claims (6 и 10+); exact/current model count не подтверждён. Paper-соревнование описано как STATIC_DEMO; hash-chain claim этим site candidate не перепроверялся.",
      "guide Battle model count",
    );
  }

  if (file === "index.html") {
    html = replaceQualified(
      html,
      "6 ИИ-оркестраторов (Claude 4.8, GPT-5.5, Gemini, Hermes, GLM 5.2, Sakana) соревнуются на paper-торговле. Нейтральный hash-chain ledger — честность криптографически.",
      "Roster claim из artifact snapshot перечислял 6 ИИ-оркестраторов, тогда как другие страницы заявляли 10+; exact/current count не подтверждён. Paper roster и hash-chain claim этим candidate не перепроверялись.",
      "index Battle roster contradiction",
    );
    html = replaceQualified(
      html,
      "ML и regime-фильтр TradingView-вебхуков. Блокирует входы против режима. 100 событий бесплатно, 15 долларов в месяц unlimited.",
      "Исторический offer claim из artifact snapshot: 100 событий / 15 долларов. Pricing, capacity и webhook behavior не подтверждены; ссылка помечена LIVE_DEGRADED.",
      "Gatekeeper pricing claim",
    );
    html = replaceQualified(
      html,
      "Бесплатные прогноз-рынки: какой бот выиграет неделю? Очки, не деньги.",
      "Paper prediction-game description из artifact snapshot; free/current availability не подтверждена. Очки, не деньги; capital effect запрещён.",
      "DUST availability claim",
    );
    html = replaceQualified(
      html,
      "Копитрейд-лента: сигналы валидированных ботов открыто, реальные коллы для VIP.",
      "Historical copy-feed description; current signals, VIP access и conversion не подтверждены. Квалифицирован только LIVE_DEGRADED endpoint.",
      "Sovereign Copy live claim",
    );
    html = replaceQualified(
      html,
      "Risk-intelligence ежедневно: режим, funding, Fear and Greed. Telegram-алерты.",
      "Artifact snapshot описывал daily risk-intelligence и Telegram alerts; текущая cadence, freshness и доставка не подтверждены.",
      "Risk Desk cadence claim",
    );
    html = replaceQualified(
      html,
      "A/B-лаборатория грид-стратегий: 3 плотности, hedge-short, 4 защиты.",
      "Artifact snapshot заявлял 3 плотности и 4 защиты; counts не перепроверены. Surface PAPER_ONLY, execution запрещён.",
      "Grid Lab count claim",
    );
    html = replaceQualified(
      html,
      '<span class="cta">299/мес →</span>',
      '<span class="cta">Offer snapshot · verify scope →</span>',
      "Inner Circle price CTA",
    );
    html = replaceQualified(
      html,
      "Флагман: production AI-агенты безопасны за 72 часа. Бесплатный авто-триаж по 7 классам отказов + self-check.",
      "STATIC_DEMO service description. Historical 72h/free offer claims не подтверждены; доступен client-only intake brief без submission backend.",
      "AI Audit offer claim on index",
    );
    html = replaceQualified(
      html,
      '<a class="btn btn-ghost" href="https://t.me/bitai1_bot" target="_blank">🤖 Telegram</a>',
      '<a class="btn btn-ghost" href="https://t.me/bitai1_bot" target="_blank" rel="noopener" data-r51-link-status="LIVE_DEGRADED" title="Landing reachability only; bot workflow not verified">LIVE_DEGRADED · Telegram landing</a>',
      "index Telegram CTA",
    );
  }

  if (file === "boards.html") {
    html = replaceQualified(
      html,
      "Paper-лига (snapshot) 150+ ботов.</b> Каждый бот = стратегия×конфиг, торгует paper на данных Binance в snapshot. PnL эпохи = realized закрытых сделок с 24.06 06:05 UTC (канон, совпадает с HUB). Гонка = топ-15 по PnL. Красное ≠ сломано: лаборатория измеряет и слабых — их убивает еженедельный вердикт, выживших изучаем.",
      "Artifact catalog заявлял 150+ configurations в snapshot 2026-07-03.</b> Exact/current roster не перепроверен. Описание PnL window, top-15 и weekly verdict сохранено как historical context, не как fresh panel data.",
      "boards league count and freshness",
    );
    html = replaceQualified(
      html,
      "Paper-BTC симулятор (:8093): открой позицию, попади в лидерборд против ботов и ИИ. Пока 1 сделка — заходи первым.",
      "Paper-BTC simulator description из snapshot. Artifact заявлял 1 paper trade на 2026-07-03; current count и write-path не проверены.",
      "boards one-trade claim",
    );
    html = replaceQualified(
      html,
      "ИИ (10 оркестраторов) × Люди (симулятор) × Market-neutral эджи — кто делает деньги честнее. Витрина для зрителей.",
      "AI roster claim 10 из snapshot конфликтовал с count 6 на другой странице; exact/current count не подтверждён. Три paper/reference tracks сохранены как historical catalog.",
      "boards model roster contradiction",
    );
    html = replaceQualified(
      html,
      "v900-гриды = 100% WR ячейки грида в спокойных режимах.",
      "100% WR было historical cell label из artifact snapshot, не текущий и не перепроверенный performance claim.",
      "boards grid WR claim",
    );
    html = replaceQualified(
      html,
      "Реальные сделки Robert vs что сделали бы rule-based эджи на тех же входах. Discipline gap = сколько стоит отклонение от правил. Пусто = реальных сделок не залогировано (shadow_account.py log).",
      "Historical description сравнения manual decisions и rule-based reference. Current shadow-account log, counts и freshness не проверены; эта страница ничего не записывает.",
      "boards shadow-account claim",
    );
    html = replaceQualified(
      html,
      "Главный урок здесь: высокий WR при перекошенном R:R = минус (ловушка 74.9%).",
      "Главный методологический урок: высокий WR при перекошенном R:R может быть убыточным. 74.9% было historical example label и не перепроверено как current KPI.",
      "boards 74.9 claim",
    );
  }

  if (file === "ai-audit.html") {
    html = replaceQualified(
      html,
      "<title>AI-Agent Reliability Audit — production-агенты безопасны за 72ч | Sovereign Arena</title>",
      "<title>AI-Agent Reliability Audit — static reference and dated incident case | Sovereign Arena</title>",
      "AI Audit title",
    );
    html = replaceQualified(
      html,
      'content="Триаж production AI-агентов по 7 классам отказов за 72 часа. Живой кейс: тихая деградация, найденная за час. Бесплатный первый прогон."',
      'content="STATIC_DEMO: описание audit format и датированный incident case 2026-07-21. Pricing, 72h SLA и conversion не подтверждены."',
      "AI Audit meta offer",
    );
    html = replaceQualified(
      html,
      "Твой production-агент выглядит рабочим — а данные протухли 3 дня назад и никто не заметил. Мы находим такое за часы, а не когда это стоит денег. Триаж по 7 классам отказов за 72 часа.",
      "STATIC_DEMO audit format и датированный incident case. Historical claims про 72h, pricing и Telegram conversion не являются текущим оффером; доступен client-only intake brief.",
      "AI Audit hero offer",
    );
    html = replaceQualified(
      html,
      "<div><b>72ч</b><span>до отчёта</span></div>",
      "<div><b>72ч*</b><span>historical target · unverified</span></div>",
      "AI Audit 72h metric",
    );
    html = replaceQualified(
      html,
      "<div><b>$0</b><span>первый триаж</span></div>",
      "<div><b>UNVERIFIED</b><span>historical pricing claim</span></div>",
      "AI Audit zero-price metric",
    );
    html = replaceQualified(
      html,
      '<a class="btn btn-main" href="https://t.me/bitai1_bot" target="_blank">Проверить моего агента →</a>',
      `<a class="btn btn-main" href="${intakeUrl}" target="_blank" rel="noopener" data-cta-status="STATIC_DEMO">Prepare intake brief →</a>`,
      "AI Audit hero CTA",
    );
    html = replaceQualified(
      html,
      "Бесплатный триаж покажет, что горит.",
      "Client-only intake brief поможет структурировать проверку; submission backend не подтверждён.",
      "AI Audit score medium copy",
    );
    html = replaceQualified(
      html,
      "Начни с бесплатного триажа.",
      "Начни с client-only intake brief; submission backend не подтверждён.",
      "AI Audit score high copy",
    );
    html = replaceQualified(
      html,
      '\'<a class="btn btn-main" href="https://t.me/bitai1_bot" target="_blank">Запросить бесплатный триаж →</a>\';',
      `'<a class="btn btn-main" href="${intakeUrl}" target="_blank" rel="noopener" data-cta-status="STATIC_DEMO">Prepare intake brief →</a>';`,
      "AI Audit generated CTA",
    );
    html = replaceQualified(
      html,
      '<div class="tier free"><div>Первый триаж</div><div class="amt">$0 · 72ч</div><p style="color:#b9d4e8;font-size:14px">Авто-триаж по 7 классам + короткий отчёт с P0-находками. Без обязательств.</p><a class="btn btn-main" href="https://t.me/bitai1_bot" target="_blank" style="margin-top:6px">Запросить →</a></div>',
      `<div class="tier free"><div>Historical offer snapshot</div><div class="amt">UNVERIFIED</div><p style="color:#b9d4e8;font-size:14px">Production artifact заявлял $0 / 72h; pricing, SLA и delivery не подтверждены. Intake — client-only brief builder.</p><a class="btn btn-main" href="${intakeUrl}" target="_blank" rel="noopener" data-cta-status="STATIC_DEMO" style="margin-top:6px">Prepare brief →</a></div>`,
      "AI Audit free tier",
    );
    html = replaceQualified(
      html,
      '<div class="tier"><div>Deep Audit</div><div class="amt">от $1.5k</div><p style="color:#b9d4e8;font-size:14px">Ручной разбор находок, воспроизведение, threat-model, план ремедиации и повторная проверка.</p><a class="btn btn-ghost" href="https://t.me/bitai1_bot" target="_blank" style="margin-top:6px">Обсудить →</a></div>',
      `<div class="tier"><div>Deep Audit · historical offer snapshot</div><div class="amt">UNVERIFIED</div><p style="color:#b9d4e8;font-size:14px">Artifact заявлял pricing от $1.5k; current scope, price и availability не подтверждены.</p><a class="btn btn-ghost" href="${intakeUrl}" target="_blank" rel="noopener" data-cta-status="STATIC_DEMO" style="margin-top:6px">Prepare brief →</a></div>`,
      "AI Audit paid tier",
    );
  }

  if (file === "pulse.html") {
    html = replaceQualified(
      html,
      `const schemaValid = required.every((key) => Object.prototype.hasOwnProperty.call(data, key))
    && data.schema_version === "arena.pulse.status.v1"
    && data.status === "DATA_UNAVAILABLE"
    && data.classification === "LIVE_DEGRADED"
    && data.metrics === null;`,
      `const schemaValid = required.every((key) => Object.prototype.hasOwnProperty.call(data, key))
    && data.schema_version === "arena.pulse.status.v1"
    && data.status === "DATA_UNAVAILABLE"
    && data.classification === "LIVE_DEGRADED"
    && typeof data.source === "object"
    && data.source !== null
    && data.source.id === "sovereign-arena-pulse-status-evidence"
    && data.source.endpoint === "/pulse-status.json"
    && data.source.availability === "AVAILABLE"
    && data.source.evidence_http === 200
    && data.source.failed_predecessor_endpoint === "/api/pulse"
    && data.source.failed_predecessor_observation === "HTTP_404"
    && typeof data.observed_at === "string"
    && !Number.isNaN(Date.parse(data.observed_at))
    && data.producer_heartbeat === null
    && data.freshness === "UNAVAILABLE"
    && data.metrics === null
    && typeof data.reason === "string"
    && data.reason.trim().length > 0
    && data.can_trade === false
    && data.capital_permission === "DENY";`,
      "Pulse browser schema validation",
    );
  }

  return html;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (fileURLToPath(import.meta.url) === invokedPath) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const siteDir = path.join(root, "site");
  const files = [
    "index.html",
    "ai-audit.html",
    "boards.html",
    "guide.html",
    "pulse.html",
  ];
  for (const file of files) {
    const filePath = path.join(siteDir, file);
    const html = await readFile(filePath, "utf8");
    await writeFile(filePath, qualifyClaimsByFile(file, html), "utf8");
  }
  console.log(JSON.stringify({ qualified_files: files }, null, 2));
}
