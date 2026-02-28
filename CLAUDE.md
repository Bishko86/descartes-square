# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Descartes Square is a full-stack decision-making tool implementing the Descartes Method (Decision Matrix). Users analyze decisions by answering 4 structured questions, with optional AI-powered suggestions via Google Gemini. The app supports English and Ukrainian locales.

## Tech Stack

- **Frontend:** Angular 20 (standalone components, Signals, Reactive Forms), Angular Material, RxJS
- **Backend:** NestJS 11, MongoDB (Mongoose), JWT auth, Google Generative AI
- **Monorepo:** Nx 21
- **Testing:** Karma + Jasmine
- **Linting/Formatting:** ESLint 9 + Prettier

## Commands

```bash
# Development
npm start                # Frontend dev server (port 4200)
npm run start:ua         # Frontend with Ukrainian locale
npm run start:api        # Backend API (port 3000)

# Build
npm run build            # Frontend (dev)
npm run build:prod       # Frontend (production)

# Quality
npm test                 # Run unit tests (Karma)
npm run lint             # Lint frontend
npm run lint:api         # Lint API

# i18n
npm run locale           # Extract i18n strings to JSON

# Docker
npm run docker:dev       # Build and start all containers
npm run docker:down      # Stop containers
```

To run a single test file, use:

```bash
npx nx test descartes-square --include="**/path/to/spec.ts"
```

## Architecture

### Monorepo Structure

```
apps/
  descartes-square/    # Angular frontend
  api/                 # NestJS backend
libs/
  shared/              # Shared TypeScript interfaces, enums, constants
  shared-ui/           # Shared Angular UI components (auth forms, lang switch)
```

### Frontend (`apps/descartes-square/src/app/`)

- **Standalone components** — no NgModules; all feature components use `imports: []` directly
- **Routing:** `app.routes.ts` with lazy-loaded feature routes under `/descartes-square/*`, `/sign-in`, `/sign-up`, `/home`
- **State:** Angular Signals API for reactive state; RxJS for HTTP operations
- **Auth:** `core/interceptors/` handles JWT injection and refresh token rotation on 401
- **Path aliases:** `@core/*`, `@auth/*`, `@descartes/*` defined in `tsconfig.json` per-app; `shared` and `shared-ui` defined in `tsconfig.base.json`

**Feature modules:**

- `auth/` — sign-in/sign-up pages
- `descartes-square/` — main feature: list view, create/edit form, details view
- `core/` — shared services, interceptors, directives used across features
- `home/` — landing page

### Backend (`apps/api/src/app/`)

- **Auth module:** JWT access + refresh token strategy via Passport; guards protect routes; tokens stored in MongoDB User document
- **AI module:** Wraps Google Gemini (`gemini-2.5-flash`) to generate decision analysis suggestions per question
- Env vars required: `DATABASE_CONNECTION`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_API_KEY`

### Shared Library (`libs/shared/`)

Contains the core domain model:

- `DescartesQuestionsMap` — maps `QuestionId` enum values to the 4 Descartes question texts
- `QuestionId` enum — `Q1`–`Q4` keys
- API DTOs/interfaces used by both frontend and backend

### The Descartes Method (domain logic)

Four questions form the decision matrix:

- **Q1:** What will happen if this decision IS made?
- **Q2:** What will happen if this decision is NOT made?
- **Q3:** What WON'T happen if this decision IS made?
- **Q4:** What WON'T happen if this decision is NOT made?

Each question holds an array of user-supplied arguments. The AI service suggests additional arguments per question given the decision title as context.

### Internationalization

Angular i18n with `@angular/localize`. Locale source files in `src/i18n/`. Run `npm run locale` to extract new translation units. Use `npm run start:ua` for the Ukrainian build during development.

## Deployment

**Production URL:** `https://descartes-square.bishko.site` (Cloudflare DNS → server port 80)

**Docker images** are published to GHCR on every push to `master` via `.github/workflows/deploy.yml`:

- `ghcr.io/bishko86/descartes-square-frontend:latest`
- `ghcr.io/bishko86/descartes-square-api:latest`

**Services:** `Dockerfile.frontend` (Nginx + Angular i18n builds), `Dockerfile.api` (NestJS + bcrypt native addons), `mongo:7` — orchestrated by `docker-compose.yml`.

**Angular i18n build output** (production): `dist/descartes-square/{en,uk}/browser/`
Nginx serves `/en/*` and `/uk/*` from those folders. `/` redirects to `/en/`. API requests to `/api/*` are proxied to the `api` container on port 3000.

**On the production server** (`/opt/descartes-square/`):

1. Place `docker-compose.yml` and a `.env` file with the secrets from `.env.example`
2. Deploy manually on the server: `docker compose pull && docker compose up -d --remove-orphans && docker image prune -f`

**CORS origin** is controlled by the `CORS_ORIGIN` env var (set in `.env`). Defaults to `http://localhost:4200` in dev.

## Claude Code Hooks

This repo uses Claude Code hooks (`.claude/settings.local.json`) that run automatically:

- **Pre-tool:** Query validation before Write/Edit operations
- **Post-tool:** Prettier formatting + TypeScript type-check after file edits

Copy `.claude/settings.example.json` → `.claude/settings.local.json` and update absolute paths to enable hooks.
