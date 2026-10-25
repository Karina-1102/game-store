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
