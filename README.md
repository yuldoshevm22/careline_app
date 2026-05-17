# CareLine — Telegram Mini App

> Premium business operations management for CareLine napkin manufacturing company.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) + TypeScript |
| **UI** | Framer Motion + Custom Liquid Glass Design System |
| **Database** | PostgreSQL (Supabase) + Prisma ORM |
| **Auth** | Telegram initData HMAC-SHA256 + JWT |
| **Validation** | Zod |
| **Export** | SheetJS (xlsx) |
| **Deployment** | Vercel + Supabase |

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` — Supabase connection string (transaction mode, port 6543)
- `DIRECT_URL` — Supabase direct connection (port 5432, for migrations)
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `JWT_SECRET` — 32+ char secret key

### 3. Set up database

```bash
# Push schema to database
npm run db:push

# Seed initial data (products, expense types)
npm run db:seed
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📱 Telegram Setup

1. Message [@BotFather](https://t.me/botfather) → `/newbot`
2. Message `/newapp` → set your HTTPS URL
3. For local development, use ngrok to expose localhost:
   ```bash
   ngrok http 3000
   ```
4. Set the ngrok URL as your Web App URL in BotFather

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (app)/              # Authenticated app group
│   │   ├── dashboard/      # Home — stats overview
│   │   ├── operations/     # New operation form
│   │   ├── history/        # Operations history
│   │   ├── clients/        # Clients list + detail
│   │   ├── employees/      # Employees CRUD
│   │   └── reports/        # Reports + Excel export
│   └── api/                # API routes
│       └── auth/telegram/  # Telegram auth endpoint
├── components/
│   ├── ui/                 # Liquid Glass design system (10 components)
│   ├── operations/         # Sale, Payment, Expense forms
│   ├── clients/            # Client components
│   └── shared/             # Providers (Telegram, Auth)
├── actions/                # Server Actions
│   ├── operations.ts       # Sale, Payment, Expense CRUD
│   ├── clients.ts          # Client CRUD
│   ├── employees.ts        # Employee CRUD
│   ├── catalogs.ts         # Products, ExpenseTypes, etc.
│   └── reports.ts          # Dashboard aggregations
├── lib/                    # Utilities
│   ├── prisma.ts           # Prisma singleton
│   ├── auth.ts             # JWT + Telegram validation
│   ├── validators.ts       # Zod schemas
│   ├── utils.ts            # Formatters, helpers
│   └── constants.ts        # App constants
└── types/                  # TypeScript definitions
```

## 💰 Features

### Operations
- **Продажа (Sale)** — Select products, quantity, price → auto-calculate total, assign client
- **Оплата от клиента (Client Payment)** — Record payment (cash/card), update balance
- **Выдача из кассы (Cash Expense)** — Record expense with employee and type

### Clients
- Full CRUD with search
- Balance tracking (auto-updated from operations)
- Operation history per client

### Reports
- Today/month summary with animated numbers
- Cash flow calculation
- Excel export with date filtering

### UI/UX
- iOS 26 Liquid Glass design system
- Framer Motion animations throughout
- Telegram WebApp integration (back button, haptic feedback, theme sync)
- Dark mode support via Telegram

## 🚢 Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npx vercel
```

## 📊 Database Commands

```bash
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed initial data
npm run db:studio    # Open Prisma Studio
```

## 📄 License

Private — CareLine © 2026
