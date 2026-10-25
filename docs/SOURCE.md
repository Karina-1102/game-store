# Полный исходный код обновлённого существующего проекта

Исправления админки и запуска описаны в docs/ADMIN-UPDATE.md. Все текстовые исходники включены полностью. WEBP приведены в Base64; готовые изображения находятся в архиве. Runtime файлы, .env, пользовательские загрузки и node_modules не включаются. Этот документ не воспроизводит сам себя.

```text
game-store/
├── app
│   ├── 404
│   │   └── page.tsx
│   ├── [[...path]]
│   │   └── page.tsx
│   ├── api
│   │   └── [...path]
│   │       └── route.ts
│   ├── setup
│   │   └── page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components
│   ├── admin.tsx
│   ├── catalog-editor.tsx
│   ├── setup-form.tsx
│   ├── store.tsx
│   └── ui.tsx
├── docs
│   ├── ADMIN-UPDATE.md
│   ├── API.md
│   ├── SOURCE.md
│   ├── TREE.txt
│   └── VERIFICATION.md
├── lib
│   ├── catalog.ts
│   ├── client-id.ts
│   ├── db.ts
│   ├── mail.ts
│   ├── money.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── security.ts
│   ├── settings.ts
│   ├── slug.ts
│   ├── storage.ts
│   └── validation.ts
├── prisma
│   ├── migrations
│   │   ├── 20261014000000_init
│   │   │   └── migration.sql
│   │   ├── 20261014010000_store_settings
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── assets
│   │   ├── roblox.webp
│   │   ├── standoff-2.webp
│   │   ├── telegram.webp
│   │   └── warface.webp
│   └── uploads
│       └── .gitkeep
├── scripts
│   ├── create-admin.ts
│   ├── dev.mjs
│   └── maintenance.ts
├── tests
│   ├── admin-ui.tsx
│   ├── integration.ts
│   ├── routes.ts
│   └── security.test.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── AGENTS.md
├── Dockerfile
├── README.md
├── docker-compose.yml
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
└── tsconfig.json
```

## FILE:
/workspace/game-store/.dockerignore

Тип: text (.dockerignore)

```text
node_modules
.next
.env
.env.*
!.env.example
.git
public/uploads/*
*.tsbuildinfo
docs
```

## FILE:
/workspace/game-store/.env.example

Тип: dotenv (.example)

```dotenv
DATABASE_URL=postgresql://store:change-me@localhost:5432/game_store?schema=public
POSTGRES_USER=store
POSTGRES_PASSWORD=change-me
POSTGRES_DB=game_store
AUTH_SECRET=
APP_URL=http://localhost:3000
PAYMENT_PROVIDER=stripe
PAYMENT_MODE=test
PAYMENT_SECRET_KEY=
PAYMENT_PUBLIC_KEY=
PAYMENT_WEBHOOK_SECRET=
STORE_CURRENCY=rub
STORE_NAME=NEXUS
LEGAL_NAME=
LEGAL_ADDRESS=
SUPPORT_EMAIL=
LEGAL_APPROVED=false
STORAGE_PROVIDER=local
S3_ENDPOINT=
S3_REGION=auto
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_PUBLIC_URL=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
TRUST_PROXY=false
```

## FILE:
/workspace/game-store/.gitignore

Тип: text (.gitignore)

```text
node_modules/
.next/
.env
.env.*
!.env.example
public/uploads/*
!public/uploads/.gitkeep
*.tsbuildinfo
coverage/
```

## FILE:
/workspace/game-store/AGENTS.md

Тип: markdown (.md)

```markdown
<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
```

## FILE:
/workspace/game-store/Dockerfile

Тип: dockerfile (Dockerfile)

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN --mount=type=secret,id=proxy_ca NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca npm ci
COPY . .
RUN npm run build
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app .
RUN mkdir -p public/uploads && chown node:node public/uploads
USER node
EXPOSE 3000
CMD ["npm","start"]
```

## FILE:
/workspace/game-store/README.md

Тип: markdown (.md)

````markdown
# NEXUS — магазин цифровых игровых товаров

Полный исходный проект на Next.js 16, React 19, TypeScript, Tailwind CSS 4, PostgreSQL и Prisma 6. Серверная сессионная авторизация, роли USER/ADMIN, каталог из БД, серверный расчёт заказов, Stripe Checkout и проверяемый webhook. Выдача товара **ручная**, оператором после оплаты. Магазин не обходит правила игр и не использует неофициальные API выдачи.

## Требования и Node.js

Node.js 22 LTS (22.12 или новее), npm 10+, PostgreSQL 16+, Docker Engine с Compose v2 (для контейнерного запуска). Установите Node.js 22 с https://nodejs.org/en/download. Проверьте:

```bash
node --version
npm --version
docker --version
docker compose version
```

Все команды ниже выполняются из корня `game-store`.

## Как открыть магазин

1. Установите Node.js 22 LTS и Docker Desktop. Откройте Docker Desktop и дождитесь готовности.
2. Откройте терминал в папке `game-store`.
3. Установите зависимости:

```bash
npm install
```

4. Запустите магазин одной командой:

```bash
npm run dev
```

5. Откройте обычный браузер Chrome, Safari, Edge или Firefox и перейдите на **http://localhost:3000**.

Команда автоматически создаёт `.env`, генерирует уникальные секреты, проверяет PostgreSQL и при необходимости запускает её через Docker, применяет миграции, добавляет начальные товары и запускает сайт. В терминале появится **«Сайт запущен: http://localhost:3000»**. Никакие секреты не выводятся в терминал. При повторном запуске существующая `.env` и товары сохраняются. Если у вас уже настроена внешняя PostgreSQL, используется существующий `DATABASE_URL`, Docker для неё не запускается.

Если порт занят:

```bash
npm run dev -- --port 3001
```

Откройте http://localhost:3001. Остановить сайт: Ctrl+C. Чтобы снова открыть магазин, достаточно `npm run dev`; PostgreSQL и картинки остаются на диске.

## Первый вход в админку через браузер

При первом локальном запуске откройте **http://localhost:3000/setup**. Введите своё имя, email и придумайте пароль от 12 символов. Нажмите **«Создать администратора»** — откроется `/admin`. Готового общего пароля нет.

После создания первого администратора страница настройки закрывается. Обычная регистрация по-прежнему создаёт только покупателей. Эта функция работает исключительно в development, при запуске через `npm run dev` на loopback-адресе. В режиме доступа с телефона `--lan` и в production она отключена. Для уже существующей установки, где владелец зарегистрировался как USER, ниже сохранён безопасный способ выдачи ADMIN через серверную команду.

## Как добавить товар без кода

1. Войдите в **http://localhost:3000/admin**.
2. Откройте **Товары** → **+ Добавить товар**.
3. Введите название, например **1000 Gold**.
4. Выберите **Standoff 2**, категорию и количество игровой валюты.
5. Введите обычную цену **799** — в рублёвом магазине это **799 ₽**, а не 7,99 ₽. Копейки вводятся как **799,90** или **799.90**. При необходимости заполните старую цену.
6. Нажмите **Загрузить изображение**, выберите PNG/JPG/JPEG/WEBP из проводника компьютера или галереи телефона. После загрузки появится превью.
7. Заполните описание и инструкцию; оставьте **В наличии** и **Показывать покупателям**.
8. Нажмите **Сохранить товар**. Товар сохранится в PostgreSQL, появится в разделе игры и поиске и останется после перезапуска.

Напротив товара доступны **Редактировать**, **Скрыть / Показать**, **Удалить**. Для изменения 799 ₽ на 749 ₽ откройте редактирование, введите 749 и сохраните. Старые цены и валюты существующих товаров не пересчитываются автоматически. Для новой локальной установки валюта — RUB; у существующей установки сохраняется её `STORE_CURRENCY`, а поле цены показывает соответствующий знак валюты.

Адрес товара создаётся автоматически. Служебные ID и JSON вводить не требуется. Дополнительные настройки вариантов, остатка и полей получателя находятся в сворачиваемом блоке. Категорию можно создать прямо в форме товара.

## Как добавить игру

**Игры** → **+ Добавить игру** → название, описание, изображение, логотип, статус → **Сохранить игру**. Например, **PUBG Mobile** автоматически получает адрес `pubg-mobile`. Его можно задать вручную в поле «Адрес раздела (slug)». После сохранения игра доступна в каталоге и в выборе игры при добавлении товара. Список игр хранится в БД.

## Админка с телефона

Сначала создайте администратора на компьютере через обычный `npm run dev`. Затем остановите сайт и запустите:

```bash
npm run dev -- --lan
```

Компьютер и телефон должны быть в одной Wi-Fi сети. В терминале появится адрес вида **http://192.168.1.20:3000** — откройте именно его на телефоне. На телефоне `localhost` означает сам телефон. При необходимости разрешите Node.js доступ к локальной сети в firewall компьютера. В этом режиме первоначальное создание администратора отключено; войдите в уже созданный аккаунт. Формы, карточки товаров, загрузка из галереи, скрытие и просмотр заказа адаптированы под маленький экран.

## Установка обновления поверх существующего проекта

Сохраните вашу `.env`, `public/uploads` и резервную копию PostgreSQL. Обновите исходные файлы, не удаляя данные. Выполните `npm install`, затем `npm run dev`: новая миграция создаёт только таблицу настроек магазина и не удаляет существующие записи. В production выполните `npm run db:migrate` перед запуском новой сборки. Seed не перезаписывает ранее изменённые товары, цены и игры.

## PostgreSQL без Docker

Установите PostgreSQL 16 из https://www.postgresql.org/download/. Войдите в `psql` под владельцем сервера:

```sql
CREATE ROLE store WITH LOGIN PASSWORD 'replace-with-your-random-password';
CREATE DATABASE game_store OWNER store;
```

Укажите `DATABASE_URL=postgresql://store:ENCODED_PASSWORD@localhost:5432/game_store?schema=public`, выполните `npm run db:migrate` и `npm run db:seed`. SQL миграция находится в `prisma/migrations/20261014000000_init/migration.sql`. В production используйте `prisma migrate deploy`, а не `db push`. Включите TLS для внешнего подключения к БД.

## Выдача ADMIN существующему аккаунту (для уже настроенного сервера)

1. Зарегистрируйте собственный аккаунт на `/register`, используя уникальный пароль от 12 символов (до 72 байт UTF-8).
2. На сервере в интерактивном терминале выполните:

```bash
npm run admin:create -- --email owner@example.com
```

3. Введите тот же email в запросе подтверждения. Команда выдаёт существующему пользователю ADMIN и записывает действие в журнал; пароли не передаются в аргументах, предустановленного администратора нет.
4. Откройте `/admin`. Для контейнера:

```bash
docker compose exec app npm run admin:create -- --email owner@example.com
```

Роль проверяется сервером при каждом запросе. Заблокированные пользователи теряют сессии. Обычный USER не может читать admin API, обновлять цену или отмечать заказ оплаченным.

## Настройка Stripe

Stripe должен поддерживать страну регистрации вашей компании и вашу категорию деятельности. Укажите валюту `STORE_CURRENCY` (для новой установки `rub`, а существующая конфигурация сохраняется). Выбор валюты не является автоматическим обменом существующих цен. Интеграция использует Stripe Checkout, только оплату картой; реквизиты карт не обрабатываются магазином. Встроенные налоги и мультивалютность не включены: итоговая цена должна уже учитывать ваши обязательства. Для валют с отличной от двух десятичных знаков точностью требуется адаптация форматирования; используйте USD/EUR/RUB и проверяйте доступность валюты в вашем Stripe-аккаунте.

В Dashboard Stripe включите test mode, создайте тестовые API-ключи и заполните:

```dotenv
PAYMENT_PROVIDER=stripe
PAYMENT_MODE=test
PAYMENT_SECRET_KEY=sk_test_YOUR_KEY
PAYMENT_PUBLIC_KEY=pk_test_YOUR_KEY
PAYMENT_WEBHOOK_SECRET=whsec_YOUR_SECRET
APP_URL=http://localhost:3000
```

Публичный ключ зарезервирован для будущего встроенного Checkout; текущий hosted Checkout не требует отдавать его клиенту. TEST MODE — настоящий Stripe sandbox, а не локальная фейковая оплата. Тестовая карта: `4242 4242 4242 4242`, любая будущая дата и CVC. Для отказа используйте `4000 0000 0000 9995`. Подробные сценарии: https://docs.stripe.com/testing.

## Webhook

Установите Stripe CLI по https://docs.stripe.com/stripe-cli. Затем:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/payment --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired,charge.refunded,payment_intent.payment_failed
```

Скопируйте выданный CLI `whsec_...` в `.env` и перезапустите приложение. Webhook принимает необработанное тело, проверяет Stripe-Signature и livemode, привязывает событие к платежу и заказу, сравнивает сумму и валюту. Уникальный ID события и транзакция с блокировкой заказа обеспечивают идемпотентность и повторную доставку. Ошибки возвращают non-2xx, Stripe повторяет доставку. `/success` только читает статус. PAYMENT_FAILED применяется к окончательному отказу сессии; неуспешная попытка карты логируется и не мешает повторить оплату в том же Checkout.

Для production зарегистрируйте HTTPS endpoint `/api/webhooks/payment` в Stripe Dashboard → Developers → Webhooks и выберите перечисленные события. CLI secret и Dashboard secret различаются. Включите повторную доставку событий и мониторинг ошибок. Полный возврат вызывается в admin API через Stripe, а `REFUNDED` устанавливает только проверенный webhook. Частичные возвраты логируются, но заказ остаётся в текущем статусе: интерфейс магазина предназначен для полных возвратов.

## Production mode и законность продаж

```dotenv
PAYMENT_MODE=production
PAYMENT_SECRET_KEY=sk_live_YOUR_KEY
PAYMENT_PUBLIC_KEY=pk_live_YOUR_KEY
PAYMENT_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
APP_URL=https://shop.example.com
LEGAL_NAME=Your registered company
LEGAL_ADDRESS=Your registered address
SUPPORT_EMAIL=support@example.com
LEGAL_APPROVED=true
```

Перед включением `LEGAL_APPROVED` юрист должен утвердить документы `/terms`, `/privacy`, `/refunds` для вашей юрисдикции, сроки выдачи, согласие на исполнение цифрового заказа, налоги, возрастные ограничения и реквизиты. Тексты находятся в `components/store.tsx`; это явные шаблоны, а не юридическое заключение. Заполните инструкции каждого товара. Для каждой игры администратор указывает `saleAllowed` и основание (`permissionReference`): договор, ссылку на правила или иное подтверждение. Seed не утверждает, что продажа валют перечисленных игр разрешена. Production-заказ для неподтверждённой игры отклоняется.

## Админка

`/admin` содержит обзор заказов и выручки, игры, категории, товары, заказы, пользователей, поддержку, журнал действий и платёжные события. Фильтры заказов: ID/email/игра/товар, статус и диапазон дат; товаров: игра, публикация, остаток и цена. Денежные поля админки вводятся **обычной ценой**, например 799 или 749,90. В БД они по-прежнему хранятся целыми числами в копейках/центах. Изменения сохраняются в PostgreSQL без пересборки. Сохранение товара проверяет updatedAt, чтобы устаревшая форма не перезаписала резерв остатков; при конфликте обновите страницу. У каждой игры и товара динамические поля `text`, `number`, `select`, `checkbox`, обязательность и варианты выбора. Поля товара заменяют поля игры; пустой список наследует поля игры. Варианты товаров — отдельные записи; основной товар выбирается по названию в дополнительных параметрах. При изменении игрового товара сохраняется снимок названия, цены и полей в заказе.

Статусы выполнения изменяются строго `PAID → PROCESSING → COMPLETED`. В test mode оператор не должен выполнять реальную выдачу. Внутренние комментарии не видны покупателю. Удаление товара, связанного с заказом, запрещено foreign key; снимайте такой товар с публикации. Игру с категориями/товарами сначала очистите или скройте. Изображения после замены не удаляются автоматически, чтобы не ломать сохранённые ссылки: очистка неиспользуемых объектов выполняется оператором хранилища.

## SMTP и восстановление пароля

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-user
SMTP_PASSWORD=your-password
SMTP_FROM=NEXUS <noreply@example.com>
```

Порт 465 обычно требует `SMTP_SECURE=true`. Ссылка сброса действует 30 минут; в БД хранится HMAC токена. Использование одноразовое, после сброса и смены пароля старые сессии удаляются. Без SMTP сервис возвращает ошибку конфигурации, не выводит токены в лог. Для локальной проверки почты можно запустить Mailpit:

```bash
docker run -d --name game-store-mailpit -p 127.0.0.1:1025:1025 -p 127.0.0.1:8025:8025 axllent/mailpit
```

Укажите `SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_SECURE=false`, `SMTP_FROM=noreply@example.com`, без пользователя/пароля. Письма доступны на http://localhost:8025. Для app в Docker настройте достижимый hostname SMTP-сервера, а не localhost контейнера.

## Хранение изображений

Локально `STORAGE_PROVIDER=local`; файлы сохраняются в `public/uploads` и сразу доступны через `/api/images/:name`, в Docker — постоянный volume `uploads`. Поддерживаются PNG/JPEG/WEBP до 5 MB и 16 миллионов пикселей; MIME сверяется с форматом декодированного файла. Sharp удаляет метаданные, изменяет размер и перекодирует в WEBP; уникальный UUID не содержит пользовательского имени. SVG, HTML, GIF и исполняемые файлы не принимаются. Начальные изображения `public/assets` — собственная абстрактная графика, без чужих игровых обложек.

Для S3 / R2:

```dotenv
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://your-account.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=game-store
S3_ACCESS_KEY=YOUR_ACCESS_KEY
S3_SECRET_KEY=YOUR_SECRET_KEY
S3_PUBLIC_URL=https://images.example.com
```

Настройте публичный read-only домен для объектов, HTTPS и минимальные права credentials на PutObject только в нужный bucket. Не включайте public write и листинг. Для AWS S3 endpoint можно оставить пустым и использовать IAM role вместо статических credentials. После изменения домена перезапустите приложение: Next Image разрешает только настроенный hostname. R2/S3-интеграция реализована, реальный доступ требует ваших credentials.

## Безопасность и эксплуатация

Пароли: bcrypt cost 12, ограничение 72 UTF-8 байта. Cookie: HttpOnly, SameSite=Lax, Secure в production. CSRF: проверка Origin для каждой мутации кроме подписанного webhook. Клиент отправляет только ID, количество и данные получателя; цена и остаток читаются сервером. Запрос заказа имеет UUID `checkoutKey` для повторного безопасного отправления. Товары блокируются в фиксированном порядке, остатки резервируются атомарно. Храните AUTH_SECRET вне исходников; его смена аннулирует существующие сессии и reset tokens.

Rate limiting сохраняется в PostgreSQL, работает при нескольких процессах приложения. Без доверенного proxy применяется общий лимит, чтобы пользователь не мог подделать IP. В production поставьте приложение за nginx, установите `TRUST_PROXY=true`, **заменяйте**, а не дополняйте, `X-Forwarded-For` и не открывайте порт приложения в Интернет. Файрволл должен разрешать внешние подключения только к reverse proxy. Лимиты: логин 20/IP за 10 минут + 8/email, регистрация 5/IP за 10 минут, поиск 120/IP в минуту. Настройте дополнительные лимиты тела и соединений на proxy.

CSP, nosniff, frame deny, referrer policy, permissions policy и HSTS включены. CSP допускает inline script/style для Next.js; для более строгой политики можно добавить nonce-based CSP. ORM и параметризованный SQL исключают конкатенацию пользовательских запросов. React экранирует текст; HTML из админки не исполняется. Не храните секретные данные игровых аккаунтов в полях доставки.

Плановая очистка и восстановление истёкших резервов:

```bash
node --env-file=.env --import tsx scripts/maintenance.ts
```

Запускайте каждые 10 минут. Оплата подтверждается только webhook. Если Stripe webhook не дошёл, повторите его из Dashboard. Истёкшая сессия может освободить резерв после проверенного `expired` webhook или maintenance. Незапущенные платежи освобождают резерв по истечении срока; заказы без записанного Stripe ID после сбоя создания платежа помечаются для ручной сверки: не освобождайте их до проверки Stripe, чтобы исключить выдачу без остатка. Настройте оповещения на длительные `AWAITING_PAYMENT` и ошибки webhook. Делайте резервные копии PostgreSQL и хранилища, проверяйте восстановление, обновляйте зависимости.

## Тесты

```bash
npm run typecheck
npm test
npm run build
```

`npm test` проверяет ввод цены в рублях, генерацию адресов и денежные расчёты, запрет клиентской цены, поля доставки, пароль и соответствие платежа заказу. Для HTTP-интеграционных тестов используйте **отдельную тестовую PostgreSQL**, APP_URL работающего экземпляра и `PAYMENT_MODE=test`. Этот тест проверяет также запрет первоначальной настройки в production: запускайте его против production-сборки (`npm run build`, затем `npm start`), а не `npm run dev`. Настройте тестовый webhook secret и тестовый Stripe ключ на сервере и в окружении процесса теста. Скрипт создаёт пользователей, игру, товар и заказ; в конце удаляет свои данные, но оставляет загруженную картинку. Не запускайте на production.

```bash
node --env-file=.env --import tsx --test tests/integration.ts
npm run test:smoke
```

Этот тест проверяет реальную БД, регистрацию, login/logout, RBAC, CSRF, поиск, CRUD, цену, upload/опасный файл, создание заказа, идемпотентность, отсутствие оплаты от `/success`, подпись/сумму/повтор webhook, историю и статусы, смену и сброс пароля. Webhook здесь подписывается локальной тестовой fixture; тест **не доказывает** успешный реальный платёж Stripe. Проверка настоящей оплаты: `stripe listen`, оформить заказ через браузер, оплатить тестовой картой, убедиться в PAID после webhook, повторить событие через Stripe Dashboard, проверить неизменный итог и журнал. Вручную проверьте корзину/localStorage и размеры 375/768/1440 px.

## Production build

```bash
npm ci
npm run db:generate
npm run db:migrate
npm run db:seed
npm run build
npm start
```

Next.js читает `.env` автоматически. CLI-скрипты `tsx` сами `.env` не загружают; scripts npm используют Node `--env-file-if-exists=.env`, как указано в package.json. Приложение слушает 3000. Динамические страницы и API читают БД при запросе; сборка не требует доступной БД. Sitemap и SEO генерируются из PostgreSQL. Каталог и admin списки имеют пагинацию по 24 записи. Поиск имеет debounce 300 ms, ограниченный ответ и параметризованный SQL. Для очень большого каталога добавьте trigram/GIN индексы под фактические поисковые нагрузки. Персональные ответы не кешируются.

## Docker

```bash
npm install
npm run dev
# после первого запуска остановите сайт: Ctrl+C
# затем для контейнерного запуска:
docker compose up --build
docker compose logs -f app
```

Для Docker сначала выполните однократный локальный запуск выше, чтобы автоматически создать `.env` с секретами; для существующей установки используйте её настроенную `.env`. Затем `docker compose up --build` собирает и запускает приложение и PostgreSQL. После сборки достаточно `docker compose up`. Магазин доступен в обычном браузере по http://localhost:3000. Создайте администратора во время локального первого запуска; production-контейнер не предоставляет открытого назначения ADMIN.

Сборка выполняется с lockfile. При запуске app выполняет миграции и idempotent seed, затем запускает Next. DB и uploads сохраняются в volumes. Порты привязаны к localhost. Контейнер работает от пользователя node; это production-сборка с Secure cookies. Для удалённого доступа обязателен HTTPS reverse proxy. На localhost используйте browser с поддержкой secure localhost cookies, либо локальную разработку `npm run dev`.

В управляемом окружении с TLS proxy передайте доверенный CA как BuildKit secret (`proxy_ca`), без отключения TLS:

```bash
docker build --secret id=proxy_ca,src=/path/to/proxy-ca.pem -t game-store .
```

Для восстановления БД пример:

```bash
docker compose exec -T db pg_dump -U store game_store > backup.sql
```

Храните backup в защищённом месте отдельно от сервера. Не выполняйте `docker compose down -v` для действующего магазина: команда удаляет volumes.

## Деплой на сервер

1. Подготовьте Linux VPS, Node/Docker, домен, firewall, резервное копирование и мониторинг. Скопируйте исходники и заполненную `.env` безопасным способом. Не помещайте `.env` в Git или публичный архив.
2. Выполните Docker-команды выше. Укажите `APP_URL=https://shop.example.com`, production Stripe ключи и webhook secret.
3. Установите nginx и TLS сертификат через Certbot по инструкциям вашего дистрибутива. Пример location в TLS server block:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $remote_addr;
    client_max_body_size 6m;
    proxy_read_timeout 60s;
}
```

4. Установите `TRUST_PROXY=true`, не публикуйте порт 3000. Stripe должен иметь доступ к `/api/webhooks/payment` через HTTPS; не ставьте basic auth на этот endpoint.
5. Зарегистрируйте владельца и выдайте ADMIN через CLI. Замените демонстрационные инструкции и цены, подтвердите разрешения игр, юридические тексты и условия выполнения.
6. Проверьте Stripe test mode на отдельном staging-домене. Переключите на live и проведите контролируемую операцию с последующим возвратом, разрешённую вашим провайдером. Настройте monitoring webhook, SMTP и резервов.
7. Выполняйте maintenance по расписанию, контролируйте доступ администраторов и обновления безопасности. Для нескольких app-реплик используйте S3, общую PostgreSQL и отдельный migration job.

## Файлы и API

Полный исходный код каждого текстового файла, SQL миграции и seed представлен в `docs/SOURCE.md` с абсолютными путями и расширениями; `docs/TREE.txt` содержит дерево. Все необходимые файлы включены в архив проекта. Реальные API перечислены в `docs/API.md`. Результаты проверки и ограничения — `docs/VERIFICATION.md`.

## Автоматическая проверка новых форм

`npm run test:admin-ui` запускает React-формы в JSDOM и отправляет их запросы в реально запущенный сервер с настоящей PostgreSQL. Нужна **отдельная пустая тестовая БД**, `STORE_CURRENCY=rub` и экземпляр `npm run dev -- --port 3100` с `APP_URL=http://localhost:3100`. Первый администратор создаётся через локальный setup endpoint. Тест проходит добавление 1000 Gold, загрузку PNG, поиск, изменение 799 → 749, скрытие/публикацию, добавление PUBG Mobile и товара в неё, сохранение настроек. Это DOM-тест, а не проверка реального Chrome/Safari. После теста остаются контрольные записи для проверки перезапуска — не запускайте его на действующем магазине.
````

## FILE:
/workspace/game-store/app/404/page.tsx

Тип: tsx (.tsx)

```tsx
export { default } from '../not-found';
```

## FILE:
/workspace/game-store/app/[[...path]]/page.tsx

Тип: tsx (.tsx)

```tsx
import Store from '@/components/store';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/security';
import { notFound,redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic='force-dynamic';
const pages=['','catalog','search','cart','checkout','success','payment-error','login','register','forgot-password','reset-password','account','orders','support','faq','terms','privacy','refunds','contacts','admin'];
export async function generateMetadata({params}:{params:Promise<{path?:string[]}>}):Promise<Metadata> {
 const path=(await params).path||[];let title='Игровые ценности';let description='Цифровые игровые товары, каталог и поддержка.';let image='';
 if(path[0]==='games' && path[1]){const g=await db.game.findUnique({where:{slug:path[1]}});if(g){title=g.name;description=g.description.slice(0,160);image=g.image;}}
 if(path[0]==='products' && path[1]){const p=await db.product.findUnique({where:{slug:path[1]}});if(p){title=p.name;description=p.description.slice(0,160);image=p.image;}}
 const privatePage=['admin','account','orders','checkout','login','register','cart','success','payment-error','reset-password','forgot-password'].includes(path[0]);
 return {title,description,alternates:{canonical:'/'+path.join('/')},openGraph:{title,description,images:image?[image]:[]},robots:privatePage?{index:false,follow:false}:undefined};
}
export default async function Page({params}:{params:Promise<{path?:string[]}>}) {
 const path=(await params).path||[];
 if(path.length>2 || (path.length===2 && !['games','products','orders'].includes(path[0])) || (path.length<2 && !pages.includes(path[0]||'')))notFound();
 if(path[0]==='games'){if(!path[1] || !await db.game.findFirst({where:{slug:path[1],published:true}}))notFound();}
 if(path[0]==='products'){if(!path[1] || !await db.product.findFirst({where:{slug:path[1],published:true,game:{published:true}}}))notFound();}
 if(['admin','account','orders','checkout'].includes(path[0])){const user=await currentUser();if(!user)redirect('/login?next='+encodeURIComponent('/'+path.join('/')));if(path[0]==='admin' && user.role!=='ADMIN')redirect('/account');if(path[0]==='orders' && path[1] && !await db.order.findFirst({where:{id:path[1],userId:user.id}}))notFound();}
 return <Store path={path}/>;
}
```

## FILE:
/workspace/game-store/app/api/[...path]/route.ts

Тип: typescript (.ts)

```typescript
import { NextRequest,NextResponse } from 'next/server';
import { Prisma,OrderStatus } from '@prisma/client';
import { z,ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { storeSettings } from '@/lib/settings';
import { slugify } from '@/lib/slug';
import { randomUUID, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { ApiError,checkOrigin,currentUser,requireUser,newSession,clearSession,hashToken,rateLimit,readJson,readBounded,safeUser } from '@/lib/security';
import { emailSchema,passwordSchema,gameSchema,productSchema } from '@/lib/validation';
import { catalog,search,productInclude,pageParams } from '@/lib/catalog';
import { createOrder,orderInclude,publicOrder } from '@/lib/orders';
import { createPayment,provider,handlePaymentEvent } from '@/lib/payments';
import { uploadImage } from '@/lib/storage';
import { readFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { sendReset } from '@/lib/mail';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}});
const idSchema=z.string().min(1).max(100);
async function route(req:NextRequest,{params}:{params:Promise<{path:string[]}>}) {
 try {
 const path=(await params).path;const key=path.join('/');const method=req.method;const p=req.nextUrl.searchParams;
 if(key==='webhooks/payment' && method==='POST') {
  if(Number(req.headers.get('content-length'))>1048576)throw new ApiError(413,'Webhook слишком большой');
  const raw=(await readBounded(req,1048576)).toString('utf8');if(Buffer.byteLength(raw)>1048576)throw new ApiError(413,'Webhook слишком большой');
  let event;try{event=provider.verify(raw,req.headers.get('stripe-signature')||'');}catch(e){if(e instanceof ApiError)throw e;throw new ApiError(400,'Неверная подпись webhook');}
  return json(await handlePaymentEvent(event));
 }
 if(path[0]==='images' && path.length===2 && method==='GET'){if(!/^[a-f0-9-]{36}\.webp$/.test(path[1]))throw new ApiError(404,'Файл не найден');try{const file=await readFile(nodePath.join(process.cwd(),'public','uploads',path[1]));return new NextResponse(new Uint8Array(file),{headers:{'Content-Type':'image/webp','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}catch{throw new ApiError(404,'Файл не найден');}}
 if(!['GET','HEAD'].includes(method))checkOrigin(req);
 if(key==='config' && method==='GET')return json({...await storeSettings(),paymentMode:process.env.PAYMENT_MODE||'test',currency:process.env.STORE_CURRENCY||'rub',legalName:process.env.LEGAL_NAME||'',legalAddress:process.env.LEGAL_ADDRESS||'',legalApproved:process.env.LEGAL_APPROVED==='true'});
 if(key==='auth/setup' && method==='GET')return json({available:process.env.NODE_ENV==='development' && process.env.DEV_LOCAL_ONLY==='true' && await db.user.count({where:{role:'ADMIN'}})===0});
 if(key==='auth/setup' && method==='POST') {
  if(process.env.NODE_ENV!=='development' || process.env.DEV_LOCAL_ONLY!=='true')throw new ApiError(403,'Первоначальная настройка доступна только на этом компьютере при локальном запуске');
  await rateLimit(req,'setup',5,600);
  const input=z.object({email:emailSchema,name:z.string().max(100).default(''),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));
  const passwordHash=await bcrypt.hash(input.password,12);
  const user=await db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(67321893)`;if(await tx.user.count({where:{role:'ADMIN'}}))throw new ApiError(409,'Администратор уже создан. Войдите в существующий аккаунт.');const u=await tx.user.create({data:{email:input.email,name:input.name,passwordHash,role:'ADMIN'},select:safeUser});await tx.adminLog.create({data:{adminId:u.id,action:'LOCAL_SETUP_ADMIN',object:'User',objectId:u.id,after:{role:'ADMIN'}}});return u;});
  await clearSession();await newSession(user.id);return json({user},201);
 }
 if(key==='auth/me' && method==='GET')return json({user:await currentUser()});
 if(key==='auth/register' && method==='POST') {
  await rateLimit(req,'register',5,600);const input=z.object({email:emailSchema,password:passwordSchema,confirmPassword:z.string(),name:z.string().max(100).default('')}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));
  const user=await db.user.create({data:{email:input.email,passwordHash:await bcrypt.hash(input.password,12),name:input.name},select:safeUser});await newSession(user.id);return json({user},201);
 }
 if(key==='auth/login' && method==='POST') {
  await rateLimit(req,'login-ip',20,600);const input=z.object({email:emailSchema,password:z.string().min(1).max(200)}).parse(await readJson(req));await rateLimit(req,'login-email',8,600,input.email);
  const u=await db.user.findUnique({where:{email:input.email}});
  const valid=await bcrypt.compare(input.password,u?.passwordHash||'$2b$12$C6UzMDM.H6dfI/f/IKcEe.3sDyqpSHNuDyYKQsBWGjRVHKZaikqiS');
  if(!u || !valid || u.blocked)throw new ApiError(401,'Неверные данные для входа');await clearSession();await newSession(u.id);return json({user:await currentUser()});
 }
 if(key==='auth/logout' && method==='POST'){await clearSession();return json({ok:true});}
 if(key==='auth/forgot-password' && method==='POST') {
  await rateLimit(req,'forgot',5,600);const {email}=z.object({email:emailSchema}).parse(await readJson(req));
  if(!process.env.SMTP_HOST)throw new ApiError(503,'Восстановление недоступно: SMTP не настроен');
  const u=await db.user.findUnique({where:{email}});if(u && !u.blocked){const token=randomBytes(32).toString('hex');await db.passwordReset.create({data:{userId:u.id,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+30*60000)}});try{await sendReset(email,token);}catch{throw new ApiError(503,'Не удалось отправить письмо');}}
  return json({message:'Если аккаунт существует, письмо отправлено.'});
 }
 if(key==='auth/reset-password' && method==='POST') {
  await rateLimit(req,'reset',10,600);const input=z.object({token:z.string().length(64),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));const passwordHash=await bcrypt.hash(input.password,12);
  await db.$transaction(async tx=>{const reset=await tx.passwordReset.findUnique({where:{tokenHash:hashToken(input.token)},include:{user:true}});if(!reset || reset.expiresAt<new Date() || reset.user.blocked)throw new ApiError(400,'Ссылка истекла или уже использована');await tx.passwordReset.delete({where:{id:reset.id}});await tx.user.update({where:{id:reset.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:reset.userId}});await tx.passwordReset.deleteMany({where:{userId:reset.userId}});});return json({ok:true});
 }
 if(key==='auth/change-password' && method==='POST') {
  const user=await requireUser();await rateLimit(req,'change-password',5,600,user.id);const input=z.object({currentPassword:z.string().max(200),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));const u=await db.user.findUniqueOrThrow({where:{id:user.id}});if(!await bcrypt.compare(input.currentPassword,u.passwordHash))throw new ApiError(400,'Текущий пароль неверен');
  await db.$transaction([db.user.update({where:{id:user.id},data:{passwordHash:await bcrypt.hash(input.password,12)}}),db.session.deleteMany({where:{userId:user.id}}),db.passwordReset.deleteMany({where:{userId:user.id}})]);await newSession(user.id);return json({ok:true});
 }
 if(key==='account' && method==='PATCH'){const u=await requireUser();const {name}=z.object({name:z.string().max(100)}).parse(await readJson(req));return json(await db.user.update({where:{id:u.id},data:{name},select:safeUser}));}
 if(key==='games' && method==='GET')return json(await db.game.findMany({where:{published:true},orderBy:{sortOrder:'asc'},include:{categories:true,products:{where:{published:true},select:{price:true,currency:true,stock:true},orderBy:{price:'asc'}}}}));
 if(path[0]==='games' && path.length===2 && method==='GET'){const game=await db.game.findFirst({where:{slug:path[1],published:true},include:{categories:true}});if(!game)throw new ApiError(404,'Игра не найдена');const qp=new URLSearchParams(p);qp.set('game',game.id);return json({game,...await catalog(qp)});}
 if(key==='cart-products' && method==='POST'){const {ids}=z.object({ids:z.array(idSchema).max(30)}).parse(await readJson(req));return json(await db.product.findMany({where:{id:{in:ids},published:true,game:{published:true}},include:productInclude}));}
 if(key==='products' && method==='GET')return json(await catalog(p));
 if(path[0]==='products' && path.length===2 && method==='GET'){const product=await db.product.findFirst({where:{slug:path[1],published:true,game:{published:true}},include:{...productInclude,variants:{where:{published:true},include:productInclude}}});if(!product)throw new ApiError(404,'Товар не найден');return json(product);}
 if(key==='search' && method==='GET'){await rateLimit(req,'search',120,60);return json(await search(p.get('q')||''));}
 if(key==='orders' && method==='POST'){const u=await requireUser();await rateLimit(req,'orders',10,60,u.id);return json(publicOrder(await createOrder(u.id,await readJson(req))),201);}
 if(key==='orders' && method==='GET'){const u=await requireUser();const {take,skip,page}=pageParams(p);const [items,count]=await Promise.all([db.order.findMany({where:{userId:u.id},include:orderInclude,orderBy:{createdAt:'desc'},take,skip}),db.order.count({where:{userId:u.id}})]);return json({items:items.map(publicOrder),page,pages:Math.ceil(count/take),count});}
 if(path[0]==='orders' && path.length===2 && method==='GET'){const u=await requireUser();const order=await db.order.findFirst({where:{id:path[1],userId:u.id},include:orderInclude});if(!order)throw new ApiError(404,'Заказ не найден');return json(publicOrder(order));}
 if(key==='payments/create' && method==='POST'){const u=await requireUser();await rateLimit(req,'payments',10,60,u.id);const {orderId}=z.object({orderId:idSchema}).parse(await readJson(req));return json(await createPayment(u.id,orderId,u.email));}
 if(key==='support' && method==='GET'){const u=await requireUser();return json(await db.ticket.findMany({where:{userId:u.id},orderBy:{createdAt:'desc'},take:50}));}
 if(key==='support' && method==='POST'){const u=await requireUser();await rateLimit(req,'support',5,600,u.id);const input=z.object({subject:z.string().min(3).max(150),message:z.string().min(10).max(5000)}).parse(await readJson(req));return json(await db.ticket.create({data:{...input,userId:u.id}}),201);}
 if(path[0]==='admin') {
 const admin=await requireUser(true);if(method!=='GET')await rateLimit(req,'admin',120,60,admin.id);
 const entity=path[1];const id=path[2];
 if(entity==='settings' && method==='GET')return json(await storeSettings());
 if(entity==='settings' && method==='PATCH'){const input=z.object({name:z.string().trim().min(1).max(80),supportEmail:z.union([emailSchema,z.literal('')])}).parse(await readJson(req));return json(await db.$transaction(async tx=>{const before=await tx.storeSetting.findUnique({where:{id:'main'}});const after=await tx.storeSetting.upsert({where:{id:'main'},create:{id:'main',...input},update:input});await tx.adminLog.create({data:{adminId:admin.id,action:'UPDATE_SETTINGS',object:'Store',objectId:'main',before:before?JSON.parse(JSON.stringify(before)):Prisma.JsonNull,after:JSON.parse(JSON.stringify(after))}});return {...after,currency:process.env.STORE_CURRENCY||'rub'};}));}
 if(['games','products'].includes(entity) && id && path[3]==='visibility' && method==='PATCH') {
  const input=z.object({published:z.boolean()}).strict().parse(await readJson(req));
  return json(await db.$transaction(async tx=>{let before,after;if(entity==='products'){before=await tx.product.findUniqueOrThrow({where:{id}});after=await tx.product.update({where:{id},data:input,include:productInclude});}else{before=await tx.game.findUniqueOrThrow({where:{id}});after=await tx.game.update({where:{id},data:input});}await tx.adminLog.create({data:{adminId:admin.id,action:input.published?'PUBLISH':'HIDE',object:entity,objectId:id,before:{published:before.published},after:{published:after.published}}});return after;}));
 }
 if(entity==='dashboard' && method==='GET') {
  const today=new Date();today.setUTCHours(0,0,0,0);const week=new Date(Date.now()-7*86400000);const paid={paidAt:{not:null},status:{not:'REFUNDED' as OrderStatus}};
  const [statuses,revenue,day,seven,popular]=await Promise.all([db.order.groupBy({by:['status'],_count:true}),db.order.aggregate({where:paid,_sum:{total:true}}),db.order.aggregate({where:{...paid,paidAt:{gte:today}},_sum:{total:true}}),db.order.aggregate({where:{...paid,paidAt:{gte:week}},_sum:{total:true}}),db.orderItem.groupBy({by:['productId','name'],where:{order:paid},_sum:{quantity:true},orderBy:{_sum:{quantity:'desc'}},take:5})]);return json({statuses,revenue:revenue._sum.total||0,today:day._sum.total||0,week:seven._sum.total||0,popular,currency:process.env.STORE_CURRENCY||'rub'});
 }
 if(entity==='uploads' && method==='POST'){if(Number(req.headers.get('content-length'))>6*1024*1024)throw new ApiError(413,'Слишком большой файл');const bytes=await readBounded(req,6*1024*1024);if(bytes.byteLength>6*1024*1024)throw new ApiError(413,'Слишком большой файл');const form=await new Response(new Uint8Array(bytes),{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();const f=form.get('file');if(!(f instanceof File))throw new ApiError(400,'Файл отсутствует');const url=await uploadImage(f);await db.adminLog.create({data:{adminId:admin.id,action:'UPLOAD',object:'Image',objectId:url,after:{url}}});return json({url});}
 if(entity==='logs' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.adminLog.findMany({orderBy:{createdAt:'desc'},take,skip,include:{admin:{select:{email:true}}}}),page,count:await db.adminLog.count()});}
 if(entity==='payments' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.paymentEvent.findMany({orderBy:{createdAt:'desc'},take,skip,include:{payment:true}}),page,count:await db.paymentEvent.count()});}
 if(entity==='games' && method==='GET')return json(await db.game.findMany({orderBy:{sortOrder:'asc'},include:{categories:true}}));
 if(entity==='products' && method==='GET'){if(id){const v=await db.product.findUnique({where:{id},include:productInclude});if(!v)throw new ApiError(404,'Товар не найден');return json(v);}return json(await catalog(p,true));}
 if(entity==='categories' && method==='GET')return json(await db.category.findMany({include:{game:true},orderBy:{name:'asc'}}));
 if(['games','products','categories'].includes(entity) && ['POST','PATCH','DELETE'].includes(method)) {
  if(method!=='POST' && !id)throw new ApiError(400,'Требуется ID');
  const raw=method==='DELETE'?null:await readJson(req);
  if(raw && method==='POST' && !raw.slug){const prefix=entity==='products' && raw.gameId?(await db.game.findUnique({where:{id:raw.gameId},select:{slug:true}}))?.slug+'-':'';const base=slugify((prefix||'')+(typeof raw.name==='string'?raw.name:''));const exists=entity==='games'?await db.game.findUnique({where:{slug:base}}):entity==='products'?await db.product.findUnique({where:{slug:base}}):await db.category.findUnique({where:{slug:base}});raw.slug=exists?base+'-'+randomUUID().slice(0,8):base;}
  const data=entity==='games'?raw&&gameSchema.parse(raw):entity==='products'?raw&&productSchema.parse(raw):raw&&z.object({name:z.string().min(1).max(100),slug:z.string().regex(/^[a-z0-9-]+$/).max(100),gameId:idSchema}).parse(raw);
  return json(await db.$transaction(async tx=>{
   let before:any=null;let after:any;
   if(entity==='games') {
    if(id)before=await tx.game.findUniqueOrThrow({where:{id}});
    if(method==='DELETE')after=await tx.game.delete({where:{id}});else if(method==='POST')after=await tx.game.create({data});else after=await tx.game.update({where:{id},data});
   } else if(entity==='categories') {
    if(id)before=await tx.category.findUniqueOrThrow({where:{id}});
    if(method==='DELETE')after=await tx.category.delete({where:{id}});else if(method==='POST')after=await tx.category.create({data});else after=await tx.category.update({where:{id},data});
   } else {
    if(id){await tx.$queryRaw`SELECT id FROM "Product" WHERE id=${id} FOR UPDATE`;before=await tx.product.findUniqueOrThrow({where:{id},include:productInclude});if(method==='PATCH' && (!raw.updatedAt || new Date(raw.updatedAt).getTime()!==before.updatedAt.getTime()))throw new ApiError(409,'Товар изменился после открытия формы. Обновите страницу перед сохранением.');}
    if(method==='DELETE')after=await tx.product.delete({where:{id}});
    else {
     const {fields,images,...base}=data;
     if(base.currency!==(process.env.STORE_CURRENCY||'rub'))throw new ApiError(400,'Укажите валюту магазина');
     if(base.categoryId){const cat=await tx.category.findUnique({where:{id:base.categoryId}});if(!cat || cat.gameId!==base.gameId)throw new ApiError(400,'Категория не принадлежит игре');}
     if(base.parentId){const parent=await tx.product.findUnique({where:{id:base.parentId}});if(!parent || parent.gameId!==base.gameId || base.parentId===id || parent.parentId)throw new ApiError(400,'Недопустимый родитель варианта');}
     if(id){await tx.productField.deleteMany({where:{productId:id}});await tx.productImage.deleteMany({where:{productId:id}});}
     const values={...base,fields:{create:fields},images:{create:images.map((url:string,sortOrder:number)=>({url,sortOrder}))}};
     after=method==='POST'?await tx.product.create({data:values,include:productInclude}):await tx.product.update({where:{id},data:values,include:productInclude});
    }
   }
   await tx.adminLog.create({data:{adminId:admin.id,action:method,object:entity,objectId:after.id,before:before?JSON.parse(JSON.stringify(before)):Prisma.JsonNull,after:JSON.parse(JSON.stringify(after))}});return after;
  }),method==='POST'?201:200);
 }
 if(entity==='orders' && method==='GET') {
  if(id){const o=await db.order.findUnique({where:{id},include:{...orderInclude,user:{select:safeUser}}});if(!o)throw new ApiError(404,'Заказ не найден');return json(o);}
  const {take,skip,page}=pageParams(p);const q=(p.get('q')||'').slice(0,100);const where:Prisma.OrderWhereInput={};
  if(q)where.OR=[{id:{contains:q}},{user:{email:{contains:q,mode:'insensitive'}}},{items:{some:{OR:[{name:{contains:q,mode:'insensitive'}},{gameName:{contains:q,mode:'insensitive'}}]}}}];
  if(p.get('status'))where.status=z.enum(OrderStatus).parse(p.get('status'));
  if(p.get('from') || p.get('to'))where.createdAt={...(p.get('from')?{gte:z.coerce.date().parse(p.get('from'))}:{}),...(p.get('to')?{lte:new Date(z.coerce.date().parse(p.get('to')).getTime()+86400000-1)}:{})};
  if(p.get('user'))where.userId=p.get('user')!;
  const [items,count]=await Promise.all([db.order.findMany({where,include:{...orderInclude,user:{select:safeUser}},orderBy:{createdAt:'desc'},take,skip}),db.order.count({where})]);return json({items,count,page,pages:Math.ceil(count/take)});
 }
 if(entity==='orders' && id && method==='PATCH') {
  const input=z.object({status:z.enum(['PROCESSING','COMPLETED']).optional(),internalComment:z.string().max(10000).optional()}).parse(await readJson(req));
  return json(await db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${id} FOR UPDATE`;const before=await tx.order.findUniqueOrThrow({where:{id}});if(input.status && !((before.status==='PAID' && input.status==='PROCESSING') || (before.status==='PROCESSING' && input.status==='COMPLETED') || before.status===input.status))throw new ApiError(409,'Сначала подтвердите оплату; соблюдайте порядок выполнения');const after=await tx.order.update({where:{id},data:input,include:orderInclude});await tx.adminLog.create({data:{adminId:admin.id,action:'UPDATE_ORDER',object:'Order',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));
 }
 if(entity==='refunds' && id && method==='POST'){const o=await db.order.findUniqueOrThrow({where:{id},include:{payment:true}});if(!['PAID','PROCESSING','COMPLETED'].includes(o.status) || !o.payment?.intentId)throw new ApiError(409,'Возврат недоступен');await provider.refund(o.payment.intentId,id);await db.adminLog.create({data:{adminId:admin.id,action:'REQUEST_REFUND',object:'Order',objectId:id}});return json({message:'Возврат запрошен. Статус изменит webhook.'});}
 if(entity==='users' && method==='GET'){if(id){const u=await db.user.findUnique({where:{id},select:{...safeUser,orders:{include:orderInclude,orderBy:{createdAt:'desc'},take:50}}});if(!u)throw new ApiError(404,'Пользователь не найден');return json(u);}const {take,skip,page}=pageParams(p);const where={email:{contains:(p.get('q')||'').slice(0,100),mode:'insensitive' as const}};return json({items:await db.user.findMany({where,select:safeUser,take,skip,orderBy:{createdAt:'desc'}}),count:await db.user.count({where}),page});}
 if(entity==='users' && id && method==='PATCH'){const input=z.object({blocked:z.boolean()}).parse(await readJson(req));if(id===admin.id)throw new ApiError(400,'Нельзя заблокировать себя');return json(await db.$transaction(async tx=>{const before=await tx.user.findUniqueOrThrow({where:{id},select:safeUser});if(before.role==='ADMIN')throw new ApiError(400,'Блокировку администратора выполняйте через серверную процедуру');const after=await tx.user.update({where:{id},data:input,select:safeUser});if(input.blocked)await tx.session.deleteMany({where:{userId:id}});await tx.adminLog.create({data:{adminId:admin.id,action:'BLOCK_USER',object:'User',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));}
 if(entity==='support' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.ticket.findMany({include:{user:{select:safeUser}},orderBy:{createdAt:'desc'},take,skip}),count:await db.ticket.count(),page});}
 if(entity==='support' && id && method==='PATCH'){const input=z.object({reply:z.string().min(1).max(5000),status:z.enum(['OPEN','CLOSED'])}).parse(await readJson(req));return json(await db.$transaction(async tx=>{const before=await tx.ticket.findUniqueOrThrow({where:{id}});const after=await tx.ticket.update({where:{id},data:input});await tx.adminLog.create({data:{adminId:admin.id,action:'REPLY_TICKET',object:'Ticket',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));}
 }
 throw new ApiError(404,'Endpoint не найден');
 } catch(e) {
 if(e instanceof ApiError)return json({error:e.message},e.status);
 if(e instanceof ZodError)return json({error:e.issues.map(i=>i.message).join('; ')},400);
 if(e instanceof Prisma.PrismaClientKnownRequestError){if(e.code==='P2002')return json({error:'Такое значение уже существует'},409);if(e.code==='P2025')return json({error:'Запись не найдена'},404);if(e.code==='P2003')return json({error:'Запись связана с другими данными. Снимите с публикации вместо удаления.'},409);}
 console.error('API failure',e instanceof Error?e.name:'Unknown');return json({error:'Внутренняя ошибка сервера'},500);
 }
}
export {route as GET,route as POST,route as PATCH,route as DELETE};
```

## FILE:
/workspace/game-store/app/error.tsx

Тип: tsx (.tsx)

```tsx
'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><span className="eyebrow">NEXUS / 500</span><h1>Не удалось загрузить страницу</h1><p>Попробуйте ещё раз. Если ошибка повторится, обратитесь в поддержку.</p><button onClick={reset}>Повторить</button><a href="/support">Поддержка</a></main>;}
```

## FILE:
/workspace/game-store/app/global-error.tsx

Тип: tsx (.tsx)

```tsx
'use client';
export default function GlobalError({reset}:{reset:()=>void}){return <html lang="ru"><body style={{margin:0,background:'#0c0e14',color:'#f4f5fa',fontFamily:'Arial,sans-serif'}}><main style={{maxWidth:700,margin:'100px auto',padding:30}}><p>Ошибка 500</p><h1>Сервис временно недоступен</h1><p>Попробуйте обновить страницу.</p><button onClick={reset}>Повторить</button><p><a href="/" style={{color:'#b5fb5b'}}>На главную</a></p></main></body></html>;}
```

## FILE:
/workspace/game-store/app/globals.css

Тип: css (.css)

```css
@import "tailwindcss";
:root{--bg:#0c0e14;--panel:#151821;--border:#282d3b;--muted:#9aa2b5;--text:#f4f5fa;--accent:#b5fb5b;--purple:#9172ff}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,Arial,sans-serif;line-height:1.6}a{color:inherit;text-decoration:none}button,.button{cursor:pointer;border:0;border-radius:12px;background:var(--accent);color:#151b0f;font-size:14px;font-weight:700;padding:13px 20px;display:inline-flex;align-items:center;justify-content:center;gap:12px;transition:transform .2s,background .2s}button:hover,.button:hover{transform:translateY(-2px);background:#c7ff82}button:disabled{opacity:.45;cursor:not-allowed;transform:none}.secondary{background:#222736!important;color:var(--text)!important;border:1px solid var(--border)}.danger{background:#3c2029;color:#ffb1c3;margin:6px}.text-button{background:none;color:var(--muted);padding:8px}.container{width:min(1280px,calc(100% - 48px));margin:0 auto}main.container{min-height:65vh;padding-bottom:80px}.header{border-bottom:1px solid var(--border);background:#0c0e14ee;position:sticky;top:0;z-index:40;backdrop-filter:blur(16px)}.nav{display:flex;align-items:center;gap:25px;min-height:88px}.brand{font-size:26px;font-weight:900;letter-spacing:-1.4px;display:flex;align-items:center;gap:8px;white-space:nowrap}.brand>span{color:var(--accent);font-size:34px}.brand small{font-size:8px;font-weight:600;letter-spacing:2px;width:35px;white-space:normal;color:var(--muted);line-height:1.4}.nav nav{display:flex;gap:24px;font-size:13px}.nav>.search-box{flex:1;max-width:350px;margin-left:auto}.cart-link,.account-link{font-size:13px;white-space:nowrap}.cart-link b{background:var(--accent);color:#12190d;border-radius:6px;padding:2px 7px;margin-left:5px}.test-banner{padding:7px;text-align:center;background:#241f35;color:#c9b8ff;font-size:11px;letter-spacing:.3px}.hero{display:grid;grid-template-columns:1.4fr 1fr;gap:20px;padding:80px 0 65px;position:relative;overflow:hidden}.eyebrow{color:var(--muted);letter-spacing:2px;font-size:10px;font-weight:700;text-transform:uppercase}.eyebrow i{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 12px #b5fb5b;margin-right:7px}h1,h2,h3,h4{line-height:1.15;font-weight:700;margin:0 0 20px}h1{font-size:clamp(32px,4vw,54px);letter-spacing:-2px}h2{font-size:30px;letter-spacing:-1px}h3{font-size:20px}h4{font-size:15px}.hero h1{font-size:clamp(36px,4.5vw,62px);margin-top:23px}.hero em{font-style:normal;color:var(--accent)}p{color:var(--muted);font-size:14px;margin:16px 0}.hero-content>p{font-size:16px;line-height:1.8}.search-box{position:relative}.search-box form{display:flex;border:1px solid var(--border);background:#181c27;border-radius:12px;align-items:center;padding:4px 8px}.search-box form>span{color:var(--muted);font-size:25px;margin:0 10px}.search-box input{margin:0;border:0!important;background:transparent!important;min-width:0;flex:1;padding:9px 0;font-size:12px;outline:0}.search-box button{padding:7px 13px;background:transparent;color:var(--muted);font-size:20px}.search-large{max-width:620px;margin:30px 0}.search-large form{padding:9px}.search-large input{font-size:14px}.search-large button{background:var(--accent);color:#161c10}.suggestions{position:absolute;top:calc(100% + 8px);left:0;right:0;background:#202532;border:1px solid var(--border);border-radius:12px;z-index:50;box-shadow:0 20px 60px #0009;overflow:hidden}.suggestions a{display:flex;justify-content:space-between;padding:10px 16px;font-size:12px;gap:8px}.suggestions a:hover{background:#30374a}.suggestions p{padding:10px}.suggestions small{color:var(--accent);white-space:nowrap}.hero-pills{display:flex;gap:23px;color:var(--muted);font-size:11px}.hero-visual{position:relative;min-height:350px;display:grid;place-items:center;background:radial-gradient(ellipse,#614cc32b,transparent 65%)}.gem{font-size:260px;line-height:1;color:var(--accent);text-shadow:0 0 100px #a3fb4730;transform:rotate(-14deg);animation:float 6s ease-in-out infinite}.orbit{position:absolute;width:320px;height:320px;border:1px solid #70775844;border-radius:50%;transform:rotateX(55deg) rotateZ(-25deg);box-shadow:0 0 0 35px #373c3522,0 0 0 75px #373c3511}.floating{position:absolute;background:#202331aa;border:1px solid #555a6f66;box-shadow:0 14px 45px #0006;backdrop-filter:blur(15px);padding:15px 23px;border-radius:16px;display:flex;gap:12px;align-items:center;font-size:24px}.floating b{font-size:13px;letter-spacing:1px}.floating small{font-size:10px;color:var(--muted)}.f1{top:40px;right:0;transform:rotate(8deg);color:#bda8ff}.f2{bottom:55px;left:0;transform:rotate(-6deg);color:var(--accent)}.hero-coordinate{position:absolute;bottom:0;font-size:8px;letter-spacing:4px;color:var(--muted)}section{margin-bottom:64px}.section-head{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:20px 0 26px}.section-head h2{margin:0}.section-head h2 span{font-size:10px;color:#657086;letter-spacing:1px;margin-left:18px;vertical-align:middle}.section-head>a{font-size:12px;color:var(--muted)}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px;margin:24px 0}.game-card,.product-card{border:1px solid var(--border);border-radius:18px;overflow:hidden;background:linear-gradient(150deg,#202434a0,#151821);transition:transform .25s,border-color .25s}.game-card:hover,.product-card:hover{transform:translateY(-5px);border-color:#6a7453}.art{position:relative;isolation:isolate;height:180px;display:flex;align-items:center;justify-content:center;background:radial-gradient(circle at 65% 20%,#685b8d,#202736 75%);overflow:hidden}.game-card:nth-child(4n+2) .art{background:radial-gradient(circle at 70% 20%,#8d654a,#352a2a 75%)}.game-card:nth-child(4n+3) .art{background:radial-gradient(circle at 70% 20%,#657679,#202a30 75%)}.game-card:nth-child(4n+4) .art{background:radial-gradient(circle at 70% 20%,#3c6346,#15271e 75%)}.art b{font-size:65px;font-weight:900;letter-spacing:-5px;transform:rotate(-10deg);text-shadow:0 15px 20px #0005;color:#ffffffd9}.art-orbit{position:absolute;width:180px;height:180px;border:1px solid #ffffff33;border-radius:40px;transform:rotate(30deg);box-shadow:0 0 0 25px #ffffff06}.art-caption{position:absolute;bottom:14px;left:20px;font-size:8px;letter-spacing:4px;color:#ffffff99}.art.large{height:390px;border-radius:20px}.art.large b{font-size:130px}.card-body{padding:20px}.card-body h3{font-size:19px;margin:9px 0 13px}.card-body p{font-size:12px;display:flex;justify-content:space-between;margin-bottom:0}.stock{font-size:10px;color:var(--accent)}.stock.out{color:#bd7385}.price-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:19px 0}.price-row b{font-size:20px;letter-spacing:-.5px}del{font-size:11px;color:var(--muted);display:block;font-weight:400}.badge{background:#2a3421;color:var(--accent);padding:5px 9px;border-radius:7px;font-size:10px;white-space:nowrap}.product-card button{width:100%;justify-content:space-between}.benefits{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--border);border-radius:20px;padding:30px;gap:30px;background:#12151e}.benefits>div+div{border-left:1px solid var(--border);padding-left:30px}.benefits span{color:var(--accent);font-size:10px}.benefits h3{margin-top:18px}.benefits p{font-size:12px;margin:0}.faq-section{display:grid;grid-template-columns:1fr 1.5fr;gap:60px}.faq-section h2{font-size:44px;margin:20px 0 30px}.faq details{border-bottom:1px solid var(--border);padding:21px 0}.faq summary{display:flex;justify-content:space-between;font-size:14px;cursor:pointer;list-style:none}.faq summary span{color:var(--accent)}.faq p{line-height:1.8}.page-title{padding:45px 0 20px}.page-title h1{margin-top:15px}.page-title p{max-width:700px}.game-tabs,.admin-tabs{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}.game-tabs>a{background:var(--panel);border:1px solid var(--border);padding:12px 20px;border-radius:10px;font-size:13px}.game-hero{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;margin:45px 0}.game-hero .page-title{padding:0}.game-hero .art:not(.large){height:70px;width:70px}.product-detail{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin:60px 0}.product-detail h1{margin-top:15px}.product-detail .button{margin:10px}.detail-price{font-size:36px;font-weight:800;margin:25px 0}.detail-price del{display:inline;margin-left:10px;font-size:16px}.notice{margin-top:30px;border-top:1px solid var(--border);padding-top:25px}.panel{background:#151821b0;border:1px solid var(--border);padding:28px;border-radius:18px;margin-bottom:20px}.auth{max-width:470px;margin:65px auto}.auth h1{font-size:33px;margin-top:15px}.auth-links{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:24px;font-size:11px;color:var(--muted)}form label{display:block;color:var(--muted);font-size:12px;margin-bottom:18px}input,select,textarea{background:#0f121a;border:1px solid #303746;border-radius:9px;color:var(--text);padding:12px 13px;font:inherit;width:100%;margin-top:7px}input:focus,select:focus,textarea:focus{outline:2px solid #b5fb5b88;outline-offset:2px}input[type=checkbox]{width:16px;height:16px;accent-color:var(--accent);margin:0}textarea{min-height:100px;resize:vertical}.check{display:flex;align-items:center;flex-wrap:wrap;gap:8px}.check a{color:var(--text);text-decoration:underline}fieldset{border:0;padding:0;margin:0;min-width:0}.form-grid,.account-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.account-grid .button{margin:10px 10px 10px 0}.checkout-grid{display:grid;grid-template-columns:1.7fr 1fr;gap:25px}.summary{position:sticky;top:125px;height:fit-content}.summary button{width:100%}.cart-row{display:grid;grid-template-columns:140px 1fr;gap:25px}.cart-row .art{height:140px;border-radius:12px}.quantity{display:flex;gap:20px;align-items:center;margin-top:15px}.quantity input{max-width:100px}.quantity label{margin:0}.delivery-fields{padding-top:20px;border-top:1px solid var(--border);margin-top:20px}.muted{font-size:11px;color:var(--muted)}.order-row{display:flex;justify-content:space-between;gap:25px;align-items:center;padding:22px;background:var(--panel);border:1px solid var(--border);border-radius:12px;margin-bottom:12px}.order-row small,table small{display:block;font-size:10px;color:var(--muted)}.order-item{border-bottom:1px solid var(--border);padding:18px 0;display:flex;gap:20px;flex-wrap:wrap;justify-content:space-between}.order-item dl{width:100%;margin:0;font-size:12px;color:var(--muted)}dl>div{display:flex;gap:15px}dd{margin:0;color:var(--text);word-break:break-word}blockquote{border-left:2px solid var(--accent);margin:20px 0 0;padding-left:15px;color:var(--text);font-size:13px;white-space:pre-wrap}.legal{max-width:850px;margin:55px auto}.legal h1{font-size:36px}.legal h2{font-size:23px;margin-top:32px}.legal p{line-height:1.9}.empty{text-align:center;padding:70px 20px;border:1px dashed var(--border);border-radius:18px;margin:25px 0}.empty>span{color:var(--accent);font-size:40px}.empty h3{margin:18px}.empty a{color:var(--accent);font-size:13px}.alert{border:1px solid #694250;background:#30212b;color:#ffc2d0;padding:14px 18px;border-radius:12px;margin:20px 0;font-size:13px}.alert button{margin-left:20px}.toast{position:fixed;bottom:28px;right:28px;max-width:calc(100% - 32px);background:#28311f;border:1px solid #617d44;box-shadow:0 10px 50px #0008;padding:17px 25px;border-radius:14px;z-index:100;font-size:13px;color:#deffc4}.toast span{margin-left:18px}.filters{display:flex;flex-wrap:wrap;gap:15px;align-items:end;margin:22px 0}.filters input,.filters select{width:auto;max-width:230px}.filters label{font-size:10px;max-width:160px}.pager{display:flex;align-items:center;justify-content:center;gap:20px;margin:30px}.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.stats .panel{margin:0}.stats span{font-size:12px;color:var(--muted)}.stats strong{display:block;font-size:28px;margin-top:10px}.table-wrap{overflow-x:auto;border:1px solid var(--border);border-radius:14px}table{border-collapse:collapse;width:100%;font-size:12px}th,td{text-align:left;padding:16px;border-bottom:1px solid var(--border);vertical-align:top}th{color:var(--muted);font-weight:400;background:#151a25}td button{font-size:10px;padding:8px 10px;margin:3px}td pre{max-width:400px;white-space:pre-wrap;word-break:break-all;font-size:10px}td form{min-width:220px}.field-editor{border-top:1px solid var(--border);padding-top:20px;margin:20px 0}.field-row{display:flex;align-items:center;flex-wrap:wrap;gap:15px;background:#10131a;padding:15px;border-radius:12px;margin:12px 0}.field-row label{max-width:180px;margin:0}.field-row .check{max-width:none}.editor{border-color:#68794a}.editor img{border-radius:8px;margin:8px 0}.skeleton{min-height:220px;background:linear-gradient(90deg,#171c28,#222938,#171c28);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:16px}.skeleton.hero{height:400px;margin:40px 0}.error-page{max-width:800px;margin:100px auto;padding:30px}.error-page h1{margin-top:25px}.error-page a{margin-right:20px}footer{background:#10131b;border-top:1px solid var(--border);padding:40px 0 20px}.footer-top{display:flex;align-items:center;justify-content:space-between;gap:20px}.footer-top>a:last-child{font-size:13px;color:var(--accent)}.footer-links{display:flex;gap:28px;flex-wrap:wrap;font-size:11px;color:var(--muted);padding:30px 0;border-bottom:1px solid var(--border)}.footer-bottom{display:flex;justify-content:space-between;gap:20px;color:#6c7589;font-size:9px;padding-top:20px}@keyframes shimmer{to{background-position:-200% 0}}@keyframes float{50%{transform:translateY(-12px) rotate(-9deg)}}@media(max-width:1000px){.nav{gap:15px}.nav nav{display:none}.grid{grid-template-columns:repeat(3,1fr)}.hero h1{font-size:43px}.floating{padding:12px}.gem{font-size:210px}.hero{grid-template-columns:1.3fr 1fr}.product-detail,.game-hero{gap:30px}.checkout-grid{grid-template-columns:1.3fr 1fr}}@media(max-width:700px){.container{width:calc(100% - 32px)}.nav{flex-wrap:wrap;padding:14px 0;gap:16px;min-height:70px}.brand{font-size:22px}.brand small{display:none}.nav>.search-box{order:5;max-width:none;flex-basis:100%;margin:0}.cart-link{margin-left:auto}.account-link{font-size:11px}.header{position:relative}.test-banner{font-size:9px;padding:7px 15px}.hero{grid-template-columns:1fr;padding:35px 0;gap:0;margin-bottom:30px}.hero h1{font-size:39px;letter-spacing:-1.5px}.hero-content>p{font-size:13px}.hero-visual{min-height:250px;margin-top:20px}.gem{font-size:180px}.orbit{width:200px;height:200px}.f1{right:12%;top:25px}.f2{left:8%;bottom:25px}.hero-coordinate{bottom:8px}.hero-pills{font-size:9px;gap:15px}.search-large{margin:22px 0}.section-head h2{font-size:23px}.section-head h2 span{display:none}.section-head a{font-size:10px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px 0}.art{height:135px}.art b{font-size:45px}.art-orbit{width:120px;height:120px}.art-caption{left:12px;bottom:9px;letter-spacing:2px;font-size:6px}.card-body{padding:14px}.card-body h3{font-size:15px}.card-body .eyebrow{font-size:8px;letter-spacing:1px}.price-row{margin:13px 0;gap:5px}.price-row b{font-size:16px}.badge{font-size:8px;padding:4px 6px}.product-card button{padding:10px;font-size:10px}.benefits{grid-template-columns:1fr;padding:25px;gap:25px}.benefits>div+div{border-left:0;border-top:1px solid var(--border);padding:25px 0 0}.faq-section{grid-template-columns:1fr;gap:15px}.faq-section h2{font-size:34px}.faq summary{font-size:13px}.product-detail,.game-hero,.account-grid,.form-grid,.checkout-grid{grid-template-columns:1fr;gap:20px}.game-hero{margin:30px 0}.product-detail{margin:30px 0}.art.large{height:280px}.summary{position:static}.panel{padding:20px}.cart-row{grid-template-columns:75px 1fr;gap:15px}.cart-row .art{height:80px}.cart-row .art b{font-size:28px}.cart-row .art-caption{display:none}.cart-row .art-orbit{width:60px;height:60px}.quantity{gap:5px}.order-row{flex-wrap:wrap;padding:18px;gap:10px}.order-row>b{font-size:13px}.stats{grid-template-columns:repeat(2,1fr)}.stats strong{font-size:23px}.stats span{font-size:10px}.admin-tabs{gap:7px}.admin-tabs button{padding:9px;font-size:10px}.admin h1{font-size:30px}.filters input,.filters select{max-width:100%;width:100%;margin:0}.filters{gap:10px}.auth{margin:35px auto}.auth h1{font-size:29px}.legal{margin:30px auto}.legal h1{font-size:28px}.footer-top{flex-wrap:wrap}.footer-top p{display:none}.footer-links{gap:17px}.footer-bottom{flex-direction:column;gap:10px}.toast{bottom:15px;right:16px}section{margin-bottom:40px}.page-title{padding:30px 0 15px}.page-title h1{font-size:34px}}@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
/* Administration: ordinary forms, readable cards and touch-friendly controls. */
.admin-tabs button{min-height:44px}.add-catalog-button{padding:16px 25px;font-size:16px;min-height:52px}.admin-catalog-list{display:grid;gap:14px}.admin-catalog-card{display:flex;align-items:center;gap:22px;margin:0;padding:20px}.catalog-card-image{width:105px;height:105px;flex-shrink:0;border-radius:12px;overflow:hidden;display:grid;place-items:center;background:#242a38;color:var(--muted);font-size:35px}.catalog-card-image img{width:100%;height:100%;object-fit:cover}.catalog-card-info{flex:1;min-width:0}.catalog-card-info h3{margin-bottom:8px;overflow-wrap:anywhere}.catalog-card-info p{margin:0 0 8px}.catalog-card-info strong{font-size:22px}.catalog-badges{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:10px}.catalog-card-actions{display:flex;gap:8px;flex-wrap:wrap}.catalog-card-actions button{min-height:44px;margin:0}.hidden-badge{color:#c3c8d3;background:#2b2e3a}.admin-dialog{width:min(780px,calc(100vw - 32px));max-height:calc(100dvh - 40px);margin:auto;border:1px solid #3c4655;border-radius:22px;padding:28px;background:#151821;color:var(--text);box-shadow:0 30px 100px #000b;overflow-y:auto;overscroll-behavior:contain}.admin-dialog::backdrop{background:#05070dcc;backdrop-filter:blur(4px)}.dialog-heading{display:flex;justify-content:space-between;gap:20px;align-items:center;margin-bottom:26px}.dialog-heading h2{font-size:29px;margin:10px 0 0}.dialog-heading button{min-height:44px;min-width:44px}.admin-dialog .full-width{grid-column:1/-1}.admin-dialog label{font-size:14px}.admin-dialog input,.admin-dialog select,.admin-dialog textarea{font-size:16px;min-height:46px}.admin-dialog input[type=checkbox]{min-height:18px;width:18px;height:18px}.admin-dialog small{display:block;font-size:11px;margin-top:8px;color:var(--muted)}.dialog-actions{display:flex;justify-content:flex-end;gap:12px;position:sticky;bottom:-28px;background:#151821f5;margin:22px -28px -28px;padding:18px 28px;border-top:1px solid var(--border);z-index:2}.dialog-actions button{min-height:48px}.image-upload>p{font-size:14px;margin:0 0 10px}.image-upload-body{display:flex;gap:22px;align-items:center;padding:18px;border:1px dashed #40495e;border-radius:14px}.image-upload img,.image-placeholder{width:150px;height:120px;object-fit:cover;border-radius:10px;flex-shrink:0}.image-placeholder{background:#202635;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:30px;color:var(--muted)}.image-placeholder span{font-size:10px}.upload-file{position:absolute;width:1px!important;height:1px;opacity:0;pointer-events:none;overflow:hidden}.image-upload button{min-height:44px}.admin-extra{margin-top:25px;border:1px solid var(--border);border-radius:12px;padding:17px}.admin-extra>summary{cursor:pointer;font-size:14px;color:var(--muted);min-height:30px}.admin-extra[open]>summary{margin-bottom:24px}.image-gallery{display:flex;flex-wrap:wrap;gap:15px}.image-gallery img{display:block;width:100px;height:90px;object-fit:cover;border-radius:8px}.image-gallery button{padding:9px;margin:8px 0}.inline-category{background:#0e121b;padding:15px;border-radius:12px;margin:10px 0}.store-settings{max-width:650px}.admin .table-wrap button{min-height:42px}.setup-form{max-width:500px;margin:70px auto}.setup-form h1{font-size:34px}.setup-form button{width:100%}
@media(max-width:700px){.admin-catalog-card{display:grid;grid-template-columns:75px 1fr;padding:16px;gap:14px}.catalog-card-image{width:75px;height:85px}.catalog-card-info h3{font-size:18px}.catalog-card-info strong{font-size:20px}.catalog-card-actions{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.catalog-card-actions button{font-size:11px;padding:10px 5px}.admin .section-head{align-items:flex-start;flex-direction:column;gap:14px}.admin .add-catalog-button{width:100%}.admin-dialog{width:calc(100vw - 16px);max-height:calc(100dvh - 16px);padding:18px;border-radius:16px}.dialog-heading h2{font-size:24px}.admin-dialog .form-grid{gap:5px}.dialog-actions{bottom:-18px;margin:20px -18px -18px;padding:14px 18px;display:grid;grid-template-columns:1fr 1.5fr}.dialog-actions button{padding:12px 10px;font-size:13px}.image-upload-body{padding:14px;gap:15px;align-items:flex-start;flex-direction:column}.image-upload img,.image-placeholder{width:100%;height:170px}.image-upload-body>div:last-child{width:100%}.image-upload button{width:100%}.admin-extra{padding:13px}.admin .field-row{flex-direction:column;align-items:stretch}.admin .field-row label{max-width:100%;width:100%}.admin .table-wrap table,.admin .table-wrap tbody{display:block;width:100%}.admin .table-wrap thead{display:none}.admin .table-wrap tr{display:flex;flex-wrap:wrap;gap:10px;padding:16px;border-bottom:1px solid var(--border)}.admin .table-wrap td{padding:0;border:0;max-width:100%;overflow-wrap:anywhere}.admin .table-wrap td:first-child{flex-basis:100%;font-weight:bold}.admin .table-wrap td:last-child{flex-basis:100%}.admin .table-wrap td form{min-width:0}.admin .table-wrap td textarea{width:100%}.admin .table-wrap{overflow:visible}.setup-form{margin:35px auto}}
```

## FILE:
/workspace/game-store/app/layout.tsx

Тип: tsx (.tsx)

```tsx
import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_URL||'http://localhost:3000'),title:{default:'NEXUS — игровые ценности',template:'%s | NEXUS'},description:'Магазин цифровых игровых товаров с безопасной оплатой и поддержкой.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="ru"><body>{children}</body></html>;}
```

## FILE:
/workspace/game-store/app/loading.tsx

Тип: tsx (.tsx)

```tsx
export default function Loading(){return <main className="container"><div className="skeleton hero"/><div className="grid">{[1,2,3,4].map(i=><div key={i} className="skeleton card"/>)}</div></main>;}
```

## FILE:
/workspace/game-store/app/not-found.tsx

Тип: tsx (.tsx)

```tsx
import Link from 'next/link';
export default function NotFound(){return <main className="error-page"><span className="eyebrow">NEXUS / 404</span><h1>Здесь пока пусто</h1><p>Страница не найдена или товар снят с публикации.</p><Link className="button" href="/catalog">Открыть каталог</Link></main>;}
```

## FILE:
/workspace/game-store/app/robots.ts

Тип: typescript (.ts)

```typescript
import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin','/account','/orders','/checkout','/cart','/reset-password','/setup']},sitemap:`${process.env.APP_URL||'http://localhost:3000'}/sitemap.xml`};}
```

## FILE:
/workspace/game-store/app/setup/page.tsx

Тип: tsx (.tsx)

```tsx
import SetupForm from '@/components/setup-form';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
export const dynamic='force-dynamic';
export const metadata={title:'Первоначальная настройка магазина',robots:{index:false,follow:false}};
export default async function SetupPage(){if(process.env.NODE_ENV!=='development'||process.env.DEV_LOCAL_ONLY!=='true'||await db.user.count({where:{role:'ADMIN'}})>0)redirect('/login?next=/admin');return <SetupForm/>;}
```

## FILE:
/workspace/game-store/app/sitemap.ts

Тип: typescript (.ts)

```typescript
import { db } from '@/lib/db';
import type { MetadataRoute } from 'next';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.APP_URL||'http://localhost:3000';const [games,products]=await Promise.all([db.game.findMany({where:{published:true}}),db.product.findMany({where:{published:true,game:{published:true}}})]);return [{url:base},{url:base+'/catalog'},...games.map(g=>({url:base+'/games/'+g.slug,lastModified:g.updatedAt})),...products.map(p=>({url:base+'/products/'+p.slug,lastModified:p.updatedAt}))];}
```

## FILE:
/workspace/game-store/components/admin.tsx

Тип: tsx (.tsx)

```tsx
'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import CatalogEditor from './catalog-editor';
import { majorToMinor,currencyLabel } from '@/lib/money';
import { api,money,statuses,Empty,Loading,Pager } from './ui';
const tabs:Record<string,string>={dashboard:'Главная',games:'Игры',products:'Товары',orders:'Заказы',users:'Пользователи',settings:'Настройки',categories:'Категории',support:'Поддержка',logs:'Журнал действий',payments:'Платежи'};
export default function Admin({notify}:{notify:(s:string)=>void}) {
 const [currency,setCurrency]=useState('rub'),[catalogReady,setCatalogReady]=useState(false);
 const [tab,setTab]=useState('dashboard'),[data,setData]=useState<any>(null),[games,setGames]=useState<any[]>([]),[categories,setCategories]=useState<any[]>([]),[editor,setEditor]=useState<any>(null),[detail,setDetail]=useState<any>(null),[busy,setBusy]=useState(false),[filters,setFilters]=useState<Record<string,string>>({}),[page,setPage]=useState(1),[error,setError]=useState('');
 const requestGeneration=useRef(0);const currentTab=useRef(tab);currentTab.current=tab;
 const load=useCallback(async()=>{const generation=++requestGeneration.current;setError('');try{const normalized={...filters};if(tab==='products'){for(const key of ['min','max']){if(normalized[key]){try{normalized[key]=String(majorToMinor(normalized[key]));}catch{delete normalized[key];}}}}const params=new URLSearchParams({...normalized,page:String(page)});const result=await api('admin/'+tab+'?'+params);if(generation===requestGeneration.current&&currentTab.current===tab)setData(result);}catch(e){if(generation===requestGeneration.current&&currentTab.current===tab)setError((e as Error).message);}},[tab,filters,page]);
 useEffect(()=>{setData(null);const t=setTimeout(load,300);return()=>{clearTimeout(t);requestGeneration.current++;};},[load]);
 const refreshCatalog=useCallback(()=>{Promise.all([api('admin/games'),api('admin/categories'),api('config')]).then(([g,c,config])=>{setGames(g);setCategories(c);setCurrency(config.currency);setCatalogReady(true);}).catch(e=>notify(e.message));},[notify]);
 useEffect(refreshCatalog,[refreshCatalog,tab]);
 function filter(key:string,value:string){setFilters(old=>({...old,[key]:value}));setPage(1);}
 async function open(id:string){try{setDetail(await api('admin/'+tab+'/'+id));}catch(e){notify((e as Error).message);}}
 async function remove(id:string){if(!confirm('Удалить запись? Связанные с заказами товары удалить нельзя; их можно скрыть.'))return;setBusy(true);try{await api('admin/'+tab+'/'+id,'DELETE');notify('Запись удалена');await load();}catch(e){notify((e as Error).message);}finally{setBusy(false);}}
 async function action(url:string,method:string,body:any){if(busy)return;setBusy(true);try{const r=await api(url,method,body);notify(r.message||'Изменения сохранены');await load();if(detail?.id&&['orders','users'].includes(tab))setDetail(await api('admin/'+tab+'/'+detail.id));}catch(e){notify((e as Error).message);}finally{setBusy(false);}}
 return <div className="admin"><div className="page-title"><span className="eyebrow">УПРАВЛЕНИЕ МАГАЗИНОМ</span><h1>Панель администратора</h1></div><div className="admin-tabs">{Object.entries(tabs).map(([key,title])=><button className={tab===key?'active':'secondary'} key={key} onClick={()=>{setData(null);setError('');setTab(key);setEditor(null);setDetail(null);setFilters({});setPage(1);}}>{title}</button>)}</div>{error&&<div className="alert">{error}</div>}
 {editor&&<CatalogEditor key={editor.id||"new"} entity={tab} initial={editor} games={games} categories={categories} currency={currency} notify={notify} refresh={refreshCatalog} close={()=>{setEditor(null);load();}}/>}
 {tab==='settings'&&data&&<Settings initial={data} notify={notify} refresh={load}/>}
 {detail&&<div className="panel"><div className="section-head"><h2>{tab==='users'?detail.email:'Заказ №'+detail.id.slice(-8).toUpperCase()}</h2><button className="secondary" onClick={()=>setDetail(null)}>Закрыть ×</button></div>{tab==='orders'?<><p>Покупатель: {detail.user.email} · {statuses[detail.status]} · {money(detail.total,detail.currency)}</p>{detail.items.map((i:any)=><div className="order-item" key={i.id}><h3>{i.gameName} / {i.name} × {i.quantity}</h3><dl>{i.fieldsSnapshot.map((f:any)=><div key={f.key}><dt>{f.label}</dt><dd>{String(i.deliveryData[f.key]??'—')}</dd></div>)}</dl></div>)}<form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);action('admin/orders/'+detail.id,'PATCH',{internalComment:f.get('comment'),...(f.get('status')?{status:f.get('status')}:{})});}}><label>Статус выполнения<select name="status" defaultValue=""><option value="">Не менять</option>{detail.status==='PAID'&&<option value="PROCESSING">В обработке</option>}{detail.status==='PROCESSING'&&<option value="COMPLETED">Выполнен</option>}</select></label><label>Внутренний комментарий<textarea name="comment" defaultValue={detail.internalComment}/></label><button disabled={busy}>Сохранить</button></form>{['PAID','PROCESSING','COMPLETED'].includes(detail.status)&&<button className="danger" disabled={busy} onClick={()=>{if(confirm('Запросить полный возврат через Stripe?'))action('admin/refunds/'+detail.id,'POST',{});}}>Вернуть платёж</button>}</>:<><p>Роль: {detail.role==='ADMIN'?'Администратор':'Покупатель'} · {detail.blocked?'Заблокирован':'Активен'}</p><button disabled={busy||detail.role==='ADMIN'} onClick={()=>action('admin/users/'+detail.id,'PATCH',{blocked:!detail.blocked})}>{detail.blocked?'Разблокировать':'Заблокировать'}</button><h3>Заказы пользователя</h3>{detail.orders.map((o:any)=><div className="order-row" key={o.id}><b>№{o.id.slice(-8).toUpperCase()}</b><span>{statuses[o.status]}</span><span>{money(o.total,o.currency)}</span></div>)}</>}</div>}
 {tab==='dashboard'&&data&&<><div className="stats">{[['Все заказы',data.statuses.reduce((a:number,s:any)=>a+s._count,0)],...['NEW','AWAITING_PAYMENT','PAID','PROCESSING','COMPLETED'].map(s=>[statuses[s],data.statuses.find((v:any)=>v.status===s)?._count||0]),['Выручка',money(data.revenue,data.currency)],['Сегодня (UTC)',money(data.today,data.currency)],['За 7 дней',money(data.week,data.currency)]].map(([label,value])=><div className="panel" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="panel"><h2>Популярные товары</h2>{data.popular.length?data.popular.map((p:any)=><p key={p.productId}>{p.name} — {p._sum.quantity} шт.</p>):<p>Оплаченных заказов пока нет</p>}</div></>}
 {['games','categories','products'].includes(tab)&&<div className="section-head"><h2>{tabs[tab]}</h2><button className="add-catalog-button" disabled={!catalogReady} onClick={()=>setEditor({})}>{tab==='products'?'+ Добавить товар':tab==='games'?'+ Добавить игру':'+ Добавить категорию'}</button></div>}
 {['products','orders','users'].includes(tab)&&<div className="filters"><input placeholder={tab==='orders'?'Номер заказа, email, игра или товар':'Поиск по '+(tab==='users'?'email':'названию')} value={filters.q||''} onChange={e=>filter('q',e.target.value)}/>{tab==='products'&&<><select value={filters.game||''} onChange={e=>filter('game',e.target.value)}><option value="">Все игры</option>{games.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select><select onChange={e=>filter('published',e.target.value)}><option value="">Любая публикация</option><option value="true">Опубликован</option><option value="false">Скрыт</option></select><select onChange={e=>filter('stock',e.target.value)}><option value="">Любой остаток</option><option value="true">В наличии</option><option value="false">Закончился</option></select><input type="text" inputMode="decimal" aria-label="Цена от" placeholder={'Цена от, '+currencyLabel(currency)} onChange={e=>filter('min',e.target.value)}/><input type="text" inputMode="decimal" aria-label="Цена до" placeholder={'Цена до, '+currencyLabel(currency)} onChange={e=>filter('max',e.target.value)}/></>}{tab==='orders'&&<><select onChange={e=>filter('status',e.target.value)}><option value="">Все статусы</option>{Object.entries(statuses).map(([s,t])=><option key={s} value={s}>{t}</option>)}</select><label>От<input type="date" onChange={e=>filter('from',e.target.value)}/></label><label>До<input type="date" onChange={e=>filter('to',e.target.value)}/></label></>}</div>}
 {!data&&!error&&<Loading/>}
 {data&&!['dashboard','settings'].includes(tab)&&<>{(Array.isArray(data)?data:data.items).length?(['games','products','categories'].includes(tab)?<div className="admin-catalog-list">{(Array.isArray(data)?data:data.items).map((item:any)=><article className="admin-catalog-card panel" key={item.id}><div className="catalog-card-image">{item.image?<img src={item.image} alt={item.name}/>:<span>▧</span>}</div><div className="catalog-card-info"><h3>{item.name}</h3><p>{tab==='products'?item.game.name:tab==='categories'?item.game.name:'Игра / приложение'}</p>{tab==='products'&&<strong>{money(item.price,item.currency)}</strong>}<div className="catalog-badges">{tab!=='categories'&&<span className={item.published?'badge':'badge hidden-badge'}>{item.published?'Опубликовано':'Скрыто'}</span>}{tab==='products'&&<span className="stock">{item.stock?'В наличии · '+item.stock+' пакетов':'Нет в наличии'}</span>}</div></div><div className="catalog-card-actions"><button className="secondary" disabled={busy} onClick={()=>setEditor(item)}>Редактировать</button>{tab!=='categories'&&<button className="secondary" disabled={busy} onClick={()=>action('admin/'+tab+'/'+item.id+'/visibility','PATCH',{published:!item.published})}>{item.published?'Скрыть':'Показать'}</button>}<button className="danger" disabled={busy} onClick={()=>remove(item.id)}>Удалить</button></div></article>)}</div>:<div className="table-wrap"><table><thead><tr>{(tab==='orders'?['Заказ / дата','Покупатель','Сумма','Статус','']:tab==='users'?['Email','Роль','Состояние','']:tab==='logs'?['Время','Администратор','Действие','Объект','Изменения']:tab==='payments'?['Событие','Тип','Результат','Время']:tab==='support'?['Тема','Пользователь','Сообщение / ответ','']:['Название','ID / slug','Цена / публикация','Действия']).map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{(Array.isArray(data)?data:data.items).map((v:any)=><tr key={v.id}>{tab==='orders'?<><td>№{v.id.slice(-8).toUpperCase()}<small>{new Date(v.createdAt).toLocaleString('ru-RU')}</small></td><td>{v.user.email}</td><td>{money(v.total,v.currency)}</td><td>{statuses[v.status]}</td><td><button onClick={()=>open(v.id)}>Открыть</button></td></>:tab==='users'?<><td>{v.email}</td><td>{v.role==='ADMIN'?'Администратор':'Покупатель'}</td><td>{v.blocked?'Заблокирован':'Активен'}</td><td><button onClick={()=>open(v.id)}>Открыть</button></td></>:tab==='logs'?<><td>{new Date(v.createdAt).toLocaleString('ru-RU')}</td><td>{v.admin.email}</td><td>{actionName(v.action)}</td><td>{objectName(v.object)}</td><td>{logSummary(v)}</td></>:tab==='payments'?<><td>{v.payment?'Заказ №'+v.payment.orderId.slice(-8).toUpperCase():'—'}</td><td>{paymentEventName(v.type)}</td><td>{statuses[v.result]||({'RECEIVED':'Получено','IGNORED':'Без изменений','ATTEMPT_FAILED':'Попытка оплаты не удалась'} as Record<string,string>)[v.result]||'Обработано'}</td><td>{new Date(v.createdAt).toLocaleString('ru-RU')}</td></>:<><td>{v.subject}</td><td>{v.user.email}</td><td><p>{v.message}</p>{v.reply&&<blockquote>{v.reply}</blockquote>}</td><td><form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);action('admin/support/'+v.id,'PATCH',{reply:f.get('reply'),status:f.get('status')});}}><textarea name="reply" defaultValue={v.reply} required minLength={1} maxLength={5000}/><select name="status" defaultValue={v.status}><option value="OPEN">Открыто</option><option value="CLOSED">Закрыто</option></select><button disabled={busy}>Ответить</button></form></td></>}</tr>)}</tbody></table></div>):<Empty text="Записей пока нет"/>}{!Array.isArray(data)&&<Pager page={page} pages={data.pages||Math.ceil(data.count/24)} onChange={setPage}/>}</>}
 </div>;
}
function Settings({initial,notify,refresh}:{initial:any;notify:(s:string)=>void;refresh:()=>void}){const [name,setName]=useState(initial.name),[email,setEmail]=useState(initial.supportEmail),[busy,setBusy]=useState(false);return <form className="panel store-settings" onSubmit={async e=>{e.preventDefault();if(busy)return;setBusy(true);try{await api('admin/settings','PATCH',{name,supportEmail:email});notify('Настройки сохранены');window.dispatchEvent(new Event('store-settings-updated'));refresh();}catch(e){notify((e as Error).message);}finally{setBusy(false);}}}><h2>Настройки магазина</h2><label>Название магазина<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label><label>Электронная почта поддержки<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><p>Валюта цен: {({rub:'рубли',usd:'доллары США',eur:'евро'} as Record<string,string>)[initial.currency]||initial.currency}. Вводите обычную цену, например 799,90.</p><button disabled={busy}>{busy?'Сохраняем…':'Сохранить настройки'}</button></form>;}
function actionName(v:string){return ({POST:'Добавление',PATCH:'Изменение',DELETE:'Удаление',HIDE:'Скрытие',PUBLISH:'Публикация',UPLOAD:'Загрузка изображения',UPDATE_ORDER:'Изменение заказа',BLOCK_USER:'Блокировка пользователя',REPLY_TICKET:'Ответ поддержки',REQUEST_REFUND:'Запрос возврата',UPDATE_SETTINGS:'Настройки магазина',LOCAL_SETUP_ADMIN:'Создание администратора',CLI_PROMOTE_ADMIN:'Назначение администратора'} as Record<string,string>)[v]||'Действие администратора';}
function objectName(v:string){return ({games:'Игра',products:'Товар',categories:'Категория',User:'Пользователь',Order:'Заказ',Store:'Магазин',Ticket:'Обращение',Image:'Изображение'} as Record<string,string>)[v]||'Запись';}
function logSummary(v:any){if(v.before?.price!==undefined&&v.after?.price!==undefined&&v.before.price!==v.after.price)return `Цена: ${money(v.before.price,v.before.currency)} → ${money(v.after.price,v.after.currency)}`;return v.after?.name||v.before?.name||(v.after?.status?statuses[v.after.status]||'Сохранено':'Сохранено');}
function paymentEventName(v:string){return v.includes('refunded')?'Возврат платежа':v.includes('expired')?'Срок оплаты истёк':v.includes('failed')?'Ошибка оплаты':'Подтверждение оплаты';}
```

## FILE:
/workspace/game-store/components/catalog-editor.tsx

Тип: tsx (.tsx)

```tsx
'use client';
import { clientId } from '@/lib/client-id';
import { useEffect,useId,useRef,useState } from 'react';
import { api } from './ui';
import { currencyLabel,majorToMinor,minorToMajor } from '@/lib/money';

type Props={entity:string;initial:any;games:any[];categories:any[];currency:string;notify:(s:string)=>void;close:()=>void;refresh:()=>void};
export default function CatalogEditor({entity,initial,games,categories,currency,notify,close,refresh}:Props) {
 const defaults=entity==='games'?{name:'',slug:'',description:'',image:'',logo:'',aliases:[],fields:[],published:true,sortOrder:0,saleAllowed:false,permissionReference:''}:entity==='categories'?{name:'',slug:'',gameId:''}:{name:'',slug:'',gameId:'',categoryId:null,parentId:null,description:'',instruction:'',image:'',images:[],aliases:[],tags:[],fields:[],currency,price:0,oldPrice:null,amount:'',stock:100,published:true,minQuantity:1,maxQuantity:10,deliveryMethod:'MANUAL'};
 const [value,setValue]=useState<any>({...defaults,...initial,images:(initial.images||[]).map((v:any)=>typeof v==='string'?v:v.url)});
 const [price,setPrice]=useState(initial.price!==undefined?minorToMajor(initial.price):'');
 const [oldPrice,setOldPrice]=useState(initial.oldPrice?minorToMajor(initial.oldPrice):'');
 const [inStock,setInStock]=useState(!initial.id||initial.stock>0),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState('');
 const [categoryName,setCategoryName]=useState(''),[addingCategory,setAddingCategory]=useState(false),[localCategories,setLocalCategories]=useState(categories);
 const [parentQuery,setParentQuery]=useState(''),[parents,setParents]=useState<any[]>([]),[dirty,setDirty]=useState(false);
 const dialog=useRef<HTMLDialogElement>(null);const amountEdited=useRef(false);const titleId=useId();
 useEffect(()=>{const element=dialog.current;if(element&&!element.open){element.showModal();element.querySelector<HTMLInputElement>('input:not([type="file"])')?.focus();}return()=>{element?.close();};},[]);
 useEffect(()=>setLocalCategories(categories),[categories]);
 useEffect(()=>{if(entity!=='products'||!value.gameId)return;let alive=true;const t=setTimeout(()=>api('admin/products?'+new URLSearchParams({game:value.gameId,q:parentQuery})).then(d=>{if(alive)setParents(d.items.filter((p:any)=>!p.parentId&&p.id!==initial.id));}).catch(()=>{}),300);return()=>{alive=false;clearTimeout(t);};},[entity,value.gameId,parentQuery,initial.id]);
 function set(key:string,v:any){setValue((old:any)=>({...old,[key]:v}));setDirty(true);setError('');}
 function cancel(){if(busy||uploading||addingCategory)return;if(!dirty||confirm('Закрыть форму без сохранения изменений?'))close();}
 async function submit(e:React.FormEvent){e.preventDefault();if(busy||uploading||addingCategory)return;setError('');let payload={...value};
  try{if(entity==='products'){payload={...payload,price:majorToMinor(price),oldPrice:oldPrice.trim()?majorToMinor(oldPrice):null,stock:inStock?Number(value.stock):0,parentId:value.parentId||null};if(payload.price<50)throw new Error('Минимальная цена — 0,50 '+currencyLabel(value.currency)+'.');if(inStock&&payload.stock<1)throw new Error('Укажите хотя бы один доступный пакет.');if(payload.oldPrice!==null&&payload.oldPrice<payload.price)throw new Error('Старая цена должна быть не меньше текущей.');}if(!payload.slug?.trim())delete payload.slug;
   setBusy(true);const saved=await api('admin/'+entity+(initial.id?'/'+initial.id:''),initial.id?'PATCH':'POST',payload);
   notify(entity==='products'?(saved.published?'Товар сохранён и доступен покупателям':'Товар сохранён как скрытый'):entity==='games'?'Игра сохранена':'Категория сохранена');refresh();close();
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}
 }
 const text=(key:string,label:string,multiline=false,required=false)=><label key={key}>{label}{multiline?<textarea value={value[key]||''} maxLength={10000} onChange={e=>set(key,e.target.value)}/>:<input autoFocus={key==='name'} value={value[key]||''} maxLength={key==='name'?150:100} required={required} onChange={e=>{set(key,e.target.value);if(key==='name'&&entity==='products'&&!initial.id&&!amountEdited.current){const amount=/^\s*(\d+)/.exec(e.target.value);set('amount',amount?Number(amount[1]):'');}}}/>}</label>;
 const number=(key:string,label:string,min=0)=><label key={key}>{label}<input type="number" inputMode="numeric" min={min} max={key==='amount'?100000000:1000000} step="1" required value={value[key]??''} onChange={e=>{if(key==='amount')amountEdited.current=true;set(key,e.target.value===''?'':Number(e.target.value));}}/></label>;
 const gameSelect=<label>Игра / приложение<select required value={value.gameId} onChange={e=>{set('gameId',e.target.value);set('categoryId',null);set('parentId',null);}}><option value="">Выберите игру</option>{games.map(g=><option key={g.id} value={g.id}>{g.name}{g.published?'':' (скрыта)'}</option>)}</select></label>;
 const checkbox=(key:string,label:string)=><label className="check"><input type="checkbox" checked={!!value[key]} onChange={e=>set(key,e.target.checked)}/>{label}</label>;
 const title=entity==='products'?(initial.id?'Редактировать товар':'Добавить товар'):entity==='games'?(initial.id?'Редактировать игру':'Добавить игру'):(initial.id?'Редактировать категорию':'Добавить категорию');
 return <dialog ref={dialog} className="admin-dialog" aria-labelledby={titleId} onCancel={e=>{e.preventDefault();cancel();}}><div className="dialog-heading"><div><span className="eyebrow">УПРАВЛЕНИЕ КАТАЛОГОМ</span><h2 id={titleId}>{title}</h2></div><button type="button" className="secondary" aria-label="Закрыть форму" disabled={busy||uploading||addingCategory} onClick={cancel}>×</button></div><form onSubmit={submit}><fieldset disabled={busy||uploading||addingCategory}><div className="form-grid">
 {text('name',entity==='products'?'Название товара':entity==='games'?'Название игры':'Название категории',false,true)}
 {entity!=='games'&&gameSelect}
 {entity==='products'&&<>
 <div><label>Категория<select value={value.categoryId||''} onChange={e=>set('categoryId',e.target.value||null)}><option value="">Без категории</option>{localCategories.filter(c=>c.gameId===value.gameId).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button type="button" className="text-button" disabled={!value.gameId} onClick={()=>setCategoryName(categoryName===''?' ': '')}>+ Добавить категорию</button>{categoryName!==''&&<div className="inline-category"><label>Название новой категории<input value={categoryName.trimStart()} onChange={e=>setCategoryName(e.target.value||' ')}/></label><button type="button" disabled={!categoryName.trim()} onClick={async()=>{setAddingCategory(true);try{const category=await api('admin/categories','POST',{name:categoryName.trim(),gameId:value.gameId});setLocalCategories(old=>[...old,category]);set('categoryId',category.id);setCategoryName('');notify('Категория добавлена');}catch(e){setError((e as Error).message);}finally{setAddingCategory(false);}}}>Сохранить категорию</button></div>}</div>
 {number('amount','Количество игровой валюты',1)}
 <label>Цена ({currencyLabel(value.currency)})<input aria-label={'Цена ('+currencyLabel(value.currency)+')'} inputMode="decimal" placeholder="Например, 799" required value={price} onChange={e=>{setPrice(e.target.value);setDirty(true);setError('');}}/><small>Введите обычную цену: 799 означает {799} {currencyLabel(value.currency)}.</small></label>
 <label>Старая цена ({currencyLabel(value.currency)})<input inputMode="decimal" placeholder="Необязательно" value={oldPrice} onChange={e=>{setOldPrice(e.target.value);setDirty(true);}}/></label>
 <label>Наличие<select value={inStock?'yes':'no'} onChange={e=>{setInStock(e.target.value==='yes');if(e.target.value==='yes'&&!value.stock)set('stock',100);setDirty(true);}}><option value="yes">В наличии</option><option value="no">Нет в наличии</option></select></label>
 <label>Статус публикации<select value={value.published?'yes':'no'} onChange={e=>set('published',e.target.value==='yes')}><option value="yes">Показывать покупателям</option><option value="no">Скрыть товар</option></select></label>
 </>}
 {entity==='games'&&<label>Статус отображения<select value={value.published?'yes':'no'} onChange={e=>set('published',e.target.value==='yes')}><option value="yes">Показывать в каталоге</option><option value="no">Скрыть игру</option></select></label>}
 {entity!=='categories'&&<div className="full-width">{text('description','Описание',true)}</div>}
 {entity!=='categories'&&<div className="full-width"><ImageUpload label="Изображение" value={value.image} onChange={url=>set('image',url)} setUploading={setUploading} onError={setError}/></div>}
 {entity==='games'&&<><div className="full-width"><ImageUpload label="Логотип" value={value.logo} onChange={url=>set('logo',url)} setUploading={setUploading} onError={setError}/></div><label>Адрес раздела (slug)<input value={value.slug} placeholder="Например, pubg-mobile" pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={e=>set('slug',e.target.value)}/><small>Можно оставить пустым — адрес создастся по названию.</small></label></>}
 {entity==='products'&&<div className="full-width">{text('instruction','Инструкция покупателю',true)}</div>}
 </div>
 {entity!=='categories'&&<details className="admin-extra"><summary>Дополнительные параметры</summary><div className="form-grid">
 {entity==='products'&&<>{number('stock','Сколько пакетов доступно',inStock?1:0)}{number('minQuantity','Минимальное количество в заказе',1)}{number('maxQuantity','Максимальное количество в заказе',1)}<div><label>Основной товар для варианта<input placeholder="Найти товар по названию" value={parentQuery} onChange={e=>setParentQuery(e.target.value)}/></label><select aria-label="Основной товар" value={value.parentId||''} onChange={e=>set('parentId',e.target.value||null)}><option value="">Самостоятельный товар</option>{value.parentId&&!parents.some(p=>p.id===value.parentId)&&<option value={value.parentId}>Текущий основной товар</option>}{parents.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></div></>}
 {entity==='games'&&<>{number('sortOrder','Порядок в каталоге')}{checkbox('saleAllowed','Правила игры разрешают продажу этих товаров')}{text('permissionReference','Подтверждение разрешения продаж',true)}</>}
 <label>Дополнительные слова для поиска<input value={(value.aliases||[]).join(', ')} placeholder="Например, голда, gold" onChange={e=>set('aliases',e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/></label>
 {entity==='products'&&<><label>Поисковые метки<input value={(value.tags||[]).join(', ')} onChange={e=>set('tags',e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/></label><label>Адрес товара<input value={value.slug} placeholder="Создаётся автоматически" pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={e=>set('slug',e.target.value)}/></label></>}
 </div><FieldsEditor fields={value.fields} onChange={f=>set('fields',f)}/>{entity==='products'&&<><h3>Дополнительные фотографии</h3><div className="image-gallery">{value.images.map((url:string)=><div key={url}><img src={url} alt="Дополнительное изображение товара"/><button type="button" className="secondary" onClick={()=>set('images',value.images.filter((s:string)=>s!==url))}>Убрать</button></div>)}</div>{value.images.length<10&&<ImageUpload label="Дополнительное изображение" value="" onChange={url=>set('images',[...value.images,url])} setUploading={setUploading} onError={setError}/>}</>}</details>}
 </fieldset>{error&&<p className="alert" role="alert">{error}</p>}{uploading&&<p role="status">Загружаем изображение…</p>}<div className="dialog-actions"><button type="button" className="secondary" disabled={busy||uploading||addingCategory} onClick={cancel}>Отмена</button><button type="submit" disabled={busy||uploading||addingCategory}>{busy?'Сохраняем…':entity==='products'?'Сохранить товар':entity==='games'?'Сохранить игру':'Сохранить категорию'}</button></div></form></dialog>;
}
function ImageUpload({label,value,onChange,setUploading,onError}:{label:string;value:string;onChange:(s:string)=>void;setUploading:(v:boolean)=>void;onError:(s:string)=>void}){
 const id=useId();const [preview,setPreview]=useState('');const input=useRef<HTMLInputElement>(null);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 return <div className="image-upload"><p>{label}</p><div className="image-upload-body">{(preview||value)?<img src={preview||value} alt={'Превью: '+label}/>:<div className="image-placeholder">▧<span>Картинка ещё не выбрана</span></div>}<div><button type="button" className="secondary" onClick={()=>input.current?.click()}>{value?'Заменить изображение':label==='Логотип'?'Загрузить логотип':'Загрузить изображение'}</button><input ref={input} id={id} aria-label={label==='Логотип'?'Файл логотипа':label==='Изображение'?'Файл изображения':'Файл: '+label} className="upload-file" tabIndex={-1} type="file" accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" onChange={async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>5*1024*1024){onError('Выберите PNG, JPG, JPEG или WEBP не больше 5 МБ.');return;}setPreview(URL.createObjectURL(file));setUploading(true);onError('');try{const body=new FormData();body.append('file',file);const response=await fetch('/api/admin/uploads',{method:'POST',body,credentials:'same-origin'});const data=await response.json();if(!response.ok)throw new Error(data.error||'Не удалось загрузить изображение');onChange(data.url);}catch(e){onError((e as Error).message);}finally{setPreview('');setUploading(false);}}}/><small>PNG, JPG, JPEG или WEBP · до 5 МБ.<br/>Выберите файл с компьютера или из галереи телефона.</small>{value&&<button type="button" className="text-button" onClick={()=>onChange('')}>Убрать изображение</button>}</div></div></div>;
}
function FieldsEditor({fields,onChange}:{fields:any[];onChange:(f:any[])=>void}){
 function update(i:number,key:string,value:any){onChange(fields.map((f,n)=>n===i?{...f,[key]:value}:f));}
 return <div className="field-editor"><h3>Что покупатель должен указать для получения товара</h3><p>Пустой список товара использует поля игры. Пароль игрового аккаунта запрашивать нельзя.</p>{fields.map((f,i)=><div className="field-row" key={f.key}><label>Название поля<input required value={f.label} onChange={e=>update(i,'label',e.target.value)}/></label><label>Тип ответа<select value={f.type} onChange={e=>update(i,'type',e.target.value)}><option value="text">Текст</option><option value="number">Число</option><option value="select">Выбор из списка</option><option value="checkbox">Подтверждение</option></select></label>{f.type==='select'&&<label>Варианты ответа через запятую<input required value={f.options.join(', ')} onChange={e=>update(i,'options',e.target.value.split(',').map(v=>v.trim()).filter(Boolean))}/></label>}<label className="check"><input type="checkbox" checked={f.required} onChange={e=>update(i,'required',e.target.checked)}/>Обязательное поле</label><button type="button" className="danger" aria-label={'Удалить поле '+f.label} onClick={()=>onChange(fields.filter((_,n)=>n!==i))}>Удалить</button></div>)}<button type="button" className="secondary" onClick={()=>onChange([...fields,{key:'field_'+clientId().replace(/-/g,'').slice(0,12),label:'',type:'text',required:true,options:[],sortOrder:fields.length}])}>+ Добавить поле</button></div>;
}
```

## FILE:
/workspace/game-store/components/setup-form.tsx

Тип: tsx (.tsx)

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './ui';
export default function SetupForm(){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');return <main className="container"><div className="panel setup-form"><span className="eyebrow">NEXUS / ПЕРВЫЙ ЗАПУСК</span><h1>Создайте администратора</h1><p>Этот аккаунт будет управлять товарами, играми и заказами. Страница доступна только при первом локальном запуске на этом компьютере.</p><form onSubmit={async e=>{e.preventDefault();if(busy)return;const form=new FormData(e.currentTarget);setBusy(true);setError('');try{await api('auth/setup','POST',{name:form.get('name'),email:form.get('email'),password:form.get('password'),confirmPassword:form.get('confirmPassword')});router.push('/admin');router.refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><label>Ваше имя<input name="name" autoComplete="name" maxLength={100}/></label><label>Электронная почта<input name="email" type="email" autoComplete="email" required maxLength={254}/></label><label>Пароль<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={72}/><small>Не менее 12 символов. Не используйте пароль от игрового аккаунта.</small></label><label>Повторите пароль<input name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={72}/></label>{error&&<p className="alert" role="alert">{error}</p>}<button disabled={busy}>{busy?'Создаём аккаунт…':'Создать администратора'}</button></form></div></main>;}
```

## FILE:
/workspace/game-store/components/store.tsx

Тип: tsx (.tsx)

```tsx
'use client';
import { clientId } from '@/lib/client-id';
import { useCallback,useEffect,useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter,useSearchParams } from 'next/navigation';
import Admin from './admin';
import { api,money,statuses,Empty,Loading,Art,GameCard,ProductCard,SearchBox,Faq,Pager } from './ui';
type CartItem={productId:string;quantity:number};
export default function Store({path}:{path:string[]}) {
 const router=useRouter();const query=useSearchParams();const section=path[0]||'';
 const [user,setUser]=useState<any>(null),[config,setConfig]=useState<any>({name:'NEXUS',paymentMode:'test'}),[cart,setCart]=useState<CartItem[]>([]),[ready,setReady]=useState(false),[toast,setToast]=useState(''),[data,setData]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[page,setPage]=useState(1);
 const notify=useCallback((text:string)=>setToast(text),[]);
 useEffect(()=>{api('auth/me').then(d=>setUser(d.user)).catch(()=>{});api('config').then(setConfig).catch(()=>{});try{const v=JSON.parse(localStorage.getItem('nexus-cart')||'[]');if(Array.isArray(v))setCart(v.filter(i=>typeof i.productId==='string' && Number.isInteger(i.quantity) && i.quantity>0).slice(0,30));}catch{}setReady(true);},[]);
 useEffect(()=>{const refresh=()=>api('config').then(setConfig).catch(()=>{});window.addEventListener('store-settings-updated',refresh);return()=>window.removeEventListener('store-settings-updated',refresh);},[]);
 useEffect(()=>{if(ready)localStorage.setItem('nexus-cart',JSON.stringify(cart));},[cart,ready]);
 useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(''),5000);return()=>clearTimeout(t);},[toast]);
 useEffect(()=>{setPage(1);},[section,path[1]]);
 useEffect(()=>{
  let alive=true;setData(null);setError('');const suffix='?page='+page;let load:Promise<any>|undefined;
  if(!section)load=Promise.all([api('games'),api('products?sort=popular')]).then(([games,products])=>({games,products:products.items}));
  if(section==='catalog')load=Promise.all([api('games'),api('products'+suffix)]).then(([games,products])=>({games,...products}));
  if(section==='games')load=api('games/'+path[1]+suffix);
  if(section==='products')load=api('products/'+path[1]);
  if(section==='search')load=api('search?q='+encodeURIComponent(query.get('q')||''));
  if(section==='orders')load=api('orders'+(path[1]?'/'+path[1]:suffix));
  if(section==='success'||section==='payment-error')load=query.get('order')?api('orders/'+query.get('order')):Promise.resolve({});
  if(load)load.then(v=>{if(alive)setData(v);}).catch(e=>{if(alive)setError(e.message);});return()=>{alive=false;};
 },[section,path[1],page,query]);
 function add(p:any){setCart(old=>{const found=old.find(i=>i.productId===p.id);return found?old.map(i=>i.productId===p.id?{...i,quantity:Math.min(i.quantity+1,p.maxQuantity,p.stock)}:i):[...old,{productId:p.id,quantity:p.minQuantity}];});notify('Товар добавлен в корзину');}
 const grid=(items:any[])=><div className="grid">{items.map(p=><ProductCard p={p} key={p.id} add={add}/>)}</div>;
 const header=(title:string,desc?:string)=><div className="page-title"><span className="eyebrow">NEXUS / {section.toUpperCase()}</span><h1>{title}</h1>{desc&&<p>{desc}</p>}</div>;
 async function logout(){setBusy(true);try{await api('auth/logout','POST',{});setUser(null);router.push('/');notify('Вы вышли из аккаунта');}catch(e){notify((e as Error).message);}finally{setBusy(false);}}
 return <><header className="header"><div className="container nav"><Link className="brand" href="/"><span>✦</span>{config.name}<small>GAME STORE</small></Link><nav><Link href="/catalog">Каталог</Link><Link href="/support">Поддержка</Link></nav><SearchBox/><Link className="cart-link" href="/cart">Корзина <b>{cart.reduce((a,i)=>a+i.quantity,0)}</b></Link><Link className="account-link" href={user?'/account':'/login'}>{user?'Кабинет':'Войти'} ↗</Link></div></header>
 {config.paymentMode==='test'&&<div className="test-banner">Тестовый режим Stripe · товары демонстрационные · реальная выдача отключена</div>}
 <main className="container">
 {error&&<div className="alert">{error}<button onClick={()=>router.refresh()}>Обновить</button></div>}
 {!section&&<><section className="hero"><div className="hero-content"><span className="eyebrow"><i/> ТВОЙ СЛЕДУЮЩИЙ УРОВЕНЬ</span><h1>Больше возможностей.<br/><em>Больше игры.</em></h1><p>Игровая валюта и цифровые товары в одном месте.<br/>Выбери свою игру — остальное мы берём на себя.</p><SearchBox large/><div className="hero-pills"><span>✧ Безопасная оплата</span><span>◷ Статус каждого заказа</span></div></div><div className="hero-visual"><div className="orbit"/><div className="gem">✦</div><div className="floating f1">★ <b>STARS</b><small>Telegram</small></div><div className="floating f2">◈ <b>GOLD</b><small>Standoff 2</small></div><span className="hero-coordinate">PLAY / UPGRADE / REPEAT</span></div></section><section><div className="section-head"><h2>Выбери свою игру<span>01 /</span></h2><Link href="/catalog">Весь каталог ↗</Link></div>{data?<div className="grid">{data.games.map((g:any)=><GameCard key={g.id} g={g}/>)}</div>:<Loading/>}</section><section><div className="section-head"><h2>Популярные пакеты<span>02 /</span></h2><Link href="/catalog">Все товары ↗</Link></div>{data?grid(data.products.slice(0,8)):<Loading/>}</section><section className="benefits">{[['01','Защищённая оплата','Оплата на странице Stripe. Данные банковской карты не попадают на сервер магазина.'],['02','Всё под контролем','История и актуальный статус заказа в личном кабинете.'],['03','Поддержка рядом','Создай обращение — ответ появится в личном кабинете.']].map(([n,t,d])=><div key={n}><span>{n} /</span><h3>{t}</h3><p>{d}</p></div>)}</section><section className="faq-section"><div><span className="eyebrow">ЕСТЬ ВОПРОСЫ?</span><h2>Разберёмся<br/>вместе.</h2><Link className="button secondary" href="/support">Написать в поддержку ↗</Link></div><Faq/></section></>}
 {section==='catalog'&&<>{header('Каталог','Найди игру и выбери подходящий пакет.')}<SearchBox large/>{data?<><div className="game-tabs">{data.games.map((g:any)=><Link key={g.id} href={'/games/'+g.slug}>{g.name} ↗</Link>)}</div><Catalog initial={data} add={add} notify={notify}/></>:<Loading/>}</>}
 {section==='games'&&<>{data?<><div className="game-hero"><div>{header(data.game.name,data.game.description)}{data.game.logo&&<Art src={data.game.logo} name={data.game.name}/>}<span className="stock">{data.items.some((p:any)=>p.stock>0)?'● Товары в наличии':'○ Товары временно недоступны'}</span>{data.items.length>0&&<p>От {money(Math.min(...data.items.map((p:any)=>p.price)),data.items[0].currency)}</p>}</div><Art src={data.game.image} name={data.game.name} large/></div><h2>Доступные пакеты</h2>{data.items.length?grid(data.items):<Empty text="В этой игре пока нет доступных товаров"/>}<Pager page={page} pages={data.pages} onChange={setPage}/></>:!error&&<Loading/>}</>}
 {section==='products'&&<>{data?<><div className="product-detail"><Art src={data.image||data.game.image} name={data.game.name} large/><div><Link className="eyebrow" href={'/games/'+data.game.slug}>{data.game.name} ↗</Link><h1>{data.name}</h1><p>{data.description}</p><span className="stock">{data.stock?'● В наличии':'○ Товар закончился'}</span><div className="detail-price">{money(data.price,data.currency)} {data.oldPrice&&<del>{money(data.oldPrice,data.currency)}</del>}</div><p>В пакете: {data.amount} · Количество: {data.minQuantity}–{data.maxQuantity}</p><button disabled={!data.stock} onClick={()=>add(data)}>Добавить в корзину ＋</button><Link className="button secondary" href="/cart">Перейти к оформлению →</Link><div className="notice"><h3>Как получить товар</h3><p>{data.instruction||'Заполните данные получателя при оформлении. Выдача выполняется оператором после подтверждения оплаты.'}</p></div></div></div>{data.images.length>0&&<div className="grid">{data.images.map((img:any)=><Art key={img.id} src={img.url} name={data.name}/>)}</div>}{data.variants.length>0&&<><h2>Другие варианты</h2>{grid(data.variants)}</>}</>:!error&&<Loading/>}</>}
 {section==='search'&&<>{header('Поиск',query.get('q')?`Результаты по запросу «${query.get('q')}»`:'Введите запрос')}<SearchBox large/>{data?<><div className="grid">{data.games.map((g:any)=><GameCard key={g.id} g={g}/>)}</div>{grid(data.products)}{!data.games.length&&!data.products.length&&<Empty text="Ничего не найдено"/>}</>:!error&&<Loading/>}</>}
 {(section==='cart'||section==='checkout')&&<>{header(section==='cart'?'Корзина':'Оформление заказа')}<Cart cart={cart} setCart={setCart} checkout={section==='checkout'} notify={notify} ready={ready}/></>}
 {['login','register','forgot-password','reset-password'].includes(section)&&<Auth section={section} setUser={setUser} notify={notify}/>}
 {section==='account'&&<>{header('Личный кабинет',user?.email)}<div className="account-grid"><div className="panel"><h2>Аккаунт</h2><Account user={user} setUser={setUser} notify={notify}/><Link className="button secondary" href="/orders">Мои заказы →</Link>{user?.role==='ADMIN'&&<Link className="button secondary" href="/admin">Админ-панель →</Link>}<button className="danger" disabled={busy} onClick={logout}>Выйти</button></div><div className="panel"><h2>Сменить пароль</h2><PasswordForm notify={notify}/></div></div></>}
 {section==='orders'&&<>{header(path[1]?'Заказ '+path[1]:'Мои заказы')}{data?(path[1]?<OrderDetails o={data} notify={notify}/>:<>{data.items.length?<div className="orders">{data.items.map((o:any)=><Link key={o.id} className="order-row" href={'/orders/'+o.id}><div><b>#{o.id.slice(-8).toUpperCase()}</b><small>{new Date(o.createdAt).toLocaleString('ru-RU')}</small><p>{o.items.map((i:any)=>i.name).join(', ')}</p></div><span className="badge">{statuses[o.status]}</span><b>{money(o.total,o.currency)} ↗</b></Link>)}</div>:<Empty text="У вас пока нет заказов"/>}<Pager page={page} pages={data.pages} onChange={setPage}/></>):!error&&<Loading/>}</>}
 {['success','payment-error'].includes(section)&&<>{header(section==='success'?'Проверяем оплату':'Оплата не завершена',section==='success'?'Подтверждение поступает от Stripe. Страница не меняет статус заказа.':'Вы можете вернуться к заказу и повторить оплату, пока сессия активна.')}{data?.id?<OrderDetails o={data} notify={notify}/>:<Link href="/orders">Мои заказы →</Link>}</>}
 {section==='support'&&<>{header('Поддержка','Ваши обращения и ответы команды')}<Support user={user} notify={notify}/></>}
 {section==='faq'&&<>{header('Частые вопросы')}<Faq/></>}
 {['terms','privacy','refunds','contacts'].includes(section)&&<Legal section={section} config={config}/>}
 {section==='admin'&&<Admin notify={notify}/>}
 </main><footer><div className="container"><div className="footer-top"><Link className="brand" href="/">✦ {config.name}</Link><p>Твоя игра. Твой следующий уровень.</p><Link href="/support">Поддержка ↗</Link></div><div className="footer-links">{[['catalog','Каталог'],['faq','FAQ'],['terms','Соглашение'],['privacy','Конфиденциальность'],['refunds','Возврат'],['contacts','Контакты']].map(([href,label])=><Link key={href} href={'/'+href}>{label}</Link>)}</div><div className="footer-bottom"><span>© {new Date().getFullYear()} {config.name}</span><span>Названия игр принадлежат их правообладателям. Продажи — только в рамках разрешённых правил.</span></div></div></footer>{toast&&<div role="status" className="toast" onClick={()=>setToast('')}>{toast}<span>×</span></div>}</>;
}
function Catalog({initial,add,notify}:{initial:any;add:(p:any)=>void;notify:(s:string)=>void}){const [data,setData]=useState(initial),[game,setGame]=useState(''),[stock,setStock]=useState(''),[page,setPage]=useState(1),[busy,setBusy]=useState(false);useEffect(()=>{setBusy(true);api(`products?page=${page}&game=${game}&stock=${stock}`).then(setData).catch(e=>notify(e.message)).finally(()=>setBusy(false));},[game,stock,page,notify]);return <><div className="filters"><select value={game} onChange={e=>{setGame(e.target.value);setPage(1);}}><option value="">Все игры</option>{initial.games.map((g:any)=><option value={g.id} key={g.id}>{g.name}</option>)}</select><select value={stock} onChange={e=>{setStock(e.target.value);setPage(1);}}><option value="">Любое наличие</option><option value="true">В наличии</option></select></div>{busy?<Loading/>:data.items.length?<div className="grid">{data.items.map((p:any)=><ProductCard key={p.id} p={p} add={add}/>)}</div>:<Empty text="Товары не найдены"/>}<Pager page={page} pages={data.pages} onChange={setPage}/></>;}
function Cart({cart,setCart,checkout,notify,ready}:{cart:CartItem[];setCart:(v:CartItem[])=>void;checkout:boolean;notify:(s:string)=>void;ready:boolean}) {
 const [products,setProducts]=useState<any[]>([]),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[order,setOrder]=useState<any>(null),[loadError,setLoadError]=useState('');const [fields,setFields]=useState<Record<string,Record<string,any>>>({});const [key,setKey]=useState('');const router=useRouter();
 useEffect(()=>{if(!ready)return;setLoading(true);api('cart-products','POST',{ids:cart.map(i=>i.productId)}).then(data=>{setProducts(data);setLoadError('');}).catch(e=>setLoadError(e.message)).finally(()=>setLoading(false));},[cart,ready]);
 useEffect(()=>{setKey(clientId());setOrder(null);},[cart,fields]);
 const total=cart.reduce((sum,i)=>sum+(products.find(p=>p.id===i.productId)?.price||0)*i.quantity,0);
 async function submit(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);try{const created=order||await api('orders','POST',{checkoutKey:key,items:cart.map(i=>({...i,deliveryData:fields[i.productId]||{}}))});setOrder(created);notify('Заказ создан: сумма подтверждена сервером');const payment=await api('payments/create','POST',{orderId:created.id});setCart([]);window.location.assign(payment.url);}catch(e){notify((e as Error).message);}finally{setBusy(false);}}
 if(!ready||loading)return <Loading/>;if(loadError)return <div className="alert">{loadError}</div>;if(!cart.length)return <Empty text="Корзина пустая"/>;
 return <form onSubmit={submit}><div className="checkout-grid"><div>{cart.map(item=>{const p=products.find(v=>v.id===item.productId);if(!p)return <div className="panel" key={item.productId}>Товар больше недоступен <button type="button" onClick={()=>setCart(cart.filter(i=>i.productId!==item.productId))}>Удалить</button></div>;const f=p.fields.length?p.fields:p.game.fields;return <div className="panel cart-row" key={p.id}><Art src={p.image||p.game.image} name={p.game.name}/><div><span className="eyebrow">{p.game.name}</span><h3>{p.name}</h3><b>{money(p.price,p.currency)}</b><div className="quantity"><label>Количество <input type="number" min={p.minQuantity} max={Math.min(p.maxQuantity,p.stock)} value={item.quantity} disabled={busy||!!order} onChange={e=>setCart(cart.map(i=>i.productId===p.id?{...i,quantity:Math.max(p.minQuantity,Math.min(Number(e.target.value)||1,p.maxQuantity,p.stock))}:i))}/></label><button type="button" className="text-button" disabled={busy||!!order} onClick={()=>setCart(cart.filter(i=>i.productId!==p.id))}>Удалить</button></div>{checkout&&<div className="delivery-fields"><h4>Получатель</h4>{f.map((field:any)=><label key={field.key}>{field.label}{field.required?' *':''}{field.type==='select'?<select required={field.required} disabled={busy||!!order} value={fields[p.id]?.[field.key]??''} onChange={e=>setFields({...fields,[p.id]:{...fields[p.id],[field.key]:e.target.value}})}><option value="">Выберите</option>{field.options.map((opt:string)=><option key={opt}>{opt}</option>)}</select>:<input type={field.type} required={field.required} disabled={busy||!!order} value={field.type==='checkbox'?undefined:fields[p.id]?.[field.key]??''} checked={field.type==='checkbox'?!!fields[p.id]?.[field.key]:undefined} onChange={e=>setFields({...fields,[p.id]:{...fields[p.id],[field.key]:field.type==='checkbox'?e.target.checked:e.target.value}})}/>}</label>)}<p className="muted">{p.instruction}</p></div>}</div></div>;})}<button type="button" className="text-button" disabled={busy||!!order} onClick={()=>setCart([])}>Очистить корзину</button></div><aside className="panel summary"><h2>Ваш заказ</h2><div className="price-row"><span>Итого</span><b>{money(total,products[0]?.currency)}</b></div><p>Окончательная сумма проверяется сервером перед оплатой.</p>{checkout?<><label className="check"><input type="checkbox" required/>Принимаю <Link href="/terms">соглашение</Link> и <Link href="/privacy">политику</Link></label><button disabled={busy||products.length!==cart.length||products.some(p=>!p.stock)}>{busy?'Создаём платёж…':order?'Повторить переход к оплате':'Перейти к оплате →'}</button>{order&&<Link href={'/orders/'+order.id}>Открыть созданный заказ</Link>}</>:<button type="button" onClick={()=>router.push('/checkout')}>Оформить заказ →</button>}<p className="muted">Защищённая оплата Stripe. Пароль от игры не требуется.</p></aside></div></form>;
}
function Auth({section,setUser,notify}:{section:string;setUser:(u:any)=>void;notify:(s:string)=>void}) {
 const {register,handleSubmit,formState:{isSubmitting,errors}}=useForm<any>();const router=useRouter();const params=useSearchParams();const [message,setMessage]=useState('');const title:Record<string,string>={login:'С возвращением',register:'Создать аккаунт','forgot-password':'Восстановить пароль','reset-password':'Новый пароль'};
 async function submit(input:any){setMessage('');try{const route=section==='register'?'auth/register':section==='login'?'auth/login':section==='forgot-password'?'auth/forgot-password':'auth/reset-password';const result=await api(route,'POST',{...input,...(section==='reset-password'?{token:params.get('token')}: {})});if(result.user){setUser(result.user);notify(section==='login'?'Вход выполнен':'Аккаунт создан');const next=params.get('next');router.push(next?.startsWith('/')&&!next.startsWith('//')?next:'/account');router.refresh();}else{setMessage(result.message||'Пароль изменён. Войдите с новым паролем.');}}catch(e){setMessage((e as Error).message);}}
 return <div className="auth panel"><span className="eyebrow">ТВОЙ NEXUS</span><h1>{title[section]}</h1><form onSubmit={handleSubmit(submit)}>{section==='register'&&<label>Имя<input {...register('name',{maxLength:100})} autoComplete="name"/></label>}{section!=='reset-password'&&<label>Email<input type="email" {...register('email',{required:true,maxLength:254})} autoComplete="email" required/></label>}{section!=='forgot-password'&&<label>Пароль<input type="password" {...register('password',{required:true,minLength:section==='login'?1:12,maxLength:72})} autoComplete={section==='login'?'current-password':'new-password'} minLength={section==='login'?1:12} maxLength={72} required/></label>}{['register','reset-password'].includes(section)&&<label>Повторите пароль<input type="password" {...register('confirmPassword',{required:true})} autoComplete="new-password" required/></label>}{section==='register'&&<label className="check"><input type="checkbox" required/>Принимаю <Link href="/terms">соглашение</Link></label>}{Object.keys(errors).length>0&&<p className="alert">Проверьте поля. Новый пароль: минимум 12 символов.</p>}{message&&<p role="status" className="alert">{message}</p>}<button disabled={isSubmitting}>{isSubmitting?'Подождите…':section==='login'?'Войти':section==='register'?'Зарегистрироваться':'Отправить'}</button></form><div className="auth-links"><Link href="/login">Вход</Link><Link href="/register">Регистрация</Link><Link href="/forgot-password">Забыли пароль?</Link></div></div>;
}
function Account({user,setUser,notify}:{user:any;setUser:(u:any)=>void;notify:(s:string)=>void}){const [name,setName]=useState(''),[busy,setBusy]=useState(false);useEffect(()=>setName(user?.name||''),[user]);return <form onSubmit={async e=>{e.preventDefault();setBusy(true);try{const u=await api('account','PATCH',{name});setUser(u);notify('Данные сохранены');}catch(e){notify((e as Error).message);}finally{setBusy(false);}}}><label>Имя<input value={name} maxLength={100} onChange={e=>setName(e.target.value)}/></label><p>{user?.email} · {user?.role}</p><button disabled={busy}>{busy?'Сохраняем…':'Сохранить'}</button></form>;}
function PasswordForm({notify}:{notify:(s:string)=>void}){const {register,handleSubmit,reset,formState:{isSubmitting}}=useForm();return <form onSubmit={handleSubmit(async d=>{try{await api('auth/change-password','POST',d);reset();notify('Пароль изменён. Другие сессии завершены.');}catch(e){notify((e as Error).message);}})}>{[['currentPassword','Текущий пароль'],['password','Новый пароль'],['confirmPassword','Повторите пароль']].map(([key,label])=><label key={key}>{label}<input type="password" {...register(key)} autoComplete={key==='currentPassword'?'current-password':'new-password'} minLength={key==='currentPassword'?1:12} maxLength={72} required/></label>)}<button disabled={isSubmitting}>{isSubmitting?'Сохраняем…':'Изменить пароль'}</button></form>;}
export function OrderDetails({o,notify}:{o:any;notify:(s:string)=>void}){const [order,setOrder]=useState(o),[busy,setBusy]=useState(false);useEffect(()=>setOrder(o),[o]);useEffect(()=>{if(order.status!=='AWAITING_PAYMENT')return;const t=setInterval(()=>api('orders/'+order.id).then(setOrder).catch(()=>{}),5000);return()=>clearInterval(t);},[order.id,order.status]);return <div className="panel"><div className="section-head"><h2>#{order.id.slice(-8).toUpperCase()}</h2><span className="badge">{statuses[order.status]}</span></div><p>{new Date(order.createdAt).toLocaleString('ru-RU')}</p>{order.items.map((i:any)=><div className="order-item" key={i.id}><b>{i.gameName} / {i.name} × {i.quantity}</b><span>{money(i.unitPrice*i.quantity,order.currency)}</span><dl>{(i.fieldsSnapshot||[]).map((f:any)=><div key={f.key}><dt>{f.label}</dt><dd>{String(i.deliveryData[f.key]??'—')}</dd></div>)}</dl></div>)}<h3>Итого: {money(order.total,order.currency)}</h3><p>Оплата: {order.payment?.status==='PAID'?'Подтверждена':order.payment?.status==='REFUNDED'?'Возврат выполнен':'Не подтверждена'}</p>{order.status==='AWAITING_PAYMENT'&&<button disabled={busy} onClick={async()=>{setBusy(true);try{const p=await api('payments/create','POST',{orderId:order.id});window.location.assign(p.url);}catch(e){notify((e as Error).message);}finally{setBusy(false);}}}>{busy?'Подождите…':'Оплатить заказ →'}</button>}<Link className="button secondary" href="/support">Помощь с заказом</Link></div>;}
function Support({user,notify}:{user:any;notify:(s:string)=>void}){const [tickets,setTickets]=useState<any[]>([]);const {register,handleSubmit,reset,formState:{isSubmitting}}=useForm();const load=useCallback(()=>api('support').then(setTickets).catch(e=>notify(e.message)),[notify]);useEffect(()=>{if(user)load();},[user,load]);if(!user)return <div className="panel"><p>Войдите, чтобы написать в поддержку и видеть ответы.</p><Link className="button" href="/login?next=/support">Войти</Link></div>;return <div className="account-grid"><form className="panel" onSubmit={handleSubmit(async d=>{try{await api('support','POST',d);reset();notify('Обращение отправлено');load();}catch(e){notify((e as Error).message);}})}><h2>Новое обращение</h2><label>Тема<input {...register('subject')} minLength={3} maxLength={150} required/></label><label>Сообщение<textarea {...register('message')} minLength={10} maxLength={5000} required placeholder="Укажите номер заказа и опишите вопрос"/></label><button disabled={isSubmitting}>{isSubmitting?'Отправляем…':'Отправить'}</button></form><div>{tickets.length?tickets.map(t=><div className="panel" key={t.id}><h3>{t.subject}</h3><p>{t.message}</p><small>{new Date(t.createdAt).toLocaleString('ru-RU')} · {t.status==='OPEN'?'Открыто':'Закрыто'}</small>{t.reply&&<blockquote>{t.reply}</blockquote>}</div>):<Empty text="Обращений пока нет"/>}</div></div>;}
function Legal({section,config}:{section:string;config:any}){const titles:Record<string,string>={terms:'Пользовательское соглашение',privacy:'Политика конфиденциальности',refunds:'Правила возврата',contacts:'Контакты'};return <article className="legal panel"><h1>{titles[section]}</h1>{!config.legalApproved&&<p className="alert">Шаблон документа. До начала коммерческих продаж оператор обязан заполнить реквизиты и утвердить условия для своей юрисдикции.</p>}<p>Оператор: {config.legalName||'Реквизиты не заполнены'}<br/>Адрес: {config.legalAddress||'Не заполнен'}<br/>Связь: {config.supportEmail?<a href={'mailto:'+config.supportEmail}>{config.supportEmail}</a>:<Link href="/support">Служба поддержки</Link>}</p>{section==='terms'&&<><h2>1. Предмет соглашения</h2><p>Магазин принимает заказы на цифровые игровые товары, указанные в каталоге. Названия игр принадлежат правообладателям. Продажи допускаются только при наличии разрешённого способа передачи и соблюдении законодательства.</p><h2>2. Заказ и выдача</h2><p>Покупатель указывает достоверные данные получателя, проверяет пакет и сумму. Договор заключается в порядке, установленном применимым законодательством. Выдача начинается после серверного подтверждения платежа и производится согласно инструкции товара. Пароли от игровых аккаунтов не запрашиваются.</p><h2>3. Ответственность и споры</h2><p>При ошибке, задержке или неверных данных обратитесь в поддержку с номером заказа. Обязательные права потребителя не ограничиваются этим документом. До запуска оператор обязан определить сроки исполнения, применимое право, возрастные ограничения и порядок разрешения споров.</p></>}{section==='privacy'&&<><h2>Какие данные обрабатываются</h2><p>Email, хеш пароля, имя, данные получателя товара, история заказов, обращения и технические данные, необходимые для защиты сервиса. Сессионная cookie используется для входа и имеет HttpOnly и SameSite. Данные карты обрабатывает Stripe.</p><h2>Для чего</h2><p>Авторизация, исполнение заказа, поддержка, предотвращение злоупотреблений и соблюдение обязанностей оператора. Доступ ограничен ролями. Платёжный сервис, почтовый провайдер и хранилище получают только необходимые для работы данные.</p><h2>Права и сроки</h2><p>Запрос на доступ, исправление или удаление направляется оператору через поддержку. Данные, которые необходимо хранить по закону, удаляются после истечения обязательного срока. До запуска оператор указывает правовое основание, точные сроки хранения, страны обработки и уполномоченный контакт.</p></>}{section==='refunds'&&<><h2>Запрос возврата</h2><p>Направьте номер заказа и причину в поддержку. Неисполненные, ошибочно выданные и спорные заказы рассматриваются индивидуально с учётом законодательства. Укажите корректные данные до оплаты.</p><h2>Возврат платежа</h2><p>После одобрения возврат направляется через Stripe на исходный способ оплаты. Срок зачисления зависит от банка. Магазин показывает статус после подтверждения платёжной системы. Законные права потребителя, включая применимые исключения для цифрового контента, сохраняются.</p><p>До коммерческого запуска оператор утверждает сроки рассмотрения, условия начала исполнения цифрового заказа и правила частичного возврата. Интерфейс поддерживает полный возврат заказа.</p></>}{section==='contacts'&&<><p>Обращения принимаются через защищённую форму поддержки. В обращении укажите номер заказа; никогда не отправляйте пароль или реквизиты карты.</p><Link className="button" href="/support">Открыть поддержку →</Link></>}</article>;}
```

## FILE:
/workspace/game-store/components/ui.tsx

Тип: tsx (.tsx)

```tsx
'use client';
import { useEffect,useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
export async function api(url:string,method='GET',body?:unknown){const r=await fetch('/api/'+url,{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined,credentials:'same-origin'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Ошибка запроса');return data;}
export function money(value:number,currency='usd'){return new Intl.NumberFormat('ru-RU',{style:'currency',currency}).format(value/100);}
export const statuses:Record<string,string>={NEW:'Новый',AWAITING_PAYMENT:'Ожидает оплаты',PAID:'Оплачен',PROCESSING:'В обработке',COMPLETED:'Выполнен',CANCELLED:'Отменён',REFUNDED:'Возвращён',PAYMENT_FAILED:'Ошибка оплаты'};
export function Empty({text='Пока ничего нет'}:{text?:string}){return <div className="empty"><span>◇</span><h3>{text}</h3><Link href="/catalog">Открыть каталог →</Link></div>;}
export function Loading(){return <div className="grid">{[1,2,3,4].map(v=><div className="skeleton card" key={v}/>)}</div>;}
export function Art({src,name,large=false}:{src?:string;name:string;large?:boolean}){return <div className={'art '+(large?'large':'')}>{src?<Image src={src} alt={name} fill sizes={large?'(max-width: 700px) 100vw, 50vw':'(max-width: 700px) 50vw, 25vw'} style={{objectFit:'cover'}}/>:<><span className="art-orbit"/><b>{name.slice(0,2).toUpperCase()}</b><span className="art-caption">DIGITAL GOODS</span></>}</div>;}
export function GameCard({g}:{g:any}){return <Link href={'/games/'+g.slug} className="game-card"><Art src={g.image} name={g.name}/><div className="card-body"><span className="eyebrow">ИГРА / ПРИЛОЖЕНИЕ</span><h3>{g.name}</h3><p>{g.products?.length?`От ${money(Math.min(...g.products.map((p:any)=>p.price)),g.products[0].currency)}`:'Открыть раздел'} <span>↗</span></p></div></Link>;}
export function ProductCard({p,add}:{p:any;add:(p:any)=>void}){const discount=p.oldPrice?Math.round((1-p.price/p.oldPrice)*100):0;return <article className="product-card"><Link href={'/products/'+p.slug}><Art src={p.image||p.game.image} name={p.game.name}/></Link><div className="card-body"><span className="eyebrow">{p.game.name}</span><Link href={'/products/'+p.slug}><h3>{p.name}</h3></Link><span className={'stock '+(p.stock?'':'out')}>{p.stock?'● В наличии':'○ Нет в наличии'}</span><div className="price-row"><div><b>{money(p.price,p.currency)}</b>{p.oldPrice&&<del>{money(p.oldPrice,p.currency)}</del>}</div>{discount>0&&<span className="badge">−{discount}%</span>}</div><button disabled={!p.stock} onClick={()=>add(p)}>В корзину <span>＋</span></button></div></article>;}
export function SearchBox({large=false}:{large?:boolean}){
 const [q,setQ]=useState(''),[data,setData]=useState<any>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const c=new AbortController();if(q.trim().length<2){setData(null);return;}const t=setTimeout(async()=>{setBusy(true);setError('');try{const r=await fetch('/api/search?q='+encodeURIComponent(q),{signal:c.signal});const d=await r.json();if(!r.ok)throw new Error(d.error);setData(d);}catch(e){if((e as Error).name!=='AbortError')setError((e as Error).message);}finally{if(!c.signal.aborted)setBusy(false);}},300);return()=>{clearTimeout(t);c.abort();};},[q]);
 return <div className={'search-box '+(large?'search-large':'')}><form action="/search"><span>⌕</span><input name="q" placeholder="Игра, валюта или товар…" value={q} onChange={e=>setQ(e.target.value)} aria-label="Поиск" autoComplete="off"/><button aria-label="Найти">{busy?'…':'→'}</button></form>{(data||error)&&<div className="suggestions">{error?<p>{error}</p>:<>{data.games.map((g:any)=><Link key={g.id} href={'/games/'+g.slug} onClick={()=>setData(null)}>{g.name}<small>Раздел ↗</small></Link>)}{data.products.slice(0,5).map((p:any)=><Link key={p.id} href={'/products/'+p.slug} onClick={()=>setData(null)}>{p.name}<small>{money(p.price,p.currency)}</small></Link>)}{!data.games.length&&!data.products.length&&<p>Ничего не найдено</p>}</>}</div>}</div>;
}
export const faqs=[['Как получить товар?','Выберите пакет, заполните поля получателя и оплатите заказ. После подтверждения оплаты оператор выполнит выдачу указанным в товаре способом. Статус доступен в разделе «Мои заказы».'],['Нужно ли передавать пароль от игры?','Нет. Мы не запрашиваем пароль от игрового аккаунта. Указывайте только идентификаторы получателя, перечисленные в форме заказа.'],['Почему платёж ещё не подтверждён?','Статус обновляется после уведомления от платёжной системы. Открытие страницы успешной оплаты само по себе не подтверждает платёж.'],['Можно ли вернуть деньги?','Обратитесь в поддержку с номером заказа. Условия зависят от стадии выполнения и применимого законодательства; они описаны в правилах возврата.']];
export function Faq(){return <div className="faq">{faqs.map(([q,a])=><details key={q}><summary>{q}<span>＋</span></summary><p>{a}</p></details>)}</div>;}
export function Pager({page,pages,onChange}:{page:number;pages:number;onChange:(p:number)=>void}){return pages>1?<div className="pager"><button disabled={page<=1} onClick={()=>onChange(page-1)}>←</button><span>{page} / {pages}</span><button disabled={page>=pages} onClick={()=>onChange(page+1)}>→</button></div>:null;}
```

## FILE:
/workspace/game-store/docker-compose.yml

Тип: yaml (.yml)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-store}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env}
      POSTGRES_DB: ${POSTGRES_DB:-game_store}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 5s
      timeout: 5s
      retries: 20
    restart: unless-stopped
  app:
    build: .
    env_file: .env
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-store}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB:-game_store}?schema=public
      NODE_ENV: production
    ports:
      - "127.0.0.1:3000:3000"
    depends_on:
      db:
        condition: service_healthy
    command: ["sh", "-c", "npm run db:migrate && npm run db:seed && npm start"]
    volumes:
      - uploads:/app/public/uploads
    restart: unless-stopped
volumes:
  postgres_data:
  uploads:
```

## FILE:
/workspace/game-store/docs/ADMIN-UPDATE.md

Тип: markdown (.md)

````markdown
# Изменения существующего магазина

Изменения внесены поверх проекта game-store. Исходная схема, регистрация, сессии, роли, поиск, корзина, Stripe, история заказов, категории и личный кабинет сохранены. Дополнительная миграция создаёт только StoreSetting.

## Для владельца магазина

- `/admin` открывается обычным браузером и доступна только ADMIN.
- Меню: Главная, Игры, Товары, Заказы, Пользователи, Настройки; дополнительные категории, поддержка и журналы сохранены.
- Большие кнопки **+ Добавить товар**, **+ Добавить игру**, **+ Добавить категорию**.
- Обычные формы с названиями, выбором игры/категории, количеством валюты, ценой, старой ценой, описанием, изображением, наличием, публикацией и инструкцией.
- Цены вводятся в обычных единицах. В рублёвом магазине **799 → 799 ₽**, **749,90 → 749 ₽ 90 копеек**. В БД сохраняются 79900 и 74990; старые денежные значения не мигрируют и не пересчитываются. У существующего магазина сохранена его валюта.
- Адрес товара и незаданный адрес игры формируются сервером по названию. Новые игры и товары берутся из PostgreSQL. ID, JSON, SQL и параметры подключения в формах не отображаются.
- PNG/JPG/JPEG/WEBP выбираются кнопкой из проводника или галереи, показывается превью. URL вручную вводить не нужно. MIME, содержимое и размер проверяются сервером, файл перекодируется в WEBP.
- **Редактировать**, **Удалить**, **Скрыть / Показать** рядом с товаром и игрой. Скрытие меняет только публикацию и не перезаписывает цену или резервированный остаток.
- Мобильные карточки, формы в один столбец, большие кнопки, прокрутка формы и закреплённые действия сохранения.
- Название магазина и email поддержки меняются в Настройках и сохраняются в БД.

## Запуск

После установки Node.js 22.12+ и Docker Desktop:

```bash
npm install
npm run dev
```

Откройте **http://localhost:3000**. При первом локальном запуске создайте администратора на **http://localhost:3000/setup**. Последующие входы — `/login`, панель — `/admin`. Никаких команд для добавления каждого товара не требуется.

`npm run dev` создаёт отсутствующую `.env` с уникальными секретами, подключает существующую PostgreSQL либо запускает её через Docker, выполняет миграции и idempotent seed. В терминале печатается адрес магазина. Для телефона в той же Wi-Fi сети используйте `npm run dev -- --lan` после создания администратора и откройте напечатанный сетевой адрес, а не localhost телефона.

Создание первого администратора через браузер возможно только в локальном development, на loopback-интерфейсе, и только до появления первого ADMIN. В LAN и production функция отключена. Регистрация покупателей не выдаёт ADMIN. Одновременные setup-запросы сериализуются блокировкой PostgreSQL.

## Проверено

- TypeScript и production build: PASS.
- 8 unit-тестов, включая точный ввод денежных значений и UUID на мобильном HTTP LAN без randomUUID: PASS.
- React-формы в JSDOM + настоящий HTTP-сервер + настоящий PostgreSQL: PASS. Добавлен **1000 Gold**, загружен PNG, сохранена цена **799 ₽**, найден товар в игре и поиске, цена изменена на **749 ₽**, проверены скрытие и повторная публикация; добавлены **PUBG Mobile** и **60 UC**; настройки сохранены.
- Сервер остановлен и запущен заново командой `npm run dev`: цена 749 ₽, товар, файл изображения, поисковый результат, новая игра и настройки сохранились.
- LAN-адрес доступен по HTTP; изображение и товар читаются, setup API возвращает 403: PASS.
- Удаление созданных тестовых товаров и игры через защищённые ADMIN API: PASS.
- Регрессионный HTTP-тест регистрации, login/logout, RBAC, CSRF, заказов, резерва, подписи/суммы/повторов webhook, истории, смены пароля и поддержки: PASS.
- Запрет новых настроек и публикации для USER, запрет setup в production: PASS.
- 28 маршрутов, HTTP 404/redirects, security headers, загрузка JS/CSS production-сайта: PASS.
- `docker compose config --quiet`: PASS.
- `npm audit`: 0 известных уязвимостей на момент проверки.

Контрольные записи после проверки перезапуска удалены из отдельной тестовой БД. Настоящие пользовательские данные не удалялись. Данные в архиве — исходники, не дамп проверочной БД.

## Ограничения проверки

Настоящий браузер Chrome/Safari/Firefox и управление нативной галереей здесь недоступны: выполнен интерактивный DOM-тест форм, а не визуальное браузерное испытание. Реальные устройства следует проверить после запуска. Docker-сокет заблокирован окружением; команда dev проверена с уже работающей настоящей PostgreSQL, а Docker fallback и запуск контейнеров здесь не выполнялись. Настоящая Stripe-операция, SMTP и внешнее S3 всё ещё требуют ваших ключей и проверок по README. Имитация оплаты не добавлялась.

Для обновления своего проекта сохраните `.env`, `public/uploads` и PostgreSQL volume; замените исходники, установите зависимости и запустите обычную команду. README содержит отдельные шаги для Docker и production.
````

## FILE:
/workspace/game-store/docs/API.md

Тип: markdown (.md)

```markdown
# API

Все ответы JSON, персональные данные Cache-Control: no-store. Мутации требуют Origin = APP_URL. Авторизация: cookie session. Ошибки `{ "error": "..." }`, HTTP 400/401/403/404/409/413/429/500/503. Полные схемы полей: `lib/validation.ts`.

| Method | Path | Доступ / назначение |
|---|---|---|
| GET | /api/config | Публичные реквизиты и режим |
| GET | /api/games | Опубликованные игры |
| GET | /api/games/:slug | Игра и пагинация товаров |
| GET | /api/products | Каталог: page, game, category, stock |
| GET | /api/products/:slug | Товар, поля, варианты и изображения |
| GET | /api/search?q= | Поиск названия/алиасов/тегов |
| POST | /api/cart-products | Публичный batch: ids, не более 30 |
| POST | /api/auth/register | email, password, confirmPassword, name? |
| POST | /api/auth/login | email, password |
| POST | /api/auth/logout | Удаление сессии |
| GET | /api/auth/me | Текущий пользователь |
| GET / POST | /api/auth/setup | Только первый локальный development-запуск: проверка доступности / создание первого ADMIN |
| POST | /api/auth/forgot-password | email, отправка SMTP |
| POST | /api/auth/reset-password | token, password, confirmPassword |
| POST | /api/auth/change-password | USER: currentPassword, password, confirmPassword |
| PATCH | /api/account | USER: name |
| POST | /api/orders | USER: checkoutKey UUID, items [{productId,quantity,deliveryData}] |
| GET | /api/orders | USER: только свои заказы, page |
| GET | /api/orders/:id | USER: только собственный заказ |
| POST | /api/payments/create | USER: orderId; hosted Checkout URL |
| POST | /api/webhooks/payment | Raw body + Stripe-Signature, без cookie/Origin |
| GET / POST | /api/support | USER: обращения / {subject,message} |
| GET | /api/admin/dashboard | ADMIN: статистика и выручка |
| GET / PATCH | /api/admin/settings | ADMIN: название магазина и email поддержки |
| PATCH | /api/admin/products/:id/visibility | ADMIN: published, без изменения цены и остатка |
| PATCH | /api/admin/games/:id/visibility | ADMIN: published |
| GET / POST | /api/admin/games | ADMIN: список / новая игра |
| PATCH / DELETE | /api/admin/games/:id | ADMIN: полная модель + updatedAt / удаление |
| GET / POST | /api/admin/categories | ADMIN: список / новая категория |
| PATCH / DELETE | /api/admin/categories/:id | ADMIN: редактирование / удаление |
| GET / POST | /api/admin/products | ADMIN: фильтры / новый товар |
| GET / PATCH / DELETE | /api/admin/products/:id | ADMIN: чтение / полная модель + updatedAt / удаление |
| POST | /api/admin/uploads | ADMIN: multipart file |
| GET | /api/admin/orders | ADMIN: q,status,from,to,user,page |
| GET / PATCH | /api/admin/orders/:id | ADMIN: детали / status?,internalComment? |
| POST | /api/admin/refunds/:orderId | ADMIN: полный возврат Stripe |
| GET | /api/admin/users | ADMIN: q,page |
| GET / PATCH | /api/admin/users/:id | ADMIN: аккаунт и заказы / blocked |
| GET | /api/admin/support | ADMIN: обращения, page |
| PATCH | /api/admin/support/:id | ADMIN: reply,status |
| GET | /api/admin/logs | ADMIN: журнал, page |
| GET | /api/admin/payments | ADMIN: события платежей, page |

POST/PATCH игры и товара отправляют полную редактируемую модель; лишние read-only поля схемы удаляют. Админка делает это автоматически. Заказ имеет строгую схему, запрещающую цену или произвольные дополнительные поля. Создание платежа отдельное от создания заказа; повторный checkoutKey возвращает тот же заказ. Refund API не изменяет статус оплаты напрямую.

Создание игры, категории и товара может не передавать slug: сервер формирует читаемый уникальный адрес по названию. UI показывает обычные денежные единицы и переводит их в целые копейки/центы до отправки; сервер по-прежнему валидирует целые минимальные единицы. Для PATCH товара требуется updatedAt текущей версии. Настройки сохраняются в StoreSetting, старые таблицы и данные сохранены. Local setup недоступен в production и при --lan.
```

## FILE:
/workspace/game-store/docs/TREE.txt

Тип: text (.txt)

```text
game-store/
├── app
│   ├── 404
│   │   └── page.tsx
│   ├── [[...path]]
│   │   └── page.tsx
│   ├── api
│   │   └── [...path]
│   │       └── route.ts
│   ├── setup
│   │   └── page.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components
│   ├── admin.tsx
│   ├── catalog-editor.tsx
│   ├── setup-form.tsx
│   ├── store.tsx
│   └── ui.tsx
├── docs
│   ├── ADMIN-UPDATE.md
│   ├── API.md
│   ├── SOURCE.md
│   ├── TREE.txt
│   └── VERIFICATION.md
├── lib
│   ├── catalog.ts
│   ├── client-id.ts
│   ├── db.ts
│   ├── mail.ts
│   ├── money.ts
│   ├── orders.ts
│   ├── payments.ts
│   ├── security.ts
│   ├── settings.ts
│   ├── slug.ts
│   ├── storage.ts
│   └── validation.ts
├── prisma
│   ├── migrations
│   │   ├── 20261014000000_init
│   │   │   └── migration.sql
│   │   ├── 20261014010000_store_settings
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public
│   ├── assets
│   │   ├── roblox.webp
│   │   ├── standoff-2.webp
│   │   ├── telegram.webp
│   │   └── warface.webp
│   └── uploads
│       └── .gitkeep
├── scripts
│   ├── create-admin.ts
│   ├── dev.mjs
│   └── maintenance.ts
├── tests
│   ├── admin-ui.tsx
│   ├── integration.ts
│   ├── routes.ts
│   └── security.test.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── AGENTS.md
├── Dockerfile
├── README.md
├── docker-compose.yml
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── proxy.ts
└── tsconfig.json
```

## FILE:
/workspace/game-store/docs/VERIFICATION.md

Тип: markdown (.md)

```markdown
Текущая проверка доработки админки: [ADMIN-UPDATE.md](ADMIN-UPDATE.md). Этот документ также сохраняет результаты проверки базового магазина.

# Результаты проверки — 14 октября 2026

Проверялся созданный проект, не отдельный макет. Окружение: Node.js 24.19.0, Next.js 16.4.0, Prisma 6.19.0, настоящий локальный PostgreSQL 18.4. Docker-конфигурация использует PostgreSQL 16: схема не использует специфичные для PostgreSQL 18 функции.

## Выполнено успешно

| Проверка | Результат |
|---|---|
| `npm run typecheck` | PASS |
| `npm test` | PASS, 8 тестов |
| `npm run build` | PASS, production build Next.js 16.4 |
| `prisma migrate deploy` | PASS, initial SQL migration + StoreSetting migration |
| Seed, включая повторный запуск | PASS, 4 игры и 20 товаров, без дубликатов |
| `npm run test:integration` | PASS, реальные PostgreSQL и HTTP |
| `npm run test:smoke` | PASS, 28 URL и security headers |
| `npm audit` (включая dev dependencies) | 0 известных уязвимостей на момент проверки |
| `docker compose config --quiet` | PASS |
| Регистрация и bcrypt hash | PASS |
| Login, logout, cookie session | PASS |
| USER/ADMIN, запрет admin API | PASS |
| CSRF: неверный Origin | PASS, 403 |
| CRUD игры, категории, товара | Создание и изменение проверены HTTP |
| Цена сохраняется в БД | PASS |
| Устаревшая форма товара | PASS, 409 вместо перезаписи резерва |
| Поиск по альтернативному русскому названию | PASS |
| Batch товаров для корзины | Реализован, использует PostgreSQL |
| Upload PNG и чтение нового WEBP без перезапуска | PASS |
| HTML под MIME image/png | PASS, отклонён |
| Создание заказа, обязательные поля | PASS |
| Цена только на сервере | PASS, frontend price отклонён |
| Повторный checkoutKey | PASS, один заказ и один резерв |
| Одновременные заказы при недостатке остатка | PASS, только один создаётся |
| Истёкшая оплата и повтор webhook | PASS, остаток восстановлен один раз |
| Чужой заказ | PASS, 404 |
| `/success` не подтверждает оплату | PASS |
| Неверная подпись webhook | PASS, 400 |
| Неверная сумма webhook | PASS, 400 |
| Подписанный paid webhook и повтор | PASS, PAID и один PaymentEvent |
| Выполнение неоплаченного заказа | PASS, 409 |
| PAID → PROCESSING → COMPLETED | PASS |
| История заказов | PASS |
| Смена пароля, аннулирование старых сессий | PASS |
| Одноразовый reset token | PASS |
| Обращение и ответ поддержки | PASS |
| Блокировка пользователя | PASS, сессия перестаёт работать |
| 404 отсутствующих страниц, игр, товаров | PASS, настоящий HTTP 404 |
| Приватные страницы без cookie | PASS, HTTP 307 на login |

Интеграционные пользователи, заказы и временная игра удалены после тестов. В проверочной БД остались только seed данные: 4 игры, 20 товаров, 0 пользователей и 0 заказов.

## Границы проверки

- Stripe SDK и реальный hosted Checkout реализованы. Тест использовал **локально подписанные fixture-события**, а не банковскую операцию. Создание настоящей Checkout-сессии, оплата тестовой картой, реальный retry Stripe и возврат требуют ключей вашего Stripe sandbox и проверки по README. Без ключей приложение не имитирует оплату.
- SMTP интеграция реализована. Отправка по реальному SMTP-серверу не проверялась; одноразовый сброс пароля и изменение bcrypt hash проверены напрямую через HTTP.
- S3/R2 интеграция реализована. Подтверждена локальная загрузка и безопасное перекодирование. Внешнее S3-хранилище требует credentials и своего испытания.
- Docker daemon socket недоступен в песочнице. Compose-конфигурация проверена; образ и полный `docker compose up` в этом окружении не запускались.
- Browser-control недоступен. Формы админки дополнительно проверены интерактивно в JSDOM с настоящими HTTP и PostgreSQL; визуальная проверка на iPhone/Android не проводилась. DOM/HTTP проверки не заменяют проверку настоящего браузера.
- Юридические документы — шаблоны. Production требует утверждения оператором и подтверждения разрешённых продаж для каждой игры. Нельзя считать seed разрешением продавать валюту указанных сервисов.
- Выдача ручная. Автоматический неофициальный перевод игровой валюты не реализован и не подразумевается. Перед запуском оператор задаёт реальные инструкции и сроки в товарах.

Проверки не являются обещанием отсутствия всех ошибок или результатом внешнего security audit. README содержит порядок staging-проверки и коммерческого запуска.
```

## FILE:
/workspace/game-store/lib/catalog.ts

Тип: typescript (.ts)

```typescript
import { Prisma } from '@prisma/client';
import { db } from './db';
import { normalizeSearch } from './validation';
export const productInclude={game:true,category:true,fields:{orderBy:{sortOrder:'asc' as const}},images:{orderBy:{sortOrder:'asc' as const}}} as const;
export function pageParams(params:URLSearchParams){const page=Math.max(1,Math.min(10000,Number(params.get('page'))||1));return {page,take:24,skip:(page-1)*24};}
export async function search(q:string) {
 q=normalizeSearch(q).slice(0,100);if(!q)return {games:[],products:[]};
 // Parameterized SQL supports aliases/tags, Cyrillic, substrings and ё/е normalization.
 const pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%';
 const gameIds=await db.$queryRaw<{id:string}[]>`SELECT id FROM "Game" WHERE published=true AND (replace(lower(name),'ё','е') LIKE ${pattern} OR EXISTS (SELECT 1 FROM unnest(aliases) a WHERE replace(lower(a),'ё','е') LIKE ${pattern})) ORDER BY "sortOrder" LIMIT 8`;
 const productIds=await db.$queryRaw<{id:string}[]>`SELECT p.id FROM "Product" p JOIN "Game" g ON g.id=p."gameId" WHERE p.published=true AND g.published=true AND (replace(lower(p.name),'ё','е') LIKE ${pattern} OR replace(lower(g.name),'ё','е') LIKE ${pattern} OR EXISTS (SELECT 1 FROM unnest(p.aliases || p.tags || g.aliases) a WHERE replace(lower(a),'ё','е') LIKE ${pattern})) ORDER BY p.price LIMIT 24`;
 const [games,products]=await Promise.all([db.game.findMany({where:{id:{in:gameIds.map(r=>r.id)}},orderBy:{sortOrder:'asc'}}),db.product.findMany({where:{id:{in:productIds.map(r=>r.id)}},include:productInclude,orderBy:{price:'asc'}})]);
 return {games,products};
}
export async function catalog(params:URLSearchParams,admin=false) {
 const {page,take,skip}=pageParams(params);const where:Prisma.ProductWhereInput=admin?{}:{published:true,game:{published:true}};
 if(params.get('game'))where.gameId=params.get('game')!;
 if(params.get('category'))where.categoryId=params.get('category')!;
 if(params.get('q'))where.name={contains:params.get('q')!.slice(0,100),mode:'insensitive'};
 if(admin && params.get('published'))where.published=params.get('published')==='true';
 if(params.get('stock')==='true')where.stock={gt:0};if(params.get('stock')==='false')where.stock=0;
 if(params.get('min') || params.get('max'))where.price={...(params.get('min')?{gte:Math.max(0,Number(params.get('min'))||0)}:{}),...(params.get('max')?{lte:Math.max(0,Number(params.get('max'))||0)}:{})};
 if(params.get('sort')==='popular' && !admin){const ranked=await db.orderItem.groupBy({by:['productId'],where:{order:{paidAt:{not:null},status:{not:'REFUNDED'}}},_sum:{quantity:true},orderBy:{_sum:{quantity:'desc'}},take:24});const products=await db.product.findMany({where,include:productInclude,orderBy:{createdAt:'desc'},take:24});const popular=await db.product.findMany({where:{...where,id:{in:ranked.map(r=>r.productId)}},include:productInclude});const ordered=ranked.map(r=>popular.find(v=>v.id===r.productId)).filter(Boolean);return {items:[...ordered,...products.filter(v=>!ordered.some(p=>p?.id===v.id))].slice(0,24),count:await db.product.count({where}),page:1,pages:1};}
 const [items,count]=await Promise.all([db.product.findMany({where,include:productInclude,orderBy:{createdAt:'desc'},take,skip}),db.product.count({where})]);return {items,count,page,pages:Math.ceil(count/take)};
}
```

## FILE:
/workspace/game-store/lib/client-id.ts

Тип: typescript (.ts)

```typescript
/** randomUUID is unavailable on plain HTTP LAN addresses in some mobile browsers. */
export function clientId(source: Pick<Crypto,'getRandomValues'> & Partial<Pick<Crypto,'randomUUID'>> = globalThis.crypto): string {
 if(typeof source.randomUUID==='function')return source.randomUUID();
 const bytes=source.getRandomValues(new Uint8Array(16));
 bytes[6]=(bytes[6]&0x0f)|0x40;bytes[8]=(bytes[8]&0x3f)|0x80;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
```

## FILE:
/workspace/game-store/lib/db.ts

Тип: typescript (.ts)

```typescript
import { PrismaClient } from '@prisma/client';
const globalDb = globalThis as unknown as { db?: PrismaClient };
export const db = globalDb.db ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalDb.db = db;
```

## FILE:
/workspace/game-store/lib/mail.ts

Тип: typescript (.ts)

```typescript
import nodemailer from 'nodemailer';
export async function sendReset(email:string,token:string) {
 const link=`${process.env.APP_URL}/reset-password?token=${token}`;
 if(!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new Error('SMTP не настроен');
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});
 await transport.sendMail({from:process.env.SMTP_FROM,to:email,subject:'Восстановление пароля NEXUS',text:`Для изменения пароля откройте ${link}\nСсылка действительна 30 минут. Если вы не запрашивали сброс, проигнорируйте письмо.`});
}
```

## FILE:
/workspace/game-store/lib/money.ts

Тип: typescript (.ts)

```typescript
/** Convert user-entered major units to integer minor units without floating point arithmetic. */
export function majorToMinor(value: string): number {
  const normalized = value.trim().replace(',', '.');
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) throw new Error('Введите цену числом, например 799 или 799,90.');
  const result = Number(match[1]) * 100 + Number((match[2] || '').padEnd(2, '0'));
  if (!Number.isSafeInteger(result) || result > 100000000) throw new Error('Цена слишком большая.');
  return result;
}
export function minorToMajor(value: number): string {
  const whole = Math.floor(value / 100);
  const fraction = String(value % 100).padStart(2, '0');
  return fraction === '00' ? String(whole) : `${whole},${fraction}`;
}
export function currencyLabel(currency: string): string {
  return ({ rub: '₽', usd: '$', eur: '€' } as Record<string, string>)[currency] || currency.toUpperCase();
}
```

## FILE:
/workspace/game-store/lib/orders.ts

Тип: typescript (.ts)

```typescript
import { Prisma } from '@prisma/client';
import { db } from './db';
import { ApiError } from './security';
import { checkoutSchema, fieldsSchema, totalMinor, validateDelivery } from './validation';
export const orderInclude = {items:true,payment:true} as const;
export async function createOrder(userId:string,body:unknown) {
 const input=checkoutSchema.parse(body);
 const existing=await db.order.findUnique({where:{userId_checkoutKey:{userId,checkoutKey:input.checkoutKey}},include:orderInclude});
 if(existing) return existing;
 if(new Set(input.items.map(i=>i.productId)).size!==input.items.length) throw new ApiError(400,'Объедините повторяющиеся товары');
 try {return await db.$transaction(async tx=>{
  const rows=[];
  for(const item of [...input.items].sort((a,b)=>a.productId.localeCompare(b.productId))) {
   await tx.$queryRaw`SELECT id FROM "Product" WHERE id=${item.productId} FOR UPDATE`;
   const p=await tx.product.findUnique({where:{id:item.productId},include:{game:true,fields:{orderBy:{sortOrder:'asc'}}}});
   if(!p || !p.published || !p.game.published) throw new ApiError(400,'Товар недоступен');
   if(process.env.PAYMENT_MODE==='production' && (!p.game.saleAllowed || !p.game.permissionReference)) throw new ApiError(400,'Продажи для этой игры не разрешены');
   if(item.quantity<p.minQuantity || item.quantity>p.maxQuantity || item.quantity>p.stock) throw new ApiError(400,`Недопустимое количество: ${p.name}`);
   if(p.currency!==(process.env.STORE_CURRENCY||'rub')) throw new ApiError(400,'Валюта товара не соответствует валюте магазина');
   const fields=fieldsSchema.parse(p.fields.length?p.fields:p.game.fields);
   let deliveryData;try{deliveryData=validateDelivery(fields,item.deliveryData);}catch(e){throw new ApiError(400,(e as Error).message);}
   await tx.product.update({where:{id:p.id},data:{stock:{decrement:item.quantity}}});
   rows.push({productId:p.id,name:p.name,gameName:p.game.name,quantity:item.quantity,unitPrice:p.price,deliveryData,fieldsSnapshot:fields});
  }
  const total=totalMinor(rows.map(r=>({price:r.unitPrice,quantity:r.quantity})));
  return tx.order.create({data:{userId,checkoutKey:input.checkoutKey,status:'AWAITING_PAYMENT',total,currency:process.env.STORE_CURRENCY||'rub',expiresAt:new Date(Date.now()+35*60000),items:{create:rows},payment:{create:{amount:total,currency:process.env.STORE_CURRENCY||'rub'}}},include:orderInclude});
 });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2002'){const o=await db.order.findUnique({where:{userId_checkoutKey:{userId,checkoutKey:input.checkoutKey}},include:orderInclude});if(o)return o;}throw e;}
}
export async function releaseStock(tx:Prisma.TransactionClient,id:string,status:'CANCELLED'|'PAYMENT_FAILED'|'REFUNDED') {
 const order=await tx.order.findUniqueOrThrow({where:{id},include:{items:true}});
 if(!order.stockReleased) {
  for(const i of [...order.items].sort((a,b)=>a.productId.localeCompare(b.productId))) await tx.product.update({where:{id:i.productId},data:{stock:{increment:i.quantity}}});
 }
 await tx.order.update({where:{id},data:{status,stockReleased:true}});
}
export function publicOrder(o:any) {const {internalComment,userId,checkoutKey,...rest}=o; if(rest.payment){const {url,...payment}=rest.payment;rest.payment=payment;}return rest;}
```

## FILE:
/workspace/game-store/lib/payments.ts

Тип: typescript (.ts)

```typescript
import Stripe from 'stripe';
import { db } from './db';
import { ApiError } from './security';
import { releaseStock } from './orders';
import { Prisma } from '@prisma/client';
export interface PaymentProvider {create(order:{id:string;total:number;currency:string;expiresAt:Date},email:string):Promise<{id:string;url:string}>;verify(body:string,signature:string):Stripe.Event;cancel(id:string):Promise<void>;refund(intentId:string,orderId:string):Promise<void>}
export function stripeClient() {
 const key=process.env.PAYMENT_SECRET_KEY||''; const mode=process.env.PAYMENT_MODE;
 if(process.env.PAYMENT_PROVIDER!=='stripe' || !['test','production'].includes(mode||'')) throw new ApiError(503,'Платёжный провайдер не настроен');
 if(!(mode==='test'?key.startsWith('sk_test_'):key.startsWith('sk_live_'))) throw new ApiError(503,'Ключ Stripe не соответствует режиму оплаты');
 if(mode==='production' && (process.env.LEGAL_APPROVED!=='true' || !process.env.LEGAL_NAME || !process.env.LEGAL_ADDRESS || !process.env.SUPPORT_EMAIL || !process.env.APP_URL?.startsWith('https://'))) throw new ApiError(503,'Заполните реквизиты и подтвердите юридические документы');
 return new Stripe(key,{maxNetworkRetries:2});
}
export class StripeProvider implements PaymentProvider {
 async create(o:{id:string;total:number;currency:string;expiresAt:Date},email:string) {
  const s=await stripeClient().checkout.sessions.create({mode:'payment',customer_email:email,client_reference_id:o.id,metadata:{orderId:o.id},payment_intent_data:{metadata:{orderId:o.id}},line_items:[{price_data:{currency:o.currency,unit_amount:o.total,product_data:{name:`Заказ ${o.id}`}},quantity:1}],success_url:`${process.env.APP_URL}/success?order=${o.id}`,cancel_url:`${process.env.APP_URL}/payment-error?order=${o.id}`,expires_at:Math.floor(o.expiresAt.getTime()/1000),payment_method_types:['card']},{idempotencyKey:`checkout-${o.id}`});
  if(!s.url) throw new ApiError(502,'Stripe не вернул ссылку'); return {id:s.id,url:s.url};
 }
 verify(body:string,signature:string) {if(!process.env.PAYMENT_WEBHOOK_SECRET)throw new ApiError(503,'Webhook secret не настроен');return stripeClient().webhooks.constructEvent(body,signature,process.env.PAYMENT_WEBHOOK_SECRET);}
 async cancel(id:string){await stripeClient().checkout.sessions.expire(id);}
 async refund(intentId:string,orderId:string){await stripeClient().refunds.create({payment_intent:intentId},{idempotencyKey:`refund-${orderId}`});}
}
export const provider:PaymentProvider=new StripeProvider();
export async function createPayment(userId:string,orderId:string,email:string) {
 const order=await db.order.findFirst({where:{id:orderId,userId},include:{payment:true,items:{include:{product:{include:{game:true}}}}}});
 if(!order)throw new ApiError(404,'Заказ не найден');
 if(process.env.PAYMENT_MODE==='production' && order.items.some(i=>!i.product.game.saleAllowed || !i.product.game.permissionReference))throw new ApiError(400,'Продажа для игры не подтверждена');
 if(order.status!=='AWAITING_PAYMENT' || order.expiresAt<new Date())throw new ApiError(409,'Срок оплаты истёк или заказ уже оплачен');
 if(order.payment?.url)return {url:order.payment.url};
 if(order.expiresAt.getTime()<Date.now()+30*60000)throw new ApiError(409,'Создание платёжной сессии просрочено. Обратитесь в поддержку с номером заказа.');
 await db.payment.updateMany({where:{orderId,status:'CREATED'},data:{status:'CREATING'}});
 const session=await provider.create(order,email);
 await db.$transaction(async tx=>{await tx.payment.update({where:{orderId},data:{providerId:session.id,url:session.url}});await tx.payment.updateMany({where:{orderId,status:{in:['CREATED','CREATING']}},data:{status:'PENDING'}});});
 return {url:session.url};
}
export function checkPaymentIdentity(session:{id:string;amount_total:number|null;currency:string|null;metadata:Record<string,string>|null},payment:{providerId:string|null;amount:number;currency:string;orderId:string}) {
 return session.metadata?.orderId===payment.orderId && (!payment.providerId || session.id===payment.providerId) && session.amount_total===payment.amount && session.currency===payment.currency;
}
export async function handlePaymentEvent(event:Stripe.Event) {
 if(event.livemode !== (process.env.PAYMENT_MODE==='production'))throw new ApiError(400,'Неверный режим webhook');
 const supported=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','charge.refunded','payment_intent.payment_failed'];
 if(!supported.includes(event.type))return {ignored:true};
 try {return await db.$transaction(async tx=>{
  await tx.paymentEvent.create({data:{id:event.id,type:event.type,result:'RECEIVED'}});
  const obj=event.data.object as any;
  let payment;
  if(event.type.startsWith('checkout.session.')) payment=await tx.payment.findFirst({where:{OR:[{providerId:obj.id},...(obj.metadata?.orderId?[{orderId:obj.metadata.orderId}]:[])]}});
  else {const intent=typeof obj.payment_intent==='string'?obj.payment_intent:obj.payment_intent?.id;payment=await tx.payment.findFirst({where:{OR:[{intentId:intent||obj.id},...(obj.metadata?.orderId?[{orderId:obj.metadata.orderId}]:[])]}});}
  if(!payment)throw new ApiError(409,'Платёж ещё не зарегистрирован');
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${payment.orderId} FOR UPDATE`;
  const order=await tx.order.findUniqueOrThrow({where:{id:payment.orderId}});
  await tx.paymentEvent.update({where:{id:event.id},data:{paymentId:payment.id}});
  let result='IGNORED';
  if(event.type.startsWith('checkout.session.')) {
   if(!checkPaymentIdentity(obj,payment))throw new ApiError(400,'Сумма, валюта или ID платежа не совпадают');
   if(!payment.providerId)await tx.payment.update({where:{id:payment.id},data:{providerId:obj.id,url:obj.url}});
   if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type) && obj.payment_status==='paid') {
    if(order.status==='AWAITING_PAYMENT' && !order.stockReleased){await tx.order.update({where:{id:order.id},data:{status:'PAID',paidAt:new Date()}});await tx.payment.update({where:{id:payment.id},data:{status:'PAID',intentId:typeof obj.payment_intent==='string'?obj.payment_intent:obj.payment_intent?.id}});result='PAID';}
   } else if(['checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type) && order.status==='AWAITING_PAYMENT') {
    const status=event.type==='checkout.session.expired'?'CANCELLED':'PAYMENT_FAILED';await releaseStock(tx,order.id,status);await tx.payment.update({where:{id:payment.id},data:{status}});result=status;
   }
  } else if(event.type==='charge.refunded') {
   if(obj.currency!==payment.currency || obj.amount!==payment.amount || obj.payment_intent!==payment.intentId)throw new ApiError(400,'Несоответствие возврата');
   if(obj.refunded && obj.amount_refunded===payment.amount && ['PAID','PROCESSING','COMPLETED'].includes(order.status)){await tx.order.update({where:{id:order.id},data:{status:'REFUNDED'}});await tx.payment.update({where:{id:payment.id},data:{status:'REFUNDED'}});result='REFUNDED';}
  } else { if(obj.amount!==payment.amount || obj.currency!==payment.currency || (payment.intentId && obj.id!==payment.intentId))throw new ApiError(400,'Несоответствие попытки оплаты');result='ATTEMPT_FAILED'; /* Checkout may permit retry. Keep reservation until session expiry. */ }
  await tx.paymentEvent.update({where:{id:event.id},data:{result}});return {received:true,result};
 });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2002' && await db.paymentEvent.findUnique({where:{id:event.id}}))return {duplicate:true};throw e;}
}
```

## FILE:
/workspace/game-store/lib/security.ts

Тип: typescript (.ts)

```typescript
import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
export class ApiError extends Error { constructor(public status:number,message:string) {super(message);} }
export function secret() {const v=process.env.AUTH_SECRET; if(!v || v.length<32) throw new ApiError(503,'AUTH_SECRET не настроен'); return v;}
export function hashToken(v:string) {return createHmac('sha256',secret()).update(v).digest('hex');}
export const safeUser = {id:true,email:true,name:true,role:true,blocked:true,createdAt:true} as const;
export async function currentUser() {return userForToken((await cookies()).get('session')?.value);}
export async function userForToken(token:string|undefined) {
 if(!token) return null;
 const session=await db.session.findUnique({where:{tokenHash:hashToken(token)},include:{user:{select:safeUser}}});
 return session && session.expiresAt>new Date() && !session.user.blocked ? session.user : null;
}
export async function requireUser(admin=false) {const u=await currentUser(); if(!u) throw new ApiError(401,'Войдите в аккаунт'); if(admin && u.role!=='ADMIN') throw new ApiError(403,'Доступ запрещён'); return u;}
export async function newSession(userId:string) {
 const token=randomBytes(32).toString('hex'); const expires=new Date(Date.now()+1000*60*60*24*7);
 await db.session.create({data:{userId,tokenHash:hashToken(token),expiresAt:expires}});
 (await cookies()).set('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires});
}
export async function clearSession() {
 const c=await cookies(); const token=c.get('session')?.value;
 if(token) await db.session.deleteMany({where:{tokenHash:hashToken(token)}});
 c.set('session','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
}
export function checkOrigin(req:NextRequest) {
 const expected=new URL(process.env.APP_URL || 'http://localhost:3000').origin;
 const permitted=process.env.NODE_ENV==='development'?(process.env.DEV_ALLOWED_ORIGINS||'').split(',').filter(Boolean):[];
 if(req.headers.get('origin')!==expected && !permitted.includes(req.headers.get('origin')||'')) throw new ApiError(403,'Неверный источник запроса');
 if(req.headers.get('sec-fetch-site')==='cross-site') throw new ApiError(403,'Недопустимый запрос');
}
export async function rateLimit(req:NextRequest,scope:string,limit=30,seconds=60,identity='') {
 const ip=process.env.TRUST_PROXY==='true' ? (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown') : 'shared';
 const bucket=Math.floor(Date.now()/(seconds*1000));
 const key=hashToken(`${scope}:${identity || ip}:${bucket}`);
 const row=await db.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((bucket+1)*seconds*1000)},update:{count:{increment:1}}});
 if(row.count>limit) throw new ApiError(429,'Слишком много запросов. Повторите позже.');
}
export async function readBounded(req:NextRequest,maxBytes:number) {
 if(Number(req.headers.get('content-length'))>maxBytes)throw new ApiError(413,'Запрос слишком большой');
 const reader=req.body?.getReader();if(!reader)return Buffer.alloc(0);const parts:Uint8Array[]=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();throw new ApiError(413,'Запрос слишком большой');}parts.push(value);}
 return Buffer.concat(parts);
}
export async function readJson(req:NextRequest) {
 const bytes=await readBounded(req,65536);
 try{return JSON.parse(Buffer.from(bytes).toString('utf8'));}catch{throw new ApiError(400,'Некорректный JSON');}
}
```

## FILE:
/workspace/game-store/lib/settings.ts

Тип: typescript (.ts)

```typescript
import { db } from './db';
export async function storeSettings() {
 const saved = await db.storeSetting.findUnique({where:{id:'main'}});
 return {name:saved?.name || process.env.STORE_NAME || 'NEXUS',supportEmail:saved?.supportEmail ?? process.env.SUPPORT_EMAIL ?? '',currency:process.env.STORE_CURRENCY || 'rub'};
}
```

## FILE:
/workspace/game-store/lib/slug.ts

Тип: typescript (.ts)

```typescript
const letters: Record<string,string> = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'};
export function slugify(name: string) {
  return name.toLowerCase().split('').map(c=>letters[c]??c).join('').normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80).replace(/-$/,'') || 'item';
}
```

## FILE:
/workspace/game-store/lib/storage.ts

Тип: typescript (.ts)

```typescript
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ApiError } from './security';
export async function uploadImage(file:File) {
 if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>5*1024*1024 || file.size<1)throw new ApiError(400,'Нужен PNG, JPEG или WEBP до 5 MB');
 const input=Buffer.from(await file.arrayBuffer());
 let output:Buffer;
 try{const instance=sharp(input,{limitInputPixels:16000000,animated:false});const meta=await instance.metadata();if(!['png','jpeg','webp'].includes(meta.format||'') || ({png:'image/png',jpeg:'image/jpeg',webp:'image/webp'} as Record<string,string>)[meta.format!]!==file.type)throw new Error(); output=await instance.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();}catch{throw new ApiError(400,'Файл не является безопасным изображением');}
 const name=`${randomUUID()}.webp`;
 if(process.env.STORAGE_PROVIDER==='s3') {
  if(!process.env.S3_BUCKET || !process.env.S3_PUBLIC_URL)throw new ApiError(503,'S3 не настроен');
  const client=new S3Client({endpoint:process.env.S3_ENDPOINT||undefined,region:process.env.S3_REGION||'auto',forcePathStyle:true,credentials:process.env.S3_ACCESS_KEY?{accessKeyId:process.env.S3_ACCESS_KEY,secretAccessKey:process.env.S3_SECRET_KEY||''}:undefined});
  await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:name,Body:output,ContentType:'image/webp',CacheControl:'public,max-age=31536000,immutable'}));
  return `${process.env.S3_PUBLIC_URL.replace(/\/$/,'')}/${name}`;
 }
 const folder=path.join(process.cwd(),'public','uploads');await mkdir(folder,{recursive:true});await writeFile(path.join(folder,name),output,{flag:'wx'});return `/api/images/${name}`;
}
```

## FILE:
/workspace/game-store/lib/validation.ts

Тип: typescript (.ts)

```typescript
import { z } from 'zod';
export const emailSchema = z.email().max(254).transform(v => v.toLowerCase().trim());
export const passwordSchema = z.string().min(12, 'Минимум 12 символов').refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Максимум 72 байта');
export const fieldSchema = z.object({ key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/), label: z.string().min(1).max(100), type: z.enum(['text','number','select','checkbox']), required: z.boolean().default(true), options: z.array(z.string().min(1).max(100)).max(50).default([]), sortOrder: z.number().int().default(0) }).refine(f => f.type !== 'select' || f.options.length > 0, 'Добавьте варианты выбора');
export const fieldsSchema = z.array(fieldSchema).max(20).refine(f => new Set(f.map(v => v.key)).size === f.length, 'Ключи полей должны быть уникальны');
export type DeliveryField = z.infer<typeof fieldSchema>;
const image = z.string().max(2048).refine(v => v === '' || /^\/api\/images\/[a-f0-9-]+\.webp$/.test(v) || /^\/assets\/[a-z0-9-]+\.webp$/.test(v) || (process.env.S3_PUBLIC_URL && v.startsWith(process.env.S3_PUBLIC_URL.replace(/\/$/,'') + '/')), 'Используйте загрузку изображения');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const gameSchema = z.object({ name:z.string().min(1).max(100), slug, description:z.string().max(10000), aliases:z.array(z.string().max(100)).max(50).default([]), image:image.default(''), logo:image.default(''), published:z.boolean().default(true), sortOrder:z.number().int().min(0).default(0), fields:fieldsSchema.default([]), saleAllowed:z.boolean().default(false), permissionReference:z.string().max(2000).default('') }).refine(v => !v.saleAllowed || v.permissionReference.length > 10, 'Укажите основание разрешения продаж');
export const productSchema = z.object({ name:z.string().min(1).max(150), slug, gameId:z.string().min(1), categoryId:z.string().nullable().default(null), parentId:z.string().nullable().default(null), description:z.string().max(10000), image:image.default(''), images:z.array(image).max(10).default([]), aliases:z.array(z.string().max(100)).max(50).default([]), tags:z.array(z.string().max(100)).max(50).default([]), price:z.number().int().min(50).max(100000000), oldPrice:z.number().int().min(0).max(100000000).nullable().default(null), currency:z.string().regex(/^[a-z]{3}$/).default(process.env.STORE_CURRENCY||'rub'), amount:z.number().int().min(1).max(100000000), stock:z.number().int().min(0).max(1000000), published:z.boolean().default(true), minQuantity:z.number().int().min(1).max(100).default(1), maxQuantity:z.number().int().min(1).max(100).default(10), deliveryMethod:z.enum(['MANUAL']).default('MANUAL'), instruction:z.string().max(10000).default(''), fields:fieldsSchema.default([]) }).refine(v => v.maxQuantity >= v.minQuantity, 'Максимум меньше минимума').refine(v => !v.oldPrice || v.oldPrice >= v.price, 'Старая цена меньше текущей');
export const checkoutSchema = z.object({ checkoutKey:z.uuid(), items:z.array(z.object({ productId:z.string().min(1), quantity:z.number().int().min(1).max(100), deliveryData:z.record(z.string(),z.union([z.string().max(500),z.boolean(),z.number().finite()])) }).strict()).min(1).max(30) }).strict();
export function validateDelivery(fields: DeliveryField[], raw: Record<string, unknown>) {
 const result: Record<string,string|number|boolean> = {};
 for (const f of fields) {
  const v = raw[f.key];
  if (v === undefined || v === '' || v === null) { if(f.required) throw new Error(`Заполните поле «${f.label}»`); continue; }
  if(f.type==='checkbox') { if(typeof v!=='boolean' || (f.required && !v)) throw new Error(`Подтвердите «${f.label}»`); result[f.key]=v; }
  else if(f.type==='number') { const n=Number(v); if(!Number.isSafeInteger(n) || n<0) throw new Error(`Неверное число: ${f.label}`); result[f.key]=n; }
  else { if(typeof v!=='string' || v.length>500 || !v.trim()) throw new Error(`Неверное поле: ${f.label}`); if(f.type==='select' && !f.options.includes(v)) throw new Error(`Неверный вариант: ${f.label}`); result[f.key]=v.trim(); }
 }
 if(Object.keys(raw).some(k=>!fields.some(f=>f.key===k))) throw new Error('Неизвестное поле доставки');
 return result;
}
export function totalMinor(lines: {price:number;quantity:number}[]) {
 const sum=lines.reduce((a,l)=>a+l.price*l.quantity,0);
 if(!Number.isSafeInteger(sum) || sum<50 || sum>100000000) throw new Error('Недопустимая сумма заказа');
 return sum;
}
export function normalizeSearch(q:string) { return q.toLowerCase().replace(/ё/g,'е').trim(); }
```

## FILE:
/workspace/game-store/next-env.d.ts

Тип: typescript (.ts)

```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";
import "./.next/dev/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

## FILE:
/workspace/game-store/next.config.ts

Тип: typescript (.ts)

```typescript
import type { NextConfig } from 'next';
const config: NextConfig = { allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS||'').split(',').filter(Boolean).map(v=>new URL(v).hostname), poweredByHeader: false, images: { remotePatterns: process.env.S3_PUBLIC_URL ? [{ protocol: 'https', hostname: new URL(process.env.S3_PUBLIC_URL).hostname }] : [] }, async headers() { return [{ source: '/:path*', headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }, { key: 'X-Frame-Options', value: 'DENY' }, { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }, { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' " + (process.env.NODE_ENV === 'development' ? "'unsafe-eval'; " : "; ") + "style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" }, ...(process.env.NODE_ENV === 'production' ? [{key:'Strict-Transport-Security',value:'max-age=31536000; includeSubDomains'}] : [])] }]; } };
export default config;
```

## FILE:
/workspace/game-store/package-lock.json

Тип: json (.json)

```json
{
  "name": "game-store",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "game-store",
      "version": "1.0.0",
      "dependencies": {
        "@aws-sdk/client-s3": "^3.900.0",
        "@prisma/client": "6.19.0",
        "bcryptjs": "^3.0.2",
        "next": "^16.4.0",
        "nodemailer": "^10.1.1",
        "react": "^19.1.0",
        "react-dom": "^19.1.0",
        "react-hook-form": "^7.62.0",
        "sharp": "^0.35.5",
        "stripe": "^19.1.0",
        "zod": "^4.1.11"
      },
      "devDependencies": {
        "@tailwindcss/postcss": "^4.1.14",
        "@testing-library/react": "^16.3.3",
        "@testing-library/user-event": "^14.6.8",
        "@types/jsdom": "^30.0.0",
        "@types/node": "^22.18.0",
        "@types/nodemailer": "^7.0.2",
        "@types/react": "^19.1.0",
        "@types/react-dom": "^19.1.0",
        "jsdom": "^30.1.2",
        "prisma": "6.19.0",
        "tailwindcss": "^4.1.14",
        "tsx": "^4.20.5",
        "typescript": "^5.9.2"
      },
      "engines": {
        "node": ">=22.12.0"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.3.0.tgz",
      "integrity": "sha512-U4+70Pc5ZS9osnCBCE5Jha/ciHM+Yp+CNMNC/7HvYbNRk1Ldd+f7qO65W5qfhu/TCv+/ozljlXXe9Nj8419DMA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@asamuzakjp/css-color": {
      "version": "7.1.5",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/css-color/-/css-color-7.1.5.tgz",
      "integrity": "sha512-jCpAvj8apa7SKHZYogk0rbXB3Kb0hLFrpkWF+Ap+vBA5rirItnpv9NKyAyEuDuFizvl0qwnj6JWR70RGJ0rOlw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@csstools/css-calc": "^3.4.3",
        "@csstools/css-color-parser": "^4.2.6",
        "@csstools/css-parser-algorithms": "^4.0.2",
        "@csstools/css-tokenizer": "^4.0.2",
        "lru-cache": "^11.5.3"
      },
      "engines": {
        "node": "^22.22.2 || ^24.15.0 || >=26.0.0"
      }
    },
    "node_modules/@asamuzakjp/dom-selector": {
      "version": "9.2.4",
      "resolved": "https://registry.npmjs.org/@asamuzakjp/dom-selector/-/dom-selector-9.2.4.tgz",
      "integrity": "sha512-YnVzxDxLaqL0t7Q4wfcgHZjg55Wm6y5EaO7Bhu3q9J7wq/8iw3PhsnWiOQhYekx4VexnbkgWpTT6n+QIV7kczw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "bidi-js": "^1.1.0",
        "css-tree": "^3.2.1",
        "is-potential-custom-element-name": "^1.0.1",
        "lru-cache": "^11.5.3"
      },
      "engines": {
        "node": "^22.22.2 || ^24.15.0 || >=26.0.0"
      }
    },
    "node_modules/@aws-sdk/checksums": {
      "version": "3.1001.3",
      "resolved": "https://registry.npmjs.org/@aws-sdk/checksums/-/checksums-3.1001.3.tgz",
      "integrity": "sha512-CcAkVyEUKGngbEqJdVdSc53Iy52+XzVL5NIcTen2BlK8UByNC1DThVtf5VKSrNzyA+SqyTvs+3S+knVBbOUizQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/client-s3": {
      "version": "3.1151.0",
      "resolved": "https://registry.npmjs.org/@aws-sdk/client-s3/-/client-s3-3.1151.0.tgz",
      "integrity": "sha512-Kg20OP7F+rrWMFjPv/aCsNUt/qDbvh1bLJFQM8k/8fnxowR/DA67qL5KHzWWN5gwJCYplS3KQde6P/knOB+lxg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/checksums": "^3.1001.3",
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/credential-provider-node": "^3.972.86",
        "@aws-sdk/middleware-sdk-s3": "^3.972.79",
        "@aws-sdk/signature-v4-multi-region": "^3.996.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/fetch-http-handler": "^5.8.0",
        "@smithy/node-http-handler": "^4.12.1",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/core": {
      "version": "3.978.3",
      "resolved": "https://registry.npmjs.org/@aws-sdk/core/-/core-3.978.3.tgz",
      "integrity": "sha512-nslpzUCTI9b2IQMWSd6mSAXldBexPc8rr0d3dXUutXYFLFaTdsHa2GD7sJdsn3PhyjK0O5K8ypd6zi+RXXPVlg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/types": "^3.974.6",
        "@aws-sdk/xml-builder": "^3.972.41",
        "@aws/lambda-invoke-store": "^0.3.0",
        "@smithy/core": "^3.35.2",
        "@smithy/signature-v4": "^5.7.4",
        "@smithy/types": "^4.19.0",
        "bowser": "^2.11.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-env": {
      "version": "3.972.74",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-env/-/credential-provider-env-3.972.74.tgz",
      "integrity": "sha512-rsRJcW2iFUhCgclyD6OSbMEaPl8Eu0qSeRZb2uuCK1ViZ66hl5wOe/p6Vr6MO3b+ydyKgFeqza2p6tZThvILlw==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-http": {
      "version": "3.972.76",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-http/-/credential-provider-http-3.972.76.tgz",
      "integrity": "sha512-pnKdh0Br7OJPj+7qKjzgTfDTFW0RhEMKXNDR2jv9CAM4oHuG/4z3hRh8KtutLfpmItuRtDbKBmwWkDqHwwAWXw==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/fetch-http-handler": "^5.8.0",
        "@smithy/node-http-handler": "^4.12.1",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-ini": {
      "version": "3.973.19",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-ini/-/credential-provider-ini-3.973.19.tgz",
      "integrity": "sha512-kcjvAxqQEV8yuwkX58RelNn3ne65o7JgRWf3Z/gVvbi7Xuw1qSDLJlatrLD76+40cmRxmNkLxBoyp/vAQChQ5g==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/credential-provider-env": "^3.972.74",
        "@aws-sdk/credential-provider-http": "^3.972.76",
        "@aws-sdk/credential-provider-login": "^3.972.81",
        "@aws-sdk/credential-provider-process": "^3.972.74",
        "@aws-sdk/credential-provider-sso": "^3.973.18",
        "@aws-sdk/credential-provider-web-identity": "^3.972.80",
        "@aws-sdk/nested-clients": "^3.997.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/credential-provider-imds": "^4.5.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-login": {
      "version": "3.972.81",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-login/-/credential-provider-login-3.972.81.tgz",
      "integrity": "sha512-CeQHSbE2CnVdaHIJ/NayRaCecIER+Pm9faUPkmRATO54rCoMTEPSbVieGHzEwvm1dZM2HIs6qQZCznhayNTWJQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/nested-clients": "^3.997.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-node": {
      "version": "3.972.86",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-node/-/credential-provider-node-3.972.86.tgz",
      "integrity": "sha512-WNttSyr6e8innPtBSty//CdnqJcgZN6eAbtw3v/CR2IObz6MYZEo8eusdtuCHJ2ujwFqC2bSPHVyhXGHx8HruQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/credential-provider-env": "^3.972.74",
        "@aws-sdk/credential-provider-http": "^3.972.76",
        "@aws-sdk/credential-provider-ini": "^3.973.19",
        "@aws-sdk/credential-provider-process": "^3.972.74",
        "@aws-sdk/credential-provider-sso": "^3.973.18",
        "@aws-sdk/credential-provider-web-identity": "^3.972.80",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/credential-provider-imds": "^4.5.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-process": {
      "version": "3.972.74",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-process/-/credential-provider-process-3.972.74.tgz",
      "integrity": "sha512-Yj6kZFJQdbR+PygTkqdVLPHHpdDpOS9GCYVcDCuweCRRig9LF24ELQBMfyUw1vspvrZJUfnOGVyMjhaL094ahw==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-sso": {
      "version": "3.973.18",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-sso/-/credential-provider-sso-3.973.18.tgz",
      "integrity": "sha512-FnpPhdY4qUGtX/8X6eKxh+uD+9Y19i9FYibgk4SBe0M935s9vocHkHzaxaMNk+YkHmvzgdu8cHA5SCoeU+kkew==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/nested-clients": "^3.997.48",
        "@aws-sdk/token-providers": "3.1150.0",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/credential-provider-web-identity": {
      "version": "3.972.80",
      "resolved": "https://registry.npmjs.org/@aws-sdk/credential-provider-web-identity/-/credential-provider-web-identity-3.972.80.tgz",
      "integrity": "sha512-TJF25Ndwy2HxcVj6oxMgp8qVlJAawlExHYBXqhuC6Zt2m+A7WpdkjBD6QglNbiArlteYljZHEY3R7KKmno6ISA==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/nested-clients": "^3.997.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/middleware-sdk-s3": {
      "version": "3.972.79",
      "resolved": "https://registry.npmjs.org/@aws-sdk/middleware-sdk-s3/-/middleware-sdk-s3-3.972.79.tgz",
      "integrity": "sha512-UfgAQosf4IEXldMsyntVuHsJnaQzlH6pmkOr6dQy7CaOYSlGz3mWiW4Di7XfQ/kPJP6xE7oMshz1V0E8RqGdRg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/signature-v4-multi-region": "^3.996.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/nested-clients": {
      "version": "3.997.48",
      "resolved": "https://registry.npmjs.org/@aws-sdk/nested-clients/-/nested-clients-3.997.48.tgz",
      "integrity": "sha512-B01jdXJtAW/XOiUzGdI2mz67WyEHbGEc9X6Euzw3bjLAa+txTqdZDER4X2FsIEcXzV2ABqudVZ5thali8tCCzQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/signature-v4-multi-region": "^3.996.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/fetch-http-handler": "^5.8.0",
        "@smithy/node-http-handler": "^4.12.1",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/signature-v4-multi-region": {
      "version": "3.996.48",
      "resolved": "https://registry.npmjs.org/@aws-sdk/signature-v4-multi-region/-/signature-v4-multi-region-3.996.48.tgz",
      "integrity": "sha512-cFDXfEbXaGwbnpvR/DyqfxfjxpjXVRVthQLgkwvcfDS5u3+8G9WSj1X1Ag/pTRg/QOeOno1Tq3ycEdrKsCUcOA==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/types": "^3.974.6",
        "@smithy/signature-v4": "^5.7.4",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/token-providers": {
      "version": "3.1150.0",
      "resolved": "https://registry.npmjs.org/@aws-sdk/token-providers/-/token-providers-3.1150.0.tgz",
      "integrity": "sha512-wDU36ofhabZYu+d2KSriyDbwzxNoaOp+4dG0p3qkabk7HeALR5nIWyQbjoyJZLn3iqWkv/xNdyUfbfevDVDzzg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@aws-sdk/core": "^3.978.3",
        "@aws-sdk/nested-clients": "^3.997.48",
        "@aws-sdk/types": "^3.974.6",
        "@smithy/core": "^3.35.2",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/types": {
      "version": "3.974.6",
      "resolved": "https://registry.npmjs.org/@aws-sdk/types/-/types-3.974.6.tgz",
      "integrity": "sha512-v/clNZzZnDxGyvpHMOGpJKVXFAExJzUNAAjaWGdcx8QAcXLGwTaOkw33p5SHAi0YAioK32xB3hWwOekRVfmfKg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws-sdk/xml-builder": {
      "version": "3.972.41",
      "resolved": "https://registry.npmjs.org/@aws-sdk/xml-builder/-/xml-builder-3.972.41.tgz",
      "integrity": "sha512-ctjVSyCMegrWfXlx6VqzSBFI6UqmQ5ZlnfMhdLIiWmhoH8UAQxSCP5N3OpG7X3k4LnS7ou74C4mt20+bfTW2aQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/@aws/lambda-invoke-store": {
      "version": "0.3.0",
      "resolved": "https://registry.npmjs.org/@aws/lambda-invoke-store/-/lambda-invoke-store-0.3.0.tgz",
      "integrity": "sha512-sl4Bm6yiMNYrZKkqqDFWN0UfnWhlS8ivKxrYl+6t0gCLrqr8y3B2IqZZbFRkfaVVp7C/baApyh71P+LeE1A2sQ==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@babel/code-frame": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/code-frame/-/code-frame-7.29.7.tgz",
      "integrity": "sha512-Aup7aUOfpbAUg2ROOJN6Iw5f9DMBlzu0mIkm/malLQFN/YQgO48wCj0Kxa3sEHJvPVFg7siR+qRInwXd2qhQKw==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/helper-validator-identifier": "^7.29.7",
        "js-tokens": "^4.0.0",
        "picocolors": "^1.1.1"
      },
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/helper-validator-identifier": {
      "version": "7.29.7",
      "resolved": "https://registry.npmjs.org/@babel/helper-validator-identifier/-/helper-validator-identifier-7.29.7.tgz",
      "integrity": "sha512-qehxGkRj55h/ff8EMaJ+cYhyaKlHIxqYDn682wQD7RNp9UujOQsHog2uS0r2vzr4pW+sXf90NeeayjcNaX3fFg==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@babel/runtime": {
      "version": "7.29.10",
      "resolved": "https://registry.npmjs.org/@babel/runtime/-/runtime-7.29.10.tgz",
      "integrity": "sha512-NpugTzbKgGrNe45Ui32cN8vCFFMxVtP/9rtfwv0nP5FRDAjvYBxJcLVpYA9mr1jxP6cnIT7x9LUzuDTbWYYNRA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.9.0"
      }
    },
    "node_modules/@bramus/specificity": {
      "version": "2.4.3",
      "resolved": "https://registry.npmjs.org/@bramus/specificity/-/specificity-2.4.3.tgz",
      "integrity": "sha512-0GEz8qJWokkUVYQYRukmkSHIFNoBH8QTreeHrAFbvz1XFYc3Y+puhMs8PQ5x8GNugiC2l5jvDBXKLbBIByeSBw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "css-tree": "^3.2.1"
      },
      "bin": {
        "specificity": "bin/cli.js"
      }
    },
    "node_modules/@csstools/color-helpers": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/@csstools/color-helpers/-/color-helpers-6.1.2.tgz",
      "integrity": "sha512-grhRy3OKmniaAEKXMjua5z/EODX0MSqBGjunw8+j/3HQjOnahs2AGhvEOIYVUWcU6ScApbhLhVrQTX8XqrMrow==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@csstools/css-calc": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/@csstools/css-calc/-/css-calc-3.4.3.tgz",
      "integrity": "sha512-iex20d8CHVkyvg6B7UKV7uHnI2Bqo9g+EFfT9E0y+GvTvhZ/DwONJ+9aKb1dlqm0ZiGsL5RXjp0fCoJYnkeDjA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.2",
        "@csstools/css-tokenizer": "^4.0.2"
      }
    },
    "node_modules/@csstools/css-color-parser": {
      "version": "4.2.6",
      "resolved": "https://registry.npmjs.org/@csstools/css-color-parser/-/css-color-parser-4.2.6.tgz",
      "integrity": "sha512-iiPQ3iRWwnJkeEn6RIu6SJPr7hYrLz6XZ9s/QZl+2/LI5KQVjpl2fdmDSZKuD4xP6GMmMPgHFFXg6k1Wkz0Trg==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "@csstools/color-helpers": "^6.1.2",
        "@csstools/css-calc": "^3.4.3"
      },
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-parser-algorithms": "^4.0.2",
        "@csstools/css-tokenizer": "^4.0.2"
      }
    },
    "node_modules/@csstools/css-parser-algorithms": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@csstools/css-parser-algorithms/-/css-parser-algorithms-4.0.2.tgz",
      "integrity": "sha512-40cSKyMvK+tq4qz6Awrlye2WGuOKt3FwPgtGg6KTfbHOWNw+Rk1rzbAtZnZ6IBhsY491HLRnDXwoyBAijmmILA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      },
      "peerDependencies": {
        "@csstools/css-tokenizer": "^4.0.2"
      }
    },
    "node_modules/@csstools/css-syntax-patches-for-csstree": {
      "version": "1.1.15",
      "resolved": "https://registry.npmjs.org/@csstools/css-syntax-patches-for-csstree/-/css-syntax-patches-for-csstree-1.1.15.tgz",
      "integrity": "sha512-J0u7HkVl2nzSlhsiTOp4AmwcUQ3D+mGEEKfBy/7To5/y7F2OHwyLrXfrhR0SMgr4p5Lo+eaMVSeai24zUcBIxA==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT-0",
      "peerDependencies": {
        "css-tree": "^3.2.1"
      },
      "peerDependenciesMeta": {
        "css-tree": {
          "optional": true
        }
      }
    },
    "node_modules/@csstools/css-tokenizer": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/@csstools/css-tokenizer/-/css-tokenizer-4.0.2.tgz",
      "integrity": "sha512-OoKoR0f76dCY666JlcbhmVTs2drYj1GUXZTYTcbUgJjh9Nv41aFfZ21bPQTERm5+L5cBDo466NltB2lplS5GBw==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/csstools"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/csstools"
        }
      ],
      "license": "MIT",
      "engines": {
        "node": ">=20.19.0"
      }
    },
    "node_modules/@emnapi/runtime": {
      "version": "1.11.3",
      "resolved": "https://registry.npmjs.org/@emnapi/runtime/-/runtime-1.11.3.tgz",
      "integrity": "sha512-Xz4Tpyki7XyrpbUK1jR1AhdAdaXyhhY4lZ3neLodmhpuWfy2PAQN5B46sAiU4liOXGLkHypn/qU+jvfWSCYYLA==",
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "tslib": "^2.4.0"
      }
    },
    "node_modules/@esbuild/aix-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/aix-ppc64/-/aix-ppc64-0.28.2.tgz",
      "integrity": "sha512-XExcO+dvLKvVtNTibSTBej1NCAbaGhWn9Ww1ZPx80qsahhPFe/8jgWP0IchNe0F3HwkU7n8ejhH8bjonqht8mQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "aix"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm/-/android-arm-0.28.2.tgz",
      "integrity": "sha512-kXXoiPVVGQcnIYGOeaovwOURpniDBpSq4A03qkQ+BMQqtGG6HYap3xne9C1O1yo4TR3qxlCX5IqqmX6fFo2Lqg==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-arm64/-/android-arm64-0.28.2.tgz",
      "integrity": "sha512-5YfKeeI8qWfBZIX+u2xZC3Zlb3Os/gLS2sbEKM+I4ZOcsWmHS2WLysCcQZDAFRslDUU5Oiq44gf6PYN1vGwG5A==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/android-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/android-x64/-/android-x64-0.28.2.tgz",
      "integrity": "sha512-O387ite7SzUyCcy3JQX4P4bLtEA7bLLkx+esve5JHnyYfNTxcVpXZo9jhdB0lTKN44gztELTdU7nS8Nr16Fs1Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-arm64/-/darwin-arm64-0.28.2.tgz",
      "integrity": "sha512-n4KqkOQrraxHJcgjM1RvwbigfQKIKJVpM7xp+KsxiyUSrRdIXnt73VhrPAx0fV44hgfmIVKjxMN9J1t5jySVkw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/darwin-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/darwin-x64/-/darwin-x64-0.28.2.tgz",
      "integrity": "sha512-uq6suIWYP37qzGddBKPw5QEQPi6HiLGsO7UmkpfyaYNQ3D+rN6w6WfwH+nuqcGXWvawGwxOEroO4YGnFh95azw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-arm64/-/freebsd-arm64-0.28.2.tgz",
      "integrity": "sha512-n+I0BTSRIoy+d6RPKnEVwql5UwBJolytvY4mAOIEJorKlqgPII8ix6slVVrfZ5Tnj7glIZvloylbB/EJPMWEXw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/freebsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/freebsd-x64/-/freebsd-x64-0.28.2.tgz",
      "integrity": "sha512-78XJTJkvPs0kz2w61301PJjXl4g7q3JqiYMZ/M/yVI73EHBrCRTgkhu9oqG7vPqq+a/yadEW8aD+agKlk5xrmg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm/-/linux-arm-0.28.2.tgz",
      "integrity": "sha512-XlDnu2q5yoqems+xay6wSAcg9DDD7K9RLKZEBOMZm3ckNpJBvOX20tSfby8KfrrhINDyv9V2YVZKY/SpoGJI8w==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-arm64/-/linux-arm64-0.28.2.tgz",
      "integrity": "sha512-pW4AC0P3it8c7do9MVM4p51FzHzdM/TZrerurgRcHJ2WTa1VQ1CIq18xncfpBJw4ojkiZZrKW2yIBWBP92j6Ug==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ia32/-/linux-ia32-0.28.2.tgz",
      "integrity": "sha512-CYbnj78HsIeA+DhgUKgFCfvNsTHFhMMrinUrMZpDXJXKN8T3XViTZ/+wtHeVxEWY8ewSzTFN+nRmSwO2tZaLUQ==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-loong64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-loong64/-/linux-loong64-0.28.2.tgz",
      "integrity": "sha512-buwkd8nsph4R+ajRvw0qM5Hja/TXQow3ptzWO2EbG/cqcIkHloRrdlBtQlshyYGTNFvfkfJ5tpPLVkY4DtsPfQ==",
      "cpu": [
        "loong64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-mips64el": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-mips64el/-/linux-mips64el-0.28.2.tgz",
      "integrity": "sha512-ZVykbDyk7519VwiNb9Lcj9m8XM6v5V9uKPvrEMkkEedVewf+0itkhahp4HDpgERXhwLRpWFypsGbG/J8s0QjJA==",
      "cpu": [
        "mips64el"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-ppc64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-ppc64/-/linux-ppc64-0.28.2.tgz",
      "integrity": "sha512-CAXl+Dtd9UUuJd8pKKdwh6MLm3MUMiqMPmhZ3tTSXPqfyQ3vDl6R5hZdZ/kYojK4ofXtdfSv1tFq8XzWx3heNQ==",
      "cpu": [
        "ppc64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-riscv64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-riscv64/-/linux-riscv64-0.28.2.tgz",
      "integrity": "sha512-GeXCej4IQtU1B+QlDV8W/RRvbzI3O/Stss+/bCXv4lZls5WGRtu2a+3JkA3i4qIUlMXpcHebWpF8AkJhATowuA==",
      "cpu": [
        "riscv64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-s390x": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-s390x/-/linux-s390x-0.28.2.tgz",
      "integrity": "sha512-3H1weTYZPxt/WOhByszQZybS9w5lKzUn1FDMsgEChbHWQwHYQQRfBxgCcZvPhjHfKyJjIievvMmEUawJrdY9Dg==",
      "cpu": [
        "s390x"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/linux-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/linux-x64/-/linux-x64-0.28.2.tgz",
      "integrity": "sha512-4xTZr1FUmSoQW4XIWmit3tzQrUTZM+N3P0XV8xROKYF50XfI7xeO90+1bZvNwxIufQ9hDQVRJH5YhgPVF8A/HQ==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-arm64/-/netbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-sSATRjPeDBg3pdgHoQfoYBob11Kk1FGa9lui5RIHZCoCkJa9QKlvl3/vKz2usCmYYjs7ymJR/2Nnsqe+Hjt5nw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/netbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/netbsd-x64/-/netbsd-x64-0.28.2.tgz",
      "integrity": "sha512-lqnzCV+mM0gIADaKihiCg6ifgfU2L3h5E33rNQBN1Y4MaVGnzryzmvvf7UHxprpQdE8hpqLolJ9Rl+SkIRDpyw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "netbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-arm64/-/openbsd-arm64-0.28.2.tgz",
      "integrity": "sha512-AL2qJILH7lNjrDmCQDvdxMfAUIv8KMNZOvrwAQ8i8//ntL9FflhOyMJ8OZSMBb8/AWXe3/5v5S20y3zCoZWKoQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openbsd-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openbsd-x64/-/openbsd-x64-0.28.2.tgz",
      "integrity": "sha512-QtiuPytchRyC4rwUKhexJdQKvDuZ6hWloi3igqPQNUJCS1/v9EiO3UTOXR6A3FoMo4fnAKbWJdqaIwhOzh8qEw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openbsd"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/openharmony-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/openharmony-arm64/-/openharmony-arm64-0.28.2.tgz",
      "integrity": "sha512-WkhYDmpTjLvGlScA1rwjRUmhl4k8oXR3cIbtqWmELgU/dFeHHlEllxDvdWcNJV9rbzCexB5vz8gtNewWLgCT7Q==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "openharmony"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/sunos-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/sunos-x64/-/sunos-x64-0.28.2.tgz",
      "integrity": "sha512-GPMSkTOtMnv2U2F8gxe4Io6qmVs+YKyp832Etqqxr0hFngmXQ3rzwytelm3GIn7T4VviRUlf3sOgBOiTdvaf7g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "sunos"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-arm64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-arm64/-/win32-arm64-0.28.2.tgz",
      "integrity": "sha512-PIhhEkE9uPBleRBrQEJpUn7MBnibZzbGzYWPmY3x+YoVg/95zbjB4CxPPOQ8l5tYYM4mMaCthF8/1DIfBQQyWQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-ia32": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-ia32/-/win32-ia32-0.28.2.tgz",
      "integrity": "sha512-YmJbfTlvU7Sdn9BB+4PRES4oB6pxgS37MAONj+hBr/cpXS1aBPKXxNnDbu+QCWPj0o9dgyxeq79g6c5P8KeuYA==",
      "cpu": [
        "ia32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@esbuild/win32-x64": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/@esbuild/win32-x64/-/win32-x64-0.28.2.tgz",
      "integrity": "sha512-5ebpxr3nWMzrL/rnUI755Jkuee0bHL/Gq0WTF9lvcpv73wAp5eu8MfBUgWK9bhWvZjj7yX8etf/8tI8Ney695g==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@exodus/bytes": {
      "version": "1.16.0",
      "resolved": "https://registry.npmjs.org/@exodus/bytes/-/bytes-1.16.0.tgz",
      "integrity": "sha512-IcpW84uEn3N7ETtNZMlxKhfl6Pec8rUNGOTBtWbK1FKhJxIFAptZyVrvVRVBimAJxJCgc3PxepxkdWWG4DVzfA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": "^20.19.0 || ^22.12.0 || >=24.0.0"
      },
      "peerDependencies": {
        "@noble/hashes": "^1.8.0 || ^2.0.0"
      },
      "peerDependenciesMeta": {
        "@noble/hashes": {
          "optional": true
        }
      }
    },
    "node_modules/@img/colour": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz",
      "integrity": "sha512-Td76q7j57o/tLVdgS746cYARfSyxk8iEfRxewL9h4OMzYhbW4TAcppl0mT4eyqXddh6L/jwoM75mo7ixa/pCeQ==",
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@img/sharp-darwin-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-arm64/-/sharp-darwin-arm64-0.35.5.tgz",
      "integrity": "sha512-QRUlFQ0WxvdWyqqG/WtI3iupfD5rBzmCHXSdPsY91sAtVtTo7Q4cb6zOccZ3gqEqkr0f1As1ehLqmEpDsRf+lg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-darwin-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-darwin-x64/-/sharp-darwin-x64-0.35.5.tgz",
      "integrity": "sha512-+BR255RhDlpygUpOc/Jdt1nT6DQ3XG/ERo5wbcdOf5Q320dKtPCKPLR1LJs9VGXRaMa8l1uUa0tkCNOXiAxZUw==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-darwin-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-freebsd-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-freebsd-wasm32/-/sharp-freebsd-wasm32-0.35.5.tgz",
      "integrity": "sha512-Y/z91nEZ4uIBX5X3nfTovjU9lHNKFYbL2lpHCLVNmXQK03VIZvXBBt0KxbPGp2SdGSF+2mQU4e+hQaWOt86iAw==",
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "dependencies": {
        "@img/sharp-wasm32": "0.35.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-arm64/-/sharp-libvips-darwin-arm64-1.3.4.tgz",
      "integrity": "sha512-5R89nBYiRdUlSWJxPhO+GVtaXzXSxKnRu/xqMn3KTA3L9EB9Oy/P+Nn2f2vlhPuUdy/Zusb2DarbyTpGCfEDuw==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-darwin-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-darwin-x64/-/sharp-libvips-darwin-x64-1.3.4.tgz",
      "integrity": "sha512-iR2OKH80yi0U+dUplyh3/xdpFvps6YkCwsXenIJxqxR1v9o+xtKTGbS9H7cps+2Vxjc8B1j96p75NmTGjIhtpQ==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "darwin"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm/-/sharp-libvips-linux-arm-1.3.4.tgz",
      "integrity": "sha512-LmRtTsOHuvM2+wlO2Db37dx5MiZhB0FvSunciw48YjdOkZz9KAiRbm8ujeMOA1INqmei5NapFxYEK1D1ZSidmw==",
      "cpu": [
        "arm"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-arm64/-/sharp-libvips-linux-arm64-1.3.4.tgz",
      "integrity": "sha512-Y3dgX/6lE2QhQb+Gxy0WZxfg9MEm/JBjamZpS2IklP7xIQoKN4hzAm7KcMVGtaVDt3neE9OKBC7vAfonA/Lr1A==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-ppc64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-ppc64/-/sharp-libvips-linux-ppc64-1.3.4.tgz",
      "integrity": "sha512-Le6boB8Tai0Nis+gIxIpKx68UDVVIqdR8Tin5Yf1z2LJJQLDJvCDRqRu+jC2qCoD+eIomonmOwB4smBRxfVpYQ==",
      "cpu": [
        "ppc64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-riscv64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-riscv64/-/sharp-libvips-linux-riscv64-1.3.4.tgz",
      "integrity": "sha512-aHkkIEHPRdQEegJN20MLmGtxYD9R2wQr3Cwpddnu5+YKMt6Uzax7S9h5gpZTo8wyrGuZSlfQ63OevL5mTyOC7Q==",
      "cpu": [
        "riscv64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-s390x": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-s390x/-/sharp-libvips-linux-s390x-1.3.4.tgz",
      "integrity": "sha512-ra/mB6MikESDUO7Yg+Mi95bFBb9GsObURuhnOv3OqknjGe9sZrG8tCe9q0xSIGrtLgvgw0gKnFWcK4blSgQOuQ==",
      "cpu": [
        "s390x"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linux-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linux-x64/-/sharp-libvips-linux-x64-1.3.4.tgz",
      "integrity": "sha512-GJ//SSXbnwSDes02umB3nDJLFcQzw8a18V8fyhqr6tV515tOEMdImjjxj1AoafMRz56F3PHgftnj1QEKSU1zkw==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-arm64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-arm64/-/sharp-libvips-linuxmusl-arm64-1.3.4.tgz",
      "integrity": "sha512-hvulFwtjUcagsis6BBxHwGFwWoNZjgYmULGVrZcyfNbjA8hKILbRxGg15/7w5HDyXHXUos/j6baAWqnCyQ2DWA==",
      "cpu": [
        "arm64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-libvips-linuxmusl-x64": {
      "version": "1.3.4",
      "resolved": "https://registry.npmjs.org/@img/sharp-libvips-linuxmusl-x64/-/sharp-libvips-linuxmusl-x64-1.3.4.tgz",
      "integrity": "sha512-6zXKeE/p39I1AmA3cJG35eyBGNqNddLnUXjhwBnsGjFPWqf5VKkDBEqaEkPDoTEtkxwi2vv8Tcr2mDyP4So7Fg==",
      "cpu": [
        "x64"
      ],
      "license": "LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "linux"
      ],
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-linux-arm": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm/-/sharp-linux-arm-0.35.5.tgz",
      "integrity": "sha512-LEaXK2WdXVK5ykcw0buWyPMsmLLL2vpHLD6yrNSW+JGEL3BZPA4tpKN6iaMc4AxTTAoaX/sU1rOL51lcIz48ZQ==",
      "cpu": [
        "arm"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-arm64/-/sharp-linux-arm64-0.35.5.tgz",
      "integrity": "sha512-LYVx5JTsOM2CBzmxreh+nl64/3H6Xb09iSLknqH47z2T2DFFxDeFLP5y4dJwe6H7uGQlHPyEEtIqyo3DYsRwdQ==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-ppc64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-ppc64/-/sharp-linux-ppc64-0.35.5.tgz",
      "integrity": "sha512-QVxAAq8evVRI9ia2vqgwrmWucn5Dfv+JdWzj75pD8omHLPSP7f8p20O8jxzjCcuCEQEOtYOZUmX1hkiZ0kdevA==",
      "cpu": [
        "ppc64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-ppc64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-riscv64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-riscv64/-/sharp-linux-riscv64-0.35.5.tgz",
      "integrity": "sha512-LtdreXguaavKODPIfzJ4kffx7UNt1omwtK0rch4EBbbSTXPnxWmYSayXdLJw0fJzQ97kHt1gL/yh4tvU+nCyRQ==",
      "cpu": [
        "riscv64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-riscv64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-s390x": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-s390x/-/sharp-linux-s390x-0.35.5.tgz",
      "integrity": "sha512-UZasTOFiYzotTsGOCu42BfUzP6Tu6Do/947iRm1RsLKvlllxwGcn4RN27LibGWceix4Y+Pmw3jsnTcCQIgWjqA==",
      "cpu": [
        "s390x"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-s390x": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linux-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linux-x64/-/sharp-linux-x64-0.35.5.tgz",
      "integrity": "sha512-SxFtLTeJInhAA9Q836kux2vZNeOBQEx658qvbboZScr0wIARym3IcGmW7KpVD5sbVg0Ojy+udFQdayYIZyoNog==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linux-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-arm64/-/sharp-linuxmusl-arm64-0.35.5.tgz",
      "integrity": "sha512-9HbMclmI1zlNkFRs3z9/eBtDjfD0sGlrX1z6b1qwmiFY5ElDLh4BC0LPBdVp7z1DXFiKlIcznf+ZlsuZzLxQqg==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-linuxmusl-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-linuxmusl-x64/-/sharp-linuxmusl-x64-0.35.5.tgz",
      "integrity": "sha512-4KOphqB035HrVdqLZfCgMzzERrQkkzOwRhl4OAkRO1YCldbaFjySXMaK534Mo0V+LndnlJk+sbUyLeU0ULyD1A==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-libvips-linuxmusl-x64": "1.3.4"
      }
    },
    "node_modules/@img/sharp-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-wasm32/-/sharp-wasm32-0.35.5.tgz",
      "integrity": "sha512-Ptsga1su4tQx+LLF1ECS9U6nz5kmrXKo6XVbtR48Ke3ZRxxgaWBu7IDtEe1quo8hiupwm6WFqxVlXaSf7IINGQ==",
      "license": "Apache-2.0 AND LGPL-3.0-or-later AND MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/runtime": "^1.11.3"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-webcontainers-wasm32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-webcontainers-wasm32/-/sharp-webcontainers-wasm32-0.35.5.tgz",
      "integrity": "sha512-hfhF/FmoQyTUkA0bIKFOtw536BQSeBMe6BF6QyWlrPxT754+TFLaZ7sKKTfvvM0yJgKgaYTwnFCIZ/GuDw5SUA==",
      "cpu": [
        "wasm32"
      ],
      "license": "Apache-2.0",
      "optional": true,
      "dependencies": {
        "@img/sharp-wasm32": "0.35.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-arm64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-arm64/-/sharp-win32-arm64-0.35.5.tgz",
      "integrity": "sha512-X4t7g+7ZA5DKblCBEXGjUqqemj4vczING/5viFwAL8h4N3qYeyjwdCvRLHi4EdOUI+2Z7UFlp1VM+p/AuEtm6Q==",
      "cpu": [
        "arm64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-ia32": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-ia32/-/sharp-win32-ia32-0.35.5.tgz",
      "integrity": "sha512-5Zm82LoBc43nhwNybZlG7Y1KO//Zhsn306fQl29ZOuStHLGTo3BWL83q3cznX0poxSAMuYL1On/BHBxkBeKr6A==",
      "cpu": [
        "ia32"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": "^20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@img/sharp-win32-x64": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/@img/sharp-win32-x64/-/sharp-win32-x64-0.35.5.tgz",
      "integrity": "sha512-x76eH0vEiHlcMQu8Y8IenntaACtddpT6W0wmXtWrnKcnKI7ME5DdgqhAD6SEWOEl1v2zDvkZDhFA9KnURwpfqg==",
      "cpu": [
        "x64"
      ],
      "license": "Apache-2.0 AND LGPL-3.0-or-later",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/remapping": {
      "version": "2.3.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/remapping/-/remapping-2.3.5.tgz",
      "integrity": "sha512-LI9u/+laYG4Ds1TDKSJW2YPrIlcVYOwi2fUC6xB43lueCjgxV4lffOCZCtYFiH6TNOX+tQKXx97T4IKHbhyHEQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.5",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.6.0.tgz",
      "integrity": "sha512-T7jf+5zgsZHwNJ4lvQ7/aezbyk0nNX+zJVWpmHA7VYsEx7a7qr5Rg5IbtJFqkgze5Y2sruq1RUY8Q837Od7iFw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.31",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.31.tgz",
      "integrity": "sha512-zzNR+SdQSDJzc8joaeP8QQoCQr8NuYx2dIIytl1QeBEZHJ9uW6hebsrYgbz8hJwUQao3TWCMtmfV8Nu1twOLAw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@next/env": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/env/-/env-16.4.0.tgz",
      "integrity": "sha512-pyLlT5oafGlX8X7xjgGNXz5dNIDSxREm+qD6i9VLSZiZFopA/XWl8NM/KPmLx/8EG/++c49iid3gNWSQW1+2dQ==",
      "license": "MIT"
    },
    "node_modules/@next/swc-darwin-arm64": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-arm64/-/swc-darwin-arm64-16.4.0.tgz",
      "integrity": "sha512-yyZ+9MgViAKLLb5l1gPBGjRwnq3teNLb5Zx6JEw8LzNSTjlsnp+baUHFxTgl7PpjCmKf48VQfyipG1eBflb48Q==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-darwin-x64": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-darwin-x64/-/swc-darwin-x64-16.4.0.tgz",
      "integrity": "sha512-RePEEejEj1Auf5s9qEcG0JbcDP3ceNUS/ofNX8AhxzgIjTVlZIHMatlp16YplcSMpsVo/ZMQHJTjbMYJznjGUg==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-gnu": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-gnu/-/swc-linux-arm64-gnu-16.4.0.tgz",
      "integrity": "sha512-HhsyCqd+NpmvDDVY/LqkAN24f+QVvXh3ie+PfcwKinWL2Mu826JymQxJXGjAIfmJ4VlHjp4Pe/nZtXtUoEMAqw==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-arm64-musl": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-arm64-musl/-/swc-linux-arm64-musl-16.4.0.tgz",
      "integrity": "sha512-sN9Pf+Zh+RpZAOmbR7d8KAA8T61CVhawtbEJ2Bk6QrRzx6Z/6haaF4UiwBzytM96GRRRWZh9/WALIEO3npMamA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-gnu": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-gnu/-/swc-linux-x64-gnu-16.4.0.tgz",
      "integrity": "sha512-D5M5xLWQVd1CvR+L7BickM1weRfmM41x3L1NWcnKY/oyJJqr1qwaCgmu3dMAhLBOMdZwSuDCRV6DJRRpiUkbDQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-linux-x64-musl": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-linux-x64-musl/-/swc-linux-x64-musl-16.4.0.tgz",
      "integrity": "sha512-8d5WLS6a9YalqpOgXdlbvonFu+sIgjA+CO6tGzetrpPVcUL56foa7B7664h41rAlbLi5fJwK4vWji3zf4QDy+w==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-arm64-msvc": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-arm64-msvc/-/swc-win32-arm64-msvc-16.4.0.tgz",
      "integrity": "sha512-sQuOIiW3snb48UwrBcDMvFA/u03qtw2LeuSIxFIQ9AJuW9UG/4Ddsfo+eV73PnZwBhyncMtsKVh7PrzMol2/fA==",
      "cpu": [
        "arm64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@next/swc-win32-x64-msvc": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/@next/swc-win32-x64-msvc/-/swc-win32-x64-msvc-16.4.0.tgz",
      "integrity": "sha512-6/33lCuxpdHUy27RegyGM/5uTpF7YZd3UR4D0gpkOA/tWY5YR7msbQjqPgCZmSmxrrTLGCXYA4A8vT2H5DPGTQ==",
      "cpu": [
        "x64"
      ],
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 10"
      }
    },
    "node_modules/@prisma/client": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/client/-/client-6.19.0.tgz",
      "integrity": "sha512-QXFT+N/bva/QI2qoXmjBzL7D6aliPffIwP+81AdTGq0FXDoLxLkWivGMawG8iM5B9BKfxLIXxfWWAF6wbuJU6g==",
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18.18"
      },
      "peerDependencies": {
        "prisma": "*",
        "typescript": ">=5.1.0"
      },
      "peerDependenciesMeta": {
        "prisma": {
          "optional": true
        },
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/@prisma/config": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/config/-/config-6.19.0.tgz",
      "integrity": "sha512-zwCayme+NzI/WfrvFEtkFhhOaZb/hI+X8TTjzjJ252VbPxAl2hWHK5NMczmnG9sXck2lsXrxIZuK524E25UNmg==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "c12": "3.1.0",
        "deepmerge-ts": "7.1.5",
        "effect": "3.18.4",
        "empathic": "2.0.0"
      }
    },
    "node_modules/@prisma/debug": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/debug/-/debug-6.19.0.tgz",
      "integrity": "sha512-8hAdGG7JmxrzFcTzXZajlQCidX0XNkMJkpqtfbLV54wC6LSSX6Vni25W/G+nAANwLnZ2TmwkfIuWetA7jJxJFA==",
      "devOptional": true,
      "license": "Apache-2.0"
    },
    "node_modules/@prisma/engines": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/engines/-/engines-6.19.0.tgz",
      "integrity": "sha512-pMRJ+1S6NVdXoB8QJAPIGpKZevFjxhKt0paCkRDTZiczKb7F4yTgRP8M4JdVkpQwmaD4EoJf6qA+p61godDokw==",
      "devOptional": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "6.19.0",
        "@prisma/engines-version": "6.19.0-26.2ba551f319ab1df4bc874a89965d8b3641056773",
        "@prisma/fetch-engine": "6.19.0",
        "@prisma/get-platform": "6.19.0"
      }
    },
    "node_modules/@prisma/engines-version": {
      "version": "6.19.0-26.2ba551f319ab1df4bc874a89965d8b3641056773",
      "resolved": "https://registry.npmjs.org/@prisma/engines-version/-/engines-version-6.19.0-26.2ba551f319ab1df4bc874a89965d8b3641056773.tgz",
      "integrity": "sha512-gV7uOBQfAFlWDvPJdQxMT1aSRur3a0EkU/6cfbAC5isV67tKDWUrPauyaHNpB+wN1ebM4A9jn/f4gH+3iHSYSQ==",
      "devOptional": true,
      "license": "Apache-2.0"
    },
    "node_modules/@prisma/fetch-engine": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/fetch-engine/-/fetch-engine-6.19.0.tgz",
      "integrity": "sha512-OOx2Lda0DGrZ1rodADT06ZGqHzr7HY7LNMaFE2Vp8dp146uJld58sRuasdX0OiwpHgl8SqDTUKHNUyzEq7pDdQ==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "6.19.0",
        "@prisma/engines-version": "6.19.0-26.2ba551f319ab1df4bc874a89965d8b3641056773",
        "@prisma/get-platform": "6.19.0"
      }
    },
    "node_modules/@prisma/get-platform": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/@prisma/get-platform/-/get-platform-6.19.0.tgz",
      "integrity": "sha512-ym85WDO2yDhC3fIXHWYpG3kVMBA49cL1XD2GCsCF8xbwoy2OkDQY44gEbAt2X46IQ4Apq9H6g0Ex1iFfPqEkHA==",
      "devOptional": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/debug": "6.19.0"
      }
    },
    "node_modules/@smithy/core": {
      "version": "3.36.0",
      "resolved": "https://registry.npmjs.org/@smithy/core/-/core-3.36.0.tgz",
      "integrity": "sha512-3hJiwG1F5t1SoXqp/yOCmYXziyx7ZVqF63S5W6YU201e/qwVaHPex+E/3vvyY9a3ORq/b+BydeNZpP2saQ9X2g==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@smithy/credential-provider-imds": {
      "version": "4.5.2",
      "resolved": "https://registry.npmjs.org/@smithy/credential-provider-imds/-/credential-provider-imds-4.5.2.tgz",
      "integrity": "sha512-A9uSdn72ozbRUSit0eib0TW7nXuNPlaeM0zcGkJ+nE6tFcSDbnmtwoxbTCFBukVQcszDAyvsd7+rTduPTXpygg==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/core": "^3.33.2",
        "@smithy/types": "^4.17.2",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@smithy/fetch-http-handler": {
      "version": "5.8.0",
      "resolved": "https://registry.npmjs.org/@smithy/fetch-http-handler/-/fetch-http-handler-5.8.0.tgz",
      "integrity": "sha512-ycSJu3tFAQ4v04CBB0agqFMVsSQ1iG3yw+SpgxRqKfaURpQD4CZ8Wn0zPMmSnOuTpTh65Vz+EA0rMrw089wvkA==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/core": "^3.33.3",
        "@smithy/types": "^4.18.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@smithy/node-http-handler": {
      "version": "4.12.1",
      "resolved": "https://registry.npmjs.org/@smithy/node-http-handler/-/node-http-handler-4.12.1.tgz",
      "integrity": "sha512-ThMkboGeONWXAelq9FvGsuJC4rOi+qyC4/zhUF58xYpxUg5sQKx2VXZYJmtNjr4dSuBJ1HeJXETQILCz3wOHvw==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/core": "^3.33.3",
        "@smithy/types": "^4.18.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@smithy/signature-v4": {
      "version": "5.7.4",
      "resolved": "https://registry.npmjs.org/@smithy/signature-v4/-/signature-v4-5.7.4.tgz",
      "integrity": "sha512-tHy0K0VtqNd5Y7Y41h0a0Lhh0L1GzC08dTWg0F7vRJWFtTENg7IZikf3wQkanYIRdb7ngoIPMTmqgUi401fEeQ==",
      "license": "Apache-2.0",
      "dependencies": {
        "@smithy/core": "^3.35.0",
        "@smithy/types": "^4.19.0",
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@smithy/types": {
      "version": "4.19.0",
      "resolved": "https://registry.npmjs.org/@smithy/types/-/types-4.19.0.tgz",
      "integrity": "sha512-r7jh49VJxGerfAcTQA6gXcKc+98zOp/tqRwzYjgOE+iSQsP6cEU1hq2QzbuipmP68QtYdY9wKEhiCQZIzHgZ4Q==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.6.2"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@standard-schema/spec": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/@standard-schema/spec/-/spec-1.1.0.tgz",
      "integrity": "sha512-l2aFy5jALhniG5HgqrD6jXLi/rUWrKvqN/qJx6yoJsgKhblVd+iqqU4RCXavm/jPityDo5TCvKMnpjKnOriy0w==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/@swc/helpers": {
      "version": "0.5.23",
      "resolved": "https://registry.npmjs.org/@swc/helpers/-/helpers-0.5.23.tgz",
      "integrity": "sha512-5lSsMOTXURePglDfvuAQUqkGek9Hg2kksOYay2m0+XR++b2NWYL/4sWyuvVBIs8oKnJaxkdi9whaL/sqN13afw==",
      "license": "Apache-2.0",
      "dependencies": {
        "tslib": "^2.8.0"
      }
    },
    "node_modules/@tailwindcss/node": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/node/-/node-4.3.3.tgz",
      "integrity": "sha512-/T8IKEsf9VTU6tLjgC7+sv2mOPtQxzE2jMw7u4Tt40Tx+QSZxpzh95/H6cMKoja9XuW7iMdLJYBB0o9G1CaAgg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/remapping": "^2.3.5",
        "enhanced-resolve": "^5.24.1",
        "jiti": "^2.7.0",
        "lightningcss": "1.32.0",
        "magic-string": "^0.30.21",
        "source-map-js": "^1.2.1",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide/-/oxide-4.3.3.tgz",
      "integrity": "sha512-krXjAikiaFSPaK/FkAQT5UTx3VormQaiZ5hBFlJZ9UFQGB/rwg1MZIhHAG9smMQRTdyJxP6Qt5MwMtdyU5FWrA==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">= 20"
      },
      "optionalDependencies": {
        "@tailwindcss/oxide-android-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-arm64": "4.3.3",
        "@tailwindcss/oxide-darwin-x64": "4.3.3",
        "@tailwindcss/oxide-freebsd-x64": "4.3.3",
        "@tailwindcss/oxide-linux-arm-gnueabihf": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-arm64-musl": "4.3.3",
        "@tailwindcss/oxide-linux-x64-gnu": "4.3.3",
        "@tailwindcss/oxide-linux-x64-musl": "4.3.3",
        "@tailwindcss/oxide-wasm32-wasi": "4.3.3",
        "@tailwindcss/oxide-win32-arm64-msvc": "4.3.3",
        "@tailwindcss/oxide-win32-x64-msvc": "4.3.3"
      }
    },
    "node_modules/@tailwindcss/oxide-android-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-android-arm64/-/oxide-android-arm64-4.3.3.tgz",
      "integrity": "sha512-Y85A2gmPSkl5Ve5qR86GL4HT509cFqQh1aes9p3sSkyTPwt0Pppf3GkwGe4JPACcRYjgJIEhQgM6dBClnr0NYw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-arm64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-arm64/-/oxide-darwin-arm64-4.3.3.tgz",
      "integrity": "sha512-BiaWatpBcERQFDlOjRDpIVXuFK5PJez5SA4JMg6VYZdBYU+qKfV/vqjcIs+IYmtitf1xYQZTwXvU/8y4lfZUGw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-darwin-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-darwin-x64/-/oxide-darwin-x64-4.3.3.tgz",
      "integrity": "sha512-fAeUqfV5ndhxRwai8cXGzdLvul9utWOmeTkv69unv4ZXixjn61Z+p9lCWdwOwA3TYboG3BwdVuN/RDjhBRl0mw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-freebsd-x64": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-freebsd-x64/-/oxide-freebsd-x64-4.3.3.tgz",
      "integrity": "sha512-iyf5bV6+wnAlflVeEy7R25dupxTNECZN5QMI0qNT6eT+EgaGdZcKhGkr5SdoaWiLJ3spLqIY9VCeSGrwmtg4kw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm-gnueabihf": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm-gnueabihf/-/oxide-linux-arm-gnueabihf-4.3.3.tgz",
      "integrity": "sha512-aAYUprJAJQWWbRrPvtjdroZ56Md+JM8pMiopS6xGEwDfLhqj+2ver2p4nU4Mb3CRqcMmNBjo8KkUgcxhkzVQGQ==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-gnu/-/oxide-linux-arm64-gnu-4.3.3.tgz",
      "integrity": "sha512-nDxldcEENOxZRzC2uu9jrutZdAAQtb+8WWDCSnWL1zvBk1+FN+x6MtDViPB5AJMfttVCUhehGWus3XBPgatM/w==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-arm64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-arm64-musl/-/oxide-linux-arm64-musl-4.3.3.tgz",
      "integrity": "sha512-Md44bD6veX/PC5iyF8cDVnw4HBIANZepRZZ7a8DQOvkfo5WUBwcp6iAuCUz23u+4SUkhJlD3eL7hNdW8ezd/kA==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-gnu": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-gnu/-/oxide-linux-x64-gnu-4.3.3.tgz",
      "integrity": "sha512-tx7us1muwOKAKWao2v/GaafFeQboE6aj88vC6ziN2NCGcRm8gWUhwjzg+YdVB1e4boAtdtma4L43onunI6NS4w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-linux-x64-musl": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-linux-x64-musl/-/oxide-linux-x64-musl-4.3.3.tgz",
      "integrity": "sha512-SJxX60smvHgasZoBy11dX6YRjXJFovwWBoedhbQPOBzgFWBHGB+TVPWB9BxzR7TTxU8FQZAI2AyiNCMzFm8Img==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-wasm32-wasi": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-wasm32-wasi/-/oxide-wasm32-wasi-4.3.3.tgz",
      "integrity": "sha512-jx1+rPhY/5Ympkktd656HBWEBLxP7dH06losBLjjf5vgCODXvi9KhtftWcMIwTFIDqBr7cRnQkdLnAG+IOlGvQ==",
      "bundleDependencies": [
        "@napi-rs/wasm-runtime",
        "@emnapi/core",
        "@emnapi/runtime",
        "@tybys/wasm-util",
        "@emnapi/wasi-threads",
        "tslib"
      ],
      "cpu": [
        "wasm32"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "dependencies": {
        "@emnapi/core": "^1.11.1",
        "@emnapi/runtime": "^1.11.1",
        "@emnapi/wasi-threads": "^1.2.2",
        "@napi-rs/wasm-runtime": "^1.1.4",
        "@tybys/wasm-util": "^0.10.2",
        "tslib": "^2.8.1"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-arm64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-arm64-msvc/-/oxide-win32-arm64-msvc-4.3.3.tgz",
      "integrity": "sha512-3rc292Ca2ceK6Ulcc/bAVnTs/3nDtoPhyEKlgPv+yQJQi/JS/AMJlqzxvlDacL1nekbrcf6bTqp/jV4qgnPxNQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/oxide-win32-x64-msvc": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/oxide-win32-x64-msvc/-/oxide-win32-x64-msvc-4.3.3.tgz",
      "integrity": "sha512-yJ0pwIVc/nYeGoV02WtsN8KYyLQv7kyI2wDnkezyJlGGjkd4QLwDGAwl47YpPJeuI0M0ObaXGSPjvWDPeTPggw==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 20"
      }
    },
    "node_modules/@tailwindcss/postcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/@tailwindcss/postcss/-/postcss-4.3.3.tgz",
      "integrity": "sha512-JTSZZGQi1AyKirbLN3azmjVzef92tcX7h+iSqPdaeStyFpGpDlKvvpxeOE8njhbUanbRwr3z8DyzhICWnMtQeg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "@tailwindcss/node": "4.3.3",
        "@tailwindcss/oxide": "4.3.3",
        "postcss": "^8.5.16",
        "tailwindcss": "4.3.3"
      }
    },
    "node_modules/@testing-library/dom": {
      "version": "10.4.2",
      "resolved": "https://registry.npmjs.org/@testing-library/dom/-/dom-10.4.2.tgz",
      "integrity": "sha512-yzr2S9HyAIdhz2/6qHgbs665Q7PKVcDF05vsOlHPxG1mo36gKVesdYVeDLnXgfjJ03CrKRk08knc6+E/9m8v2Q==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "@babel/code-frame": "^7.10.4",
        "@babel/runtime": "^7.12.5",
        "@types/aria-query": "^5.0.1",
        "aria-query": "5.3.0",
        "dom-accessibility-api": "^0.5.9",
        "lz-string": "^1.5.0",
        "picocolors": "1.1.1",
        "pretty-format": "^27.0.2"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/@testing-library/react": {
      "version": "16.3.3",
      "resolved": "https://registry.npmjs.org/@testing-library/react/-/react-16.3.3.tgz",
      "integrity": "sha512-Uo193NgQbPMz6lrrhtRQQFcMC6Re/ELLFbbuVL30WDlZxlpZf9/lMHTAVxPRLw1q1iu9OJmR1c2BLiENRstdBg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@babel/runtime": "^7.12.5"
      },
      "engines": {
        "node": ">=18"
      },
      "peerDependencies": {
        "@testing-library/dom": "^10.0.0",
        "@types/react": "^18.0.0 || ^19.0.0",
        "@types/react-dom": "^18.0.0 || ^19.0.0",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        },
        "@types/react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/@testing-library/user-event": {
      "version": "14.6.8",
      "resolved": "https://registry.npmjs.org/@testing-library/user-event/-/user-event-14.6.8.tgz",
      "integrity": "sha512-vgSSqnANMnkcYR/vUNDbwS7aM3OErRLNUG8vCVVlj4oc6cKffUrccX7UAS5AmJQQNZTSibi9z5GvvRZ0aYgUCQ==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=12",
        "npm": ">=6"
      },
      "peerDependencies": {
        "@testing-library/dom": ">=7.21.4"
      }
    },
    "node_modules/@types/aria-query": {
      "version": "5.0.4",
      "resolved": "https://registry.npmjs.org/@types/aria-query/-/aria-query-5.0.4.tgz",
      "integrity": "sha512-rfT93uj5s0PRL7EzccGMs3brplhcrghnDoV26NqKhCAS1hVo+WdNsPvE/yb6ilfr5hi2MEk6d5EWJTKdxg8jVw==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/@types/jsdom": {
      "version": "30.0.0",
      "resolved": "https://registry.npmjs.org/@types/jsdom/-/jsdom-30.0.0.tgz",
      "integrity": "sha512-uAHGxujGE0cDaKGdK28zgDotFtNA7MKq5DXl8LrfdxdCI8VHcg15oJz+amHTChPNI5JpgEPQWc2xFdrw3em/nQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*",
        "@types/tough-cookie": "*",
        "parse5": "^8.0.0",
        "undici-types": "^8.9.0"
      }
    },
    "node_modules/@types/jsdom/node_modules/undici-types": {
      "version": "8.12.1",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-8.12.1.tgz",
      "integrity": "sha512-nCiEcIx87oMw9u3Yzj2DuRBzv6p0e7akhy4HUPtpBiVWmAY3o6Phznst8QhmY1oLMttLgJ2tlAvsKuzCgBSoAw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/@types/node": {
      "version": "22.20.5",
      "resolved": "https://registry.npmjs.org/@types/node/-/node-22.20.5.tgz",
      "integrity": "sha512-U2+DNr+wSjpsTS/wZGYHq7GcwfuSmKiKvoPvK22zwTlRhU91yOniN4qRR5KhIjvif7ysw/dz/hKmfDH0Ris4aA==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "undici-types": "~6.21.0"
      }
    },
    "node_modules/@types/nodemailer": {
      "version": "7.0.12",
      "resolved": "https://registry.npmjs.org/@types/nodemailer/-/nodemailer-7.0.12.tgz",
      "integrity": "sha512-80vKwiIsVSyFA1rRovH59jNPLBOuc6dRZIHEu40gXTkBkZnQv8vog1xSGEb9j5q/tdMAs5ivvDR2pLTU0hGHXA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@types/node": "*"
      }
    },
    "node_modules/@types/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz",
      "integrity": "sha512-N0rFCuH9YoxG9/m61l9MfpJKfmLOVU0em7ipIz6TRgSSkvReLB9vL85GB+yr8Bs5leqpvg96JSwF4ZS1s4viQg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "csstype": "^3.2.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-ZI7bU42mZXXKHn/qNLEw2IrbiINU7X5+vfgdixBHkCNpYWXjKgfQ/P+uyGb5CjOLB9UcnTeg3rylQtV2hym44Q==",
      "dev": true,
      "license": "MIT",
      "peerDependencies": {
        "@types/react": "^19.3.0"
      }
    },
    "node_modules/@types/tough-cookie": {
      "version": "4.0.5",
      "resolved": "https://registry.npmjs.org/@types/tough-cookie/-/tough-cookie-4.0.5.tgz",
      "integrity": "sha512-/Ad8+nIOV7Rl++6f1BdKxFSMgmoqEoYbHRpPcx3JEfv8VRsQe9Z4mCXeJBzxs7mbHY/XOZZuXlRNfhpVPbs6ZA==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/ansi-styles": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-5.2.0.tgz",
      "integrity": "sha512-Cxwpt2SfTzTtXcfOlzGEee8O+c+MmUgGrNiBcXnuWxuFJHe6a5Hz7qwhwe5OgaSYI0IJvkLqWX1ASG+cJOkEiA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/aria-query": {
      "version": "5.3.0",
      "resolved": "https://registry.npmjs.org/aria-query/-/aria-query-5.3.0.tgz",
      "integrity": "sha512-b0P0sZPKtyu8HkeRAfCq0IfURZK+SuwMjY1UXGBU27wpAiTwQAIlq56IbIO+ytk/JjS1fMR14ee5WBBfKi5J6A==",
      "dev": true,
      "license": "Apache-2.0",
      "peer": true,
      "dependencies": {
        "dequal": "^2.0.3"
      }
    },
    "node_modules/baseline-browser-mapping": {
      "version": "2.11.28",
      "resolved": "https://registry.npmjs.org/baseline-browser-mapping/-/baseline-browser-mapping-2.11.28.tgz",
      "integrity": "sha512-br0LOmjJqr6Rt4AEkadbcNf67Zpo7EPwKsWbjnRrJIa1QYFHQBqM4C7F2WTbV8ahTEcg1Eo+Y0aWjjORInYFyA==",
      "license": "Apache-2.0",
      "bin": {
        "baseline-browser-mapping": "dist/cli.cjs"
      },
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/bcryptjs": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/bcryptjs/-/bcryptjs-3.0.3.tgz",
      "integrity": "sha512-GlF5wPWnSa/X5LKM1o0wz0suXIINz1iHRLvTS+sLyi7XPbe5ycmYI3DlZqVGZZtDgl4DmasFg7gOB3JYbphV5g==",
      "license": "BSD-3-Clause",
      "bin": {
        "bcrypt": "bin/bcrypt"
      }
    },
    "node_modules/bidi-js": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/bidi-js/-/bidi-js-1.1.0.tgz",
      "integrity": "sha512-fX1Onk0tdVPC7obPWB5EbJ1z7NVhLq4m2xZLq2YXBkxzMXIGRpNMU88n0EPgWseKl12J7zXs7qrDxPK4sRs2fg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "require-from-string": "^2.0.2"
      }
    },
    "node_modules/bowser": {
      "version": "2.14.1",
      "resolved": "https://registry.npmjs.org/bowser/-/bowser-2.14.1.tgz",
      "integrity": "sha512-tzPjzCxygAKWFOJP011oxFHs57HzIhOEracIgAePE4pqB3LikALKnSzUyU4MGs9/iCEUuHlAJTjTc5M+u7YEGg==",
      "license": "MIT"
    },
    "node_modules/c12": {
      "version": "3.1.0",
      "resolved": "https://registry.npmjs.org/c12/-/c12-3.1.0.tgz",
      "integrity": "sha512-uWoS8OU1MEIsOv8p/5a82c3H31LsWVR5qiyXVfBNOzfffjUWtPnhAb4BYI2uG2HfGmZmFjCtui5XNWaps+iFuw==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "chokidar": "^4.0.3",
        "confbox": "^0.2.2",
        "defu": "^6.1.4",
        "dotenv": "^16.6.1",
        "exsolve": "^1.0.7",
        "giget": "^2.0.0",
        "jiti": "^2.4.2",
        "ohash": "^2.0.11",
        "pathe": "^2.0.3",
        "perfect-debounce": "^1.0.0",
        "pkg-types": "^2.2.0",
        "rc9": "^2.1.2"
      },
      "peerDependencies": {
        "magicast": "^0.3.5"
      },
      "peerDependenciesMeta": {
        "magicast": {
          "optional": true
        }
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/call-bound": {
      "version": "1.0.4",
      "resolved": "https://registry.npmjs.org/call-bound/-/call-bound-1.0.4.tgz",
      "integrity": "sha512-+ys997U96po4Kx/ABpBCqhA9EuxJaQWDQg7295H4hBphv3IZg0boBKuwYpt4YXp6MZ5AmZQnU/tyMTlRpaSejg==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "get-intrinsic": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001816",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001816.tgz",
      "integrity": "sha512-+8Yx7BXCoqk6IF8yTicjfUR6D/ldJzdlsodlEOiOSPmhK844WIgk67/zIQaGAOxNkZyyvBlrRFnLvqKIoqbAFw==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "CC-BY-4.0"
    },
    "node_modules/chokidar": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-4.0.3.tgz",
      "integrity": "sha512-Qgzu8kfBvo+cA4962jnP1KkS6Dop5NS6g7R5LFYJr4b8Ub94PPQXUksCw9PvXoeXPRRddRNC5C1JQUR2SMGtnA==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "readdirp": "^4.0.1"
      },
      "engines": {
        "node": ">= 14.16.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/citty": {
      "version": "0.1.6",
      "resolved": "https://registry.npmjs.org/citty/-/citty-0.1.6.tgz",
      "integrity": "sha512-tskPPKEs8D2KPafUypv2gxwJP8h/OaJmC82QQGGDQcHvXX43xF2VDACcJVmZ0EuSxkpO9Kc4MlrA3q0+FG58AQ==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "consola": "^3.2.3"
      }
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA==",
      "license": "MIT"
    },
    "node_modules/confbox": {
      "version": "0.2.4",
      "resolved": "https://registry.npmjs.org/confbox/-/confbox-0.2.4.tgz",
      "integrity": "sha512-ysOGlgTFbN2/Y6Cg3Iye8YKulHw+R2fNXHrgSmXISQdMnomY6eNDprVdW9R5xBguEqI954+S6709UyiO7B+6OQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/consola": {
      "version": "3.4.2",
      "resolved": "https://registry.npmjs.org/consola/-/consola-3.4.2.tgz",
      "integrity": "sha512-5IKcdX0nnYavi6G7TtOhwkYzyjfJlatbjMjuLSfE2kYT5pMDOilZ4OvMhi637CcDICTmz3wARPoyhqyX1Y+XvA==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": "^14.18.0 || >=16.10.0"
      }
    },
    "node_modules/css-tree": {
      "version": "3.2.1",
      "resolved": "https://registry.npmjs.org/css-tree/-/css-tree-3.2.1.tgz",
      "integrity": "sha512-X7sjQzceUhu1u7Y/ylrRZFU2FS6LRiFVp6rKLPg23y3x3c3DOKAwuXGDp+PAGjh6CSnCjYeAul8pcT8bAl+lSA==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "mdn-data": "2.27.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12.20.0 || ^14.13.0 || >=15.0.0"
      }
    },
    "node_modules/csstype": {
      "version": "3.2.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz",
      "integrity": "sha512-z1HGKcYy2xA8AGQfwrn0PAy+PB7X/GSj3UVJW9qKyn43xWa+gl5nXmU4qqLMRzWVLFC8KusUX8T/0kCiOYpAIQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/data-urls": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/data-urls/-/data-urls-8.0.0.tgz",
      "integrity": "sha512-JQUCCK+/CAGbGGx618PlFZMXH81Jtj7t73CHv9dd/zVWvxgGT2zLFRjnKb+Ng46GIwcy+f7f88qd4duqllK+WQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^17.1.2"
      },
      "engines": {
        "node": "^22.14.0 || >=24.0.0"
      }
    },
    "node_modules/decimal.js": {
      "version": "10.6.0",
      "resolved": "https://registry.npmjs.org/decimal.js/-/decimal.js-10.6.0.tgz",
      "integrity": "sha512-YpgQiITW3JXGntzdUmyUR1V812Hn8T1YVXhCu+wO3OpS4eU9l4YdD3qjyiKdV6mvV29zapkMeD390UVEf2lkUg==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/deepmerge-ts": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/deepmerge-ts/-/deepmerge-ts-8.0.2.tgz",
      "integrity": "sha512-uqbvqLUMrc6p0MO+WBRtTxY55hmyh94WRwI5a++PZe54X+bfVh59FSN7uWCBCW1CCVjzjnrwzfI8zidE2obMMw==",
      "devOptional": true,
      "funding": [
        {
          "type": "ko-fi",
          "url": "https://ko-fi.com/rebeccastevens"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/deepmerge-ts"
        }
      ],
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=16.9.0"
      }
    },
    "node_modules/defu": {
      "version": "6.1.7",
      "resolved": "https://registry.npmjs.org/defu/-/defu-6.1.7.tgz",
      "integrity": "sha512-7z22QmUWiQ/2d0KkdYmANbRUVABpZ9SNYyH5vx6PZ+nE5bcC0l7uFvEfHlyld/HcGBFTL536ClDt3DEcSlEJAQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/dequal": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/dequal/-/dequal-2.0.3.tgz",
      "integrity": "sha512-0je+qPKHEMohvfRTCEo3CrPG6cAzAYgmzKyxRiYSSDkS6eGJdyVJm7WaYA5ECaAD9wLB2T4EEeymA5aFVcYXCA==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/destr": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/destr/-/destr-2.0.5.tgz",
      "integrity": "sha512-ugFTXCtDZunbzasqBxrK93Ik/DRYsO6S/fedkWEMKqt04xZ4csmnmwGDBAb07QWNaGMAmnTIemsYZCksjATwsA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/detect-libc": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/detect-libc/-/detect-libc-2.1.2.tgz",
      "integrity": "sha512-Btj2BOOO83o3WyH59e8MgXsxEQVcarkUOpEYrubB0urwnN10yQ364rsiByU11nZlqWYZm05i/of7io4mzihBtQ==",
      "license": "Apache-2.0",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/dom-accessibility-api": {
      "version": "0.5.16",
      "resolved": "https://registry.npmjs.org/dom-accessibility-api/-/dom-accessibility-api-0.5.16.tgz",
      "integrity": "sha512-X7BJ2yElsnOJ30pZF4uIIDfBEVgF4XEBxL9Bxhy6dnrm5hkzqmsWHGTiHqRiITNhMyFLyAiWndIJP7Z1NTteDg==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/dotenv": {
      "version": "16.6.1",
      "resolved": "https://registry.npmjs.org/dotenv/-/dotenv-16.6.1.tgz",
      "integrity": "sha512-uBq4egWHTcTt33a72vpSG0z3HnPuIl6NqYcTrKEg2azoEyl2hpW0zqlxysq2pK9HlDIHyHyakeYaYnSAwd8bow==",
      "devOptional": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://dotenvx.com"
      }
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/effect": {
      "version": "3.22.2",
      "resolved": "https://registry.npmjs.org/effect/-/effect-3.22.2.tgz",
      "integrity": "sha512-fm1CQXCs7GTMwpadZxwU5rnAb2bN6mbQpknq/pXBGCzSKkosNYb9k0wsoL0TfB10rSa5xOEZJjo77u/KLXSANg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "@standard-schema/spec": "^1.0.0",
        "fast-check": "^3.23.1"
      }
    },
    "node_modules/empathic": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/empathic/-/empathic-2.0.0.tgz",
      "integrity": "sha512-i6UzDscO/XfAcNYD75CfICkmfLedpyPDdozrLMmQc5ORaQcdMoc21OnlEylMIqI7U8eniKrPMxxtj8k0vhmJhA==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/enhanced-resolve": {
      "version": "5.26.0",
      "resolved": "https://registry.npmjs.org/enhanced-resolve/-/enhanced-resolve-5.26.0.tgz",
      "integrity": "sha512-9vhedylFonb2YGogzUKX6+Ja72gOJbN1QHAqdrvqLwhdl/QWbKopzoUC9EbQNVsAns/bx/4uyqalrQAoy1IByw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "graceful-fs": "^4.2.4",
        "tapable": "^2.3.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/entities": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/entities/-/entities-8.1.0.tgz",
      "integrity": "sha512-kxL7msIffSuh9aaFAMD7rxAIuTRMAHMeBtgHW2yUdWw732ZNh4MehkF2gdjvtdmikkaIP9bFDDJOPlsvm7avrA==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20.19.0"
      },
      "funding": {
        "url": "https://github.com/fb55/entities?sponsor=1"
      }
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.2.tgz",
      "integrity": "sha512-HWcBoN6NileqtSydK2FqHbS/LoDd2pqrnQHLyJzBj4kOp/ky2MWMN694xOfkK8/SnUsW2DH7EfyVlydKCsm1Zw==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/esbuild": {
      "version": "0.28.2",
      "resolved": "https://registry.npmjs.org/esbuild/-/esbuild-0.28.2.tgz",
      "integrity": "sha512-HKVLS8dvII+xoKW9kmqxbRKrnWEXfJJr/FZhhJmiqIB0e053QNYFqOBouTMO/k5sID4MvCiUCvv8b9M4h32wIA==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "bin": {
        "esbuild": "bin/esbuild"
      },
      "engines": {
        "node": ">=18"
      },
      "optionalDependencies": {
        "@esbuild/aix-ppc64": "0.28.2",
        "@esbuild/android-arm": "0.28.2",
        "@esbuild/android-arm64": "0.28.2",
        "@esbuild/android-x64": "0.28.2",
        "@esbuild/darwin-arm64": "0.28.2",
        "@esbuild/darwin-x64": "0.28.2",
        "@esbuild/freebsd-arm64": "0.28.2",
        "@esbuild/freebsd-x64": "0.28.2",
        "@esbuild/linux-arm": "0.28.2",
        "@esbuild/linux-arm64": "0.28.2",
        "@esbuild/linux-ia32": "0.28.2",
        "@esbuild/linux-loong64": "0.28.2",
        "@esbuild/linux-mips64el": "0.28.2",
        "@esbuild/linux-ppc64": "0.28.2",
        "@esbuild/linux-riscv64": "0.28.2",
        "@esbuild/linux-s390x": "0.28.2",
        "@esbuild/linux-x64": "0.28.2",
        "@esbuild/netbsd-arm64": "0.28.2",
        "@esbuild/netbsd-x64": "0.28.2",
        "@esbuild/openbsd-arm64": "0.28.2",
        "@esbuild/openbsd-x64": "0.28.2",
        "@esbuild/openharmony-arm64": "0.28.2",
        "@esbuild/sunos-x64": "0.28.2",
        "@esbuild/win32-arm64": "0.28.2",
        "@esbuild/win32-ia32": "0.28.2",
        "@esbuild/win32-x64": "0.28.2"
      }
    },
    "node_modules/exsolve": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/exsolve/-/exsolve-1.1.3.tgz",
      "integrity": "sha512-kuzL9zherLQoqDeQaS55AiiIg1kb4KYXaSusTtgZTPlvKP2gGCI82LNmBNh5RjDVUXIcmgx+/Mx7vPwRzBbhJA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/fast-check": {
      "version": "3.23.2",
      "resolved": "https://registry.npmjs.org/fast-check/-/fast-check-3.23.2.tgz",
      "integrity": "sha512-h5+1OzzfCC3Ef7VbtKdcv7zsstUQwUDlYpUTvjeUsJAssPgLn7QzbboPtL5ro04Mq0rPOsMzl7q5hIbRs2wD1A==",
      "devOptional": true,
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/dubzzz"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fast-check"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "pure-rand": "^6.1.0"
      },
      "engines": {
        "node": ">=8.0.0"
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "dev": true,
      "hasInstallScript": true,
      "license": "MIT",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "license": "MIT",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "license": "MIT",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/giget": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/giget/-/giget-2.0.0.tgz",
      "integrity": "sha512-L5bGsVkxJbJgdnwyuheIunkGatUF/zssUoxxjACCseZYAVbaqdh9Tsmmlkl8vYan09H7sbvKt4pS8GqKLBrEzA==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "citty": "^0.1.6",
        "consola": "^3.4.0",
        "defu": "^6.1.4",
        "node-fetch-native": "^1.6.6",
        "nypm": "^0.6.0",
        "pathe": "^2.0.3"
      },
      "bin": {
        "giget": "dist/cli.mjs"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/graceful-fs": {
      "version": "4.2.11",
      "resolved": "https://registry.npmjs.org/graceful-fs/-/graceful-fs-4.2.11.tgz",
      "integrity": "sha512-RbJ5/jmFcNNCcDV5o9eTnBLJ/HszWV0P73bc+Ff4nS/rJj+YaS6IGyiOL0VoBYX+l1Wrl3k63h/KrH+nhJ0XvQ==",
      "dev": true,
      "license": "ISC"
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.4",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.4.tgz",
      "integrity": "sha512-T2UbfbBEF32wiepXIsMlTW9+dDYC6wMh/t/vYA4tuOMKqWz/n3vr1NFSxQiyP+zk2mXsoMA/i/7qV6LKut1t1A==",
      "license": "MIT",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/html-encoding-sniffer": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/html-encoding-sniffer/-/html-encoding-sniffer-7.0.0.tgz",
      "integrity": "sha512-UikN5yr7xsCDAq87Or5or0PAlD3HJJOKVzM05az588WnpDJ4Ux7a2A53Qi6gofGg2/EtvF/H4hCi/TXfCW4Y6w==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.15.1"
      },
      "engines": {
        "node": "^22.13.0 || >=24.0.0"
      }
    },
    "node_modules/is-potential-custom-element-name": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/is-potential-custom-element-name/-/is-potential-custom-element-name-1.0.1.tgz",
      "integrity": "sha512-bCYeRA2rVibKZd+s2625gGnGF/t7DSqDs4dP7CrLA1m7jKWz6pps0LpYLJN8Q64HtmPKJ1hrN3nzPNKFEKOUiQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/jiti": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-2.7.0.tgz",
      "integrity": "sha512-AC/7JofJvZGrrneWNaEnJeOLUx+JlGt7tNa0wZiRPT4MY1wmfKjt2+6O2p2uz2+skll8OZZmJMNqeke7kKbNgQ==",
      "devOptional": true,
      "license": "MIT",
      "bin": {
        "jiti": "lib/jiti-cli.mjs"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/jsdom": {
      "version": "30.1.2",
      "resolved": "https://registry.npmjs.org/jsdom/-/jsdom-30.1.2.tgz",
      "integrity": "sha512-0FFE/jE1rppmVfUrJUgxqXjcwolZYIGtAgj1pTussMhNZxIxi7W/PvfWaMNroGi2B36X1IKHbexpZ9DhkoOPiQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@asamuzakjp/css-color": "^7.1.3",
        "@asamuzakjp/dom-selector": "^9.2.4",
        "@bramus/specificity": "^2.4.2",
        "@csstools/css-syntax-patches-for-csstree": "^1.1.15",
        "@exodus/bytes": "^1.16.0",
        "css-tree": "^3.2.1",
        "data-urls": "^8.0.0",
        "decimal.js": "^10.6.0",
        "html-encoding-sniffer": "^7.0.0",
        "is-potential-custom-element-name": "^1.0.1",
        "lru-cache": "^11.5.3",
        "parse5": "^8.0.1",
        "saxes": "^6.0.0",
        "tough-cookie": "^6.0.2",
        "undici": "^8.11.2",
        "w3c-xmlserializer": "^6.0.0",
        "webidl-conversions": "^8.0.1",
        "whatwg-mimetype": "^5.0.0",
        "whatwg-url": "^17.2.0",
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": "^22.22.2 || ^24.15.0 || >=26.0.0"
      },
      "peerDependencies": {
        "canvas": "^3.2.3"
      },
      "peerDependenciesMeta": {
        "canvas": {
          "optional": true
        }
      }
    },
    "node_modules/lightningcss": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss/-/lightningcss-1.32.0.tgz",
      "integrity": "sha512-NXYBzinNrblfraPGyrbPoD19C1h9lfI/1mzgWYvXUTe414Gz/X1FD2XBZSZM7rRTrMA8JL3OtAaGifrIKhQ5yQ==",
      "dev": true,
      "license": "MPL-2.0",
      "dependencies": {
        "detect-libc": "^2.0.3"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      },
      "optionalDependencies": {
        "lightningcss-android-arm64": "1.32.0",
        "lightningcss-darwin-arm64": "1.32.0",
        "lightningcss-darwin-x64": "1.32.0",
        "lightningcss-freebsd-x64": "1.32.0",
        "lightningcss-linux-arm-gnueabihf": "1.32.0",
        "lightningcss-linux-arm64-gnu": "1.32.0",
        "lightningcss-linux-arm64-musl": "1.32.0",
        "lightningcss-linux-x64-gnu": "1.32.0",
        "lightningcss-linux-x64-musl": "1.32.0",
        "lightningcss-win32-arm64-msvc": "1.32.0",
        "lightningcss-win32-x64-msvc": "1.32.0"
      }
    },
    "node_modules/lightningcss-android-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-android-arm64/-/lightningcss-android-arm64-1.32.0.tgz",
      "integrity": "sha512-YK7/ClTt4kAK0vo6w3X+Pnm0D2cf2vPHbhOXdoNti1Ga0al1P4TBZhwjATvjNwLEBCnKvjJc2jQgHXH0NEwlAg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "android"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-arm64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-arm64/-/lightningcss-darwin-arm64-1.32.0.tgz",
      "integrity": "sha512-RzeG9Ju5bag2Bv1/lwlVJvBE3q6TtXskdZLLCyfg5pt+HLz9BqlICO7LZM7VHNTTn/5PRhHFBSjk5lc4cmscPQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-darwin-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-darwin-x64/-/lightningcss-darwin-x64-1.32.0.tgz",
      "integrity": "sha512-U+QsBp2m/s2wqpUYT/6wnlagdZbtZdndSmut/NJqlCcMLTWp5muCrID+K5UJ6jqD2BFshejCYXniPDbNh73V8w==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-freebsd-x64": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-freebsd-x64/-/lightningcss-freebsd-x64-1.32.0.tgz",
      "integrity": "sha512-JCTigedEksZk3tHTTthnMdVfGf61Fky8Ji2E4YjUTEQX14xiy/lTzXnu1vwiZe3bYe0q+SpsSH/CTeDXK6WHig==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "freebsd"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm-gnueabihf": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm-gnueabihf/-/lightningcss-linux-arm-gnueabihf-1.32.0.tgz",
      "integrity": "sha512-x6rnnpRa2GL0zQOkt6rts3YDPzduLpWvwAF6EMhXFVZXD4tPrBkEFqzGowzCsIWsPjqSK+tyNEODUBXeeVHSkw==",
      "cpu": [
        "arm"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-gnu/-/lightningcss-linux-arm64-gnu-1.32.0.tgz",
      "integrity": "sha512-0nnMyoyOLRJXfbMOilaSRcLH3Jw5z9HDNGfT/gwCPgaDjnx0i8w7vBzFLFR1f6CMLKF8gVbebmkUN3fa/kQJpQ==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-arm64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-arm64-musl/-/lightningcss-linux-arm64-musl-1.32.0.tgz",
      "integrity": "sha512-UpQkoenr4UJEzgVIYpI80lDFvRmPVg6oqboNHfoH4CQIfNA+HOrZ7Mo7KZP02dC6LjghPQJeBsvXhJod/wnIBg==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-gnu": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-gnu/-/lightningcss-linux-x64-gnu-1.32.0.tgz",
      "integrity": "sha512-V7Qr52IhZmdKPVr+Vtw8o+WLsQJYCTd8loIfpDaMRWGUZfBOYEJeyJIkqGIDMZPwPx24pUMfwSxxI8phr/MbOA==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-linux-x64-musl": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-linux-x64-musl/-/lightningcss-linux-x64-musl-1.32.0.tgz",
      "integrity": "sha512-bYcLp+Vb0awsiXg/80uCRezCYHNg1/l3mt0gzHnWV9XP1W5sKa5/TCdGWaR/zBM2PeF/HbsQv/j2URNOiVuxWg==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "linux"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-arm64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-arm64-msvc/-/lightningcss-win32-arm64-msvc-1.32.0.tgz",
      "integrity": "sha512-8SbC8BR40pS6baCM8sbtYDSwEVQd4JlFTOlaD3gWGHfThTcABnNDBda6eTZeqbofalIJhFx0qKzgHJmcPTnGdw==",
      "cpu": [
        "arm64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lightningcss-win32-x64-msvc": {
      "version": "1.32.0",
      "resolved": "https://registry.npmjs.org/lightningcss-win32-x64-msvc/-/lightningcss-win32-x64-msvc-1.32.0.tgz",
      "integrity": "sha512-Amq9B/SoZYdDi1kFrojnoqPLxYhQ4Wo5XiL8EVJrVsB8ARoC1PWW6VGtT0WKCemjy8aC+louJnjS7U18x3b06Q==",
      "cpu": [
        "x64"
      ],
      "dev": true,
      "license": "MPL-2.0",
      "optional": true,
      "os": [
        "win32"
      ],
      "engines": {
        "node": ">= 12.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/parcel"
      }
    },
    "node_modules/lru-cache": {
      "version": "11.5.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-11.5.3.tgz",
      "integrity": "sha512-U4N8FgzmWxc8k1VH8Kr6lQg18U7Fjvby6wXHVRX/ZZ7IwWbRMgrRbP0Wrb5q5NVinryp4SQampHKdvtecItxUg==",
      "dev": true,
      "license": "BlueOak-1.0.0",
      "engines": {
        "node": "20 || >=22"
      }
    },
    "node_modules/lz-string": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/lz-string/-/lz-string-1.5.0.tgz",
      "integrity": "sha512-h5bgJWpxJNswbU7qCrV0tIKQCaS3blPDrqKWx+QxzuzL1zGUzij9XCWLrSLsJPu5t+eWA/ycetzYAO5IOMcWAQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "bin": {
        "lz-string": "bin/bin.js"
      }
    },
    "node_modules/magic-string": {
      "version": "0.30.21",
      "resolved": "https://registry.npmjs.org/magic-string/-/magic-string-0.30.21.tgz",
      "integrity": "sha512-vd2F4YUyEXKGcLHoq+TEyCjxueSeHnFxyyjNp80yg0XV4vUhnDer/lvvlqM/arB5bXQN5K2/3oinyCRyx8T2CQ==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.5"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/mdn-data": {
      "version": "2.27.1",
      "resolved": "https://registry.npmjs.org/mdn-data/-/mdn-data-2.27.1.tgz",
      "integrity": "sha512-9Yubnt3e8A0OKwxYSXyhLymGW4sCufcLG6VdiDdUGVkPhpqLxlvP5vl1983gQjJl3tqbrM731mjaZaP68AgosQ==",
      "dev": true,
      "license": "CC0-1.0"
    },
    "node_modules/nanoid": {
      "version": "3.3.20",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.20.tgz",
      "integrity": "sha512-uKdg2G3GNCKQn9byYOpxbGqrT2fGO5KRt5J/8b3pok8rT6qxGWF6hxMyJiEYtAf+FVyYuD9hRaDqX5uPFYJ4ZQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/next": {
      "version": "16.4.0",
      "resolved": "https://registry.npmjs.org/next/-/next-16.4.0.tgz",
      "integrity": "sha512-N2C+9q89Z/oLrsepSRS4jRMtwmUZAoZuAHU0e9T6+sAB5DdhADmrnOW+zjYijlrYFmVfmQhGVGy9eMFoB7UgKg==",
      "license": "MIT",
      "dependencies": {
        "@next/env": "16.4.0",
        "@swc/helpers": "0.5.23",
        "baseline-browser-mapping": "^2.9.19",
        "caniuse-lite": "^1.0.30001579",
        "postcss": "8.5.23",
        "styled-jsx": "5.1.6"
      },
      "bin": {
        "next": "dist/bin/next"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "optionalDependencies": {
        "@next/swc-darwin-arm64": "16.4.0",
        "@next/swc-darwin-x64": "16.4.0",
        "@next/swc-linux-arm64-gnu": "16.4.0",
        "@next/swc-linux-arm64-musl": "16.4.0",
        "@next/swc-linux-x64-gnu": "16.4.0",
        "@next/swc-linux-x64-musl": "16.4.0",
        "@next/swc-win32-arm64-msvc": "16.4.0",
        "@next/swc-win32-x64-msvc": "16.4.0",
        "sharp": "^0.35.4"
      },
      "peerDependencies": {
        "@opentelemetry/api": "^1.1.0",
        "@playwright/test": "^1.51.1",
        "babel-plugin-react-compiler": "*",
        "react": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "react-dom": "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0",
        "sass": "^1.3.0"
      },
      "peerDependenciesMeta": {
        "@opentelemetry/api": {
          "optional": true
        },
        "@playwright/test": {
          "optional": true
        },
        "babel-plugin-react-compiler": {
          "optional": true
        },
        "sass": {
          "optional": true
        }
      }
    },
    "node_modules/node-fetch-native": {
      "version": "1.6.7",
      "resolved": "https://registry.npmjs.org/node-fetch-native/-/node-fetch-native-1.6.7.tgz",
      "integrity": "sha512-g9yhqoedzIUm0nTnTqAQvueMPVOuIY16bqgAJJC8XOOubYFNwz6IER9qs0Gq2Xd0+CecCKFjtdDTMA4u4xG06Q==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/nodemailer": {
      "version": "10.1.1",
      "resolved": "https://registry.npmjs.org/nodemailer/-/nodemailer-10.1.1.tgz",
      "integrity": "sha512-pbqZRoeYUO+1E8TJ/11WeY4D2EVujj1hsYjz3qff/vUFDtGnmi7p3iqzTFslYOfQ6PnjVcWxx/CIUSHCSrO/QA==",
      "license": "MIT-0",
      "engines": {
        "node": ">=20.0.0"
      }
    },
    "node_modules/nypm": {
      "version": "0.6.10",
      "resolved": "https://registry.npmjs.org/nypm/-/nypm-0.6.10.tgz",
      "integrity": "sha512-W72Hrj1petq+b3Hk2aAC+9zswetlIFTnDW4s5djseZh2nYqBbyQLOtj472HwcbcWykPBUW1WpWpjOd4nK6gMRw==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "citty": "^0.2.2",
        "pathe": "^2.0.3",
        "tinyexec": "^1.3.1"
      },
      "bin": {
        "nypm": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/nypm/node_modules/citty": {
      "version": "0.2.2",
      "resolved": "https://registry.npmjs.org/citty/-/citty-0.2.2.tgz",
      "integrity": "sha512-+6vJA3L98yv+IdfKGZHBNiGW5KHn22e/JwID0Strsz8h4S/csAu/OuICwxrg44k5MRiZHWIo8XXuJgQTriRP4w==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/object-inspect": {
      "version": "1.13.4",
      "resolved": "https://registry.npmjs.org/object-inspect/-/object-inspect-1.13.4.tgz",
      "integrity": "sha512-W67iLl4J2EXEGTbfeHCffrjDfitvLANg0UlX3wFUUSTx92KXRFegMHUVgSqE+wvhAbi4WqjGg9czysTV2Epbew==",
      "license": "MIT",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/ohash": {
      "version": "2.0.12",
      "resolved": "https://registry.npmjs.org/ohash/-/ohash-2.0.12.tgz",
      "integrity": "sha512-65S/5gk9YSsaRjcyf7Nfa6h/d3E8/1gslpXfI4W7Dxn/oap8IKRuNT5VXkLQ1YFKIEg4apRY4Pj6aiwFzrDdmw==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/parse5": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/parse5/-/parse5-8.0.1.tgz",
      "integrity": "sha512-z1e/HMG90obSGeidlli3hj7cbocou0/wa5HacvI3ASx34PecNjNQeaHNo5WIZpWofN9kgkqV1q5YvXe3F0FoPw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "entities": "^8.0.0"
      },
      "funding": {
        "url": "https://github.com/inikulin/parse5?sponsor=1"
      }
    },
    "node_modules/pathe": {
      "version": "2.0.3",
      "resolved": "https://registry.npmjs.org/pathe/-/pathe-2.0.3.tgz",
      "integrity": "sha512-WUjGcAqP1gQacoQe+OBJsFA7Ld4DyXuUIjZ5cc75cLHvJ7dtNsTugphxIADwspS+AraAUePCKrSVtPLFj/F88w==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/perfect-debounce": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/perfect-debounce/-/perfect-debounce-1.0.0.tgz",
      "integrity": "sha512-xCy9V055GLEqoFaHoC1SoLIaLmWctgCUaBaWxDZ7/Zx4CTyX7cJQLJOok/orfjZAh9kEYpjJa4d0KcJmCbctZA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA==",
      "license": "ISC"
    },
    "node_modules/pkg-types": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/pkg-types/-/pkg-types-2.3.3.tgz",
      "integrity": "sha512-j/lCFdcppV0JxWpCEITdbDltBxPP6cHT+yNJ6Go2OgoSA9518X847X9z0p6LtA4Nc16+eQzCZjRrWanTGvHJ5w==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "confbox": "^0.3.1",
        "exsolve": "^1.1.1",
        "pathe": "^2.0.3"
      }
    },
    "node_modules/pkg-types/node_modules/confbox": {
      "version": "0.3.1",
      "resolved": "https://registry.npmjs.org/confbox/-/confbox-0.3.1.tgz",
      "integrity": "sha512-cKUSoKa8YxFZZSmraVi7onONx3amu77ngK3kGpsYHDH7drPwCRkQE1RYMPlLRrMtnciRj274XNRxcHxnKmDSnA==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/postcss": {
      "version": "8.5.30",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.30.tgz",
      "integrity": "sha512-zkd+e9S1AQHhmaBKye9zlFHWjOwVgqXl1q3ECYy8561K7qxR2cREf/STLskulBFd78k6AOFeA+ff1TtEzk9bAA==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "license": "MIT",
      "dependencies": {
        "nanoid": "^3.3.20",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.2"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/pretty-format": {
      "version": "27.5.1",
      "resolved": "https://registry.npmjs.org/pretty-format/-/pretty-format-27.5.1.tgz",
      "integrity": "sha512-Qb1gy5OrP5+zDf2Bvnzdl3jsTf1qXVMazbvCoKhtKqVs4/YK4ozX4gKQJJVyNe+cajNPn0KoC0MC3FUmaHWEmQ==",
      "dev": true,
      "license": "MIT",
      "peer": true,
      "dependencies": {
        "ansi-regex": "^5.0.1",
        "ansi-styles": "^5.0.0",
        "react-is": "^17.0.1"
      },
      "engines": {
        "node": "^10.13.0 || ^12.13.0 || ^14.15.0 || >=15.0.0"
      }
    },
    "node_modules/prisma": {
      "version": "6.19.0",
      "resolved": "https://registry.npmjs.org/prisma/-/prisma-6.19.0.tgz",
      "integrity": "sha512-F3eX7K+tWpkbhl3l4+VkFtrwJlLXbAM+f9jolgoUZbFcm1DgHZ4cq9AgVEgUym2au5Ad/TDLN8lg83D+M10ycw==",
      "devOptional": true,
      "hasInstallScript": true,
      "license": "Apache-2.0",
      "dependencies": {
        "@prisma/config": "6.19.0",
        "@prisma/engines": "6.19.0"
      },
      "bin": {
        "prisma": "build/index.js"
      },
      "engines": {
        "node": ">=18.18"
      },
      "peerDependencies": {
        "typescript": ">=5.1.0"
      },
      "peerDependenciesMeta": {
        "typescript": {
          "optional": true
        }
      }
    },
    "node_modules/punycode": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/punycode/-/punycode-2.3.1.tgz",
      "integrity": "sha512-vYt7UD1U9Wg6138shLtLOvdAu+8DsC/ilFtEVHcH+wydcSpNE20AfSOduf6MkRFahL5FY7X1oU7nKVZFtfq8Fg==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/pure-rand": {
      "version": "6.1.0",
      "resolved": "https://registry.npmjs.org/pure-rand/-/pure-rand-6.1.0.tgz",
      "integrity": "sha512-bVWawvoZoBYpp6yIoQtQXHZjmz35RSVHnUOTefl8Vcjr8snTPY1wnpSPMWekcFwbxI6gtmT7rSYPFvz71ldiOA==",
      "devOptional": true,
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/dubzzz"
        },
        {
          "type": "opencollective",
          "url": "https://opencollective.com/fast-check"
        }
      ],
      "license": "MIT"
    },
    "node_modules/qs": {
      "version": "6.16.0",
      "resolved": "https://registry.npmjs.org/qs/-/qs-6.16.0.tgz",
      "integrity": "sha512-h6fhOIaRrID2CbEY2fqs+7t+UXZo+MLAnU5gRIq85uFtdiUPCdsApMlHhXogKVM4HM2DVbIjGNTTYH2OcmP1vA==",
      "license": "BSD-3-Clause",
      "dependencies": {
        "es-define-property": "^1.0.1",
        "side-channel": "^1.1.1"
      },
      "engines": {
        "node": ">=0.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/rc9": {
      "version": "2.1.2",
      "resolved": "https://registry.npmjs.org/rc9/-/rc9-2.1.2.tgz",
      "integrity": "sha512-btXCnMmRIBINM2LDZoEmOogIZU7Qe7zn4BpomSKZ/ykbLObuBdvG+mFq11DL6fjH1DRwHhrlgtYWG96bJiC7Cg==",
      "devOptional": true,
      "license": "MIT",
      "dependencies": {
        "defu": "^6.1.4",
        "destr": "^2.0.3"
      }
    },
    "node_modules/react": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react/-/react-19.3.0.tgz",
      "integrity": "sha512-E8LUcbtBWt20bbl2YoHfx4ZDBdxVTfOKtCZn9cDSJ4l6/nuoApcpIBcj47t2wZoVX8g2ZHuMHbiShgCR1T5Sog==",
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz",
      "integrity": "sha512-JDk8dgif51OjFoDE70+OT9ICyYr+69HlmihNwp1+Nsfbna3t5sIiCa9ZJktDmQ4/1b/rn26hIAR2uYXDMr5r0Q==",
      "license": "MIT",
      "dependencies": {
        "scheduler": "^0.28.0"
      },
      "peerDependencies": {
        "react": "^19.3.0"
      }
    },
    "node_modules/react-hook-form": {
      "version": "7.90.0",
      "resolved": "https://registry.npmjs.org/react-hook-form/-/react-hook-form-7.90.0.tgz",
      "integrity": "sha512-+NdG0FLzCPhFOp2NNxaUYLF9fyZhNjx9FTBBSYWF71/l6BBlmIc/j6xlp3DbaHWLJbIG7Zd8oznA19xJClU97w==",
      "license": "MIT",
      "engines": {
        "node": ">=18.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/react-hook-form"
      },
      "peerDependencies": {
        "@types/react": "*",
        "react": "^16.8.0 || ^17 || ^18 || ^19"
      },
      "peerDependenciesMeta": {
        "@types/react": {
          "optional": true
        }
      }
    },
    "node_modules/react-is": {
      "version": "17.0.2",
      "resolved": "https://registry.npmjs.org/react-is/-/react-is-17.0.2.tgz",
      "integrity": "sha512-w2GsyukL62IJnlaff/nRegPQR94C/XXamvMWmSHRJ4y7Ts/4ocGRmTHvOs8PSE6pB3dWOrD/nueuU5sduBsQ4w==",
      "dev": true,
      "license": "MIT",
      "peer": true
    },
    "node_modules/readdirp": {
      "version": "4.1.2",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-4.1.2.tgz",
      "integrity": "sha512-GDhwkLfywWL2s6vEjyhri+eXmfH6j1L7JE27WhqLeYzoh/A3DBaYGEj2H/HFZCn/kMfim73FXxEJTw06WtxQwg==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">= 14.18.0"
      },
      "funding": {
        "type": "individual",
        "url": "https://paulmillr.com/funding/"
      }
    },
    "node_modules/require-from-string": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",
      "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/saxes": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/saxes/-/saxes-6.0.0.tgz",
      "integrity": "sha512-xAg7SOnEhrm5zI3puOOKyy1OMcMlIJZYNJY7xLBwSze0UjhPLnWfj2GF2EpT0jmzaJKIWKHLsaSSajf35bcYnA==",
      "dev": true,
      "license": "ISC",
      "dependencies": {
        "xmlchars": "^2.2.0"
      },
      "engines": {
        "node": ">=v12.22.7"
      }
    },
    "node_modules/scheduler": {
      "version": "0.28.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz",
      "integrity": "sha512-juorfCmIkIw8tT+p5BXSm6PJjQF/ycEYmKyzURCIt/RaZIhL+PulbQ9Yu2z1HdOJDdqDTlxA1+xKBmHXJsczAw==",
      "license": "MIT"
    },
    "node_modules/semver": {
      "version": "7.8.5",
      "resolved": "https://registry.npmjs.org/semver/-/semver-7.8.5.tgz",
      "integrity": "sha512-Y7/KDsb8LjooZpwaqGyulO6DQlksgCncchHGk+sZIY4SBvUocMBEFH5Ur1fI4dV+Jvl0w6cjvucaIi40puRioA==",
      "license": "ISC",
      "bin": {
        "semver": "bin/semver.js"
      },
      "engines": {
        "node": ">=10"
      }
    },
    "node_modules/sharp": {
      "version": "0.35.5",
      "resolved": "https://registry.npmjs.org/sharp/-/sharp-0.35.5.tgz",
      "integrity": "sha512-Ywn4OnzGukp7CDMrp08RQ50YKmuwG47brZgIVPTvBaaAfQlRlygrRqSrxdCiL9M+LlzLBiJ68IR1QqvzHyjC7g==",
      "license": "Apache-2.0",
      "dependencies": {
        "@img/colour": "^1.1.0",
        "detect-libc": "^2.1.2",
        "semver": "^7.8.5"
      },
      "engines": {
        "node": ">=20.9.0"
      },
      "funding": {
        "url": "https://opencollective.com/libvips"
      },
      "optionalDependencies": {
        "@img/sharp-darwin-arm64": "0.35.5",
        "@img/sharp-darwin-x64": "0.35.5",
        "@img/sharp-freebsd-wasm32": "0.35.5",
        "@img/sharp-libvips-darwin-arm64": "1.3.4",
        "@img/sharp-libvips-darwin-x64": "1.3.4",
        "@img/sharp-libvips-linux-arm": "1.3.4",
        "@img/sharp-libvips-linux-arm64": "1.3.4",
        "@img/sharp-libvips-linux-ppc64": "1.3.4",
        "@img/sharp-libvips-linux-riscv64": "1.3.4",
        "@img/sharp-libvips-linux-s390x": "1.3.4",
        "@img/sharp-libvips-linux-x64": "1.3.4",
        "@img/sharp-libvips-linuxmusl-arm64": "1.3.4",
        "@img/sharp-libvips-linuxmusl-x64": "1.3.4",
        "@img/sharp-linux-arm": "0.35.5",
        "@img/sharp-linux-arm64": "0.35.5",
        "@img/sharp-linux-ppc64": "0.35.5",
        "@img/sharp-linux-riscv64": "0.35.5",
        "@img/sharp-linux-s390x": "0.35.5",
        "@img/sharp-linux-x64": "0.35.5",
        "@img/sharp-linuxmusl-arm64": "0.35.5",
        "@img/sharp-linuxmusl-x64": "0.35.5",
        "@img/sharp-webcontainers-wasm32": "0.35.5",
        "@img/sharp-win32-arm64": "0.35.5",
        "@img/sharp-win32-ia32": "0.35.5",
        "@img/sharp-win32-x64": "0.35.5"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        }
      }
    },
    "node_modules/side-channel": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/side-channel/-/side-channel-1.1.1.tgz",
      "integrity": "sha512-6x6dK6zJdpTzF4sQeNYxwtvBzf6Eg4GtlesS94HOvTudUeyK2WXAaIfmDgsyslYrRBeFIlsi54AYsFGUuhmvrQ==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4",
        "side-channel-list": "^1.0.1",
        "side-channel-map": "^1.0.1",
        "side-channel-weakmap": "^1.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-list": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-list/-/side-channel-list-1.0.1.tgz",
      "integrity": "sha512-mjn/0bi/oUURjc5Xl7IaWi/OJJJumuoJFQJfDDyO46+hBWsfaVM65TBHq2eoZBhzl9EchxOijpkbRC8SVBQU0w==",
      "license": "MIT",
      "dependencies": {
        "es-errors": "^1.3.0",
        "object-inspect": "^1.13.4"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-map": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/side-channel-map/-/side-channel-map-1.0.1.tgz",
      "integrity": "sha512-VCjCNfgMsby3tTdo02nbjtM/ewra6jPHmpThenkTYh8pG9ucZ/1P8So4u4FGBek/BjpOVsDCMoLA/iuBKIFXRA==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/side-channel-weakmap": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/side-channel-weakmap/-/side-channel-weakmap-1.0.2.tgz",
      "integrity": "sha512-WPS/HvHQTYnHisLo9McqBHOJk2FkHO/tlpvldyrnem4aeQp4hai3gythswg6p01oSoTl58rcpiFAjF2br2Ak2A==",
      "license": "MIT",
      "dependencies": {
        "call-bound": "^1.0.2",
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.5",
        "object-inspect": "^1.13.3",
        "side-channel-map": "^1.0.1"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.2.tgz",
      "integrity": "sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==",
      "license": "BSD-3-Clause",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/stripe": {
      "version": "19.3.0",
      "resolved": "https://registry.npmjs.org/stripe/-/stripe-19.3.0.tgz",
      "integrity": "sha512-3MbqRkw5LXb4LWP1LgIEYxUAYhYDDU5pcHZj4Xha6VWPnN1wrUmQ7Htsgm8wR584s0hn1aQg1lYD0Hi+F37E5g==",
      "license": "MIT",
      "dependencies": {
        "qs": "^6.11.0"
      },
      "engines": {
        "node": ">=16"
      },
      "peerDependencies": {
        "@types/node": ">=16"
      },
      "peerDependenciesMeta": {
        "@types/node": {
          "optional": true
        }
      }
    },
    "node_modules/styled-jsx": {
      "version": "5.1.6",
      "resolved": "https://registry.npmjs.org/styled-jsx/-/styled-jsx-5.1.6.tgz",
      "integrity": "sha512-qSVyDTeMotdvQYoHWLNGwRFJHC+i+ZvdBRYosOFgC+Wg1vx4frN2/RG/NA7SYqqvKNLf39P2LSRA2pu6n0XYZA==",
      "license": "MIT",
      "dependencies": {
        "client-only": "0.0.1"
      },
      "engines": {
        "node": ">= 12.0.0"
      },
      "peerDependencies": {
        "react": ">= 16.8.0 || 17.x.x || ^18.0.0-0 || ^19.0.0-0"
      },
      "peerDependenciesMeta": {
        "@babel/core": {
          "optional": true
        },
        "babel-plugin-macros": {
          "optional": true
        }
      }
    },
    "node_modules/tailwindcss": {
      "version": "4.3.3",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-4.3.3.tgz",
      "integrity": "sha512-gOhV3P7ufE62QDGg1zVaTgCR+EtPv92k2nIhVcVKcLmxT1sUBsQGhnZj175j+MqRt4zLF7ic+sCYjfhxMxj7YQ==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tapable": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/tapable/-/tapable-2.3.3.tgz",
      "integrity": "sha512-uxc/zpqFg6x7C8vOE7lh6Lbda8eEL9zmVm/PLeTPBRhh1xCgdWaQ+J1CUieGpIfm2HdtsUpRv+HshiasBMcc6A==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=6"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/webpack"
      }
    },
    "node_modules/tinyexec": {
      "version": "1.3.1",
      "resolved": "https://registry.npmjs.org/tinyexec/-/tinyexec-1.3.1.tgz",
      "integrity": "sha512-GCvB3aoys96IuDFBMcTB46JOR6mdMtAToqwiW8JlWhsoh1mhHi/xn9ss/Dg7N555GiJyEt2qzoG/NHCwM6h1EA==",
      "devOptional": true,
      "license": "MIT",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tldts": {
      "version": "7.4.18",
      "resolved": "https://registry.npmjs.org/tldts/-/tldts-7.4.18.tgz",
      "integrity": "sha512-somxA8xKAUzlAxl0TX/jMSYIbRNFIVGnI96pVGJPeMc5BsHmfVXn6mOJT6U++ELnl04eGfzpfcEuZe8WiASkXg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "tldts-core": "^7.4.18"
      },
      "bin": {
        "tldts": "bin/cli.js"
      }
    },
    "node_modules/tldts-core": {
      "version": "7.4.18",
      "resolved": "https://registry.npmjs.org/tldts-core/-/tldts-core-7.4.18.tgz",
      "integrity": "sha512-KI2PKvCmvQI/xD6ypPqkU0i7oxNXR/O58RLRaHR4svsgVUQ2JE/XC8BtMbG6PSehD27I8sZJRcC1ASnCy6lp3g==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/tough-cookie": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/tough-cookie/-/tough-cookie-6.0.2.tgz",
      "integrity": "sha512-exgYmnmL/sJpR3upZfXG5PoatXQii55xAiXGXzY+sROLZ/Y+SLcp9PgJNI9Vz37HpQ74WvDcLT8eqm+kV3FzrA==",
      "dev": true,
      "license": "BSD-3-Clause",
      "dependencies": {
        "tldts": "^7.0.5"
      },
      "engines": {
        "node": ">=16"
      }
    },
    "node_modules/tr46": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/tr46/-/tr46-7.0.0.tgz",
      "integrity": "sha512-BcDSDW+SIGWVOns1Zm6Yg91q9AEj7eaID0QDY9oIqJD1A8dscNwMcl9Sms2DeuWCNov1X0/oXanHGYQBSLwZsg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "punycode": "^2.3.1"
      },
      "engines": {
        "node": "^22.14.0 || >=24.0.0"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w==",
      "license": "0BSD"
    },
    "node_modules/tsx": {
      "version": "4.23.15",
      "resolved": "https://registry.npmjs.org/tsx/-/tsx-4.23.15.tgz",
      "integrity": "sha512-Yiex1Ovn8z2xPpOWckIiysV1SSyRMY9BkLF++q0yKiDxCqRhosKfMg3janKkiLBwZ5c/YryloKwGZcrEmtwxKw==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "esbuild": "~0.28.0"
      },
      "bin": {
        "tsx": "dist/cli.mjs"
      },
      "engines": {
        "node": ">=18.0.0"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.3"
      }
    },
    "node_modules/typescript": {
      "version": "5.9.3",
      "resolved": "https://registry.npmjs.org/typescript/-/typescript-5.9.3.tgz",
      "integrity": "sha512-jl1vZzPDinLr9eUt3J/t7V6FgNEw9QjvBPdysz9KfQDD41fQrC2Y4vKQdiaUpFT4bXlb1RHhLpp8wtm6M5TgSw==",
      "devOptional": true,
      "license": "Apache-2.0",
      "bin": {
        "tsc": "bin/tsc",
        "tsserver": "bin/tsserver"
      },
      "engines": {
        "node": ">=14.17"
      }
    },
    "node_modules/undici": {
      "version": "8.12.1",
      "resolved": "https://registry.npmjs.org/undici/-/undici-8.12.1.tgz",
      "integrity": "sha512-usz3OVQBeh1LxNn0DzU0voLXMgn5CU/WUdpBsY6Ti5afNao+vTkmn4H/NxoXolc10cOqe2+YIG0Hspq2rsl64w==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=22.19.0"
      }
    },
    "node_modules/undici-types": {
      "version": "6.21.0",
      "resolved": "https://registry.npmjs.org/undici-types/-/undici-types-6.21.0.tgz",
      "integrity": "sha512-iwDZqg0QAGrg9Rav5H4n0M64c3mkR59cJ6wQp+7C4nI0gsmExaedaYLNO44eT4AtBBwjbTiGPMlt2Md0T9H9JQ==",
      "devOptional": true,
      "license": "MIT"
    },
    "node_modules/w3c-xmlserializer": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/w3c-xmlserializer/-/w3c-xmlserializer-6.0.0.tgz",
      "integrity": "sha512-4Nsy8K5Tr6SPDH9jhKJOHf7ChDrc1zufZTVSF7x72hwuEXBqxqk9G6cK+K2NRUtB3iELRJqjXb4JPDMBjMTl2Q==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "xml-name-validator": "^5.0.0"
      },
      "engines": {
        "node": "^22.22.2 || ^24.15.0 || >=26.0.0"
      }
    },
    "node_modules/webidl-conversions": {
      "version": "8.0.1",
      "resolved": "https://registry.npmjs.org/webidl-conversions/-/webidl-conversions-8.0.1.tgz",
      "integrity": "sha512-BMhLD/Sw+GbJC21C/UgyaZX41nPt8bUTg+jWyDeg7e7YN4xOM05YPSIXceACnXVtqyEw/LMClUQMtMZ+PGGpqQ==",
      "dev": true,
      "license": "BSD-2-Clause",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/whatwg-mimetype": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/whatwg-mimetype/-/whatwg-mimetype-5.0.0.tgz",
      "integrity": "sha512-sXcNcHOC51uPGF0P/D4NVtrkjSU2fNsm9iog4ZvZJsL3rjoDAzXZhkm2MWt1y+PUdggKAYVoMAIYcs78wJ51Cw==",
      "dev": true,
      "license": "MIT",
      "engines": {
        "node": ">=20"
      }
    },
    "node_modules/whatwg-url": {
      "version": "17.3.0",
      "resolved": "https://registry.npmjs.org/whatwg-url/-/whatwg-url-17.3.0.tgz",
      "integrity": "sha512-KwOAJrpf+GTgBvcBQJcP38sMF0DsQKdwtG+TxM2pW44P6E5k0hDbWrDmyuJDIF0Uef0aQq0ZoJs+5oI+k8ddhg==",
      "dev": true,
      "license": "MIT",
      "dependencies": {
        "@exodus/bytes": "^1.16.0",
        "tr46": "^7.0.0",
        "webidl-conversions": "^8.0.1"
      },
      "engines": {
        "node": "^22.14.0 || >=24.0.0"
      }
    },
    "node_modules/xml-name-validator": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/xml-name-validator/-/xml-name-validator-5.0.0.tgz",
      "integrity": "sha512-EvGK8EJ3DhaHfbRlETOWAS5pO9MZITeauHKJyb8wyajUfQUenkIg2MvLDTZ4T/TgIcm3HU0TFBgWWboAZ30UHg==",
      "dev": true,
      "license": "Apache-2.0",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/xmlchars": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/xmlchars/-/xmlchars-2.2.0.tgz",
      "integrity": "sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==",
      "dev": true,
      "license": "MIT"
    },
    "node_modules/zod": {
      "version": "4.6.7",
      "resolved": "https://registry.npmjs.org/zod/-/zod-4.6.7.tgz",
      "integrity": "sha512-g8W2D2kU6a8untc053fX1uVBKzM7yqAxW/3zwk83+6RyF2+SKOuV+c0wBDhUwzV1PaGapmZH+rmcUzPf+3CGwg==",
      "license": "MIT",
      "funding": {
        "url": "https://github.com/sponsors/colinhacks"
      }
    }
  }
}
```

## FILE:
/workspace/game-store/package.json

Тип: json (.json)

```json
{
  "name": "game-store",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "node scripts/dev.mjs",
    "build": "prisma generate && next build --webpack",
    "start": "next start --hostname 0.0.0.0",
    "typecheck": "tsc --noEmit",
    "test": "tsx --test tests/*.test.ts",
    "test:integration": "node --env-file-if-exists=.env --import tsx --test tests/integration.ts",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "node --env-file-if-exists=.env --import tsx prisma/seed.ts",
    "admin:create": "node --env-file-if-exists=.env --import tsx scripts/create-admin.ts",
    "test:smoke": "node --env-file-if-exists=.env --import tsx --test tests/routes.ts",
    "test:admin-ui": "node --env-file-if-exists=.env --import tsx --test tests/admin-ui.tsx"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.900.0",
    "@prisma/client": "6.19.0",
    "bcryptjs": "^3.0.2",
    "next": "^16.4.0",
    "nodemailer": "^10.1.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.62.0",
    "sharp": "^0.35.5",
    "stripe": "^19.1.0",
    "zod": "^4.1.11"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.1.14",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.8",
    "@types/jsdom": "^30.0.0",
    "@types/node": "^22.18.0",
    "@types/nodemailer": "^7.0.2",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "jsdom": "^30.1.2",
    "prisma": "6.19.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.20.5",
    "typescript": "^5.9.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "overrides": {
    "postcss": "^8.5.23",
    "effect": "^3.20.0",
    "deepmerge-ts": "^8.0.0"
  },
  "engines": {
    "node": ">=22.12.0"
  }
}
```

## FILE:
/workspace/game-store/postcss.config.mjs

Тип: javascript (.mjs)

```javascript
export default { plugins: { '@tailwindcss/postcss': {} } };
```

## FILE:
/workspace/game-store/prisma/migrations/20261014000000_init/migration.sql

Тип: sql (.sql)

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('NEW', 'AWAITING_PAYMENT', 'PAID', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED', 'PAYMENT_FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "aliases" TEXT[],
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "fields" JSONB NOT NULL DEFAULT '[]',
    "saleAllowed" BOOLEAN NOT NULL DEFAULT false,
    "permissionReference" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "categoryId" TEXT,
    "parentId" TEXT,
    "aliases" TEXT[],
    "tags" TEXT[],
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "price" INTEGER NOT NULL,
    "oldPrice" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "amount" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER NOT NULL DEFAULT 10,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "instruction" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductField" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "options" TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'NEW',
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "checkoutKey" TEXT NOT NULL,
    "internalComment" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "stockReleased" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "deliveryData" JSONB NOT NULL,
    "fieldsSnapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'stripe',
    "providerId" TEXT,
    "intentId" TEXT,
    "url" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT,
    "type" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "object" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reply" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_gameId_idx" ON "Category"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_gameId_published_idx" ON "Product"("gameId", "published");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Product_parentId_idx" ON "Product"("parentId");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductField_productId_key_key" ON "ProductField"("productId", "key");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_userId_checkoutKey_key" ON "Order"("userId", "checkoutKey");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_providerId_key" ON "Payment"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_intentId_key" ON "Payment"("intentId");

-- CreateIndex
CREATE INDEX "PaymentEvent_paymentId_idx" ON "PaymentEvent"("paymentId");

-- CreateIndex
CREATE INDEX "AdminLog_createdAt_idx" ON "AdminLog"("createdAt");

-- CreateIndex
CREATE INDEX "Ticket_userId_createdAt_idx" ON "Ticket"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductField" ADD CONSTRAINT "ProductField_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

```

## FILE:
/workspace/game-store/prisma/migrations/20261014010000_store_settings/migration.sql

Тип: sql (.sql)

```sql
CREATE TABLE "StoreSetting" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "name" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StoreSetting_pkey" PRIMARY KEY ("id")
);
```

## FILE:
/workspace/game-store/prisma/migrations/migration_lock.toml

Тип: toml (.toml)

```toml
provider = "postgresql"
```

## FILE:
/workspace/game-store/prisma/schema.prisma

Тип: prisma (.prisma)

```prisma
generator client {
 provider = "prisma-client-js"
}
datasource db {
 provider = "postgresql"
 url = env("DATABASE_URL")
}
enum Role {
 USER
 ADMIN
}
enum OrderStatus {
 NEW
 AWAITING_PAYMENT
 PAID
 PROCESSING
 COMPLETED
 CANCELLED
 REFUNDED
 PAYMENT_FAILED
}
model User {
 id String @id @default(cuid())
 email String @unique
 passwordHash String
 name String @default("")
 role Role @default(USER)
 blocked Boolean @default(false)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 sessions Session[]
 resets PasswordReset[]
 orders Order[]
 logs AdminLog[]
 tickets Ticket[]
}
model Session {
 id String @id @default(cuid())
 tokenHash String @unique
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 expiresAt DateTime
 createdAt DateTime @default(now())
 @@index([userId])
 @@index([expiresAt])
}
model PasswordReset {
 id String @id @default(cuid())
 tokenHash String @unique
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Cascade)
 expiresAt DateTime
 createdAt DateTime @default(now())
 @@index([expiresAt])
}
model Game {
 id String @id @default(cuid())
 name String
 slug String @unique
 aliases String[]
 description String
 image String @default("")
 logo String @default("")
 published Boolean @default(true)
 sortOrder Int @default(0)
 fields Json @default("[]")
 saleAllowed Boolean @default(false)
 permissionReference String @default("")
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 categories Category[]
 products Product[]
}
model Category {
 id String @id @default(cuid())
 name String
 slug String @unique
 gameId String
 game Game @relation(fields: [gameId], references: [id], onDelete: Restrict)
 products Product[]
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 @@index([gameId])
}
model Product {
 id String @id @default(cuid())
 name String
 slug String @unique
 gameId String
 game Game @relation(fields: [gameId], references: [id], onDelete: Restrict)
 categoryId String?
 category Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
 parentId String?
 parent Product? @relation("Variants", fields: [parentId], references: [id], onDelete: SetNull)
 variants Product[] @relation("Variants")
 aliases String[]
 tags String[]
 description String
 image String @default("")
 price Int
 oldPrice Int?
 currency String @default("usd")
 amount Int
 stock Int @default(100)
 published Boolean @default(true)
 minQuantity Int @default(1)
 maxQuantity Int @default(10)
 deliveryMethod String @default("MANUAL")
 instruction String @default("")
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 images ProductImage[]
 fields ProductField[]
 orderItems OrderItem[]
 @@index([gameId, published])
 @@index([categoryId])
 @@index([price])
 @@index([parentId])
}
model ProductImage {
 id String @id @default(cuid())
 productId String
 product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
 url String
 sortOrder Int @default(0)
 createdAt DateTime @default(now())
 @@index([productId])
}
model ProductField {
 id String @id @default(cuid())
 productId String
 product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
 key String
 label String
 type String
 required Boolean @default(true)
 options String[]
 sortOrder Int @default(0)
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 @@unique([productId, key])
}
model Order {
 id String @id @default(cuid())
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Restrict)
 status OrderStatus @default(NEW)
 total Int
 currency String
 checkoutKey String
 internalComment String @default("")
 expiresAt DateTime
 stockReleased Boolean @default(false)
 paidAt DateTime?
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 items OrderItem[]
 payment Payment?
 @@unique([userId, checkoutKey])
 @@index([userId, createdAt])
 @@index([status, createdAt])
}
model OrderItem {
 id String @id @default(cuid())
 orderId String
 order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
 productId String
 product Product @relation(fields: [productId], references: [id], onDelete: Restrict)
 name String
 gameName String
 quantity Int
 unitPrice Int
 deliveryData Json
 fieldsSnapshot Json
 createdAt DateTime @default(now())
 @@index([orderId])
 @@index([productId])
}
model Payment {
 id String @id @default(cuid())
 orderId String @unique
 order Order @relation(fields: [orderId], references: [id], onDelete: Restrict)
 provider String @default("stripe")
 providerId String? @unique
 intentId String? @unique
 url String?
 amount Int
 currency String
 status String @default("CREATED")
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 events PaymentEvent[]
}
model PaymentEvent {
 id String @id
 paymentId String?
 payment Payment? @relation(fields: [paymentId], references: [id], onDelete: SetNull)
 type String
 result String
 createdAt DateTime @default(now())
 @@index([paymentId])
}
model AdminLog {
 id String @id @default(cuid())
 adminId String
 admin User @relation(fields: [adminId], references: [id], onDelete: Restrict)
 action String
 object String
 objectId String
 before Json?
 after Json?
 createdAt DateTime @default(now())
 @@index([createdAt])
}
model RateLimit {
 key String @id
 count Int
 expiresAt DateTime
}
model Ticket {
 id String @id @default(cuid())
 userId String
 user User @relation(fields: [userId], references: [id], onDelete: Restrict)
 subject String
 message String
 reply String @default("")
 status String @default("OPEN")
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
 @@index([userId, createdAt])
}
model StoreSetting {
 id String @id @default("main")
 name String
 supportEmail String @default("")
 createdAt DateTime @default(now())
 updatedAt DateTime @updatedAt
}
```

## FILE:
/workspace/game-store/prisma/seed.ts

Тип: typescript (.ts)

```typescript
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
const rows=[{name:'Telegram Stars',slug:'telegram',unit:'Stars',aliases:['telegram','телеграм','звезды','звёзды','stars'],packages:[50,100,250,500,1000],base:190,fields:[{key:'username',label:'Telegram username',type:'text',required:true,options:[],sortOrder:0}]},{name:'Standoff 2 Gold',slug:'standoff-2',unit:'Gold',aliases:['standoff','standoff 2','голда','gold'],packages:[100,500,1000,3000,5000],base:150,fields:[{key:'player_id',label:'ID игрока',type:'text',required:true,options:[],sortOrder:0}]},{name:'Roblox Robux',slug:'roblox',unit:'Robux',aliases:['roblox','robux','робуксы','роблокс'],packages:[80,400,800,1700,4500],base:140,fields:[{key:'username',label:'Roblox username / User ID',type:'text',required:true,options:[],sortOrder:0}]},{name:'Warface Credits',slug:'warface',unit:'Кредиты',aliases:['warface','варфейс','credits','кредиты'],packages:[100,500,1000,2500,5000],base:180,fields:[{key:'nickname',label:'Игровой ник',type:'text',required:true,options:[],sortOrder:0},{key:'platform',label:'Платформа',type:'select',required:true,options:['PC','PlayStation','Xbox'],sortOrder:1},{key:'server',label:'Сервер',type:'text',required:false,options:[],sortOrder:2}]}];
async function main(){for(const [i,g] of rows.entries()){
 const game=await db.game.upsert({where:{slug:g.slug},update:{},create:{name:g.name,slug:g.slug,aliases:g.aliases,description:`Пакеты ${g.unit} для ${g.name}. Демонстрационный каталог: перед началом реальных продаж подтвердите разрешённый способ передачи и настройте инструкции.`,image:`/assets/${g.slug}.webp`,logo:`/assets/${g.slug}.webp`,sortOrder:i,fields:g.fields,saleAllowed:false}});
 const category=await db.category.upsert({where:{slug:g.slug+'-currency'},update:{},create:{gameId:game.id,name:g.name,slug:g.slug+'-currency'}});
 for(const amount of g.packages){const price=Number((BigInt(amount)*BigInt(g.base)+BigInt(g.packages[0])/2n)/BigInt(g.packages[0]));await db.product.upsert({where:{slug:g.slug+'-'+amount},update:{},create:{gameId:game.id,categoryId:category.id,name:`${amount} ${g.unit}`,slug:g.slug+'-'+amount,aliases:g.aliases,tags:[g.unit],description:`Пакет ${amount} ${g.unit}. Проверьте данные получателя перед оплатой.`,image:`/assets/${g.slug}.webp`,price,oldPrice:Number((BigInt(price)*115n+50n)/100n),currency:process.env.STORE_CURRENCY||'rub',amount,stock:100,instruction:'Демонстрационный товар. В тестовом режиме реальная выдача не производится. Перед публикацией замените инструкцию на разрешённый способ передачи и срок исполнения.'}});}
}console.log('Seed: 4 игры и 20 товаров. Существующие записи сохранены.');}
main().finally(()=>db.$disconnect());
```

## FILE:
/workspace/game-store/proxy.ts

Тип: typescript (.ts)

```typescript
import { NextRequest,NextResponse } from 'next/server';
import { db } from './lib/db';
import { userForToken } from './lib/security';
const publicPages=new Set(['','catalog','search','cart','checkout','success','payment-error','login','register','forgot-password','reset-password','account','orders','support','faq','terms','privacy','refunds','contacts','admin','setup','404']);
export async function proxy(req:NextRequest) {
 const parts=req.nextUrl.pathname.split('/').filter(Boolean);
 let exists=parts.length<=1 && publicPages.has(parts[0]||'');
 if(parts.length===2 && parts[0]==='games')exists=!!await db.game.findFirst({where:{slug:parts[1],published:true},select:{id:true}});
 if(parts.length===2 && parts[0]==='products')exists=!!await db.product.findFirst({where:{slug:parts[1],published:true,game:{published:true}},select:{id:true}});
 if(parts.length===2 && parts[0]==='orders')exists=true;
 if(exists && ['admin','account','orders','checkout'].includes(parts[0])){const user=await userForToken(req.cookies.get('session')?.value);if(!user){const login=new URL('/login',process.env.APP_URL||req.url);login.searchParams.set('next',req.nextUrl.pathname);return NextResponse.redirect(login);}if(parts[0]==='admin' && user.role!=='ADMIN')return NextResponse.redirect(new URL('/account',process.env.APP_URL||req.url));if(parts[0]==='orders' && parts[1])exists=!!await db.order.findFirst({where:{id:parts[1],userId:user.id},select:{id:true}});}
 if(!exists){const url=req.nextUrl.clone();url.pathname='/404';return NextResponse.rewrite(url,{status:404});}
 return NextResponse.next();
}
export const config={matcher:['/((?!api(?:/|$)|_next(?:/|$)|assets(?:/|$)|uploads(?:/|$)|favicon.ico|robots.txt|sitemap.xml).*)']};
```

## FILE:
/workspace/game-store/public/assets/roblox.webp

Тип: WEBP binary, Base64 (.webp)

```text
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
```

## FILE:
/workspace/game-store/public/assets/standoff-2.webp

Тип: WEBP binary, Base64 (.webp)

```text
UklGRtZXAABXRUJQVlA4IMpXAAAQ0QGdASroA4oCPjEYiEQiIYilTBABglnbvxirAMz/2E/hylWZdL76ShyOHUjbhPq89P/9trfLF6Y3kP/+vV5m02Hbc/55vCdzn9O/rvgWcaev/1z9of4T3BeznP36sesV5N+e/9n+ye2z/F+pbzAv0h/6f9x/0nYT/un/S9QPm9/8f1Z/3b1A/6z1Ff/u9S7y1f3I//Pyef1f/h/th/3vkR/1H9O////w9wD//+oB//+qf8S/8H+4/F34lfPP8j/X/jf6/9bX2D/qv0Etufxd95/wH7R/mT+BfiS/ID2T87vsEflH8l/uv5J/l9xzIAP03+3f6X+/ftr/bvl5/E81P7f1AP15/1P5uf1z6s71r8l/4PYE/l39y/1X3OfUH/lf+T/f/vH/s/bF9e/+P7o/sJ/oP9X/4f3Q/Or///cp+33/0/fb5O/1K//H/RBeAcALInfpVeF4aFV3Sx2r/8sdxNy4+BlY7JZY0B+ZwGTslRt2qfrJIGJUqxpH/yNd6Y1aMPq7+8zNZEO+7+zrWKVXdLHZK5NfjlyyGRM87MtZmgUUNCq7pY8B/v5WJo8zHAv1J88dv8aaylv1pvUc+dB6Ws+JPYSVjkG3XaFV3SsjTt0LeuzyHUtsFL3a5iD67Pb/Rvh+RsOKvoqmFjprX0VvX4YQdVJJif+cZn/C7jQw1BKruOE9h6NpOtYnVnanCW9SIVf/NzfTYenH8vQMG+Z7RtF4R1maDonRJqn6sPG+0iDZsJjElLR+2lFNn49a+Xopit5Qk3t8S0Yc9oQfTkraFV3SxONAe4qhQrM/efJdS/XM2+OvM7ohRJlM0/zrP5jWB9/I/2biYfoBcvBE1wf4vHDWf0IohCg8G4zEsbjmC79OLkmXdLHatNm2Yur0Ts6Q5Z3t64fhjb45taDs7WIVkEm+x4pL38obZyVViVG3JO9+hykF5/NMd1xtQZ+zWerRSTLuljtX/znBoxbl/lmOhl1NU14/A+UDk3p8ULppYsTLg6IBeTRvFDaVwuhBNRoaDDm+H+Q5SCCgVXtC2s/drBjrVTxWqszZDyKpkXdzO7pY7V/8+euIhW9MTS+USmZM+8H3OwOgSu4hqn6hpoTtsBXScMYmuzR242PcsuwUa1pqYFyrmWkNpyKYz9/uCVdd2tG68QJSvldoVXdLHbRKJE9zEwtx7ZH4rXm8Z2ZSBo0Ww4cfWwV8Bi0KTYJ6Gj46h+FDwoqCoR2ZpO9qFqA5r6JtZzaj8xKvFy+shkyJbXK0s/u2aYqLHav/x23rJWflRaZREs7LUqiHUyw2rYa9ABFuilXy0Qr/Bu5Z1x23mj9MNRVh2hA0WOfCfbgPWG0mRLhX9w0/eftUfmAvmIPrtfJD9u9tWM1IFr8IoOO7xcxVnO6C458jJYH0whSsWijcuBCGyP8gnfjsq6rLnJtc7R2expBfJSs2konvhgqxQa1len7/8rM+ze5Jvmy3u0oTFoKMLKDjic6Ced3FkDPBBy3N4MMRZEdxzw8nAZUf1U8vijEZ/onYbu90c65QTdKsb3fOli183uSb50L03gtf6nXYudR/0Rwpy2Ljy10bZZQPzjhxOWgI1WHb9n96pSVhdWbg4qhVTauEcQrOKPSdpck2/mIQuLoHb4MvtF3O9kem9mAfKDuRVzxvAmZtcI7+fsTUICyIsmpMbjb2ALkdL6wjx+sirh0tlvCILQZfKAUkB+tRaVvOYDnDnsZ8TvHL37aucbteqsb3EGXsFNqe9ASE6FvqXKfBoHnXFQTDCodKN25J0ELKLcd8mt5Ugh1nNhgRjzgd96UPn5Ku81oITPqk4ZmRHGNSLDHvgbJGH7TAJ5ylbiaNDBndGGyls/d5mPQ+W/CImpA7X8vJG/p8JgFio4Bm2rBQiwiGrnAmMrfyUDZG3U2mkia1/QaLaIQWf+K2mSEkP47DBw7MMcrCVlvv0oE0CCE8rcwcy6TSkivkTqsbdKtT8LotD2tAGJr7ARJaWwh2AsVHAOdqosbDLC+DyCEwrTXuWhszDFyfDzBB43/CItPmP+jGuYnqel9+8o/gncxUyhkiPAD/8Rc8NJos6ITEX+RuBwS4HwTXHGxhsUyD1MFkdEHyvIxXRj6oIBI4XRYgPho07bdcSMMZpQOeP3/LYLlBuGrpcTfJVO37cGdG9AyhWNTOaSP+9mYd9jmwlqHoooFNzYwaTS8jixs2UdiDfXL/DYtqvNmWaNSbZMGIrUTIwmkpCO4XD+xfjS2NjEnZxKQWN6woArmpq7hKOtkkWchC0fIvCugLWoHBmVJK/6W6p19r5+37S6mPb+sOwdb+93GkMCDHfxJjPOdNADHQgfkvNV1A6sicJqbJVvHbMZChQwJHC6LEDDlISIkVo4TZ6mrKG7H0p6rt1/dln/FiH7NT8nz5AN7RFhFrUIUshie98nnQwg1iyXeE1PbL7K9KM62NYgDMLVwhHG//IsIUPxXpK/N5EuF9TKyJIZ9avsDQs+96r/RxcKjEwYlbuK1tTqxhm/CWMZtoHh7Hmq/81XizWkmlxgxgRmmoxgUU9TtAU30gywLGfHA3XbZ04sSRBJGDF5lACv0B9gJCFo1VkAUiEqyoqkcG7sgt2qsCA+NDuJl8Mh3f0bWTacZsZkGZ5lbeqEoSZPUparcflJty5kMVZv+kD0i7u6Gs2izImsWQ5rf7YFe6B4AFNwzP06guCGFkqM4e2R8C58Si0Iv1/H/N3JcaJiHMgXreVlGsg4W+zS2k65XrwtuhT8P8vqSDq2tcubgBb8Bh0oxsrwg3VDbJN7TDw35FhMPQPJrstIEHWfi2VLoc/j64godgK5tJYhcUFEPkbjoi1AcZBKr0jxyJjLeBgnzVmNIw6b2NmNKNscFqldrqs32dZ3sgnczdQuSBNKs8Qd8k12QkWdz2nZ5zVO2oUkABhA0TCZhYc1fdjwK1pvcvJtdhUL1vGliCLJ73WG61Hq1AoePmgNmNFcXaewatVgMU/DJvPr0NC1URYnYufPHKHoAu9H674yBqra45tKDsEpVK/uillVWoY9m5+L2/IChQDEwFIG7/Sic094C7s1FQ3qUlRtFyxmP7o9Q14TR6mrUerUCcEdk2l1M9GYIFmQZ4HN1VOpGLAaZtAzwJQQ7nY6IkVBWUQ1dbPmPtrrkeU5IbR2d4cC8ZJZ9lWuKWDeO74kCSWrhmOcOz60i5a/7pmsLtkQ9qBeazS5QobOA7TzDBRVTUNdtQOKQWQDG1Upvbu4yNWLv0J7xT6Ehu0xb5RaCOXh4F3kUHQLZKMPNy2ZOQB9/fV05KqKD1U1jGRJiENBWN2seLVNv1om6zR5L/oHZ73H9mJpib45VBX5oUjRfibToctYhY8dMUjj5p5xorhWlvhcMihXVSHEQl6wRWsslP8jHC88bfwKFqewKYOuEyDkCwEUO+oUEl20D74j2/91Q0GdCz/qwZ8/ZUliQKZqxykcSRj3VL7wC7z6tOgP8Ry82lbVWau/Z1eRPPGBL2+c7/SMYCquwzRINz2TDe5l0+HTDjQbDe4kv180FujQIliQ4ijdWdYncMzagTgiJ6n04LRDFrBK1itu9SBegasnmMglAJwvVobmEk+COgEE/NkDaCg+9YFjtYFBkWKyzzhvT0Hms+PQkJRIOS2oe+7SafOEPGiGduO+hCWrhycg/zqZMQFUtLB4AbspiDkglrzy72RMpQ0Kq7EC8J4Gg62GrzE5KOP6ss2tPIlzVNv7RSyG2vX/08IkQfXDSYGW+PVHiO61C/3/64Pc+ZwaJWt78zRjzXYZob7jwnNJ3av/yx2xk1Q/I6whR5t8X63MmgukEs1bckDC+rtow04RTdjBHpW1TJtOkyKGkuSLfbJda4rUaB+brnlMqEfeO0xUvvb2fBdXG7nZe4N4z+4kBOSErPTrfcPkB3dLHZ1FxZdcJ1wZTeN0thhNLkSgj5+9cVKDH+NBE7/IIWNj+sGTNK6LLLXWdLhv16rhn3Du4fx08FcecPDkhX1klvwSTKB5FVKXCIwJtVUX+VBtkJ36NQ7DPr+CmAuI41f7k0A0cegzxGqchLPKH3pX+XF4hH9b/4IJvGImx4Y7uxpaoPvWfMO4GZekHYz1/YOtuaej2qc7eNVd+7Mm/ANW3vjWgSqvBqwEmfyE3fVXdLHZ0gNsPXqDnIZxC//ZuXqPnPsEd3HKNbz/NiiM93pzhYb5mUYA/DqiPoVR6m55xQy/BAF/hOLjJ3xjaQs280DG+LiyFyFfXlQ5s57qLH/eYEj15PMbU4EPkBYeUasI/QkL2NKcgvRblQDX8aZHIvJ2uaJmI/AedtUehsI4r7zyYckoOd7GbVjRpNwxs6ZDIgbkhohcDxdxgiKyk+PeLUtYpVdxed1S3rk6kTvou3zuUwfnLdBTzs1XRsORoXOoaa5XdTXphYsgzrn+f5J/nypBJtcMblxu+3ttW/P8b8J4Z4J8f0kUKW/VguZFglV3Sx0W84Gyir6biWyi7ZZ1ubs2VnaMwJNxN5aDUXyauLbPCL6PTkDAo58+xnMtqzW4pzLVDBCbC4go/Ms7ulX0dYlwGlanxqBKjy2Ooff0ORtBiXj+3V83ocab/wTJBJGoKC1Uc45nkDu59WBIZLYZ25tmi2xVU5pleY0eYlwfaDWHsXM9lCVRlcurq2jRxsFMljWmKCuqwkVmPf4254zwfi1PyzUVT/eASZ9dKAkgKUciEdgYmguu6WMYxydfs8gXiD6irYPobFxJR2tTCQemmyg8oBL8gbZnHgXOAsoKgjrbPj6vAjX00h9OuR7m/QWsfrxALXhdicyC9ubXoBD2h5Pe7HhuXHawTkQSq9C4qYZZKWTWKVXdJD979U36rkBlAhWLQck3zneyPSu7hHf7+IOzy8uribhvaFF7Od6O9NHj1xQ7V/+WO1jIaTUs2s3sSI6zd9SuO1f/ljtX/5Y7YyUuiBcjqQP4LZesUqu6WO1f/ljqrqCrETyDAA/vXIEMR9Y5tToXa8NI4OO4Ijkvwm8TDX/DVaor4C4LfMu29SoiDAVAAAAAMJ826Iu077e/hZz6RnOFR3lreL+pshDqqMIkmAHlmijFe/gCaNIfeJCc/vNsoq0QgsUMFbmYTAYZFFT0vE1pbTfqeHAa0qvoEanp/nUL27/6Rs0v/T1VUZz11YO7njhY77GCTVYjz2FkKCsyLUb0RgMUBEm854pD2NWkrtYQcuZpmZjS2PgOiJPcYls34TzSPgp7qAfBPB2WxjkWMDDqpFIUdAHt0n57HAQoFN1VSEJlZ2QOdZ/GQsJoq4gAAAPb8NkP1NoqIwMljRaic6kceG7aoadjTQeqC8yo62H1lcJPBlauZkmAJsr9peuwwikktsvc+7OArRfxZ8aS3Be7MxYM9eqOixrhgAAADJm3UD62erz4ToGFYjCr5/zBLoJnqYd84dOgsOevARY20+SW0ajAeJ4QUhoikele7ybqV4Ki7dkUeZNuhm3btGq4W0mqWiRBmEDpYWxdXCmtRjhDx0g5bOd/RxATmGFZmbnX0EM0Xq7GGGdhCskIOVFAdV0A/7nCDMWtpDKVUEYC2SgEIIn3Q70AAABhk+QPz35Qy+/V450j8xBZacuYBQLVzn8nR7fT0Ufuti5XMI4KeUpiZAcShB9fBIfG6YdnLDU0SERE9SFO7ZAjylh1wAABpsgsk11Nk9yNPLjD5wXzHotJRiwtpmpyP5PBH6jBL+jCyQ3zTN1LcxQqCzC6/4ISQnNkHgPSB8xzRlqlhMNBtPsi5ZNahw2Z8MJtcNk6LPUHzRgeIdZMlbrLbeCH1j1IRKqTspyWzCpF7cRDn7kLtTDvSWndpJ6x4rhMCM1+lhWrQAAMNoLtAcagU4Te9vT23WgP2IglTDuSVEyqnYNxLdNN2ajoP3d0GY9AAA8ChDiRF/84FBkbPlKrrS89Hg9ye0r1Y4jFfh/AetuHdgAG8YYrOs70WONwlrD/tyAYLyLubebunRd+Ch6otScmxV104na7BwiFAZxhUXOar/fomuOmKHfNEJg4Gdie7jk/UetoEeaNqUfG+jjx8YmycK6FbFvJuuQIKw0H1Y9HRU5iRFmPQhJGgGvVMSTbpcO/LbmmYdOicJefycOQ++II5Urv3Yvw2Ck7M7UA5suYwlAzTzcD8B0IhFOZwJado1b/XEln4YkufkT2TOD1b6MiESVDMu9FFAA05GpZlfQdQ0y81knoL7fLp1FXfaGvmXkLm8Vfzeuq6QdCCj6OEglL0i3vIWi7u99MyfEXHsYbVlXvEMK+cZSnOT4Hm8Tkvn0wBXLlcK38c5yy61KOtGApOc/sz60IAha2JQzqSK7AFWsg+Cm1aq5GSnGQ3z4AAKwANOgqM9TzXfbMNsHdBS5TJTuGrTaow/L2A26y+trUwVlGtcKVYEA/JHexGAl5jwY9AeVyplraEST2u1/eZ51Yug4GMORhESA4SGJXOi2laFRllGgAnVLcblfEbAbhBrz6BKRe71ObbEQVFzm1ejv1ndTphGDNYKAdNsMcZdi+9DxyzE7nLMQQxaPKTrEZLi84KYDCOxWAPqAcO4KRwgqiX/rUJGOWmOw0nq2B+g3240O5ZspprmKjHPKMDvTCXv87MsJallIZ0J+JypDctUAlsC7fM8jwe1LEo7s0jUvmTJyndJ8FgcfZ3HcRekNEnp3cSQJZ9WPCLOwjnFOccsvSv4HvDX/sQFoOuvIVvum7T0AAAAGtIld0/ytTOlO4uFg6daTWLYluLtLvRHESB2JN3SMbnWF5nayG0iv5FJxG6jC7Ko+37NxdN/Tmb9yTAfN0QAaZzXpJc9NcTJ6FB/RKHZpFI90M/u/oaJDWs2gkgu2IcpMcDUCMMvc73CpQUB4zGw4gCNyUQ61KOvZqyc931No9SUfRDTG/SUL1fl+qgpd00orvT345CRG0CtTlE9XSRwTLftz4VXlHJW4vILfgZfyZ1ssibK/81wQ7GO+AdfOpo4bCJYSgwWFlfnqm/xRA3P4ISLqDL7hxHGJZAk+AE2mleKt0lofL2HeccD2qejXDyhXoatUay3a6vfeg9shtVzOU4IZ6rReduE61cQHkEAAAAAQWYATS5zIH9/1hJ6SzVYAmn0dAwXx8o4AjUUri+xiIt61mbp7PelVta6/JueLILfcE2qxb4pwCZ3J8XIjUexHbDJYMK6sU2IbIzOt9LegYvnTLHJDBBW0iMsOrT48cacR02d582S8I8tipRHuKxC01odMVmyGOqT95OBej6gfPWuOWdgruVUDKmvKjjm+noeKQ/4A6VfBb+2a4MzjzpP8+09zifrAYDHdR98cW7c/L8kPJ/H9Mshjqmzj2h8ynCAzE657PZDEdAYF5Qt9FzDw819QfJ19F4QOHiaUpg9aEAQtZotsS0ryETy4G3EHzUOxTcErMjcTvZelEH4mp+up+xLQAAAF8CbGdO/NkAVtr1O0kyPvIau9nwhx41oDZEMZURXVgaEvrDDsg0wXU4eoBfkpPgiEzabXx5FuVBDF85unmPeOHaJejNFts71HhHB9lLwDKNBv5Js5vXH714XfZiJBNWbsdoK64kHEdDu3u7tOCgdJCHNDJKdawffR98KxbIP1xiqZOBZ7jVasGvs8tVPi700te2oeyzxzgmaDvnE6sdl0QACboCJ0se66wc5TUyFkXzhTa/byd99xkvGvHJVYrY9SfdE0Kj88RH/P7wS4BIntWi8jS8cTj7+WonOrAhZjMlJa9umcM4guPTzt6mqRA8bUbtCiJdO/r4xeo8DzFBcjP26E3yTAABaRpfEHbAmc11r2r+/DAu4mr0Kik3X1jDMzFmnGJgf59tvgOrXZHDSRw+5QZNq5OinNJ2oxFXArmC+YdMdxGpIeyDWwYR+TOWv+unKfTJqwGPoyivKFJ6denaLEt1IlD59t8dts3Ruf/f2SXqDVh0mOZ5DUDeVdbX59SYwHHiLG3XiYzPDEXRQS+XJHuE26BAdERwAbshJ+gxkqvip4Cf5R39uMcFrFYYS82P9YYYZ+OXnSZDuStusn54hxzflhNjim0+YmxD1uUqWU+aUDaJ3jcwXUoXMpafDpyrqEP34u+8u3SRVRhz8OJunQezLu8pYpSUPgAC0SkpxrcX371IbEK4ihApsL8/0Tqc57QVGAg5Nb/XMofyf1qJeIFje8kKheFbGRg3UWstH4oASjyPt9SJDCA4ze7jiHwYSN/mQkIxfcR93kXe1IB3GXkszwUvipYQM1ePAk+3KTCrQJW7dNONkMqaPUnRHyyqP0Qf0CLyAe8rcUXICKTBNcfGQ5lfU3BGK8NeMtEWDC/vmHyxKxboBvuAH/691aDVin9yX2bECSIm1aHPxUzxxkkaC9qOehjvlTvoTrUOf/sNZUKcNPK+f3MrfL1N/4JZCt5/vYIKY1Vh69Zp/XaSLMJ6FIaJ0fm9TktlpkYd0ofEGPN5PANiK5nSfY1hzfAGDnfyGq+1gcAH0mb/AkNx6X4l30kGw6pxqfhZidC1NVhtXUpGwgA/m0ykwCEFuQV5VjYaou+6by7b8T0oiDAr35tfXfILdQwS4d4Q+dzk3HCMFDpEDp6eUZzAyW5/4r+J2k92QWV5wZqNYCwiX0EEITVwZl3fJPQEPdvEv8U5wkMImxxHmyt/pURXWaZLQ2aA+1sbgsnMqSs6JQSozMuSJlD414D/NUduCcTDclWE846gvbWvz3JLy4aACeJPgaYodsSHkxWOqisacuNozG+2ZQfglHFEORU1PanbFdhHJg1Kbk3PPmjKf8+yYLiain7masv0mvuS2wCl5cl9dRsUAGF9xJEnVIrLhrEf7sprl/fYAbsyoXkpW/7njJo+D1YXzkV2c4JRQ9di6twPNHNK/B8PB0prUrDygM56whJjvISZz0KDuBBW5/cZstenBk0NjPmgLx5Y0u9tzJzoSDOiea1yj9Xtz8+xf+79peF/h2qHlDvfzVmn9EBe76KB5JAfWVICLxAeftbcnXMqR5UixS9OduUP/MDtBoev4Ms/MDSwYOd+0qKrmC0JPiX3Bld19Il/5AXhfHQeNlB6jCQxP6VJ0M6nh6lxdqGWI6tL9BfXHcbef5zntz8X8mPAp/neg1nvr0uoKpLKZ+rqo9pVZa2VlQMTNztT+50ANStoZRptQ8IOsOSEh8F0rLL+jJPbShHdr7pZUBKf/xpj/CE5VJbhPabfHvKHTUMaAJF7yhXO9VHrjbGnibD/F6NM6jElv7xT/9qMo6QEP0Bjk5LajLORudT6ciAoFsYDbPlLaFJ4Je7aIok5VBVf+gciVOpeiGH09UBcAH//YskwiOtbV9xFe1wRASTpwGwDsFsDmkCAAgJKlFGhCJLDJ4awEasyX6C8g3T09IbgP3XX/Pgu0RexkSO4cbPYQxFrZEHkfVoj3z/DCnKQH+V/jDj+DiKJ0iYgCfXuDDbICOKDSLh3ky1gKmQyF3LoePUBnqRKZ15vYhV8JPPBVTrbNZ7Hhm/078BtLSH/03Clq9cPOvJj8Th/ba52pi0ZcebogbeX6mhobovN5T7OHyw5jsu8exJjoTcMDrVYEtHz2XHoxtMMttlvAmhlKIGEbEi28gGOsC6gV8bGAj/jAL9GBRVJy9mgUwzPaFwo5a03j3WRyudqOUGC8YNbGtB089rhFLL3Ugm3qOjW6ryOI/j7F3ETx63xWDLJ2V6VqfNwFiChL/boaBWEt2hi4gF7Y5N+dova0pWw6q/LgLpGGhPf8NJZPYpedf3V/7MPzo5zNTuJyEmLLcn8/AlmdeIQpWdaR/FyqsLrNhdcblXQ7YAdoz4M4xE6YqBW/WDaQuyuw4GLo6Svrfyhog6cRE1t/jmtPxw/11RLJar3UpfjhUomtroRHpcBtX1CU0s1jFwr+vh+balmh/yHi6QIpG/CEY7JBC6rDyum5IUOgOeyz/glD7xvcChMQrd9bjjDgbLTyzdJT1H28KTg7oJrwjXGf/2yED2/BvWzhOha2GKlG8iAV7zacvIsbEmX3mo/hcK6CkCkDHSZ2v++wkxHgExOCeIcgxdmuVoGJcVAnSPBGYJdA66MGTDR6DFo8vzdnh3yXe3gWaklu58nxPR8XysTs8B714at5IRItzfuaI7efq7cgPzmaqeAerPIZvS6ZT8zWZII8eMw0Ij2kfmJLrcnH173Ubcs5tsQyVZr7tVDXzp6EK8EesgVy+y9S7z0iHiefU2/GuSWDXeZzJY9SrI0hgjJyC3IKOqCTPoE99vy2HzrEbq80cHxzuIv2vdN5DO2SD+00slacyvsIt23RBUB1Cd/WeCPIXtzZhn/0zgsCH7E7TFPZY4xTzIxOyyaS/XQgI2mNRN6wHCnBpwHbSO1BfgkXJAlqDa8zYQFdH0/C9RTVAOV8uL/uRh/+mJCqUfya8xDqku82n++1o+B6oNolO2E4HssR1X9+BcBxT5J6ujubxXgB80lXOKU7ZUsph5d0YAakY3lSus4wY1evZkoy6A1Wyqp/m948WEMZAActh+pcp1D3s2B7Q/RnTP/Ulhp6JZ5CmLnWWiVQ9dW120cjFEuAwXr6xpSyx2s6BXp7iq7f8dwnL1LGH3aGF9JJ3EJrd9jVw/q4Gadd2UwE74cO7RjE6JPzsAuih1dT/pivxCD7JMN26L1TRC3mcCOEavZvOw1PgwNu8nQ2gZ47k8Fq7vYH9TzFJyB7UQMXQKsVcZ/4wx0g4DUxI0fy2vIH2J6LtwMMnu/R77myg7shAOCteMPnSfDVvSuqbATBpI/K5C32DSTII/RkjX3aaT13a5CiqKO8b3KQCu27lIBXaI5DU+XTyZHos1FTu5l4aFYJQqGkH1kjnQGEzL2cA2LuoD/27qBCJRuVL/fvMfthpKXwtrBCbUJObEQg3Q7CutJKAxgVmI1FdSQZDcZxVsOCH4VH7Iztm+LXuUUT7TRW2GDswi47b0giEgxm5JrmCvYIiddHCV71PWvWKYEZkMtEVE3hyerYcC+hARtMrlhq2mSgOf8I/ugACfGSLKG2fq4cnIly1+qiROx4dkEV2bQtMrljQsC9Ou9fTQi0OJ8/ljWmQUdQap44s25KCg/GV5ii5AuWzElu8l9EGsVu5qYDShNXDI+Dit70UnDAP6lnEjOm3fP8rkli6Az/wV6Wiv4DYihPU3SdSPDBU1zS3jqdwc+xXWSXyhE11MlF44upqHHMRfjyxENHVBlWoiwWM6P79PHb433PWbZWv1E8dShex8R/M3UbIN5Vf2V6psEtPyYsYPImSZ5eshDi4D2EXw4d6i8U00SYJPKpf++l3wPvAHFlVAcm5qt4ualxew3XHUUvJ8zbibrFqiLz74JWkysFcy7b2eRb8HvI43K8pD3FVZi6saEAG5/Z/YxFc9tS5F64V74iTSfdclIhcNW9K8DIat8c7nZ8pvrCfjErsb/Tl02vW/f3pBZTD9U60xUrVW6+5SAV23cpAK7RHIanxd7DF6eJB3tasWRa8EpoGCLlpXvd+Cdv5X5e5CfIN3UB/7d1AhEqsb2YyG39F203FS3WUpwOtQE4oR5IrKehCiT0avgTYc8SOgGd9xCyg25KqzyPjjeFrDLf3CSJuNyGfYVCvNccdImPQvlReYHZoXxHJ5iEPkQXyb4cx1ab4ewIEui5sQP36Y6PaPrEVO9crufzGwzeeCNoPvA45f64Z7onn2xqLYe7jWOXCUbsTObAanFwk8MJKZ7lFE+00Vt2l2yVKpDLnNdiL9iUCE8YAZkYaoPOPkHbPT+MV0mNsWWw7Tom5nH29eTxg9VpQmpgK6aUyNY985rvH91sxpgz64uI4Sm+oJyciTAVzdpeuAE3d1q0vJpNIAwCMcsxpgz8gkKlcGh/Gxr30DoH4GKQ3OIV0LZ4MoJVZOdlPucLHet0rKCiWaJZ1zeTaj/Jgt9e4bynGm1aQt+wjzvfYso/zBwS+xd1gKBycyVC821hv96xiSjJAeHJBjE9Yqb5c88uCpMaGf67ZDV42Ejy81oI0dU4l0u0dntvPGKf0yoaLU/M5lbzghBlmf7malqh3ENVOUfzDY5YBKwGB5OivkApgMomfKbIaCJzbL6ZlbY3SaW048xuKdDKLYwUdy5DqfG4US1akMZVCwdWiqQW7bYlkQZTyCKfJ3vunkjX+gEc1RHtBkncaPosEUT5KFGRDjVvjjjeyeqSewmQOo/J/tcjrrZ51kk9fSbnilPzK+wtJ4UBzWYnvQ56gedCYdGjPdJK8Y+HSIoZaa/9zJSf6EY+i9VizJlc1sYenNbGIbEEzqk0ib10YcEXEQOsEJtQarbUqE95wdqgJx+67f8bIQW9LGxszarwLHZBv15PJc96VbgsFJADb4tOvPL/xhgCV45KvVYjq3GKbtaWY1vYu6R4XNiCFwmRXcj+prKdcbaLfVJNRjVSEhpJFJhVZYX5dGKurmJSB8myLaDMienREgU3htsG3SjptAb6ewdpjlEAAb8L3O7kCczvIKg+ncSjhx1M4LRWlGzNluaQK35nZpaOL+QCo7jId2Q6ufTdIk8gJ1LPvTdY4KCR86zDcXMwvy0NjXjKrgphS+jY2FMipyEUlga/kd/5urRcmvoVbnSkOab/7v8r44Hi8f6TZClHRCWvccCbGBNIA2hDyKrtA6aiA7Z39TAgS4qXR6eNndT75KTDbVC5+Y6f1qcyKkKA4PwbDetSzrpJBP8crDFJAAoB0dH7dDUhFsm7D45B+jmBDTfUG0b3SqFuhJfWwhkDNbKlBWdc47MlMgD495F0X6ZZ8yphE3FgUkpJEuuLACQuqJ5ofHKDyamw++MBZ/fhS3PEs8zsm2QJlt047AIuvRxdyGFzFJkPDfe3aZ6KAWKtOdf6CkF4G1/tnNFmD4pHRnaPgUtnHPAZBeXHxvcPQQz0m4j2zU4cuG+j17HcAW/GxVkcOwhV89FTJgIr8ClT8A6BiAKe9OzXS9INQy+m96LBFFA8KQBgfxxLeF46Vvjngc5VRYlRQcJv15eQU+Aew/dPf5vrI6zN5yh38W7sYpXFGlYpTATxBakfQXyXe2o87Ljhrb+QDmp4LPDEtTz5+lJlc1sYenNbGdyJ6m9roD7XRhwRcRBABTgdagJKFKlj0ZuyoeMH903gRbxdRYXJ8mND+fWJx7Z2S5nLZGVlH6DOp/Gm4Ou5IbQtrATYga8yzvqi/FQiEqQIhptKh4AduZWeZlHJOgrSFIpqB8nyRvRBa+TCqy1e+S4ySB4PB1BrpzIthtSKCqgExCCTynyg22Dssio46xbE2Xo21wm/zrSPT8spNzsupTVtjfuAK3Kh8FaZaX+nn/+Rd/u0H1TSvF0Q48u6Yk/5JYZMoFmatoH7KxlRznnKsqM6tGqWl0b9yrKmOmp/M0NPnUZFwqcm+LqaUh9RDs53wKi0rqcZq1IdvOVDtOibm5ag2mjPIE0f751Hul+TFLn1EseOwBprD/xrKLXbOWm5+Fxar3Ck71UURsh/u/hymELxgTRw1MLVxNcGORUchaetFWegyOLih3a+3T0Ts3F23c6L/ro037dQ7bxBfsmnex2Evofor+EbttNFK1atx26ITAsnNKJDfAm1gxqTyJ8FLo9NA7nSu5wYgQ/VyF45KOeB/7gALN0bpVhgU2/HS2QLsDBiw81xMzndhQqvVZHT66Dv3tU2RN0PdTA9IglP3CknQUie1if+97XiEDM5rfpzWq6HcAVphtBC+pkTfO1Ukbzj5YSXyKiy3BuJpD1gtCjE4ewkEhMFbmcHBwcrJNkhT4B7D4WeBzx2/u5SApKc4vkr6wNypVIrAVlaGfxVHNcbJu3QgW16a+G+QJg825b+FDrvbnzHZ5Ui+UYZLPHNt/2w4IuIggApwOtO1HnZQuCq1kroPl5jX8fOt0xnyscMN3t83pgtFnomWvhHNMh0gC1ZTrzwhoqFOB1pq+byyippC1BKA/W9h29xlMtNu742UJxrXjFoqvrFm021Hj/6PBku/Brf58ll0Yq6ysMi2G1IoKqH9rQ5ZjNXIjoH7oPqAP2pEVls8cz8/j+2NUaG6W4uotNxPWhZ3OebvAFRlM1Q/TNQrJZaX+5qil65ZnBzrTbqWPADWG+rBzxShoAaGTTlFm/lPXG8OtcJeAE8HNxClMES/zqVfMuHQkRNH9hcGFzlb4VpWMlFjOse3sBQgCx1j7fsKxghCTLgX1a0driHqsc5GFYDtnf1NnQx1LNBRvXlfNFUxZUzGQbdnzzeATViF54V5I/51uvVQWzFWezmCcHQVVC6RZJpxMVI/BmhxYCxwfvwRMvE+ReuyI0Tl2daAyQQGDGL4K349YjB1mozflRs/2LFRnSlej9JzH5hkslE+9DuICUONRp3RK7N40OEG7UShFywMt+T9g+p5BGun5ASkBeh4RQMkitAG22oR72C7LN+nNIw9SDdBr5LEgD47GFst1TFYXaYAvbWiM0tQp+7IYBXwCnrJCnwD13U57j2hunOVXCs/rseT3axQxX3xt/OO/LvxF3/X4MB8KOXJpOAB1Q7QdKLdn4GrG8S3V+NhRNTn/ZD5xFxRDzUPWtART+ah7X6agIGm4Eq4FwpfjPaZ/8yRAFjZa9v7XDk64RN+9/FVwcfZr2V2v7kVKHuuSjr6h1QaiIoaksdWXYyHT7/MJH6DkD1Ma4l7sYQ801n9/fRkfdTQBEgm87AZ8PGwQKo8q4mNK06ISKYBWa1VBDT5saiTFM57jbIrETf5fyiB1ceWu7EOoCL3+1RixFmNOV1Tq2dLiod5XbFFuECE8dZx1FBijCWpNOklAA3I0zh5qHAoiCPFa05cjp5yXoAJ7VEYak8B3vCAgE5fZeiZYuUjGi1kjP8SaENHcDqrv3HTFGSs7tAqNB1YX2T6kasM78o1a0sf7uz6TFmQVZVMjpMtzwLAg3BzETFEqFfXveEMbuh9JdlNOjTjv1CQ7ZfGxyJJk8UvZzlsTimq7W43ZpCidXD0H2igAHaqHABw0qNbd8zshQtnYtfNWTK4Y6bGqjGmhOeQa2MBQKktYcDngVNxoalDBve9ZuACFagZseyAB6r0I0ws4I3cffAEXAqHKbAMLkuQgEPaxw5gZU1KvJccIkrbIVfpaGXVYpZza3jTsrltMa0+ABxKR82zQBhSL10TjnRhFnHiOs8/udV1Kz/fCoSRdUu359QOBUfB+jb2ZfrBYArkclVtGVi9tYC1QqgCBuBcKarIFhLbVjY54Om33r39rsJnej08cH70U/8OlZivxSZclG5BuVwxMvrQDm3cj5shW2FusG/yhlLBCNyun04LCtjrPeNEC/SqdDBP+2ifHjPb5GnpvXDI2FA507ks1RpJc37HHoPSRDU4J31bERjPMiNKGpwTvZ/EyssqLdhgst4b2ALUJIPdP/34yB6vyNvcbsLL5gXB43x2I2RdnURKllRsmcjvV0Cj/wgwGXAi3G1+zdyONGhpjto5KxF/blk8jKF22USM06A8eJUFjUcY3w8YC2Bh2XS82m71mce94uX/Xg0Ck2e31Cw8KxJWbNdbwnPLK6HH+tiwOQabBU2bMg02Cps2ZzZ3Xo6xF4bj0ls3gBtLDL+JFjtiuBDT9F2HjHIAkFN0z1gu0VQ+gru8v+8z4+vGsOzAVdu2TTduj39d9Qp28FK7zgEl9iKUdFc6iOmgcKDuP32FN1ID+HZbV3SqiuBcheKnT/cY0jAEtvtxgU7dMtuJmGkYLY9aHI/+JmLOu7YxpjHpWpyWBR1piao5OTLhzmiYjrMBpoM0XlrpYBynCgRUZZaWOQqj04k+FxVP2DRAVzaV17vmQvsieJK5ijk/w7tClL0QvY/3wgyNulN6osNb/nQrR6Zmmt85VP1442mYmQsb6ifmzmL0egJivOUEeZ8bTog/Uo+gNzt8+AEI53FODbDtdDhhLgL/j8C913IRFCJzJu/azZR5SQ4AZBVRh4H2OVxSl6XFC1rs0B4oWtbr0ROJwO2H6mlHhj6CKU90obzZu+y3Eoxmo0Qz58bDrNLPSHUnNukS6vCmbT7eOENWcah6NU+EX95R4DvHw+TI7OIq1PlFM35FpwabRPKWCEc9r3YsdBP03nauuX5iIWsur7NtE+PEeLqHxqyNEQPzfZdZbMlGFReFrukl41H5CNy9KaLSfYs/ks3yJE2nGLmVggdiGUay+0v++/vDgZPolRh9eFmBcHjfHYjZF2dOJvLkS8h7JERaiaG/VKpejvSn/VKnygCHpUIrzzwThcsaU8CbQaoTa0w5osfXgfQIF5BJgBFi0CpWV+S5tabq8l9yAlnkuy3SJA7XkWNbxA53ZdTIDzMuCcrLBK7f8vKzOMXpf91ZQGl5LDee0ErqYg1rqIr7WOwLk6bfXyTE/h78RpbuPSm5G7AWYTm5UTVWWcjI4Lsi7XOojxk/IIZxwDyRdI2rBeQhc/fef9Obs/pfo0C67sA+JYErQXGhqL013of/3KFIEEsIjGnKT4VaXCXKv6cGcAi9BMbxHSbqLXoTlAq3cb95BM5Hxu2ktd5P2ruLqj7ZaHu3/cz1o5qKeko71D/lQO+UML52pSrudG1mfAVxNc2jPX+yGWHP29nT79sWvFIHMXsj+70vKiOgR03PTR+uQzTbGqLRWfD/xLA6Dkqye8MQr1LRSZdR8ghqKSGX5ooFBFmUnAia1kk2CUO/HKPsaetOTZ8H8Cn73HFRGor0nKWD+nRbfwaFsbPUvV0o98pvTcvlhgznyjqTczcSVOwv6P3rMLVr9pQF2IgsixxQnYl2NIL5dEgtKnxg29Nx4ksZ4vUtDY2fMyQkpYm28Pa2ez4CPHNlPaI2gFcjnBM7OyxMRsInO8JcdkgJjJWOEI5jXVYqYvkdY8MvppQtUfGElCXwO42LqWPvbJVsDYK5Q6HmG10Z8b6Qa6COjNXZMGbz1S4Uveyoy+EtuBye2D9fpfpJ67+byvyNxpgn/bRPjxHk1oYh6LoX0YVF3kEfcnsNy877U5fo1CB+wEUHZX0VbOKdd6Oho0wXdFiTQ6bz1dNQDnxGB9dA/va7d2zbcM/0bIx8ZPA1bjYAUSK+8P2SAsMFO5R3zlEeEQSz0qEV5534yUvHgnWxXE2tMOZ/yuoSeG1asfEwS2Z9BJJIQbLfHhklh8QptnJa5gQ5KFcYwz7qksZmGbaA4XM/AuxkrNw7CHNdvnvb+oE2CIoYJc4bJVa0prB9a0ugupU3LmxbzTwtDIlhamzxPHgv2lf2o7chkCaJ0YbKMjGbUi7drO/JdBNBRs3eL+TxrQ7qwZPuPNJaulDGgu/SBt3qoqasH3L/iPf4iHCnwYYw9BEY074LRmTkOYjjiTwDf6Id6w1IVBy2/XyUcreJuciHk3zs0g69WlCRXwJDZkoCifB8GG7Oi1QnkXEhturr2IgjB0+/F0tHsf3IlHzerlp5PAcfFOFSEPR9F6WpmXnLOZNAjNxAKY2h6P+I7WZ/RemSF9flwrgl+6Ozblop3mGXLg6ZrZio4omvtamCfVgR6FLOjdP42ZlO29O30MWKhYLECSrXRiprBtlrsCauiQeDiq0jBa2G7mpidZh0YPGHSNuAr1uGrZn7gLcsqbcnPdWJ37To1s8vubnZlx8Hqhb4vcvuxHuMG4zjGSXy5ro4mo/fr0PCAGBzApIL5dFDfV2jzpiU6i9e2YRYq2OvrvfvYJiZ/rtU0uRvILSjWRwgUfB/PS+n99jJo06rD9WiURELtMnUNZ6o9Zb3QGaUybzJmGIW3J/l434OzrRDfgYEdsNGbLcOj3nfFowVVgT/99sTCXXsrteOzezQG26CV+CQuirx0Jv1ip0dCPD9sVf6Yu1KSK7/iUlF8mXEV++JpTcvUFKmFcjbcJnjV2EsbQi8mk/UdBiRaTU9f+9TsdR5KL3VbvH9nUXcL3Raj4CSYdDlJFswXr5S+5mURYfEaTBTlFqHr5DarGORfALWo20BwuZ+BdjJWXmI3TYKmzZ42rLJRhdeoXU6kB5rsyjiyqhBFNtpkvmka8fYyk5X3JURcTRcjCDJ4HQ9oYaLOoPI455Fna7lWJp3xCNIQYH54cvz1rj8Lnayw3t4ImktXShlFeDdk96L/jrp5H5sjERZXGqewqRgQSwioQ4ByvnZhvgGx3FqWqZpISRRtOB/EhFfiIr1pCKuSaD5SmAwExF6cpn3cQ7ZwQSBK6Tn8//KsDV3XOxV8EYUnSpF63Rn001rKefNHZ9tJpLkBOo+IowND3YwlBpwYJ0hhdoIzOO2gs04H775EKIk4lt19kt4t8MNhmfD0fuhC677caH9TeD5wAkrZ6rFyoiStel8A2nF89LqpAHrTNoUsdgCzXnUxSlCZtUeIwBrtYyP5CaOnKis5rP1Wg5EdoS8l0V4qo2e6xC/9TuKZj58sm3fYQ8wZuNi5mffcPSBBn2l4/982+ux/Lngy06ICZwlQpjeCnaRIOB7DGTzZLIidMzNA59r4T4VjDgTpOpWcJGikh6W4IeRrGyFOG98pM5jjiA4ZDB2IqHuRNt0FL6JiZ/rtOUv6Ist48JqIbYdcNCNua77vWAhYV+gukD3ffYyaNDjOwXS/6iY1pX8/K+KXmOS3uf2ZhqtyC+Me87rMBVnJyHIO9HQRm8YnWbKjYOcLHGarpsXKb8xJMUwGqHBk9FOf7DiMYFvEDn13/5tzu5jBpxjI34kLxzFzBDJ5+WO43OZs+aHU2487qOIcuIzcGVHNlIfLv6cPqPlJ0/aazQdYjZmNI7GWc4pwmEhR70Zh3IQafpo3sAC3vLE38xGu6p75OKEhz0lQ9Yr9KHmyMRH4DXDKUVy/Eh/Yv676HpSsACq9L9+MP4PnrzhbZZG03OE83vLcR3OLA4IyJf0VCkvXghULU33AkvQODyHdwQieAgOETxfTa90LgmkLq19Bym65zZVSyjBzzVNva0L0EO1DsR4XIEOezEX173xR99PmJkD5s+LDzkXg609ZXx4LwyvFhzBgv5/OF46TM2WDHuGMlrTSJNkYJA02BQ0bDjSxpD2S/Tja6cfwD45A1EbIhRGj/iqSPzNNkwE1xEu2HI9YElqVfAe3XmPu0B8Ia1xHLQoJ4USRz2j4mxjjSUkIBgt9HZnfrq2l3mk2GqxSjYkrGlBl7jd42FIf/TdfGE+zGxa7nELZvM7caoAc/bKYSr5CnSHdq/hex7WqhWrUQi4kd18CAkOlWsNygIZO7cUx3HnisCM0VoGfwnFsoC0hmJtKsEbE31PM1i5hxOFhkSE0A2lIa3QfvppakqiLdO8+ZskObNRyKTFGzC40o7nyr1sKSv2gciWerIsIQV12aSQKnfpvgerSWBt2PXxKdICAlGQ0p/9ZSeo3dKpSxfNurzpSE8DFk035BEDiEylQ+k4fHnPE+XYfZ7h98lBxB+dxVJgW6QdBcwHr1wzNFyMIJbbHmiQS+xbY9nf8HmOrn8G1olzwH1LbMIr41wSOMP8dQCoIm0elF6QMK4WOQAXCqfBLV/7jVI8lV/dnkI15refFLgP3NCh/C7+PungTgBRPD1EdxKfCyAugpZsKNTKbj7lRpJ4GGHHoRHrnwWxFijIZP6TAyraZxIzGCJMTZEBRDtnMDCkF29P4rGTBp8z8RTEAclyZQcKMTJ3akK7Zu7Gw0dbNycISiZWqgUDoUK03A5IvE5X2FNeU63DZe876/eIBi+ECqbLVNr5RBU1UKQQSxSUG56Hg8Qi/5NUVLM/VnAQyou9PEq53cJ/k/FLGsnguHZnD3sXktb1xI0OXKp9IToUOL/uUVYeOd0UFjPXz10jaADuyODjgE15Y5xCbR6q/u9pYUh+ZFBfB9EMn0EFr787ItpnlYwAKGp3EORfbyY5Tc+wEoHdgdP7FYMGuTfWtl9xsnmEHU2fPxTBm0GoHG6G+pPCJfCi4e0ENj2TDkBZbp9ecbdnOOD9g9U6dF26FCzsN297TRFrkHo74FBJEFfXo8rwvClLiG8+4MCQq959c1nq/O0pjNcYjnZWa4dnRcq/hRzICKp+fxilzYgu9isAf+ou3jZ723c2K0q+O8o9cyAsoXTHlJpMG1H8UHlu8tnYjIP57kFzZTQpMGcBJ/9vASnzkiDZ9DaZDqbG1NPhKsiqzZ6HYd8nmZ8Wz1cnVnoLRcZaOv0C1P57kBmyWRmbqRN0gB4Wd/oV9hd4Zko6+02acB3uSXKpB3N7yDTjGCit7i2n+CyEBUPAzm1+e3dOL62HZcRhO24Htj+XPPYh8ahOLub+K815NDeiGOYX8IF2+8si0kJwg5YdJd56g3avYjykBiLAwfte2H8lOOXn3jEAU+ZKwKs89H3QRCP9z0VXIAiHpgHB4bOhyfkTgcZzf+Gu2kAWJ0NXAfPzjd+HS6y1SCuqph8OhnW1eIaa62yRxGXZX+9roFk22H2WJg4J+7Ns6njUPS9K1DX+BKlJK9F2dDdsHH6IMhHCtXecqtSUAnjfPmrFqtNEERSXKOAjPBI+HwCf8eNhJn58wIBPcwFY3bhuzo1aqvwtWkrYSy7gvubIN84zXTNYnB6HfyizdAyDyVLy/IgtnZzpC+J4+Cjfpxg+DS9Cw1M5tegw9RSZFDOHgtV+uj7P7ZkjpBI6FAAbmX7b7rsQ98fGPn9m8oNmxXcQxLUefjK6zGBPveBRWKw46YvV+w7j+vQCr0kF9eYSmlmtdVxg5LvkqDPtOQaD4vINk8l+uCmvFfZlDJVTAq/rQl9/Sr0NNnID/JEa6t/StQw9P3rZOnBE+yX4o8G3JMPx4/OnN7uSD/rNFeHK47DLiwxBbNZGcXIvvIT6m3/zqRZNMCjaFH8+xZhUc+5rFe4EhRZJMEYaeTTfaS37uuOgC7bUMHc9huOBEd7m9+oj1W0uUHXS4bIOxz0tXoNvGHUUGfi4MjcFbUib2tIP/JihhvPjuq57EGXetYh6D6J7z0PGdMiDL/VXeu2nSuLRxbxUttvgL4vwRWuUTG+sMUaTTStMCBCgk76zwckFuvqZhbmJFkD9PkZX0wkPKawjVtHEIk0B2A+l8EdRsSyyzkINUMaaxd3Qfb5NQtn5wPOV9YCq1rstW/IABTwGuJjAFYYN0PG3epzd+hvFYha+E+9nmu0XACnvw7lQNj4XaxiW/GKyO31SCsL2+/8eEM+b4tK4CJryx0+kgWE2fDAPjifruAZBDb7pr3Nv8JPcDtXoZWZWg6Xcv+ySk0PrPyKhBSnjtEdBmq75rVqEoHFO2jpLkvFQ4wMMl/tdq0Ed5XIb2Y5/jUh2NsmP/BCc17TGqFj/4Vd1nbIqbDh19qjJCZikiT0JnmqpsLemmc/BFBQipYF30fTh2Fwf2ynIpFRHbxMqw1QJG4auRF9rBK4VX4HcAZ3CnwEaYrPpufu7eIQo1RLiweUFuRikQ99adHlvTSpH9wrcipYyrtXOakXwx1mWOaxbzxa8AAyY0qSatwr+PfZ0MR1QHLpmhpsgJNsW5TXs5dZAOefjl50uNTjSeGkIr2tyfjoeIanh6DmhS4w62MebqhcWkXyMHB90IeFB3KCKUdJmXTKOl2bt/QqDlhkOR79UtihViBkkqgxdBoMM4Z/KxPUCy+RtN2CUsfxTOLhpT5qUBNZymRAXrDTH/JjbiS4jX30fWyJK2+oKhJdheHVRyl3omktxVKk5K0tSGpr+R4CLb3M2CfspzTxUpb6inhWrchtMdSf7nE5xqt8dSkbfU7uZ+K1OxR9JfC1IDKLQ2AxqlFxoRWeLbyIfzD0RtpGnJdsC2VdJzO/HmkKmwEDL8WdsQvYFYDnn9rfA5t8TYlAkmFVRgm8jKXPZ6tJLsKT8QEwFoXVwXcsIaSwzPlI6P/uwqgAARIkSFhFrh4wfZSleDSlM01Alekgvp2NBaXlsxKU54AHlWV5EhKUa6sgon+CBkjrh346ETyOKJTWGfURc5V9wt85p/2/u4n4UIFnLM1G0RCko4VKQAFg03Od9ZzFT5gBMiUQ6zl4/ywVhSbChPOO9622yfIO6u1hBvD5qLMYNNMaQjeqxJc/lnKAA37WBPHCgo1ML2+ZElicRKVfQy1p0LTox7KJ0O7kvpBQfJfTS5xSFVX/Y4xyPmfd4hYj2/uNFecWIc1U0T6jbRTF1RbsYohwzgalVu+40fvmDbyEK8fAT6KJi/EhUdTMmz4KP0xw/FeyNtsgj3WNi60Lz2Vaga2g65VduO2vTd6H8h7RVyRCfo9Jxv8YAAAdPLerBaAD8RL3bUB0sn3U8a0t0QmjKioGBHuKorEf55HNS0SN9EMz/6rWfgWRruwGebfU9Yj9msOPqzlN6jRmMWO4Kx3gWLE/QOfdOKid93gmZU4gtOa2Y0pAxV3drSMUzQM6ukV9rQFV3LyMVEogQEOefMQ8tm+6mh2+evAitrtwD7+P6Rz/7UHxxZ9y4OxqmdxqfoQG1FoxTPUJE0xuqqebRbwt3/NOEoBRoI1liMv/DofXDnAHk2xfh47K+YvtHoSv6zRtAdCHMHDRcTlzmhZH6IxMoZMzeS3qeEFNxuT7YuTf/+AOOZN8bJCfGhrMzFKg5rVGHxzt6DI5ND1U5NVv+ouST8rOP4KlkE3sfXLZzcxKM3bGTCdutJ4jHi2sf5wRWFTBGC370OsFmgZC/28qE3GWZaeXUDafHa38h9LoBC8YtSpz+SRPr0XDf+LXuAuSnvgnwGn8m69A2erd9ygPAUsp5XLnSpsVeUHOjRUvqu3NVTMTUMbUAz24Wx2xnVAfOoeXPaK2e3e/tHE4gDh8x1BJaH+6lMsU3eqR4+BY3NW0c58xxa+1452/eujeyPSPbA0Y9JblV4VXz88v/CGszUFM/u8YXM89BvVsQPLGA/LiXBpAgcSk4ZGGZA4lJyrrp9NcxQ/xltU/f0MmV8xlbxEXaVmMsauyvbz+iw8Cp1ushGflTPDetj9Q3GFMRsLEvOWc71x5bSn2OD8o9X3H5wZItAuL/9zr/9RrypUZMgTh26GOBzfa7Dbr9up8UvKROe6kIK1vL1937wi9Z9sk/Bf4cWDyl8WOK6Is4wVFsmW5yKD/go/pi+wF5GyTc4b2TpMRaxtbSspDxQvbAXdbDsrLISJFOOQ6ipF3GnzNgonRhKJPWiZxqZUfu+QimEGmy6fWvDCM/t/7dazPABPFvyx4kzqs2xsGtYFjexlVrBF/ZWOHZHQ3e5GqpD/Ubx+mPgYrunCf/7poe3zLLATJaXOvq41WylejHW2QhdlUzWJ2u7QeXq+eu4SabxwOXYNSMszrapz6UY/gMtxKQQPUl9i9VmYrT96X2xWFukZ0q13z7+ISYNinM+Kw58ZfJ3Lha1MokMueYDTnOxc9OFjNHI3295T6ceULOfEeREV315Tqfc7UWfWxO+4I0gYzj62SfIt1sP/8DeNMlPgMJqOkNaPBfpE2UBwK2LOh0FquT4mlxyc/c4/mXlRVDeuThlzjPMlYMxAu/VPqo7muTIvMZFt8fFtMDluUmPrAdmmYVUXK6rpWdN1KWpD8WviMKwewdW317UL2Dkr0/qtX/6Hy2Y+dOWAJM/Y1LiJ//5ejDqcxs5rKMDp/XX+1uis/wSJx7drhWfE2x3tc+aYA+iEYBFOKvsRZwzlUf7dbhJ8ry/LMGc6+ksXTRVmUAf3fXb0fVnA63t6q7t/TJsyBZPMQiGe5bSB3yIEUbK9i2yhlYNdMGUsnzJvF5lSrgJA10ZHOTnx8llH/QjDWlMSZERq2XolGZIojP96RC5fJF8rJxvEZ07AzWyzcSP1Eb7ef/FqSXSEZc+PFgEXC3sRu9mYA2H9N5JEbhkoA9Ld7lrajf7zDgXPSMSBLBtjsF6G/s7Pfd0xnmJdWk2UnbmLMUAWqo2mp8CC6692KYL0lkoRkOf4+aZsYbqDRyJdw2fkrvkKQ2qvsf14edYNjuYEkYno0PtBP/fnIU2A9sIGVIvgy9lifw5ZKJrUVZ6Rx8WOuI731Pp4xOPx6oxCpGDHWWYfnUqPzGDuzjaixuT22xkgGcsY3JzO/7CqOTX7kmFm0R6YGsLoX+kgcBw1/TSq4HBvUay6nQNUeJkOqe3yDf4nDhb6p6XceHN5va0sHEOrTwqLUAdd8YILjB27N9bOT5L5d+mj/rPJ/fXqu/5cGP+VXhdxUC3Mt4jGgW616bxCY8Uh55G9K0lZDYz5FOpLY6/5D0WxPHpFbGkrXnhuKt0pt3Hqtl/g/MS0fhjZsBYiNnoMo8flL4QXBN5tNG3p0d4CI8lelpJ2EBUK2nbYyaMJHR13Dkf2hJKvfD+g3L0O89v4y8LHPyKYrL1Rsf9EG1Db3yhGrHRJCFx7LV6YVN/EGeL3rOHoB1P6MbGO0t77UT1Hq7Dvw9tX0ZAMXaUuQoDBFaX/aahVkisCn615LS+S3ofMTrZpuxmpbewm0SRnwR4vD+wD78LacFpj2kMtVC2F51htJ5NDUMoYjjjTmXjir+08vMe2QCVcs0a5QzxGwS1K2fGBuTuoLr1ldAfd+RKe4Xzve3iVaDI4Nf9oreYtYXH/N8i1xGNu+yVp7kIZL5AEyVJbP2B9bkeOsQCs6bOmkAruQI8j4K+Pp/TWVazv/5FBd5iwtSjuSTn8iWpf5CuaS0EqJR6qTJZSiOv1moYtVhtMhH2m+d0om5Zd0bNP7UtqHyN+4aFzKq0RG1QAaFvMHIzty6C6uVqsF/gW+sflptVBRN3qGZagTvkOsgq2AsV3oAFesjig52qg3dvTJ+oMQtkvPYL3D+9pcG6j41C6f/n1v0hTBtGud2h+b3XSsGd81BeRFiqWtvLdPxYj0plHEVPfYTgai2/h9hFEjMNOTwfctvbenMbMzUBW9SMos2wkHSXw+2q/RgghhM3LTWEzlUUV6A8e2OwiqcanxvzzBKmKC383XVki9b78ufc7oaj1HVMmx9avh7Cewabp0ukNFLGiH8DKzBAiix4IzrHblDlVdWtLZ8/C1meVgWkbGhQCdWlHNRLAr7cO5aN5x5Hmlpo9ZabSToIC064MM1Qtfk1l1ULNfAMboFMMy1+n2lsZIcWw0gKeBtPOvfyRSNvXNzogeeKREDa3jh+WAAAEc9wGeRJp6OTulYCDe+Wy9vu/n3dgUjYXE05pr5/92aDXD75ourHTn7pQfFlRji7MtBSyJeNxO9Ug/nrRJYm715wpmEN2v2AUvRktrpPPZ6y3St2bYJNg71XkDhuzfp4u+O94UdSCXaC5WOFYXPmWPPeLwUUA4rwHq2+PGOXyCylGwRLPcKygLgNr/ERZtJAtP8wM8ZTYaJDYn4a048peR+RrAqitFETBwDdUQuFP5BPqtmKGainlxnq3cG73vTazqxtCW0Oqlvt/+UMnlRSSN/Ia9l4C+10uNVY1t5FpuyvU3S9Uq5Lrt73o8NaYdTMExcT8/zmipnNJXk/bYeuq5HwBuMtL5T2961YM1CAQMVoOZoxNVbcG9O3Oqq1/eRJd00rzo9iZ7TQ6THXzlBSGFArsN+/AVtvzJGwl+0z6haWr24OO9O5ocUMQdwzsnljxyqgGrScPcOCiuwypcMPw3onU/XVGxtL5BOPflVuC90DxffPmCd//VxTU4NCVFbYOM66RgI/ZT5Di/L8iGnx1VRzTTtKenXOVTt0WPRrm3KOvRZbfIxTBCSqyzsypAZHat+muRzW6+HaBEJCMnwFfgrdTl7M7ico0wlEcoZN20jrNYFSz0jODPlHhW048PLz2wSXQpg51Xu+PiTrnFZLevyDmBWDik1soEQ+0n/u1LmZjs6ZuKbpqbfP40g4T6rTT4c3gR+jMPjOV9nUjLaOeiLGCfVQfyCNt583Tdfl/g/Ni6U7p0mf6AVHQXZmIbRMrZ8G8LvKZFhFz9BadVaDv0+4r7a/MHtTERJ1ZC3qV4FR67FAzCcDOz96F9xk3yjcuXEXqgPeRKy4qjV0rVKEW3Jsq68J5t5Mar4T3BwzE4lj2mfM5jzSeNOwmdCo9+7B4bnM0DC77t5188cJJWzcnNkv3sP7rcPi6W7IC6cewfN9MB7IYz52cUKho/UG2rkf8yCihgijYZ6n7r7dl168GeVjwc+dykVeBk03e+O13A91rEjZyckK53KISitTVFsZrcdN6h56q1hE2cSqDBaePBIsSS8xSF4ztTVReAJT0MjOYS6aCE//UBK+S1BCQYnf431gp5vU1nLXtOItBVFkk4Pmkc/+biSFOF27nEGl4sOhogeGar2ZZuCcJAtaa66UePmXXWUUTQTRyYjBP4XG3BXoqzr5jOapFUnbJTrE2/SGvbXYgIw34/90epob5+bHQSCpwKK6GLFtauD6NsuEFVmNesROb6SNRHxqCw1U5xpk6rsQ6CVVQmMz1TZ2qp7Tj/vOWnw1ikHbLzP1leT+ydBv/W5lf6RbqsK1CYm8ws32NSmQIBBdRkg1BNwzTTMsLwEov93YPPLgXWNxmO/nFtJng845p7noVWGpe/qWx927+GyWDxJz2jHDs1ei7CgbzWAhJjkrl4MvcnFDOqcsVng3G0dh0IXzGaF+y6G3uw4w0EDuvE4sSAuDjWO9WTqjsPcNXjAbflxkQTNq+RorFa5ztksa8vqS3SDWKNKyoFfUNJnPkbK/I9zlFgpV+0WwA+TlZtDiyfzR1PHcggPfZDzcMjet8QQHKm6f4qbWrhtF+4KBBCo5rEy7UlpeT3rDyJTn4B5/dXIW58i6CuMyEthO6gi3/PahJNCIDKQKu3wNEoL7ptOvLSKYI7vZpapywPnHCQEqNV0eoDhrd/6W+qKk+MCmguqLPYRq8intuquG7IhlR9dnY7cL2K2mrdKMwIaX0ClG3vJPKWR8bL+xAE1+jTvCT1U0HGI3kB5H5U/a/Bb/SufHjx/brVmas6oUxHcFAGO/Numo1dMWE7BSsEsg+CDVY+BUr7x7lkDYqgeoGyZS0Bmayh3jRJ8vMHi/vOHeTAJ4EGqw62TG2MDAFCZCXjxngZS7sL7XsifbnaDSVY9IccwzxV6k8w884pbt8OX2WnjIc4asny9V/R0qYoyEPnbv29QVUP+6xKRpk+wH0nLunpByerBYVNaTxnPKc8ws6W4fErnyIppV4b+Zk4cRUg3/tIckR2RM6k9B8GafFAjxrBMpl12sda+eHX6wgiTmH/MlMF4VR2pTEi9eSeNKx9txohgmvGVdAGIZOhYzVobY8weGo8F9H1bY0EjbfjsFmfYy5thzo6+RpJBnO6CACnR7etYfVcAAABCekGvx9ZOJ7f+hwFtuFQAap4xQ6T3uvKs88iquQSHPzQPG7DVfHRxzSWXJIKzwFK2KFfVuucbmPSb+GukZLYpLqbRd2a+TjdwoKQoKuxQD3ja/PZjRB+l3DrHk4XdArQ8wKcScWqFIW0h2/BbwAZTmuIsIPOkuYnkLHQnZMin4Ld/+BktGfaSG5bbXGwY9LndfC28UOVGyT0pncvwD1vTzc2A+SywP2umS0LJK/P4lMgOaBBMQsye9Ys3D54Jn8gatyZ0PQrCAQFogmJVJI4XxSCHDME/pNxCT7O4HqIK64AAAFrDRJ6d3EkCWfVjiakCRuPAC+zH5UQTbjIfnoUyKyr0LIGc/VO9u59cwu1ABQqUFsI7e3XCHzCgsIMvI2/EyaTyAgn5OSxyyrw1+5H0364S31LMLNs+6p5RFK0+TOal9GGxRVVUsSKlo2Ug4YmAZU35R92rgOlbYEajg8vjppIu7PlwQlJDduHWgNOA1wC9G8w45glNfblw7ca0BrQA06Coz1PNd+iERsLgAKIfj51umPN8lkah8E0+6WB3QfUnNtzg/aZKczeQ5f7pPFZIbzJf36uZjrnpKNXT/yE2gsXN82IUwZYq4+4LJ7b/w3ZqJlKrnfNfwlbDmavD6BxJf+cRVgLGvsBHW75bujHKwXidQgVh3UVN2V/SGII0JhYiIlhRcIXG6SuL+HJlSgcc0tTkbZxG7gOeYWqpCo59yfHgKXqEN3WpfylvsAA0uqe1PePjTdTMpU7WZPVrx43yUM3B8HYq+C5KT8u2PfVCPBXGV6DtXSf0M+CVU6dMK3SQOMomuz02bEuNwRQHpQazY1vB05x/DnVk/bfbYVRsvbYsOlVa9OdSj464dE9zwsLjZrh5kceH5NLILG6hNhKPlFjOQTF2WGrCdNN88FGPGkVvdD/6sp8QqSOHqs7MrHUSllEF+/e28gAsuW6LBvo4cmzGQ9yEDxLH1pYVXFFIG9womc2xhQzJ7GUvT7mb+Z5cjGJl+qHKw1rvyDAQS5GmdSXaaSDTCVx1x//DX5c+dwDrFYtVU7BCZ/dhaKAwcyQCTkunaXk0/Vtbn9/eN5Jokt5RsNiL3tFIlnEX+UOw5shJq+juNS2NQReNFPJNjDjHm9y/bhfSFhY72W0gF/mXo6V1rkjEItjQVT3e8G2Shbjv3I7+uZR3XZdMAhms+C2HBfOwDiGHm6byPLEG72k50x74eOW4GPvE2NF5M/tQmsHjnQJZumOuoloV+gLCvG4GFxOQ5iqRU93bgNbGsR84FKoY+Ji994LQSM4A2PsDhJ7X+lB+j7SU6Tjr/F8Vmpbp77NZ8UcVDJNJK3cZ60MHAARbwEKhcYaPk1pCt3mgr7La/dwYloLFnay31rUJ99pNA+bM4siiIerrnLHIMs6XVoBPjnDWtcmjXjjSsdvkcfeA/gKR5AQAxolry+QprZZBRoMCtA4CTg0HRu3ZA+fljDp7JHixL4xK0XThtEV5Y67bQb8fv/5Vh7RvNmDGj2UFGfAomKsEe9h9SPN5vi2dyZBnzfHHW38THsYyCQbf2vQMeDBquKOqwWwoiC/WmPoLMWHuapQMRDv+uHvSemULQUEbQRxX7U02M4WSrFwOqwg/hsSs5Fk+rKb2LPL+isbAio+d7mnX+6CCH/Pd9eIaXIH4sFQNHOtDY6zeavcCUHZ3VzQ0sm9k95x9Tiu7OUBzkILumBM4HQYfV6cWq3mLxGV9fs7SK//wI6HtQPZfPBF8tpBefl2lzDo6FcKQLSwmzfSdgQEXD0nBm87tCrcJ/KuZS4Hy1mCZxY6GEaGLwQACsK6K8c1TjDlz94Wb6NetzqI49F3gNUM7l0BAAe8fEm5LxO+PzwAPK8Bcelpcp7uyRjccbvsI6+6AzO2tGdrZF1Z0XjThhCC2/m0rBM4SoUyssVgKy+KLMDJTolWYQ3GvzBGUP+FOGO2N+xnfuyLeEKdv+SbshJqGOcbf8n8Z1QTop/vdWey/HsIU0BSfCEan5Eis0N1lvD7aj2S18Jm0d2ZdsQnv7jJVCIOY19fPHietwwu6v0dngEqd8Pzl82BJif/zMCykyh/GCTQghnimdlw5hIFMTLrBzAypwrWb99N4cZ/kLAvHC8pJPeWXROHmcH8oEXRleAM/hiOG/eGoEE6nhHO2lnwWYPX2fype7nRygQtZ/JOVBaKi3zl5Y8OICpnyIifGjaZDSwFeidAQt7wnYptCyjhq3tEboLmf4doRiuGe5TTsL5giTdhTr00jyuUE7E1sRBRgmui2BCH9fFyEB4Fycc/lwscIS9/lBaUQuUe1twzfsTl95uYaMrpPMx7FtM+8pIA6dHj/qQzPlEMWWshX8MUCBzJffmHHXyCftuy+S6egf25CycKToZae3B/bWW4tS8bPaMQPGUdY4YQ5J49F688x3BNvcf5PWLYUQTR7koJdVPJs7DB8/aLxfeWp5FIzDKtirjkkj4e1+Owg3Gu2x0949quq+CwjtTakTHAAAAOUDMZkGGC/Lzx9hIMoEnZAPMPlY9aOT0xN8lrAz/w2Q/U2+YXY2o9d1qUdaMBSc5/j+fbQeqC8yo62H1lcJO6kF3LvPY8MRVlGYUAAAAAAD390JtAh53PPo9Rc0JaqCeoQ3Y9EnIFk+Y+AUVHgCNn+fjI/vqWbpuu2MYQBAAAAIjlFQCMKvNNKfMcH9Gn8VQJKTofv+0u6UDBoGQThzKMTVMBSnAEuOkP902jRPIzTPbcLegAAAAAAJd1SL4uIeEZxc3iBIhnUDMAAAAAAAAIRvdwKFcF4KPLG+LQTS+bCi6pEB9IAAAA
```

## FILE:
/workspace/game-store/public/assets/telegram.webp

Тип: WEBP binary, Base64 (.webp)

```text
UklGRjRVAABXRUJQVlA4IChVAADwwAGdASroA4oCPjEYi0QiIaEQWHwsIAMEtLd+JQvXsSs7Ii9SVkT1wNPH5WV/fixUDPpwD0uf0u8f5G82x//+6/8g3/h4AGf24xtt/L3fGOlflP/Z/3O+rfhH5G8FeF/ys+/HWWwv5a3jf5h/e/6r/c/27+X3+4/4vs3+7X3Af0g/23+Q/zf7HfWz0meYH+q/139wfdm/0f7Qe6T9dv2e/4fyAfz7++f8z2s/8r///cX/dn2Cf6J/yf//65X7q//f5Rf7B/sf3b/9vyNfsF/4Pz////eAf+71AP//3BX/s/1H5H/y754/OPsb+Vn9P97euD7Kf2P6P849q/8z+/H3r+sfuJ/hP3M++f+N/0Pxi/LH2T+Rf257Av5N/If8r/X/28/u37h8fjvnmBfAP3L/T/379wP7f8xH2/+d9F/8X9p/cA/ov9L/0f5wf4f60/3v+x8Xb076QPsD/l/9U/6P+F/NH6iP9T/qf6P/Vf+P/b+4D9e/2P/a/0vwF/zr+qf7b+//5X/6f6b/////77/Zb+83//90v9gv/+ClNRPVSacKOiZw7FRgF0x0hMAVZF8mUdCpnTdBGpgx8cLWJvTsSn/y7ZcqXN7Dt1c2fU5T8jxV5JaKr52w2vXftQR6oNCYAqyK85+6dYkwaN+NUwFgFhFVkW2Yv/ApCzPf6rK2Igax2Tu/pvRSmEpa7DP7rO1PWPjGVA1IYC6Y6QkzxgrALHnSRzAGGZZFtmL/035z+PCRZGx+vBAGU8wJY0oYG1qE+70MgLkuRouX75pPG8A3zA62zF60PYefYV96SPtQOLAN8sBiYArUvDvvZxmEjBJBvSPRIfqyMVELNvfQDjrpb/tXkP0++ytNNjmPyf0N/OFRNC56aUwA53dugHZq4AHgu94rItsxK+0qVmg/eiiBU3k5dikLaO6xKvBew00OkkFLaCk0TR/G1KCyYo8qjY7SH1RGDwL+OEqZYJ8pLot/aAdI8HYHdXIe0VkW2YvofcFztcP1c3txQdJSOGZta79dovDM9i4ph4w0K1YS2jn67h06EQnW+6O2qhndBOJb/d/ho/dCVbFELGXhUV06shMAVZFtmL1zsj7Be8Hk3o0Tdynmd+Gd8UdEHeL7mLdTYtK5X4EDUYg7oP1mD3p9w0FiTIRiqQDX8LcsxEmRlCdddErYig0K3m9UGhMAVY1akMRFyLASJfAup6vTNhmSgHWSwgq8pYzteR3gejakKzGCgXL5gftawL8F4Qy3nn7MoPKoMRh+ZMVxXrsqzhbsC6Y6QmAHrBSEoMcCjCH9eNLwsO7ClUyYrDXoBN1X3CLLfPHd1LE5mIXbCGjY40DkWdEzNwK3AJuBp/Wc3VgBwHWsVZ6Y6Ql53+mLJ1lDFcCHibIZPB8MF57//N16URc+P13idM4Z8fOWhZ8q5hyRXV0cFduZhG0YLbZ6WlNhkgCWCXBhGYUzwyFMY6Qk4GPEGg0FHKE/dI6p/oDwlrWfAcszPgPBdKEmZKavDSZ6UpE4HYBD9bIlAZa8LUkH/hm/i3xoYOFcTE5uukJebDX6/YL/8PVsCSM7CEA+xyIqUE1mHFOaICFbteIE5wGIxGIxEZ6V6qKCKB+OOAmEInsJpTwHbuHcWZ4TsHMcAKsm+CjbLBipoXpNDHnx9YLpysQtwOQzdsuqylc74hMJquDVt6dFcTTP0cURcL4p2HK65Qq7ppW14vQOKpCuoVck2VBN5KW5yaGSfJFIpFHujk1cC52rEP4Ektnp/r8JPk0dbBxFMmaHjWLNDs54ti3rvdlMTjgDp5QLfqpY1h7tVtt8+SjdUL/QTEhJBZncDM2pAefWavDsDNC/JhPihUvoQ2LsggCgVj2wPGENFjB78wYW89Yh9mcWl2C+fHkhZ6XsKorRpCpyc33tpZtRp9PFuRSm9UROIOo0T08E7j7jVUPtEkCbMSiupvrYoQk/pJk4BiAdrcyR2DmAT1vhae21vhjM6vGF1rS+71MkVraihvpsvBuhUgF7FcXZnkoLQTzcBFa34WS67IzjpODdPf1s/gvtaro+z1y3TPX4/dsLZmUTC796KfmSPbCLfCnPOVuwBxW2Y5W8XWN7qi2tt5UiC4RIqEv8ckZ6DCBDfJYJ848lXH+ty3CE/pfvft/2lK+9mqIdBwt9d3fAluj5BpecyikClhVA1vdMm9gAE1aCxUYe1V+aU7yGozVyqH5zGMSEmsvcGYQGGB5JDTAp8TH5xHni5FivavANBo0W65QrbLbYw1UeJgj+5DSH/245/ZHk/EsmSh1s1UYtXTZ07GMk9Dn5zLyVWcgvr5O0BFFs2gKL45TBa5/rL/q5LEU5H2UjCpdmxy3uFHJvgMDXZDfyUh4bUci/ioUkvc6h5S5yxxekYomXxzxMWwh0dAQCSFrYBZLCa6eR87EO4bpxVrs29/0kg50jrA60JamnoOVyNUkw5Rm+29nBLuoW//rtJTTsVLoYhZ6pYdV4FdSHz82/kppx3JCqp+rqKvbN+PFhljnOy2qSoBtkiZi9OJhzEraPQ6iMS10ynRGI/aYbHp0yOfDdFZDWgfTuyTzMsPJ0jaFTugXQ5KjD6QAus6ylXD/gblzmgw9m3kkAYgSX8pgoSWL9R19ZleAd0NniMKWt7QZKmb6v/lODMJ9utw7xRAcEtdQmMvGlzS3PSjXN+xeuV5YjgMPW0XDupahVHnREkWiI5PEn4WBlDtHvyWg17s+T3supgoLqd2Dy+yfFwz4ht9JaUD9SPdfV+6+TP4I+lCtDeQ/p9rHyo+qmLLVVYkAONzwN+wJWSpuImblqRz5YCqczynQ2WFszkLsPBEFyT5fGXD5/w6XoJuSGAgsdZ3zffHFGxZX1jRhD+F+NOE2/n9IYDcXWIDfGOhuoJg1rNXT4n22zyEVYLx71C7hWoYQIEPLN+xb1fFpkXaV/GhBULIepCDms/pIfgHS1Lr37IT0EDnPlp4CzqO44BRm3qgynVaHItLy60iA9kNmv16ODvkjZPvAXn8DQgNHqRHzasLlqbaob0j0OgAmUFXQ0XIflsjEM5U98p7e6j9ibZ4XVjuJMfDI5GIsseFGzJreFsSel8IgGCCNUfxgSllukatTCFrk+CwWQXBzHOvRgKsc+BJ9pZLXOF3f8dobnZejRc3IWKCoa9l/AvtNQvkiyY9HndKlzf940S1A2RjOSvF+K1FTaCMZ7xb0vkMJkCdDgScnx6oRTe2zuU6EoOkB4d3ngipAiDK6FDocCWt4etr6s9hL9aSt5OG71iLNN2oV1RaWy3wSiabPS2FTVSfMEMyYYv/g2ujp762JRs/DJL6ZZtg/t9v5hd4/3rniECf+0t6kdleHh21JZ/qN2SYu3DcTJQ4bVsWGfuHD6Zw+e/rDS2ASgc2MYLdXtgo+o46Uk7FzQBSbi3563z90/n8lOGMb8t/ziPfAs1LDlynNH61SwxlvVBZx92OO/lUU6bbfC0VeJmixRVV0t6Y3FFDseRMDHHl7SgaTP6NCGiZbywj1BJK6CK+puon2dJnprPSu5a128vb/9jLGF6ioSW2YvV4FGWGn3Uy4Entj31etTOHmOoAFX3/sR5Z4K/aX4Wqa9UyzOg2u2iNUCnZwbHyqcNvWU9vvTZ5OhXQ5X5RXvqfWoTOMvAThYSkrJnektsxezEY/FM+Dy0nP79qfBQWjilnHJu3baS7kDxU5uyM6AXQGVmzgDXxAMyxM3WAeUVJR8Sm6aM8soqM8msE20XcvfMPJdeTYBAdQmcY6Ql/i769DQmN273j+7crm8ZLB0BqOK9LKk4JKCZajP1fESLbqe8qroPC7ZJO4vxTTc6aIeUYBW093GeBTrk3gW+Js4sUBYq1jfTMKCYblDtrSjDaTIixWmqRIZ4FGrSch+l1e8BIGQ1AUSUY9NUIaDhloqwCvsQdfVduFllj5obC9t0ZYrSz3E1dn2id/Q+2srhzVkJtKBcCuZQ4lqatRh7JplGB2igiWpWgVFvJFIytdNK0VkW2XRhO7EiKbiTsFdqMdGqmpryBhONEZmsz0iMN08T76GvqUZzaqTmccCnLPz1hgeCqDxKDopNgD+meSLjwEp/II1Ie+7PZ/rEO1sEMaLCd4hQipBH378jpuPcgPJvxjv57TsNYqKurytxuVONqg26O1VTOGtBQCTA/LCwW7F6zVjU7xsk0JUWz65DtBA9SyP/z3V3mtFgGJQ7fO9p2sYmAKsiyb6qIQsXnZbolMF7vTU03gjmnKovkm25IhCxfJL4TFWKF8k23JEIVGC/Hms6US59fp3YxO4tZRSia2hOapAV09JzNyH/hyin0GwVZFtmJ/dzNX/m+ojEkLgoqs2JjxsOYkY2Tju2ZfkKJZ8qjOwjJ3n/qQmgy1OdOOnCgKx0hLxxGc4elVgPGBjtTECsvl20NzhbHVZVnUn7g3iFRIWf8m8fBX5awwmQaNBFKsDSTCZYGcLJoO0vwdEJFSX3Ueg0I6DrnnHvt0+2C7prvhB6ZQhoRPKbXZBmYbe9swiLl2TOmFNhYJeaL7nMhZt8L/YrnqPDRqdFZEvEz4dUha1DJNJZPnaCC4EvS8GZ4q6iqewQ68IRtRnmOjsgd1CQhFz4KOxo77Y9bqVc7ByLv8uo+ASbrFnlHxpkbcfUv4rmRIlpzvrdBoGws1XxkJ6fFq7HET0x0hMASfi8Jh1jsA4z8UTpF4+47Pr9XaQpEfNBJT0lw9vfXwqVatPsH58+zFvVBoTAFWTA+Ha/bXagGK/VgVGAXTHSEwBVkXw7QR+vIyTXmf1dvVBoTAFWRbZf6Lj669P8AAA/vYXwFtv7ftrYXb6WBs/Vd4Ml2n9D5KfZiz8mkfKm8YG/x+6Sn9EBkG80W7t4oAAAAAAFkbbPKmU9rAphus7o882N6Azm2xYZx8y4pTgkvfCNZtznSReJG/y5a+IdB1tulxqOilCUW7YQDBOUzNgN+eayFRt1BBghejg883HdfOA3zLODAhrAa0b/3Dclb7z2KoJwaPodqfi9zU1FPF0gmB/hHVuYbxMeIM/KBz8oPMSlsfWJIYr76leuoJU1bmxcJKKNiHT7w0nZg/mBNkZmysVmf1GCmU8RSXbjvgdEXVu6NUqZMI+/aQAAAAPj4EdAMgsgJ+k13DJW/zJ8WwvQpaRscs3nIT/cEZOlsnogRGvZZlQ9sMLh+1DoWYswVZvJqHrugDf8P+XeS69wKO1H7WRyMOLQAAAAAGdL823RpaBltg+Xij/3Qm0cbTLZqB5ae/7FZPdyahoSx8fo+oTCOCVGgWL6mb5IDZYA0VSNgsgBgW0Il1N0bZk8toq3Oh7Jf/JAONJciEwtFpFsJ7T+SCganqEoIgit0IggmAsZ5mabK8dSKN0QZlYo8nanhKXX7UyfgNlwoLmBLxmZeVLwAAAG0kd8UrFMqs2clKTMz1YkCVfoYCqZm7E8tb3QjRymNusukjr4Dq9Hn4kAGV21WrmC3WdGCAHs6cfDKiJeCRxW8i9Um/ZPAAACIENn2BcUVtyUzley7pPkHZfvWIF5fJoSzMOI2GevQSI8TI61ujztwHOwQVD2rpO5VG1vZwvlTQCK0CXV9/hdqlslcrOuk/O8YA3HIMoVkN8scJJ56AAxiaCP0le4WW29acsdcNExXPbDN1+pX9PK1i7G5saMDQxyQt75OAay6aqWT9oVzhJSf+yJZLp0D5eJqAAAN5PMXhFK8Nvp4kIjuSp6Ln2nDFSnJfPAt2Aj8OQ7DDFzd9A+r3gAAv1OTGvTKZmy7ppODSJ9sEIz+sDt1MkDBl9uiADGc1AAI4stYU09ktbIGJwBo6idafpNspaPck+7aRR/2lfp8Iy/Yp9y2wMrMHYZVg+Bb/r+r3tLiVODV8qaCWg4pLqOrZffEekUF4Aq6kQWwIpHsGewgNNpx/R/6Yqg+tvc7Rw7FFEjcwAdiJQ1w7EzAp0BMRIAfwm/ZY5iHmnAOPQUyGfysxgH0DMACzoYqKwFyBtHQZ3vAcivTfcnNKeXOPfBtRQQ8J7AQ0PkjFebZQrUw1KXhvlKjdoymp/Yay2RYri+cDLvIg5DRc/8C1BlF7nVokFpRzUr1GqzdaOByzcWChfBKzWq6wjZpJiwMb8rMdc4SjpVa3oXYDOcWU6LR/KUFAVDxRSeharGfQABUnSZVBbOrD1K96T9xRaCwu6oTaTCErNAD5Q2rXsaaL+RTmWZVIWLuW8ByIAAbWOBr92M7Fn3pDBnQzOKqWC6lZ4LYQ49MuEDwIQEM0y3W1E0kyKQMeEnLg8uzFW7BV9sycJShLuNot5cniB3f0NNyTcGRDkCr+ku1qFh9Sl34AvMJUno5Y1+nZgbqS5gHKAwwIjG1DjUhMujoTLLHgfPNgsQ5nunPcnsB5eZRCbQIJOPhw5vRYeT+iBnkBA/27TEOXorS3SjrAYJRdf+d++6uaHQRheH50xcRFt2ToNmyYBgNv6M5rb9cEWKBMcM+YwgFupAxrpCjsPfzjQxOhohybZSxi66D/ae07FFgjwfW+8WnnCHyfX2DU4llwNQBM4pcYcrdefyEA1TYf+ozFAdFK6sxLEgioKf54KgemLD9CE6xK7Hg2kPp24AAAFP61Ae1t7+EDGvIeCsH2ODFNRbLBUVGEl5s3CLWBw7X1j3GdDj2t/aRVANlyF8zy9HeTJjP2LB1xo1abAEewltzFzJy4tvleOuGC9SsMnRSB+u75cYZAd2GgHY1rnDnAccVJEZ5mgFQEwow7gVq17F9etHfNLR17XP5HcoiAza3CtsIUJeDhxsWm/2Kte6XCsZMjABAAOGCJlFy9t3ABietD2RdmW4dwvuJx1xE8l2OxGsum03MsKYxxHxmunhucQT3MYmtHV7tx0ty+aZEWqZ6UttNh/PtAMmcWwlDQtCw6jCMgDSwWJi3Jao6TUHXYi1SkdKqG4M7KW6t6u6BfNG9Qcm9AYJlQFgPdWF67m9bsPmaRVbX3eeug/UjAAAAAANmQIAqzAlU9GNFL3dG93X6HTuQQYuNLSsq14E06FFvk7oSmPRpR8diXmHi7WRI7ij2MqwJ1+6xfkkAx+adAtSGwqIm6YG2WYPkg8DX7CPj5FRed1A7RGgruE8RBoqeEU5pQ+XBeHi8BIFob2O8qREoVB/TVPboSLwxRhgU44DTcp+zSrorvpwVCAZErr/bDkLt8psiKdK71j6asY/8mmhayarKIszRaZ9dSPCQXd0mSoovKNSV9A0wJ0lRfTef8qGyqoMbqY8hYR4CbC2U8QzLwk+22D4/kEsA+pFJ0TEoK0vsl2ZoHkf5hsmOZfiW7o9DxOvhbDHZ2wKs6dzYLFY6usAAAABGhP/cTaJWMa0lWWFB4TyvNaMO5ETEXWOD4yMmK63LUPBLmMbOZP3batYu+hjIySFYA6MZaT1ZwjetyF7NiBgdSYE14UmyoJUOTxKdvX1twri8Dydmm9v+7PoXipG+hRYiayrTzEAhzi0CI8TpGhBHXJxTKLGDFVS4lizmzA3uZ7+OWexfUXG1A95mY70hggBDrlFvrFzjMdEF631rJXRYqsygaplju6sJFXglzfEgcEeL9E68tu4+GeP4tvC7hbiyiDL3cyizyZ40gGqbJhXwNr5l2diw2jlNZc1e/zovy87GY43I1wl4OHGVUJhz4fymaeCDzFX+FWXX3lrUd6wthvEPgNUYyEMq19s/tgAAACqbay1FfTFoOj4pLCkZeAijCHNTWZ+SFYwNbaJhScWjnzm7VPIVgD8niCBqV3UfgSi0lEoBYenhfG7ZBI2JwB2zZVR+Rfe7VubFdJONCLXYs/dn42gtj1+94LakaJnC7EUXm345Y6pttxx3Cv0ghStujrFTiJbcHCjME60XCwkaDzz/iFH/q2RWI+EFDnLF6eOWGIAh0OyFExTGUUidrY+gyqmwcNCrgo+OPZiqKVWKmSAMrmF0mueXh8np8WRDrOSziWEp8lJDWehwDpaGzJfRjt3Nh7bhOEzvEgMWLX+Awf88t/cDcK4EORm2Ag2zyxQoSsZPUitHyRLuJSeFWFmBh0gwJfRrYvEN9wWdAHGyQAABYgNykbIQeIzIpZCL2AET+VZJbovj76i9L8ocK9mcmWIbExUl9BpbYY7Nmr7baU6xqXvi4mh6iM7qQFZhlPS6M90XcPfmCYY4l0e/YGQblT6ubvLOk4Yk6ABAN54IEuNpvg6V6/ezieGoEk0DtVPi6yvAlmErePG8T2872P2JbOExFqc7lnQFSVpGKuUqDhrNfe9CtpNnFgAKaasScn0IxuO/Y/bUWQkTfdx4WCoZz8shCgirIv4klBhUcUzSiycQyBZUP8jTfqwL8WvxvGsyKv/87Rq/tS1VqlqYOS3cFoaZEvnPHFNq5q7nLhIQHJxyqX0YhmIIl6jrIRGE/54FXEypMlhLl+2WCImHuLVFpBVvMnSkkYuroYapHctAAAKt6qeLlL03b/NcSi4TGM2Z2r8PkXV94hVGYY2qd3UTZPJSOpg9dzIwTxY6OYA/hD1gvrVhH80oLSUoAO84Co6DyNBAkUaZD4EO5l335PZnviEjq7E8X+mS/IPR2xClAj7n5Hey88PQMoKjI/WO4KAOsn7KqfMOhLz79Ho0TQg4DFnDafu2RXomn5I3LODXLQ8aj8Ma1Yyaq4vGENfqBChae5wSDF2+JqjBoQ2+MnVGB2tOMTv3rz4BBmu/yYDx0wtmYsik0Unr1nVvodBtx/EhTjf5le62rdqcSHIKDqff0YGCZIGRrxKt7K4AHzSjRgqcNto8HNEEl+o68O2CmPMF08ghbQRhA1ZFWH+mixP/6We0kw12QX2H7p9bq0YYAAz6k1qJE+RIzqeGi8t8afsUVYQSggI3GsjqgIw7XUHsV8C79Dxu863MBRXxWDiCG1VfYBkQHfAOQENt887iG7Tsfb1KDXRkW5osSOm+pc0g9IrNu+QJs6seaMX+isqPR636CUGcO/sHH/BjzOhDrlTBGSBqDNwgHYn4HWKBp1UihhSZT8NED6p/GWykj501AQcGELrImIBHMg3tgUS0TCHPxQftWxOenIqKJ9xMcHop8dnR2+PhqzQXdopepcHeELbhB3/yg1Xu+pgXoTIDClp3bC654RSvsWPrtLhQoF7qRYDbXt6uCreJAloeKhpCYIGrZrPiQvbEIYHJjaZJ3ULkIvJLvBMHQnc0X1h04vL/GYyeR54jpRAUGym2rnjeEiEMOotN1r0q/wvfvMp+LPbieAIznXfZOTVJfnTsULG4obIt52/PrioyXxQib61/cGMhxImM+FSAu4RXzFkvoB9dSm+GgGFEYqd7RZbFpKJQBbe8hzucEugtTwtD02+edxBotidQV+rOIJWpAQw604z6QALyUxo7KRPUI9zmK5Q3+Eq0L5YM7G08tG0J6cFoYzHolMmvPggAUe4/51raD19Tng+bcBwANYW5N/lq7OA4zSnSpKd6QgIDB+N1wndssqXk8s5Y5ljo/sTJu5SXnHYIPJe1Fir1j9uExD7VPaNWgKUoVU7r0WU7eRN6vc/DkhHRq2OlHt+5LvitlD41GHRy5uRVl1qyYpQCrNj5Le1WuNiC1W3h+FN0gCp9/4w0Urw2+niP5MHM7/KzWj0abeyF1FRGcS/Lg40eQzKklsTExapNoest6XZO5JoqMoEuuDpdHtN0K2j6EX69zCFZrd44zWZWOi1jBbtau8drysyr9cPCgTc6ZSyV8aUwtzFG5rWBwj4HE5ONVVYwCYDeF6otxeS+ILCDK0nkmJ4N2y9xKrpXCT+tEWlaQDqlQtFpAGtYKKyvS8ZKJkn5CrxtClCNRtFC/uhrXcAdRXCY7ExpG7LwsdcnXhHoLIa5fEkqmpWUAMf6+iK8Ia6YQ3w+aawn5u9wfoH4OIwkFPkLsPmDc1iZKNVXsDZqlVhMa5PHG/3YmNlt9IDFEzFBJilaDYhmPQvPKKdsH1ZORUQx2Dr5v8a/IWbtweumIOU4A4lzBlml2988ETi8I3JrusibMhiXVUXwrs8EC6iXlb1EWl+lI2uE7nLS0XAganziVmWEc5U97wGTNKkoe+nWKzs7u0rgZ6q91Pnfn+cMOgpUtyVNSHPim++2yh+2qwJbbHUrHad2Cqb4GWElMnqyvmXh3UyBgeTvska8p+tpeEHXbbmgs+p7VLnTIH7TyWRtCvv59Dlp0N3mWZxyEJ6mKnJUeaBahPMc+0rPkJDuzts4qoUD4WMmyb2iJ0pIicw0crhQo0AD8c1piQbzU/Af2yCn5GhHTNkC5v/wuQ31X0eI28ckxFShFXdqjNuSGpPr7sEB5ePuqBRn+L+8AS+uFqBbGFy4BAtAZb4cE8+CwIg9blWwo0hxhz/6bBWHU2k4IhGklRyWJcZEFrMPjZGtUz1m9JoQFLmuO7dElG86HGHgsS9pmeIkMQaU1bdzZ4Vl1/2wB4MklTuSiiX9p+irX/Opb1pExGKabXlOgKUmI3VMO1GChWJD3xKvOOBf6Y3GtwFqmfx+FqYjcDTL4ClgKQqxis40r0iB4BTwCv3HC7etwJ+xjzBSj5H+VCPjepIrgGikMES64Kmb6XkmLfqPmu4MH4b1WXNJuVc094IhVeAgf+rE0NghVEK08J0/ojYk1eClin9kInAaWdjVKAoewCC/ktjgrdbi/xaVNJOalC8LChxljFh1dJMRp3Jdg64+G9qvLUgsmFRqTMxqbq4ZI97vvBnVlhhMJP/t6Eui9UCaoLgOHal51zgCMvCNn8EOD0a0O8MwtwTzJmfmgpgUIUk2b5eOWpP4sQcooNkaAvMP24r+pIuu6e/plGcp0G67f6cAXYLCMKnAI6CW7AcCZdEATo/0syksDPrzdTH2BCvsCW6AU5DkIkStJ8zWpZ8Odkky6jzmeJ4VB9b6WE8hZocYne8H+GGiiWG1bfAP+A0L5wD8I+3wQgOZw6E67uCPg0YwA7RRM/eZqWTvHONvsRrBRbYq0McL/8ZPID9B1uqhhsx0hDzQClrIwt+owQIJaLhVcK24smYldw5paJNQFTtAmLs+QJ5Xcn5IIB/RQ2fpLJuLz+O/MKuuQ22J237ZzzjIDgvV4CI0etMbmt2WYJxO/G3eHsHCKGZhvB0njqpGiZJFHuLA1lOqj9nIfCd+Atz/pl2O9H82ftMp/AHE/fEnTmp+p2Rt1WeuZmOQwJQtHFtxcNzsfHw+SSiZbpWK+VfxE7maB6bwRHQMeVXHlhtob+2CGl3k2NobceGSz0u1oRZDXFkfYhPQoA8yAEDpMeOCpyqsU7Eh/UUefQ0wL42DTSWXvHDISDbUT5ZUvhJFg1432jCnW4q3gKpxhZlH4sg+5TbvJC4kCUK4/ZJqRV6RLI0f5SjAQxNtv3CqgDHa7uJAWTl69raf9aV/SUC1lKU+SqJjz6xuE3+hbq1AMvbt7ElXL+3evJ5si0J4cWMTRplPZ7F21cyndAK9h89xP+q/ezrJPu9WxCSkrsbTyJFnTpUn4+LsEosJBLV0sUpB0F3CsTvtZorDJ42C/ygOg+qSoZT/dhmOgO+r4rSAR8R7+rks1LvSK0e7dG4zLg7IaF6tV8jkBDuNV5Egzm7rM99vXzb9Gi97mYYd99lBH5sYnbXpiLfM5tP8/BLXy58fRobA2LqtO8mqW5ZqkG4toCexdCwjsn0DF/SP31v4tViW3cZ+FvohGpaTOLbFYG3D60vVyTXc5IuUVz9XHLnsF6SZHnys4NTcLrS0yRVVvzlY4Aym06C3kv8lf5MmW7/BHDi7imUjUqzJkzCuK+ai1LJGlw9BwncB9GH0zL0vD2khF8wNreZFe1o0aS5KGO6KngjJobwsPp/95ocskZFLftO6ZF/unJbX51qyCWiWF/Tru2hIZS6Hu/1YgIAQv5YwBiE/DFRUZfy8igysaoAcODAM7Az4ogXFWXZDVkO6YC6tiyD+gyO7S4dEm+0bEaPPirYkWnBL55KXZNOadxtID2wGayYu6pB7ilTU0aXmTjCkO0AMNYTNJSFLpOljHf1VF65xT3H8oy9NN3hZqhndKKKnCdfbmSMtHD5NqZii0uzWyZSytNJuo205xC17lGLXkMwt+F1dwGjg8GA+UhgKZiU4AJ5yya6LVQvgrMkbD6G++lChU2g51QO5kOHy/FPKrYJTRSfFAuOeWov9tAuulRb2myble4GA9D5H+z53IZWLkMnLmkhUJchkJYJenJum1OTKIjILl5+DZo1KI66vXx9Jc10Rgbtec0kOcbeMFanilCZPMYpY/APEfw35d1lNka4bonComf8OwBDSojXSNJM3eeEDw1yvVPDV0GsK6J9lDcuWoDhTS3tcfQt5/bK7ed/m4n8jG8gkxLQ3IbSy5xweYpEnpd9b8Hj41W5u/hT/VWUlaZ6UDv5wvB96o9EHvkU8q7npmbz8m/6IYenSOPkMFUDtj/l3/OzOAMXnMigGS1DH98OgJOplA8zFTwjCjFNTmBpqWafq2JEZYbgFrmxxSeYEq4SdeekuNpWqpbJZGPB6w/cCL+UKFvRMpSzA+0HgrC2PhSpq8n6x6iWvdVFlJXRHz17+ChkfjL0wAkNkq0o7GCDNPaLolGmn1tvee41OCFne+ghiR98rGApS4nrl6y9BKb7HkWUHlSG30v6+0F+2kJaw1AHt1/p2T2J/8he18chlREUaCvax0Mu/DCL0AGzJoHT5EVv1pPvJBxWEIXnNwID0GYSnnMAP941pgSAgbFQ41fl0hQpAsJ/Rw+3v/5qj/170gBfsMkOfE5yckeKrRCz+WPspPmQDdp/2kXniCiqH9jK3UfiGGILZrCqF8x0kRYJN8J0+ggd94ryCNqOTb0ER3uiAAJWOYqy2NOQLfYCVjryog8pEf+ut7cMuV1usWCCe674d1WHl5FdJln1LRaPTDRmZt9VPHdXL1cgdbRI+YomWtqoceSZBd6F8bJ6Ussppg+MYy/ZLxbrCi6cfPJ5mYDjlyr+WouR4YHV7KAxK+MWt9+WB+eIhg6bJqyKb8FMuO52WRjhrZSRjfO8oPwVAJbm4ggBEW10PF0x/gVBq/EH01Iz5TJ1YGQjdvCYAYuC8zDmgFs4cs2m5FSCJIHYAgTQ7DtsR2NZzID1O07BOWEA7TKr/AND4Fz8i+SEdDCKecyUeIEfyeJRcESVcub++t60+Q8tN6OtAJCl3Fo6ecEP3HPP7yEQ2I2ET+6/arqfIZ7LOmzohNmpKfBvFB4ibY3CQL8SpTUFdOlnZuxG8hDGcR8NVq79cIUNlk6UaZy2q5X1ihzL6KnnIMpQT+IyNx6yY0K3ZG/OTINspHTAsZbe4VHPNAdUApefIsGolorGNPudIa1ckMm0agzvRkqLnEd09vhXS60CB2BbKyRvZb+WtqHuycANGZOtk5bCMgo28SmrLQE2+VROL1s43ajzHBWdaX3RXR6Wr+CHfDko5fbZ73pJPKGLu7M3ywd3bRSRwUUFslV3HH5HAhqEaH4VCTPP2MS1y+72K4e5ZXWoD0BbmJ8FpyQTLFK0r+njyMNruMuJ1uB1F9BTdoL43BHTOdOcWxt1zmr52AqzYf7OszHq513dCSJjOAOmO6wjIRB145z7AwYdD4ansBMQIPhCWfEGmf+vsIYFU3OfRCiX+kDquYHiMVIzMCTzMbCpOpvc9dauMdqRXAqQBlJyfJc8PWAAAABH1pzvew8UTOYBokHhUn+ZpBwxHgRbzwF7JEwsZ+dsrK8O57u64HVX1wPgFNnZH2DQ+EYSqHZZjYzJ1oOAF/MgjeEWTqRUKRjUiNFWWX79mtuxZA8EP2jRzApFBtFH2dRYaaZInDvSNVUAulCgPBlcodxd1j5UnbwdrZrb9j7gTF3uhNbX9Cbktc1H3cW7Y3LobtEwC+aHMG0yVkZqzstWEGs4UNWKJ+yvFGkrmnosPEGh630VQN5kN6YqarHfb01rSQLsmDV4kxLGcaDecxvGEu+LLpWJOlYqrWQIw/5f70L+u3dGCVBr1/Z/8Ho1emfBTIBgEFTpqGv9gGIqlnw8VzyHdVLkPDgCsGTnr2zGTwJaOihVN/3tkzgb2lTxJLGEwcDM7lvB4NtYZZPxMyXihsmAAAAAAQ1y3OQ5LKeI3MG9FyU8lhY075y9dIxucf8PrxI4hltps7GqbEaPdfTd1tzsoekpv6kNyQ0SRe4LqSmvmrVaLks12lGywJua5St81a78Iu6bnXIiRVQ9ov+wU4bJ0clX/hyQRkVs0uIBf5AnnyzO5jQ8WBkCGS6VWmltm5nYgHKRhUAAQG/vya2+5maxMMrt3bcpd6Pz1TX0/1VDZUPQJR8cYOEz6eGWJ0Ivc7fzI+5n/HMvwBT6SDXFRwFRB40OruRePfYveauK7UTPPhxXZP+UkMU7wqVsb6U4JPz/KVyKvLYzv6aWuzC+xzdBP8NQKkZSjsMZyC67p2eZP/X2E8JKZYHeQJIlJ2Xzp8GPCs4d/vD1jQGZbg1shTQmRNzXoO6oNurl4ip+Zy9j29nWHNi/RkRCbKJpq80WFlUQfbvteWOYqve0dnaDsfuaLh/yj97qK/bwN5DTQD2+3Z1WTAWGnBo2XAamyQCueOhIZnI4ldKUnju9NzWg7C5XEG/G5bTTblbcVgxuov9kKynsCkPQ9JF8x+qafaFthyIjx1+Q7k9BfE2Vt4+QNvh7tUC0gtlLUMdWyAHzVk0Rr3pdRB1z74InNo1mSZF12YY5vF6rrDdSZYWm+GZ/uMXe7agSINqQNfgNFhyi1NdPzs++vgKIpDQxomOe9TRsnpT3+/4Y5B9ac2N+MpX4K7Q7nM7fMfsmAjx5KNfvfkIVHwm515DQIsn0ANJSxDIdfqxBVvWNc9Ycx3zo5jOI+Gqy/21MaGmOiWP5X1HkMGSE8Jbuwh/8kU0kY62BP8GdFkn1JytZWpLF6gN4JQmSc6w5hulKYExKUTVW6A5xVhVH2HPps3wzWu5t4vIgnQhH+B5lQl2P+5UKDlPjPMS3f5vyqPMTRvAIsHW5IevOYgZdS96n9T/2zbv/y3SWmDiX0FjrC/DIXo6BdkwavN8W1+PajWeAzarrDb8qzgGbQ6m9ScCVIz9E1y7swzhqKiEbJP9b7MiZxsi+7zCAZ4ppH9aUwKmGOZ8O0bCM7QKjsTYhTS5IwbbTafLHbXrK2MlNiGCMjyAtdqk/adpIOCswlQNSd3H2dlkuNrzeGpdoQxEY9aR7eMO1lkm9hm7IYJOLE7di4huxwtdgrR90w9VtDr7YylVc9yTMj3iw79pL033/aLQ+SgCwr29nAZQXLDfzf3uCPeSR7e4jaAmevsjUE9DW52s1sJyJo3QDJd3oKw8Q2MjLHDkbkw4K0WRO/oJZpCKNnks3+yHDxrKTWScdHIXmJDw9gp18oKkl+LeF2NqgEywpB8PYhRzW+uM4bPj6eXTpHjhPfiW5gsChsdyRk/4y6ZsCVKBapFrdxJ5hz0XRPaGkFd+LZYlxLwnSNsMKGUaJ45xZM9OuhGUs60vuiuj0J/bE0hMOKBaU12QZ8MhtX010UyQqN+2DAtgX1pjPgKlm2IuU8/QY20MLRVZyytVXyY6y8joa6mz7qKZm9Lw3YNhO+FkV3tnVMXiSdEQ4I11gOR+Hxhi4r4w23MKk+ZtQe2wxV5PxI8vX5e5tUWcGQLBt9pqUkyfpZbfIw8ex+HajkMkm4ds/B7VlP+DujJISP6Um5bLCkXZASJJm0flSDYp3/aVucvd9JdgoJCu93EoNxdXF7JEGpqAvpabypkbmK1uKsAWxK6U6yXEFBFqOiDdwimhoqOLz2TQMQNw/COXuUJz6Xf5cRN3rtVxpMEVjmEC2gDnCPKUJa7CHTY6dsxPNUJG66pCMXFdCNf/B17rYqMbAjaGLwndkowc6XFAvBdAxnZiQdack84XmEwBkNAVpXAQVo6iZqt6tTpLLC7wL1+gbHlg3r4QvrwRJVpQMeOYrp1CwsBeCPiK/8G5GljsgJzQk7gL1FmicJg4LWiEfihkdrF7yUztcDecOU5kUKby/uLzpXCsuwYopQ/Y7tb4Lh8V4ifVdLAy1VQxRbtXMwVrZ5uczpvwJ5PA6y1/98318LBgtIGfXsZ4hWZSQcwVUgianOy6M4fnApZ7v+Kw5eo9j/kO/8hAZnocVEQg9ZhvM1v/5QhaJ7m3huLRiQT6ByUqk3L/J0mHWgssJd+xZODjieb88SUyvKGQvAerDagHwTT45lCPTLz5Oz9jmF9hlTQnhF0dRtP9yXu8U4UGBWcSTjzQ6xivjkqkKML3KOug0sgvpRST+sGk/MJMvOyGkxVZVXiYR75Fi647qvOnL0ZQlB6X5RTlwrO3CFclSqiO9MIPBtG6SpAFERf+k/6rypG7IF5KfbI1ck+8wwfgsGfpqG/XdYN0byNRO7uHUg6FSaEjWMJHN6PUrU7KRWUqBs0KMbUBShdF+a7ajh7Ma27QqOq/XZJzBRm2Ll7vWd7P4LwS73zq5hCD69IAYtxAkLmz/aBL8dYhy4Q8i2AHQ7eWI2nECw5WpBtwL7Ugcmc3fbAZHC4Kzr2dlk2MD23fYu+t1wlMrhcOCQpjwndNQ1y+jqOnYpFrJEnXEoHmTOPSxLTByuFiIb+YXSSTv1XoQWqmlSAEVF3ynqqAOieWQA85K3K6AArSD5YQaUfhS3nAL4gVkSXdT7VZf/816FmKiKHxp1uqL+eZNz9GVgWFrBNroV0Kt6+gvU7mW0o8FcV8tq3sjxg2tJ1P8MYexxoW9Qj8YLoHECU05ai1Ql1jNW4jp9nweibqc95YBPc6ApfQ+D993KSf2Yqbp5PaG5IMH3lMAeYqi/81KWDIpmtQatwbvlwDfcnJd0fM4xhh16XWvclvHlIOjUdX2D6K/IBib+/J6Y2gnFy3pYFjcfn8AHODnkkJNn+j3Jkc+5dwkMe2N3V7nZRVMxpSel5Dv+IADpgc9lvgD/dgKKyCQQpY08+o3bu1XPrzEEKaNY9jasXR4bvtEzWv2neAHLD3izdkLCwVTu2AEIcaIJ8jtQfteE/G8Vg16f89CJ7GVUYfnnEeseuohMOyIjeTo1RiwcWOsmOR6wF1/i9wTmbd0KcAqaGKa8UAbPhszAHzO0Un9+lBeYHJId1PF9KAfESjyKvu7o75dBJE+D3iElqeBr+NvW464w9jgHuUyYF97Yv68WanNAZ2burb4+3e4p4Et5bpDe3bUb1Ryelt/0eUMZ3yHDHD0Intf80DG48s82CMaubq9roUnkj/aXICZHeCxorXb1O+5F86PbvWuDv1beuiAYnh3tdSqt3ZaxbAJS3F5vfmFo6APZTAVSPuV81CjCxIrWIrelwmv8He1d2y0FHNaYjjn490iwGN85/p6oPTFBHO7quV6mufn9+qgQcxDWe2pOmQ0zXfycOWbzOdNX3AAc0sjuJrhsdhvXSZgeQvFgLKBB7amZrO6XWKVefx79dGqiHOWmScbnm9789Vw9vivS90jXY5iwxy/rFrW8d/0DPvcJfyg6ONL26Kn0s61kYtOgg4GVP6MCwXSHSfiU/oFcsONs4ary5AR2ZBSgBrLSXzAuSfbcJyRxR6iiKFY4znjyo4RnmiwWnT4m6YhcTna00r2QVY1tqV/f+BzsiSlBVicjbPWw81+h2bIJAGMteCmM8dvcvVJdJWKaMdfqVzz/geW7tpF8+DpY00942cnm/zLbJO2C2FeCSCm4BiE1QKnJyWbhjZttysUjZx0VbQQARI01EE0XUaA8wCUu1VRycGkFtT9Rxs9fcCwBKw7uxqzOjnElHQN/3SbsFw7X0BKIF89Rjm9sYBXDjxh9TfB3XJwuJM0Zw5kWCZrm/psAaeTMNLmSUHftU6JiVQ7/5Qg/PeVvGX02FCQoZ/NBJwgIySr/XOSisOI9DolMrQwYgVnklSX9NPqdRaC3DUtte66xhyCiUUlE3h5UkLuVNporGHSJuODhR78isPxBrZMPOj3/2y/a2kKV3vwHlJlRP6zG+HpS9DD3wppuDePqD5qYtiUVg7odgiBRvTJ353u12kUBvzPNZtSxkpggNJPaHpM/gDyGsyUN06+rN7i6C4xF121MfFBBH3/HvoSzomJfVrz094bRPZvLVbvzGNVU5f/Su8tVqJtW/8LpHOm+qEeT0GwPETZKSDNEQ7+CEJWT3KFcCAgCyGSlJ/VKr+BI17PcgTWp9TL5CsAevY1cpqPfnNq6RO1x/PhK64K7JpZoASyTtnUYFCnfJbivM+4CC0crj4m5g1yPc0AQtruyByBa7X7CYvTYoQ4IFu84GybaTknQXklxUFaZQSYZWqrO+fMD1PqIu2Hw4HEdSfuwPkmlye6rOclRk7d0bzAS16pnZcot3QbigRPEWDzxWPlY/AUi7vLYsIKlzFxEhMXXRWR7OwHHyPpHaSoMFQAXVjzX0mFEL0VDVPgWgFMP4gvDOFpLySxVsjBYFFojg2jDETKKezaYngFzIbgzUYyjKgS48vCPDopyb+8cXFBLh4LNynJ5pEr/J+1V7AnL3Igrxku4ORAO2LcWBKi+GyFprgLJOqa+r7gGDmB+26LG/Vd5fCMqbMJeDfOhpEWFkRZJVToZIK76vqFHcSt4gJW+SX8Oc/YWwCVXc04tQ3shjrc5MV3fbWu6G5nBYrgXJmDlEtcrDhn2/5JzuEEuj5OT40NH6Jy4xQHn/ubQ8+SCCZucqafyUfGhVbVXPlOIYyWjbZuCnM7CgUVMo4fIloVdsPtgic8zY5DJUjfVxjGXEABQpfE92A1WyPdki8+z8B0wmCGTkUHHYEXprYdQMVZJbFOgO1LxzIj3h+fGJ3WLeFlTwyjElbCch1a6EhlNlvzHAFpf0s1CXHfkKpXbuBtdw5vAgoIjJPunEro2AH+D6V9WEqsnGW+ndxBVgXQaUSJ/GGbhliGF16mYPul0xsR1TyKbOO64F67Kq9G1qe4OhILlM+M+bB3vOtTCf3hw5jykF9KZcnKCDHIjEs4dW1eXMpY4k63VTPsD5FlR02iWxo8fdbF7yEDRIIF060epTjLunlYzIKDxEFzaFKACxE64/DnFlK1ShJMR4KlUX6UOgRqBMQn3BVbOqRhD2UePlJVu7heoEoNoDEPXeRxrPgPZDUswGmxTRKYiYTpli6fRJHLfJZ15eSQIj1JdDR6EWhtKapDzLnAc6by+Gp3rpqJeT/lUr3yd1n2QXdUhsOCndDe+x8x+btumzzxpT3qo7L9K7CbOHtv0AAMWvJk0qeu7C1vAcjJpnmJhueGgCvUID/TSPJGpCMNwZvgQk5ZsvuyhxGGQMpJehVUBU+AcjfD7p08G04wtDtT+2CU1LAJWktPsV2lMjl5IRmf6DHpsZIuNc+IPEA7ZFWibk+N/2jPFsF0yq9LCSAlygbmGv0EyDBE3rbya9XA6fwQDiMR5ELM7QMCmVbp1BNk4jThbb3CNkz1zumrpBxSvxlqhGxUcWTSrb/QjGgl0boWSFA4a+7fJocYr8PHuf6lh+LRDzqoqw7Y9HrAV7AjCp0ulo4X1dzKLab19RlDRKjmD2QvdOe5W6utaXKTwfBX4edT35VqCqFs1bKEd4w7DxWmkjYsnBl0X2i1W01BPpKfr4jWrPl8J5YwKHBntQswnrCmAAF4sVO1UWcRM2eBQxn9M0n92j627eXcG1/bjxihbcIWQbBAJEAxgySjZu2A/aOdiL0FlIAPNmnk+hfEEkhYIGWiVk+cD3vglucSxGuwWnvhqupEKnyxDM04MTuAekUwmKGkIVhu8YrmqeXuekWQoTvj7a36qOukbx/gaUT0z+BotNYq7vuIPzhPcRN09zitvekUcJ2mRFrGFv2lLAUfWTYlfxGObPprhARuzjJbZ6O1up6E1lGeNXEbBhBJhNPi+k5GNsOhPzmNILCOtiRxv+t/NbPBYtnl+OogLHfvDPXr+h+AZqgo8N8O35syhG6v6KpVm+HgRcsk3oUxSntPaT0GungXlYLVGtgoLXzcgui0GpuxEUVjBne/GifV4G2hwBThe+4txQisnMeyDsfruziR7Bx39kXtLPVxQEcjOhsM6Oeo+/eg2POZvYKKAejz0nvX8QAAA9YnyoGyND+jILQwigu9lJ7xixTNxWAEeDN4tan3WGX2S6mZFqtNqg9rA1abt0eh5Ie1j5hYeSXf8CLCirvDe0DNJM+67GMP3C0eqFsXJbEOlIR3MwJy9Uh/h9RPqijBa2Y9VZrZ3wHio0fYE+Um1tuPiUEivYW8jY/fgszt6Q7dlQLFlMcXZ/1d8vgqiPfhamPuCcI+WM3CJUoTTxXOmWVj7x7svnLDveGNUxDEf4VOMGJAVe/nKw3PCtsQQ2lz01ljJ+nFRlSP8nRcrgrf5dSMdOPLtUkrYattQgWAVA11laIWstBx9vMW1IHKagieQ6JCL9VOiRgy0+oGoOrEnUXB/Hj8t2IZR4YvuFNS/k9QDw8OevbdnveWC3Dq7u23Upyw0/K1OtKn0h9t2lLI3xjUzoU1ovrUGzLJEVPAPHgNWng2uhA6homAAAJLHnTCDrh4V1lih7wITxOlLLu6Fxxw42lQkYnJyKJTeypVSrUCdck3XGP7Gzdym4KaKLdExpF3v9TVPu4j0vkfFm0angp5rMmsXYDHJd8knUXe7uF97c1cL9aBv563M8TbcuIFGkN+ojHt+zGX0uUhNfL7WkdBZos6R9lMc2DceN2ASJ8MYoRVb6arbyDh0wJ9F2DIO329jlQI2tGmjX3KVBzbgnrsHS9t1oIlnE2PSj0zqEQZDRctdHX5LlcFN+Hr3J5G/wX9cUwVVMCHBltjD1CDFwWkuNA7v0knxvn9kmj434JGZTMe0EZ137NsIkd+AqtdP+cYBYeO9MLS3wZ0CATarijO3K3ZilTRwZArS4a8zOnuNFYiPY4gjke281NChkgxVfk9TG+MUGJMmq/lvfsovZz7/InyHyMVCB02mzRUwXikeY0cvzTf2rqpRmA3SvNwM/LkQFrM9Jlsg7Tx8/th0nnkWZsm1CTpIxPmtzmVBpXUxZ+448lCR9M5eA+ME+nJmuPsv/4JvSE//g+BJVaaSpfFsvSzCNGTAS8UypR7MHJYYBFuN9Jqklr0cRuRZF2Xa2komWunTbFAw8jNne4eSHDGdWh5mWmhqpBF30sL57+AdyJr9nRJSypccKRGSENzEpIPNgieX2HnfbiehikY6zEDP5b2FqI9lyyL/LMTpX/4vAG5qduIsziq1tgtycUZL+6zy2+LbrtKL30pVZnzUsxdqtuNgupYYx22i/KpxlFekG4qzqMtrROLgBBM2OiYljIyIkXt9ILYfZ8t1jOqbSte0cJenCPesj+SL6sOrqEUKuFNg4r//8/GqcN+p9iqmCQKUVIzRzHIkXP8RDKrbkXWnvPehN5SMoyohY/bDFHwqcC+TPn4DGN94De9WBKRPwCkRqSE2OLlBW3Buc/3vzX8uWCyXZPy/lJ+DAi98602N3XC0FzR2nwOwJ2S1MO9FUnx/E8+V5l2LLp/5PuiAJ9oLQgDEuEZXy0+egsijFVnQD1JsuK1fsvgpXjlNaxgg3qSMokGvdD3hqChoOuLxLWd7hbPjVCDqGdY832ibk7L3tCmFKjPFZnUsovDqAhEDbVV5Tv8zj5AOlP7BETsD6Qam+ReMYRDHPgPcjiModO9Pox5TfDCuQMzUbifxxCVF68ZKYYa3o83HDol8RdlBz7Dtkk5+LJ6Y7fGFTjbbT17xV5UEqWgL+kcEaumgvCz2pDrw4YELHy/smCz5w7h1IPP/OpuCeyk4yK7OvrzZRpFr/p8tLXUufqUzZmSBh8BJXJaFZuVc+QuB+WSmnTOwKXeeHvhFNgXP/ujutsEcf0Zb/lBd7sBo7vFElNeVRklpxulI2MXjkpN1ZaAdN9ndZXqeNHAYKYgXosqhh5qVYguH+9qTbbRY7g5gYMbycUX8+0DXxeGONk/wKwXP/g1tFl6pohYGP2chGRc9VEWXsxrszzCdNj9zhTyInzTQde2WcqBT/bBD2fILQA+d1TcP4l7IENlvqOfzPVPkWOeEZa9suLLZo+fjAM1+6p+wyxAUyh2GWnATfXZTIj9HDmjaudfzwH4rFZIt7Mv2Jl+gvmHtUEPNz9QjkPQnXLmecVUFD09B33V+M5uGyE5x4P2CVlt5RrpN6VCfltI1jA6/SwPWeNpvUgmXAXYzZJiTfYn8I/zQWmaIoWEy9exMNpuYE2t6ETGRZi9uPAoZV3epZ8ZjYNqun5VJw6EMB1i301tB3r61dBmJluoZQf9yMhzT5umvcpoxA2e936cnVctkLUbeo+pnip3POtXfwzVwXCHF0Dx9KR/BH22kLdmxTfd9ekPYf+MG2VTmMyZIUAIZsYCacIQgTBqwA60pc4UC0eEGBAby3wXcp4wDCLbD+VZok5XFtDEgL5pn5hrCnPPn1gCVxLIbh6OKQEERo8qH3pfz26U46MehHjUn7bdWnG+JlLbYaEdv9SguqdDOvyXbRB3w9xh8xtXpa1pylnC9Ytkc3ZfwK5YsMNvZR0Jc5UiVsHVA30vGoe5cqAzodD9zlcukhT1iHQ2YBWyeQBhTe9DqimM8l1HF54xLxK7CuvtdZQFzN0NE+Loxk9FHULLD0L0xN8DL1vVTO1W1OufCGNpTN0CruN1MKztkVGiI/7NOT+/bsr4dO9PoxJ4sF/9Yw/1cQ/VFM6TMqrwFX+aLvS4xBtB5LHbWUi35a5e5lXaO33/VnBzyezo7RhuUqM2r7ZVZvPTlygkNlGT+irNM8BAzA4yaIvNlHqjXXImB7XlTa46LgCI3G+8tbSuE7wYpu4NYA6pIqYctH+qIRuZigCLrznz4BgNubc6ufTG6kH6Nr/Gtn17mKUkvLg3hqDhsP7qGUEKNiyFVv2th6GCH4iRx4R7qSw4tKoeh+vH52QwsO6U/XI+O8ZQ/SH/0SKTEKaGXbKAeFOfLYOvA0RhbRVJrCnK+DJ/YcNpt6UCiX4hb1E69KSIVHQSXciq/kHNeXNcqOpsm/3CACIrWW7FC9gwNdnYPUZEMpR0dccPu8pqbncL3oqn58yucjCbayeOY6FOf0UewWIob1VxyXvhMFJvOudzGmn/PnbwHb5z0iGrYearuWItFTXbzJmyMlNHPxuYwkZ3NVCd3bPO9Y7shU1sWs/wru85RoY/wT9Q3DleDNzsOaoZM+oKA00L6Dcd1cXzJMg73+t9bv0x7+7yCLu2QJ4yA/MvNXy44SGlZ6e7dOdO44hf1lADBoFPR6N5MX52TppYYY/K3cYNuBErwtfW6kXgGfmbIE+MoZJyJviXvXqHsoczYRK+9Ui8sMej/SEHGtNvCuXkqQZLqf8Xv+EbB9b6uujWndEZ3tsOHUdYjuSLhZpmTLuC93rHDC5khKHY4TlmMMHpaxGMYI8oMlI5svd6GDk1MmDIsxJr2rdzK0zTsIrheLz56AY5rc4STnPFmwWvv+vh0NdBQjHVVnd+M6osV+HQHI/Xw4PUsAow0wlnLYoAAFuoSRqrF6DHyibQ3emmsILJN/S0PnhV4e7TPMSvBt+Y3rOkPU2toHlK7nbhZPLn++8aGZxJFT3lomCviZM30gCvKIEgLc3I1Q6SFigyg/D/hBkQGMEDQsEpruf7/CZiaj4QnjWH1c4OuKI+YIL6zk6U8td0kPDx4rxG015GWYi9ijTIY24mJlyyzgUeDJ/Ev5op0W4Xeih+U3/7+5n89o1JTQNKxohJtix426mJ2qpAtyUUmq0X+JPhXlEB8Lvm2FMlbm844WPP8npPkq1C2HbrjG9P94FmJSUMFcERCZnzow8w2bspFZjrVowJ/CdzmUKlI8ohbcv75Gz3we6j/p8rdvdi5HD2zA3NB+KM1YG1HX/SuFemdUwHsUgXH1hJwsJQsRwAuvo9fckZ+FDcN1Hest+gP1bkb/z+RdZLZk03ySmwJv6nIEvuCfj4tCK88+NBkeXTB/OZyceIMz+A2tg8kDt1vhfEXNFX+0x78dGqBwUH6kaBmt2w/x4Pw2nQszpLgfTesWME0eJv748jMwDVp/e/cIgBVGoKf8+fbsiygCxEi3dNuk2GO11/+fkiqrzCGnwfNd4ozorQVU2aHgxUE6KxUjmUbF00q9bB/hgAMcMGD+k/XmGRvxoLLYy8HnyC2f45wHL5OcP3W698sX2SGcl7d47PZ59lKSR09ww/Pw7m3RtReOPn96CguRes76x6CTMdBK1fJjY1ite+uP53ecdvtlWk1AnUr0FnlvSY2tBhXiHLbOEiQnqRxI+iMMK81FmYNBmtp2qJV+x548gc9GOKjYGb2cFfxDZ51337hyvo6MiovqtdvOuymmnWEx8FcOHd/Dad1QxBv/DxqTR4IuQrPuV76ELizaSiSapjDJA8nU7VOwHAPkimcN+JyrtxhWnYBBB8SYO5zApXRv3lVZK4M1vKeeuoMoqGX7zStLD06FmjHksr1y9Aal6PmirT4N2Kqgr9+9ctmRrN8A2SJH80zJI/swig//cxeW5w+Dssr0Edk9mOerXh2s5Kl6viJNq9C7YlA4ORJ7BcUblajXPC1PeszD8cZP0hczg0DnVRLXreZkoWQSOW9wuh+ZyNcLze+C8woMC4dOUWW8O9VHyLXcIMuA/+ib2foPrl7vlERd9HdSQVQGPfbtX4ks2YZKCD3gacqZjLBApYMThPZk4q7xnczDWmfNBUj1zjiNo5zCmnAyf7J2ODSnjJ1LIGUw36A/6M/kY98SpYY0t2nu3ZvZGJQeJQ7XQzMVBBZcn7E8a/CGuORniIUm+hmfpmgXcNfWRbmD+QSA5yFlATYSDK6SDAlhvpdQEe8vyuTi6XlIO34+E2VpZD2laeDQb41frXSIPRsWldF2e0wJg3B+hUlaWtn39WfOYmRzVEP271S3SyOFUzyo4mRkRXApDMaihOYfKKrCyLolfKTf8tGvDwGdJaNJe4x6BAtPaM4JLZ5pEoJ94antukClpUMfKhdwjNitKrGUG/Omv5YUWkoSxCybr731lbNgCQ2U/FNfMK+1K2LlJPG41Am4bjOGGLxDrWED6DykVvhrvwDFO6iBTBWs/BjCadA5JCsEEQnqwMtvlcG2zzTBbIIX2PgfOrosPPi3oZN/6TOmJ948riF7K3G+a3OaiN/QdTcA/R1lQeRyYMTw7VgW/x48BexoyMatSbav4eNSX7N7zFAo/MHAzqDcrKlJLdruqelScc5zHtKltbkF5QNgVuniHe88Ag97+cbj0z0MCaspv9lZvGrubVnD8NUbJkVL8A02AzjxcIXus3tnfg051ugCZVk+yi+NW5ULD5h4wnGHrpTkOlesFjb7YwDjRKyszC5TqULXSV22IRsd+bI/AwE/9UJL/xghkbg3irKB12iL+6uSQaexVmrjTBDWVHGPWxxNKyDbSoclME3LexNl/wTOBAFPw1HO1rBpUbwnH6Ew+x7EBi+PKuZDv5QwKdymEk3XGLJeHa5/1RpLPucSaNUJiMxOrAIh9sZpG0NloQMexkNok1fh5qCDSCagylig7ZjO3a+v7hW0HUMgmyBzGzBrY3TWcV/AIKtzZYmN9m2GEXuBZ884rzkokDQhA5xkGr7s8ocXXotSHI6hVuA5Fmq8M13GFGaot6KP99Qbp4IeMDVBEpmfA5QN0HX7G6e0siagu7H+rq9B5sPV6jVj9NuoocQ1xnUX5jQWu6aAoMji9UXPTLf5Ha/5q2pRv5njwf6fVdesFgQoHfSJ6+26vlk8gOrh/ylxa7THu7SCacHlXHF8jyKhKISfnowJILePtOpj0sVOOBkUMe7pBcqYwy33WEIERbWQSQXTFOPWU1F2DNQKsX1FE0jZp3jSfuRUCuPpUzrwpWZOkJM/sPDN4HiR4Tne09pqzmep9MLR6ItpMfMYi/LnCF6fVk9ze4l3w0I1TQC4tlsvbW7IAAAAAAREcMnZq7WqLp8LXHnFpKulyCw3HTm0FBDi+YjflC3rKAxKxzshjAVqFnSCcWWxdAOwHbeemFTTcboHevzeYf8UhPFpokGz6nyJOGBhb93LMuFGjxUoIM0rttj5gNRglvVswz4K1+l0jehwX0mxHk0Shhav4nC8ktd6S14uA/ttAiH+VmgQGEmHDWLKHm/UvXwaX40rcWtK8JNW3VwZOyETLGkTHxHOFSsYjnoA+UthHG6KJgKq1IHjYmv27jaG5uctkBXW+QhMff4+jGP6JzTKxF3P+7W5XuxT1KiUnOAAAAEAxMifKfI/JIpXiCZiFFHSlm64HQ+030KqICSyQ8WmnIjWLSVvKfydq2mwAA9tOZDXklLE+Bdzbf2S33i6gErsKwcKf1iVbGQpspBlCGs8+Kk4RqLqWz5Aa0YzF/abfcNWElxOOHKOttdNIm87Z4uvdb39n6/NxQx23nW3RJl9dZS6csJDoXTvkTT4ppSgblNv1dXcnwADSqryx3drQbOEbP6ICkN8u7GYgVA80XgnmJwADCJZU7xvUwX595JuEwqgUsLwfG42458RP8/rDl7tPMEuhaVSEUPa2Y3G4MttrxeuSTe/KhFS+O0Y5OBqhk1IbwFUv0FDA9WsYlLHNh5aztF0MSMLqmU/D5yo0er29tABOvnTWfDCdeU24JYkIUKOouu0npluXbTapfg5ozFbS9phShq66ocAgwKkdJdBOnvIxmIEj34WRUbyeBkzoFSbJzWzo6znDwtMfMD2BAepbj4lT7/Ku7ICDKoE/ZUrlzaURZPGr0afddh3rnOynlW0ucd69M7fXErDw+CAJsiKzX0A+iz08geBh0qTepvz2E6rOrXKYmTBdcg2yatgMfb6OUGH73vUxHtDppMxKonBSoYJdDcg2jmXCjjzQIb9rv+S3mbuvB8dPeHayj7kAUi6EOaoqg5qw9hsVaLqg+Mx1mT4zkkga1Ut7ERIvLZwrU2L9X8Hw7IYanamecYPqbMwg+zzOvND050idye4ROgYzryaQjkNbI0UFjnsgUu4CihofR3+KR/+5/0Bnyq1OTQxvPjuUYld4bRYBcQpQjnQrWQYo5mZwCQYtBE9a/PmUiyLtvgosCnWH+Gv5dCw615eK3Fn0BPrxa9OwQ+x1WDmjfn9qNgD0eW/pF1O914wgYTv8hsIixs208ob0MFHhaMW+lbCwZ+wZPulP7AsCp1y0etXQHpBdNGUQfG1pc2iGojVOqCL2k6bwYH+xBvCEg+CQFZB+BtDLAD0JHdJpE8xtmlpRo4nYB4vx2Lc+JFc2tccEM1b+c8A3GYElPxqIpejOSlKgnG3WceCdkyW04i5eBGflVbr0PFWqEwlFXcFdf//0BaZF8ddetCOD0p7hu0aI7Hl5EyTnafkYYS536/0xNLe87mSHDSC/0hQymYltfz2wN/n7cVyhVo9nFnzAzr3npsIfumR+Uf9jlJ3jWG5lTGLxt53hPDqnLVOYbu2eN8ThDHObNjTiRnijfHoO0a1cUsmnsnueZlkKqmIAXVDpBLwTz3MTipc6mcT3jiq9lHMevFPY3Rs8BulCFbEg8XJF+yWREB6G8Ad5cOYFWCFxBSIB8ZI7+6dCBF01WvtxoQJI7U3FpPQuXjwWfShORgKjCAiAN/mSDcGi7DMp4psdDjPpLoSiCLodRyfJl23FUtgM//uwvbKicnJz04C3hxsjLexIfSdISf2MM/03YD6fPjptkoXNM1+zpGgon0HCHHKK7zX4fnzG/rkra+IVKyJHSVamBqOg6abYv7oBTqoVsIs63ZM4L85yOyIZwAoFQfRUuIuVytRxGvevsdowpgQOFPqtPa6JT7EvK3m67oOEhUpvFeGKSkcDvwmujujN3nAOiajHXuUeM/pHUO8toE7rSGBaVMdNhH2S753+TCjG57x/RdfSfHoijHwR2b15ntfcL+Wmne8GH2chKPQL0hwPYfaEhOtWj8NVl4Mj9EMBxCnurAlAYjhlA4tO4GGiWwZ86+szd9XpbCn8NFDwbadAUAAAAVgsF1KzwWwBw/6+o/7MUifHsHU6vDPx8/z4ABfMI5x3JU4AkvH8Gl8f67U3YErcLTjTRsr4kbw4h520aCjrkzqq4hUxDn++cynfCieIl4MkkR9OGgxku1dzZwb89738On8nNJvypXre2K0FfvaJe0cIO8l96weEV7psdT2OFTOrJUG/w9+GOa4D/235gsViRpG41x1e5bwwLXJZ6HFiFEP4UF8NgT6sZ97iEOxUdGqXiXFM+vCtzBZ8wzKS0USU8S5P7nDhcj6bCTXxLsKNm/BLxVZn+4GMXwKFsAQHnVClhpQe/F7FJbaYEMdLVHmaJooAUg41x5kWeUIWuFhsvMgXcaX7ARh1JC24JfKbyyG1U+sYxP50c0j7nDXdyz7qbsCi5/75AcXSWH77CSm1lzhDex6TNWochoRiELERs/B4u+yjS+c4Qz0WWCBYtBVz8f77WOpSvtvLgcCnFCfn2fNmBh6tgRDR5AyxgUPzGrrsU873NKlu/BNZ3m2rvyaz0LkDDcITrxAZD9Z/X99Gb8+SP6QnZ3YpEtvf+F/43yf7MxXvH64wbLwwoU9G9ff8q3fX8WsTn6LU3WTNfs5tFjTskj47uvqEBfQxBqHjbQdsJ3lsFiMiX5nT/nJbIfBzC84OJ3lgwPKU65fZyjb36zPWFv9spNzj6lccuxwiRYKjSnw+a+aq5y8fIgFu2NSpSQsVK7EBrztUCOr1oHmVW8f9YQpZ3txXf80YuOhRovjCnfrAdqkPAASkG/S6oJ29k7CboBtSNB7JDz4pMNIdAROhZxKppYHxV50qmiGMRjbGeM8yF46l92C/AAAAB/4fUSfx9M0pyIl4JHFbyL1Tb5SSe9lb5DTiEALr4EdAMg94LPDKqXkAyCjfJOY7BWf0ITrErseDZwA/pc5x19p78rzdzCzL8AAAAAAAAAKrWPVfzXlGNwgIYdBo+ykSsdq7UACFXggNaIpHDcVbpwk0f/o0Ixin/h8G9u7MUNFAAAAACJx322hqtp9Kgt15Pv47K9xppcyJ0wQJ4JC+tIq98Jx8lne8hrSQQ8ATqbt25I0cDdFO7EzawrZEAAAAAAAAAAJuBFkAvT2WDSoTXMX78wAAAAAAAAADVEamfQGdDOmyfGlKE7oWk+X7OS3vgxIYAA==
```

## FILE:
/workspace/game-store/public/assets/warface.webp

Тип: WEBP binary, Base64 (.webp)

```text
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
```

## FILE:
/workspace/game-store/public/uploads/.gitkeep

Тип: text (.gitkeep)

```text

```

## FILE:
/workspace/game-store/scripts/create-admin.ts

Тип: typescript (.ts)

```typescript
import { PrismaClient } from '@prisma/client';
import { createInterface } from 'node:readline/promises';
const db=new PrismaClient();
async function main(){const index=process.argv.indexOf('--email');const email=process.argv[index+1]?.toLowerCase();if(index<0 || !email)throw new Error('Использование: npm run admin:create -- --email owner@example.com');const user=await db.user.findUnique({where:{email}});if(!user || user.blocked)throw new Error('Сначала зарегистрируйте активного пользователя через сайт');if(!process.stdin.isTTY)throw new Error('Запустите команду в интерактивном терминале');const rl=createInterface({input:process.stdin,output:process.stdout});const answer=await rl.question(`Для выдачи ADMIN введите email ${email}: `);rl.close();if(answer!==email)throw new Error('Email не совпадает');await db.$transaction(async tx=>{await tx.user.update({where:{id:user.id},data:{role:'ADMIN'}});await tx.adminLog.create({data:{adminId:user.id,action:'CLI_PROMOTE_ADMIN',object:'User',objectId:user.id,before:{role:user.role},after:{role:'ADMIN'}}});});console.log('Роль ADMIN выдана. Пароль не изменён.');}
main().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.$disconnect());
```

## FILE:
/workspace/game-store/scripts/dev.mjs

Тип: javascript (.mjs)

```javascript
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync,readFileSync,writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const args=process.argv.slice(2);
const lan=args.includes('--lan');
const portIndex=args.indexOf('--port');
const port=portIndex>=0?Number(args[portIndex+1]):3000;
if(!Number.isInteger(port)||port<1024||port>65535){console.error('Неверный порт. Например: npm run dev -- --port 3001');process.exit(1);}
let child;
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(command,arguments_){return new Promise((resolve,reject)=>{const p=spawn(command,arguments_,{cwd:root,env:process.env,stdio:'inherit',shell:process.platform==='win32'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error('Команда завершилась с ошибкой')));});}
function updateEnv(source,key,value){const line=`${key}=${value}`;const pattern=new RegExp(`^${key}=.*$`,'m');return pattern.test(source)?source.replace(pattern,line):source+'\n'+line+'\n';}
try{
 let source=existsSync('.env')?readFileSync('.env','utf8'):readFileSync('.env.example','utf8');
 const initial=!existsSync('.env');
 if(initial){const password=randomBytes(24).toString('hex');source=updateEnv(source,'POSTGRES_PASSWORD',password);source=updateEnv(source,'DATABASE_URL',process.env.DATABASE_URL||`postgresql://store:${password}@localhost:5432/game_store?schema=public`);source=updateEnv(source,'AUTH_SECRET',process.env.AUTH_SECRET||randomBytes(32).toString('hex'));writeFileSync('.env',source,{mode:0o600});console.log('Создан файл локальных настроек .env. Секреты сгенерированы автоматически.');}
 process.loadEnvFile('.env');
 if(!process.env.AUTH_SECRET){const secret=randomBytes(32).toString('hex');source=updateEnv(source,'AUTH_SECRET',secret);writeFileSync('.env',source,{mode:0o600});process.env.AUTH_SECRET=secret;}
 process.env.NODE_ENV='development';
 process.env.DEV_LOCAL_ONLY=lan?'false':'true';
 let address='localhost';
 if(lan){const candidates=Object.values(networkInterfaces()).flat().filter(v=>v?.family==='IPv4'&&!v.internal);address=candidates[0]?.address||'localhost';}
 // Explicit launcher-generated origins are allowed only in development. Production uses APP_URL alone.
 process.env.APP_URL=`http://${address}:${port}`;
 process.env.DEV_ALLOWED_ORIGINS=[`http://localhost:${port}`,`http://127.0.0.1:${port}`,...(lan&&address!=='localhost'?[`http://${address}:${port}`]:[])].join(',');
 console.log('Подготавливаем магазин…');
 await run(npm,['run','db:generate']);
 const {PrismaClient}=await import('@prisma/client');
 const db=new PrismaClient();
 let connected=false;
 try{await db.$queryRaw`SELECT 1`;connected=true;}catch{}
 if(!connected){console.log('Запускаем PostgreSQL через Docker. Docker Desktop должен быть открыт.');try{await run('docker',['compose','up','-d','db']);}catch{throw new Error('Не удалось запустить базу данных. Откройте Docker Desktop и повторите npm run dev. Если используете свою PostgreSQL, проверьте DATABASE_URL в .env.');}
  for(let i=0;i<30;i++){try{await db.$queryRaw`SELECT 1`;connected=true;break;}catch{await new Promise(r=>setTimeout(r,1000));}}
 }
 await db.$disconnect();if(!connected)throw new Error('PostgreSQL не отвечает. Проверьте, что Docker Desktop запущен.');
 await run(npm,['run','db:migrate']);
 await run(npm,['run','db:seed']);
 const check=new PrismaClient();const needsAdmin=await check.user.count({where:{role:'ADMIN'}})===0;await check.$disconnect();
 child=spawn(process.execPath,[path.join(root,'node_modules','next','dist','bin','next'),'dev','--webpack','--hostname',lan?'0.0.0.0':'127.0.0.1','--port',String(port)],{cwd:root,env:process.env,stdio:['inherit','pipe','inherit']});
 let announced=false;
 child.stdout.on('data',data=>{process.stdout.write(data);if(!announced&&data.toString().includes('Ready')){announced=true;console.log(`\nСайт запущен: http://localhost:${port}\nАдмин-панель: http://localhost:${port}/admin`);if(lan)console.log(`На телефоне в этой Wi-Fi сети: http://${address}:${port}`);if(needsAdmin&&!lan)console.log(`Создайте администратора в браузере: http://localhost:${port}/setup`);if(needsAdmin&&lan)console.log('Сначала создайте администратора: остановите сервер и выполните npm run dev без --lan.');}});
 child.on('exit',code=>process.exit(code??0));
 process.on('SIGINT',()=>child?.kill('SIGINT'));process.on('SIGTERM',()=>child?.kill('SIGTERM'));
}catch(e){console.error('\n'+(e instanceof Error?e.message:'Не удалось запустить магазин'));process.exit(1);}
```

## FILE:
/workspace/game-store/scripts/maintenance.ts

Тип: typescript (.ts)

```typescript
import { db } from '../lib/db';
import { releaseStock } from '../lib/orders';
import { stripeClient } from '../lib/payments';
async function main(){await db.session.deleteMany({where:{expiresAt:{lt:new Date()}}});await db.passwordReset.deleteMany({where:{expiresAt:{lt:new Date()}}});await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});
const orders=await db.order.findMany({where:{status:'AWAITING_PAYMENT',expiresAt:{lt:new Date(Date.now()-86400000)}},include:{payment:true},take:100});
for(const o of orders){ // Recover missing webhook; never infer PAID from a browser return.
 if(o.payment?.providerId){const session=await stripeClient().checkout.sessions.retrieve(o.payment.providerId);if(session.status!=='expired')continue;}else if(o.payment?.status!=='CREATED'){ // A crashed API may have created a session; recover via the same idempotency key inside Stripe's 24-hour retention window is unsafe here.
 console.warn('Manual Stripe reconciliation required for order',o.id);continue;}
 await db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${o.id} FOR UPDATE`;const current=await tx.order.findUniqueOrThrow({where:{id:o.id}});if(current.status==='AWAITING_PAYMENT'){await releaseStock(tx,o.id,'CANCELLED');await tx.payment.update({where:{orderId:o.id},data:{status:'CANCELLED'}});await tx.paymentEvent.create({data:{id:'reconcile-expired-'+o.id,paymentId:o.payment!.id,type:'RECONCILE_EXPIRED',result:'CANCELLED'}});}});
}}
main().catch(e=>{console.error(e.name);process.exitCode=1;}).finally(()=>db.$disconnect());
```

## FILE:
/workspace/game-store/tests/admin-ui.tsx

Тип: tsx (.tsx)

```tsx
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import sharp from 'sharp';
import {db} from '../lib/db';
const base=process.env.APP_URL||'http://localhost:3100';
const nativeFetch=globalThis.fetch;

test('admin forms create, upload, publish, edit and hide through real PostgreSQL-backed HTTP',async()=>{
 const dom=new JSDOM('<!doctype html><html><body></body></html>',{url:base+'/admin'});
 for(const key of ['window','document','navigator','HTMLElement','HTMLDialogElement','HTMLInputElement','File','FileReader','Blob','FormData','Event','MouseEvent','getComputedStyle'])Object.defineProperty(globalThis,key,{value:(dom.window as any)[key],configurable:true,writable:true});
 (globalThis as any).IS_REACT_ACT_ENVIRONMENT=true;
 dom.window.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};dom.window.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');};
 dom.window.confirm=()=>true;URL.createObjectURL=()=> 'blob:test-preview';URL.revokeObjectURL=()=>{};
 const {render,screen,within,waitFor,cleanup}=await import('@testing-library/react');
 const userEvent=(await import('@testing-library/user-event')).default;
 const Admin=(await import('../components/admin')).default;
 const marker=Date.now();const email=`ui-admin-${marker}@example.com`;const password='LocalUiTestPassword123!';
 let cookie='';let adminId='';let createdGameId='';let passed=false;
 const send=async(path:string,method='GET',body?:any)=>{const r=await nativeFetch(base+'/api/'+path,{method,headers:{Origin:base,Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {r,data:await r.json()};};
 try{
  const availability=await send('auth/setup');assert.equal(availability.data.available,true,'Use a fresh local development test database');
  const setup=await send('auth/setup','POST',{email,password,confirmPassword:password});assert.equal(setup.r.status,201);adminId=setup.data.user.id;cookie=setup.r.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await send('auth/setup')).data.available,false);
  assert.equal((await send('auth/setup','POST',{email:'other@example.com',password,confirmPassword:password})).r.status,409);
  const login=await send('auth/login','POST',{email,password});assert.equal(login.r.status,200);cookie=login.r.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await nativeFetch(base+'/admin',{headers:{Cookie:cookie}})).status,200);
  globalThis.fetch=async(input:any,init:any={})=>{
   let body=init.body;
   const headers={...init.headers,Origin:base,Cookie:cookie};
   if(body instanceof dom.window.FormData){const boundary='nexus-test-'+crypto.randomUUID();const parts:Buffer[]=[];for(const [key,value] of (body as any).entries()){if(typeof value==='string')parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`));else{const bytes=await new Promise<ArrayBuffer>((resolve,reject)=>{const reader=new dom.window.FileReader();reader.onload=()=>resolve(reader.result as ArrayBuffer);reader.onerror=reject;reader.readAsArrayBuffer(value);});parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${value.name}"\r\nContent-Type: ${value.type}\r\n\r\n`),Buffer.from(bytes),Buffer.from('\r\n'));}}parts.push(Buffer.from(`--${boundary}--\r\n`));body=Buffer.concat(parts);headers['Content-Type']='multipart/form-data; boundary='+boundary;}
   return nativeFetch(new URL(String(input),base),{...init,body,headers});
  };
  const notices:string[]=[];const user=userEvent.setup({document:dom.window.document});
  render(<Admin notify={s=>notices.push(s)}/>);
  await user.click(screen.getByRole('button',{name:'Товары'}));
  const add=await screen.findByRole('button',{name:'+ Добавить товар'});await waitFor(()=>assert.equal((add as HTMLButtonElement).disabled,false));await user.click(add);
  const dialog=screen.getByRole('dialog');const form=within(dialog);
  await user.type(form.getByLabelText('Название товара'),'1000 Gold');
  const games=await send('admin/games');const standoff=games.data.find((g:any)=>g.slug==='standoff-2');await user.selectOptions(form.getByLabelText('Игра / приложение'),standoff.id);
  const amount=form.getByLabelText('Количество игровой валюты');await user.clear(amount);await user.type(amount,'1000');
  await user.type(form.getByLabelText('Цена (₽)'),'799');
  await user.type(form.getByLabelText('Описание'),'Пакет создан через обычную форму админки.');
  const bytes=await sharp({create:{width:40,height:40,channels:3,background:'#55cc77'}}).png().toBuffer();
  await user.upload(form.getByLabelText('Файл изображения'),new dom.window.File([new Uint8Array(bytes)],'phone-photo.png',{type:'image/png'}));
  await waitFor(()=>assert.ok(form.getByAltText('Превью: Изображение').getAttribute('src')?.startsWith('/api/images/')),{timeout:10000});
  await user.click(form.getByRole('button',{name:'Сохранить товар'}));
  await waitFor(()=>assert.equal(!!screen.queryByRole('dialog'),false),{timeout:10000});
  console.log('Product created through form');const result=await send('admin/products?q=1000%20Gold');const product=result.data.items.find((p:any)=>p.price===79900&&p.description.includes('обычную форму'));assert.ok(product);assert.equal(product.gameId,standoff.id);assert.equal(product.amount,1000);
  assert.equal((await nativeFetch(base+product.image)).status,200);
  const page=await send('games/standoff-2');assert.ok(page.data.items.some((p:any)=>p.id===product.id));
  assert.ok((await send('search?q=1000%20Gold')).data.products.some((p:any)=>p.id===product.id));
  assert.equal((await nativeFetch(base+'/products/'+product.slug)).status,200);
  let card=await screen.findAllByRole('heading',{name:'1000 Gold'});const currentCard=card.find(h=>h.closest('article')?.textContent?.includes('799'))!.closest('article')!;
  await user.click(within(currentCard as HTMLElement).getByRole('button',{name:'Редактировать'}));
  const editing=within(screen.getByRole('dialog'));const price=editing.getByLabelText('Цена (₽)');assert.equal((price as HTMLInputElement).value,'799');await user.clear(price);await user.type(price,'749');await user.click(editing.getByRole('button',{name:'Сохранить товар'}));
  await waitFor(()=>assert.equal(!!screen.queryByRole('dialog'),false),{timeout:10000});assert.equal((await send('products/'+product.slug)).data.price,74900);
  await waitFor(()=>assert.ok(Array.from(document.querySelectorAll('article')).some(a=>a.textContent?.includes('1000 Gold')&&a.textContent?.includes('749'))));
  const editedCard=Array.from(document.querySelectorAll('article')).find(a=>a.textContent?.includes('1000 Gold')&&a.textContent?.includes('749'))!;
  await user.click(within(editedCard).getByRole('button',{name:'Скрыть'}));await waitFor(async()=>assert.equal((await send('admin/products/'+product.id)).data.published,false));assert.equal((await send('products/'+product.slug)).r.status,404);assert.ok(!(await send('search?q=1000%20Gold')).data.products.some((p:any)=>p.id===product.id));
  await waitFor(()=>assert.ok(within(editedCard).queryByRole('button',{name:'Показать'})));await user.click(within(editedCard).getByRole('button',{name:'Показать'}));await waitFor(async()=>assert.equal((await send('products/'+product.slug)).r.status,200));
  await user.click(screen.getByRole('button',{name:'Игры'}));await user.click(await screen.findByRole('button',{name:'+ Добавить игру'}));
  const gameForm=within(screen.getByRole('dialog'));await user.type(gameForm.getByLabelText('Название игры'),'PUBG Mobile');await user.type(gameForm.getByLabelText('Описание'),'Новая игра через сайт');await user.click(gameForm.getByRole('button',{name:'Сохранить игру'}));await waitFor(()=>assert.equal(!!screen.queryByRole('dialog'),false),{timeout:10000});
  const pubg=(await send('games')).data.find((g:any)=>g.slug==='pubg-mobile');assert.ok(pubg);createdGameId=pubg.id;assert.equal((await nativeFetch(base+'/games/pubg-mobile')).status,200);
  await user.click(screen.getByRole('button',{name:'Товары'}));await user.click(await screen.findByRole('button',{name:'+ Добавить товар'}));const pubgForm=within(screen.getByRole('dialog'));await user.type(pubgForm.getByLabelText('Название товара'),'60 UC');await user.selectOptions(pubgForm.getByLabelText('Игра / приложение'),pubg.id);const uc=pubgForm.getByLabelText('Количество игровой валюты');await user.clear(uc);await user.type(uc,'60');await user.type(pubgForm.getByLabelText('Цена (₽)'),'99,90');await user.click(pubgForm.getByRole('button',{name:'Сохранить товар'}));await waitFor(()=>assert.equal(!!screen.queryByRole('dialog'),false),{timeout:10000});assert.ok((await send('games/pubg-mobile')).data.items.some((p:any)=>p.price===9990));
  await user.click(screen.getByRole('button',{name:'Настройки'}));await user.type(await screen.findByLabelText('Электронная почта поддержки'),'support@example.com');await user.click(screen.getByRole('button',{name:'Сохранить настройки'}));await waitFor(async()=>assert.equal((await send('config')).data.supportEmail,'support@example.com'));
  assert.ok(notices.includes('Товар сохранён и доступен покупателям'));assert.ok(!document.querySelector('pre'));
  writeFileSync('/tmp/game-store-admin-persistence.json',JSON.stringify({productId:product.id,slug:product.slug,price:74900,image:product.image,gameId:createdGameId,adminId}));
  passed=true;console.log('UI persisted 1000 Gold: 799 ₽ → 749 ₽; image, search, hide/show and PUBG Mobile passed');
 }finally{cleanup();globalThis.fetch=nativeFetch;dom.window.close();if(!passed&&adminId){await db.adminLog.deleteMany({where:{adminId}});await db.user.deleteMany({where:{id:adminId}});}await db.$disconnect();}
});
```

## FILE:
/workspace/game-store/tests/integration.ts

Тип: typescript (.ts)

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';
import Stripe from 'stripe';
import { db } from '../lib/db';
const base=process.env.APP_URL||'http://localhost:3000';
// Use a disposable database. This test creates and removes its own catalog and users.
async function request(path:string,method='GET',body?:any,cookie='',extra:Record<string,string>={}){const r=await fetch(base+'/api/'+path,{method,headers:{Origin:base,...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json'}:{}),...extra},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||''};}
test('real PostgreSQL + HTTP workflows',async()=>{
 const marker=Date.now().toString();let userId='',adminId='',gameId='',productId='';const sessionCookie=[] as string[];
 try{
 const reg=await request('auth/register','POST',{email:`test${marker}@example.com`,password:'SecureTestPassword123!',confirmPassword:'SecureTestPassword123!'});assert.equal(reg.status,201);userId=reg.data.user.id;sessionCookie.push(reg.cookie);
 let cookie=reg.cookie;assert.ok(cookie.startsWith('session='));assert.equal((await request('auth/me','GET',undefined,cookie)).data.user.role,'USER');
 assert.equal((await request('admin/games','GET',undefined,cookie)).status,403);assert.equal((await request('admin/settings','GET',undefined,cookie)).status,403);assert.equal((await request('admin/products/forbidden/visibility','PATCH',{published:false},cookie)).status,403);
 assert.equal((await request('admin/games','GET')).status,401);assert.equal((await request('auth/setup','POST',{email:'not-admin@example.com',password:'SecureTestPassword123!',confirmPassword:'SecureTestPassword123!'})).status,403);
 const badOrigin=await request('auth/logout','POST',{},cookie,{Origin:'https://attacker.example'});assert.equal(badOrigin.status,403);
 const csrf=await request('auth/logout','POST',{},cookie);assert.equal(csrf.status,200);assert.equal((await request('auth/me','GET',undefined,cookie)).data.user,null);
 const login=await request('auth/login','POST',{email:`test${marker}@example.com`,password:'SecureTestPassword123!'});assert.equal(login.status,200);cookie=login.cookie;
 const adminReg=await request('auth/register','POST',{email:`admin${marker}@example.com`,password:'SecureAdminPassword123!',confirmPassword:'SecureAdminPassword123!'});assert.equal(adminReg.status,201);adminId=adminReg.data.user.id;await db.user.update({where:{id:adminId},data:{role:'ADMIN'}});const ac=adminReg.cookie;
 const game=await request('admin/games','POST',{name:'Test Game '+marker,slug:'test-'+marker,description:'Integration test',aliases:['голда-test-'+marker],fields:[{key:'player',label:'Игрок',type:'text',required:true,options:[],sortOrder:0}]},ac);assert.equal(game.status,201);gameId=game.data.id;
 const category=await request('admin/categories','POST',{name:'Test category',slug:'test-category-'+marker,gameId},ac);assert.equal(category.status,201);
 const product=await request('admin/products','POST',{name:'Test Gold '+marker,slug:'test-product-'+marker,gameId,categoryId:category.data.id,description:'Test',price:1234,currency:'usd',amount:100,stock:5},ac);assert.equal(product.status,201);productId=product.data.id;
 const search=await request('search?q='+encodeURIComponent('голда-test-'+marker));assert.equal(search.data.games[0].id,gameId);assert.ok(search.data.products.some((p:any)=>p.id===productId));
 const update=await request('admin/products/'+productId,'PATCH',{...product.data,price:2345,fields:[],images:[]},ac);assert.equal(update.status,200);assert.equal((await db.product.findUniqueOrThrow({where:{id:productId}})).price,2345);
 const form=new FormData();form.append('file',new Blob([new Uint8Array(await sharp({create:{width:20,height:20,channels:3,background:'#22ff77'}}).png().toBuffer())],{type:'image/png'}),'test.png');const upload=await fetch(base+'/api/admin/uploads',{method:'POST',headers:{Origin:base,Cookie:ac},body:form});assert.equal(upload.status,200);const uploadedUrl=(await upload.json()).url;assert.match(uploadedUrl,/\.webp$/);assert.equal((await fetch(base+uploadedUrl)).status,200);
 const fake=new FormData();fake.append('file',new Blob(['<script>alert(1)</script>'],{type:'image/png'}),'evil.png');assert.equal((await fetch(base+'/api/admin/uploads',{method:'POST',headers:{Origin:base,Cookie:ac},body:fake})).status,400);
 const input={checkoutKey:crypto.randomUUID(),items:[{productId,quantity:2,deliveryData:{player:'12345'}}]};
 assert.equal((await request('orders','POST',{...input,items:[{...input.items[0],price:1}]},cookie)).status,400);
 assert.equal((await request('orders','POST',{...input,items:[{productId,quantity:1,deliveryData:{}}]},cookie)).status,400);
 const created=await request('orders','POST',input,cookie);assert.equal(created.status,201);assert.equal(created.data.total,4690);assert.equal(created.data.status,'AWAITING_PAYMENT');const orderId=created.data.id;
 assert.equal((await request('orders','POST',input,cookie)).data.id,orderId);assert.equal((await db.product.findUniqueOrThrow({where:{id:productId}})).stock,3);
 assert.equal((await request('admin/products/'+productId,'PATCH',{...product.data,price:9999},ac)).status,409);
 assert.equal((await request('orders/'+orderId,'GET',undefined,ac)).status,404);
 assert.equal((await request('admin/orders/'+orderId,'PATCH',{status:'PROCESSING'},ac)).status,409);
 const success=await fetch(base+'/success?order='+orderId,{headers:{Cookie:cookie}});assert.equal(success.status,200);assert.equal((await db.order.findUniqueOrThrow({where:{id:orderId}})).status,'AWAITING_PAYMENT');
 const concurrent=await Promise.all([1,2].map(()=>request('orders','POST',{checkoutKey:crypto.randomUUID(),items:[{productId,quantity:2,deliveryData:{player:'race'}}]},cookie)));assert.equal(concurrent.filter(r=>r.status===201).length,1);assert.equal(concurrent.filter(r=>r.status===400).length,1);assert.equal((await db.product.findUniqueOrThrow({where:{id:productId}})).stock,1);
 const pendingId=concurrent.find(r=>r.status===201)!.data.id;const pendingSession='cs_expired_'+marker;await db.payment.update({where:{orderId:pendingId},data:{providerId:pendingSession,status:'PENDING'}});
 const expiredPayload=JSON.stringify({id:'evt_expired_'+marker,livemode:false,type:'checkout.session.expired',data:{object:{id:pendingSession,amount_total:4690,currency:'usd',metadata:{orderId:pendingId},payment_status:'unpaid'}}});const expiredHeader=new Stripe('sk_test_fixture').webhooks.generateTestHeaderString({payload:expiredPayload,secret:process.env.PAYMENT_WEBHOOK_SECRET!});for(let n=0;n<2;n++)assert.equal((await fetch(base+'/api/webhooks/payment',{method:'POST',headers:{'stripe-signature':expiredHeader},body:expiredPayload})).status,200);assert.equal((await db.product.findUniqueOrThrow({where:{id:productId}})).stock,3);assert.equal((await db.order.findUniqueOrThrow({where:{id:pendingId}})).status,'CANCELLED');
 const session='cs_test_'+marker;await db.payment.update({where:{orderId},data:{providerId:session,status:'PENDING'}});
 const event={id:'evt_integration_'+marker,object:'event',api_version:'2025-09-30.clover',created:Math.floor(Date.now()/1000),livemode:false,pending_webhooks:1,request:null,type:'checkout.session.completed',data:{object:{id:session,object:'checkout.session',amount_total:4690,currency:'usd',metadata:{orderId},payment_status:'paid',payment_intent:'pi_'+marker}}};
 const payload=JSON.stringify(event);const stripe=new Stripe('sk_test_integration_not_a_real_key');const signature=stripe.webhooks.generateTestHeaderString({payload,secret:process.env.PAYMENT_WEBHOOK_SECRET!});
 const bad=await fetch(base+'/api/webhooks/payment',{method:'POST',headers:{'stripe-signature':'invalid'},body:payload});assert.equal(bad.status,400);
 const wrong=JSON.stringify({...event,id:'evt_wrong_'+marker,data:{object:{...event.data.object,amount_total:1}}});const wrongSig=stripe.webhooks.generateTestHeaderString({payload:wrong,secret:process.env.PAYMENT_WEBHOOK_SECRET!});assert.equal((await fetch(base+'/api/webhooks/payment',{method:'POST',headers:{'stripe-signature':wrongSig},body:wrong})).status,400);
 for(let i=0;i<2;i++)assert.equal((await fetch(base+'/api/webhooks/payment',{method:'POST',headers:{'stripe-signature':signature},body:payload})).status,200);
 assert.equal((await db.order.findUniqueOrThrow({where:{id:orderId}})).status,'PAID');assert.equal(await db.paymentEvent.count({where:{id:event.id}}),1);
 assert.ok((await request('orders','GET',undefined,cookie)).data.items.some((o:any)=>o.id===orderId));
 assert.equal((await request('admin/orders/'+orderId,'PATCH',{status:'PROCESSING'},ac)).status,200);assert.equal((await request('admin/orders/'+orderId,'PATCH',{status:'COMPLETED'},ac)).status,200);
 const changed=await request('auth/change-password','POST',{currentPassword:'SecureTestPassword123!',password:'NewSecurePassword123!',confirmPassword:'NewSecurePassword123!'},cookie);assert.equal(changed.status,200);assert.equal((await request('auth/me','GET',undefined,cookie)).data.user,null);
 const token='a'.repeat(64);const {hashToken}=await import('../lib/security');await db.passwordReset.create({data:{userId,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+60000)}});assert.equal((await request('auth/reset-password','POST',{token,password:'ResetSecurePassword123!',confirmPassword:'ResetSecurePassword123!'})).status,200);assert.equal((await request('auth/reset-password','POST',{token,password:'ResetSecurePassword123!',confirmPassword:'ResetSecurePassword123!'})).status,400);assert.equal(await bcrypt.compare('ResetSecurePassword123!',(await db.user.findUniqueOrThrow({where:{id:userId}})).passwordHash),true);const active=await request('auth/login','POST',{email:`test${marker}@example.com`,password:'ResetSecurePassword123!'});assert.equal(active.status,200);const ticket=await request('support','POST',{subject:'Test support',message:'Question about my order'},active.cookie);assert.equal(ticket.status,201);assert.equal((await request('admin/support/'+ticket.data.id,'PATCH',{reply:'Operator response',status:'CLOSED'},ac)).status,200);assert.equal((await request('support','GET',undefined,active.cookie)).data[0].reply,'Operator response');assert.equal((await request('admin/users/'+userId,'PATCH',{blocked:true},ac)).status,200);assert.equal((await request('orders','GET',undefined,active.cookie)).status,401);
 }finally{
 const orders=await db.order.findMany({where:{userId:{in:[userId,adminId].filter(Boolean)}},select:{id:true}});const ids=orders.map(o=>o.id);
 await db.paymentEvent.deleteMany({where:{OR:[{id:{contains:marker}},{payment:{orderId:{in:ids}}}]}});await db.payment.deleteMany({where:{orderId:{in:ids}}});await db.order.deleteMany({where:{id:{in:ids}}});if(productId)await db.product.deleteMany({where:{id:productId}});if(gameId){await db.category.deleteMany({where:{gameId}});await db.game.deleteMany({where:{id:gameId}});}await db.adminLog.deleteMany({where:{adminId:{in:[adminId,userId].filter(Boolean)}}});await db.ticket.deleteMany({where:{userId:{in:[adminId,userId].filter(Boolean)}}});await db.user.deleteMany({where:{id:{in:[adminId,userId].filter(Boolean)}}});await db.$disconnect();
 }
});
```

## FILE:
/workspace/game-store/tests/routes.ts

Тип: typescript (.ts)

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.APP_URL||'http://localhost:3000';
test('public pages, 404, protected redirects and production headers',async()=>{
 const paths=['/','/catalog','/games/telegram','/games/standoff-2','/games/roblox','/games/warface','/products/telegram-50','/search?q=stars','/cart','/login','/register','/forgot-password','/reset-password','/support','/faq','/terms','/privacy','/refunds','/contacts','/not-a-page','/games/missing-game','/products/missing-product','/admin','/account','/orders','/checkout','/sitemap.xml','/robots.txt'];
 for(const p of paths){const r=await fetch(base+p,{redirect:'manual'});const expected=['/not-a-page','/games/missing-game','/products/missing-product'].includes(p)?404:['/admin','/account','/orders','/checkout'].includes(p)?307:200;assert.equal(r.status,expected,p);}
 const r=await fetch(base);for(const h of ['x-content-type-options','x-frame-options','content-security-policy','referrer-policy'])assert.ok(r.headers.has(h),h);
 const html=await r.text();const assets=[...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.(?:js|css))"/g)].map(m=>m[1]);assert.ok(assets.some(v=>v.endsWith('.js')));assert.ok(assets.some(v=>v.endsWith('.css')));for(const asset of new Set(assets))assert.equal((await fetch(base+asset)).status,200,asset);
});
```

## FILE:
/workspace/game-store/tests/security.test.ts

Тип: typescript (.ts)

```typescript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { totalMinor,validateDelivery,checkoutSchema,passwordSchema,normalizeSearch } from '../lib/validation';
import { checkPaymentIdentity } from '../lib/payments';
test('money arithmetic uses integers',()=>{assert.equal(totalMinor([{price:199,quantity:3},{price:250,quantity:2}]),1097);assert.throws(()=>totalMinor([{price:Number.MAX_SAFE_INTEGER,quantity:100}]));});
test('checkout rejects a client-supplied price',()=>{assert.equal(checkoutSchema.safeParse({checkoutKey:crypto.randomUUID(),items:[{productId:'p',quantity:1,deliveryData:{},price:1}]}).success,false);});
test('delivery required and select fields are validated',()=>{const fields:any=[{key:'platform',label:'Платформа',type:'select',required:true,options:['PC'],sortOrder:0}];assert.throws(()=>validateDelivery(fields,{}));assert.throws(()=>validateDelivery(fields,{platform:'fake'}));assert.deepEqual(validateDelivery(fields,{platform:'PC'}),{platform:'PC'});assert.throws(()=>validateDelivery(fields,{platform:'PC',extra:'value'}));});
test('password bcrypt byte limit, normalization',()=>{assert.equal(passwordSchema.safeParse('а'.repeat(40)).success,false);assert.equal(passwordSchema.safeParse('123456789012').success,true);assert.equal(normalizeSearch(' ЗВЁЗДЫ '),'звезды');});
test('payment checks ID, amount, currency and order',()=>{const p={providerId:'cs_1',amount:199,currency:'usd',orderId:'order'};const s={id:'cs_1',amount_total:199,currency:'usd',metadata:{orderId:'order'}};assert.equal(checkPaymentIdentity(s,p),true);for(const x of [{...s,id:'cs_2'},{...s,amount_total:1},{...s,currency:'eur'},{...s,metadata:{orderId:'evil'}}])assert.equal(checkPaymentIdentity(x,p),false);});

test('major price input keeps exact kopecks', async()=>{
 const {majorToMinor,minorToMajor}=await import('../lib/money');
 assert.equal(majorToMinor('799'),79900);
 assert.equal(majorToMinor('749,90'),74990);
 assert.equal(majorToMinor('0.29'),29);
 assert.equal(majorToMinor('1,2'),120);
 for(const value of ['-1','1.999','Infinity','1e3','hello'])assert.throws(()=>majorToMinor(value));
 assert.equal(minorToMajor(79900),'799');assert.equal(minorToMajor(74990),'749,90');
});
test('generated game addresses support Cyrillic and readable names',async()=>{
 const {slugify}=await import('../lib/slug');assert.equal(slugify('PUBG Mobile'),'pubg-mobile');assert.equal(slugify('Звёзды Telegram'),'zvezdy-telegram');assert.equal(slugify('1000 Gold'),'1000-gold');
});
test('mobile LAN HTTP can generate checkout UUID without randomUUID',async()=>{
 const {clientId}=await import('../lib/client-id');
 const id=clientId({getRandomValues:<T extends ArrayBufferView|null>(bytes:T):T=>{new Uint8Array(bytes!.buffer,bytes!.byteOffset,bytes!.byteLength).fill(7);return bytes;}});
 assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(checkoutSchema.safeParse({checkoutKey:id,items:[{productId:'p',quantity:1,deliveryData:{}}]}).success,true);
});
```

## FILE:
/workspace/game-store/tsconfig.json

Тип: json (.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```
