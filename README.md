# TaskFlow — Управление задачами

SaaS платформа для управления проектами и задачами с Kanban-доской, аналитикой и уведомлениями.

![Screenshot placeholder](screenshot.png)

## Стек технологий

- **Framework:** Next.js 14 (App Router, TypeScript strict mode)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js v5 (credentials: email + password, bcryptjs)
- **UI:** Tailwind CSS + shadcn/ui
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Date handling:** date-fns
- **Email notifications:** Resend
- **Analytics:** Recharts
- **Deploy:** Vercel

## Возможности

- Регистрация и авторизация (email + пароль)
- Создание проектов, добавление участников по email
- Kanban-доска с 4 колонками (К выполнению, В работе, На проверке, Готово)
- Drag & drop перемещение задач между колонками
- Приоритеты задач с цветовой индикацией
- Дедлайны с подсветкой просроченных задач
- Аналитика: графики по статусам, таблица просроченных задач
- Email-уведомления о приближающихся дедлайнах (Vercel Cron)
- Адаптивный интерфейс

## Установка и запуск

### Требования

- Node.js 18+
- PostgreSQL

### Шаги

1. Клонируйте репозиторий:
```bash
git clone <repo-url>
cd saas-task-manager
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`:

| Переменная | Описание |
|---|---|
| `DATABASE_URL` | Строка подключения к PostgreSQL |
| `NEXTAUTH_SECRET` | Секретный ключ для NextAuth (сгенерируйте: `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL приложения (локально: `http://localhost:3000`) |
| `RESEND_API_KEY` | API ключ Resend для email-уведомлений |
| `CRON_SECRET` | Секрет для авторизации cron-задач |

5. Примените схему базы данных:
```bash
npx prisma db push
```

6. Запустите dev-сервер:
```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000).

## Деплой на Vercel

1. Загрузите код на GitHub
2. Установите vercel CLI: `npm i -g vercel`
3. Деплой: `vercel --prod`
4. Настройте переменные окружения в Vercel Dashboard
5. Примените миграции к production БД: `npx prisma db push`

Cron-задача для проверки дедлайнов настроена в `vercel.json` — запускается ежедневно в 09:00 UTC.

## Структура проекта

```
/app
  /(auth)         — страницы входа и регистрации
  /(dashboard)    — защищённые страницы (проекты, аналитика)
  /api            — API маршруты
/components
  /auth           — формы входа и регистрации
  /projects       — карточки и модалки проектов
  /kanban         — доска, колонки, карточки задач
  /analytics      — графики и таблицы
  /layout         — сайдбар и хедер
  /ui             — базовые UI-компоненты (shadcn)
/lib              — утилиты, auth, prisma, уведомления
/prisma           — схема базы данных
```
