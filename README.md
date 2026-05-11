# FreelanceHub — Production-Grade Freelance Marketplace

A full-stack freelance marketplace platform inspired by Fiverr Pro, built with modern technologies.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (search autocomplete, sessions) |
| Auth | JWT + Google OAuth2 |
| Payments | Stripe Checkout + Webhooks |
| Real-time | Socket.io (WebSockets) |

## Project Structure

```
FreelanceHub/
├── backend/           # NestJS API
│   ├── prisma/        # Database schema & migrations
│   └── src/
│       ├── auth/      # JWT auth, Google OAuth, strategies
│       ├── gigs/      # Gig CRUD, search, Redis caching
│       ├── orders/    # Stripe payments & order lifecycle
│       ├── chat/      # WebSocket real-time messaging
│       ├── reviews/   # Reviews & dynamic rating recalculation
│       ├── recommendation/ # Tailored gig recommendations
│       └── redis/     # Redis module (global)
│
└── frontend/          # Next.js App
    └── src/app/
        ├── page.tsx         # Premium Landing Page
        ├── search/          # Marketplace with filters
        ├── gigs/[id]/       # Gig Details + Package Tabs
        ├── login/ register/ # Auth pages
        ├── dashboard/       # Seller: Overview, Gigs, Orders, Chat
        └── admin/           # Admin: User management, Pro approvals
```

## Getting Started

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in values
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, Stripe, and Google credentials

# Run Prisma migrations
npx prisma generate
npx prisma migrate dev --name init

# Start dev server (runs on port 3001)
npm run start:dev
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (runs on port 3000)
npm run dev
```

### 3. Access the App

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/api/docs |

## Key Features

- 🎨 **Premium Fiverr Pro UI** — Mega menu, hero search, gig cards
- 🔐 **Secure Auth** — JWT + Google OAuth2 login
- 📦 **3-Tier Gig Packages** — Basic / Standard / Premium pricing
- 💳 **Stripe Payments** — Checkout sessions + webhook automation
- 💬 **Real-time Chat** — Socket.io WebSocket messaging
- ⭐ **Reviews & Ratings** — Dynamic recalculation on completion
- 🤖 **Smart Recommendations** — History-based tailored gig suggestions
- 🔍 **Redis Autocomplete** — Sub-10ms search suggestions
- 🛡️ **Admin Panel** — User management, Pro verification queue
