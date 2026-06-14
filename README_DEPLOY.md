# Sovereign Arena — сайт (Astro, vercel-ready)

## Что это
Лендинг лаборатории: hero + live-статы (тянутся из Edge API), 6 сервисов с ценами, honest-дисклеймер. Один файл-страница: `src/pages/index.astro`.

`vercel.json` проксирует:
- `https://<домен>/api/*` → `http://34.70.171.152:8091/api/*` (Edge API получает HTTPS бесплатно)
- `https://<домен>/gate/*` → `http://34.70.171.152:8092/*` (Gatekeeper)

Сборку выполняет Vercel сам (`npm install && astro build`) — локально ничего билдить не нужно.

## Деплой (2 пути)

### Путь A — через GitHub (рекомендую)
1. Создай репо `sovereign-arena-site` на GitHub
2. Дай мне fine-grained token с правом push в этот репо (Settings → Developer settings → Tokens) — я залью код
3. Vercel → Add New Project → Import из GitHub → фреймворк определится сам (Astro) → Deploy
4. Домен: Vercel → Project → Settings → Domains (купить там же или подключить свой)

### Путь B — без GitHub
1. Vercel CLI: дай мне Vercel token (vercel.com/account/tokens) — задеплою напрямую `npx vercel deploy --prod`

## После деплоя
- Заменить в `src/pages/index.astro` и в Grafana Services Hub голые IP-ссылки на домен
- Поддомен `show.<домен>` → A-запись на 34.70.171.152 + nginx+certbot на VPS → HTTPS для Grafana (сделаю по сигналу)
- `EDGE_ADMIN_TOKEN` сменить перед реальными продажами ключей

## Структура
```
site/
├── package.json        # astro ^4
├── astro.config.mjs
├── vercel.json         # API-прокси
└── src/pages/index.astro
```
