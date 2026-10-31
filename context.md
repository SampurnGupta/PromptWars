# Project Context — Gamified AI Productivity Platform (PromptWars)

*Single Source of Truth for Architecture, Progress, Decisions, and Operational State.*
*Last Updated: 2026-10-31*

---

## 1. Project Objectives & Finalized Scope
PromptWars transforms repetitive, high-friction digital chores into a rewarding, interactive experience. Genuine real-world chores execute automatically in the background while users engage with a two-stage gamification puzzle.

### Core Deliverables Status
1. **Homepage with Stage 1 Gamification**: Visual representation of digital clutter as 4 scattered puzzle quadrants; pieces assemble automatically as the user completes 4 productivity verticals (25% each, 250 XP each) revealing slices of a curated scenic master artwork. **[COMPLETED & TESTED]**
2. **Four Productivity Verticals**:
   - **Email Management (`/email`)**: Classify unread Primary emails in Gmail, star high-priority/action items, mark newsletters/promotions as read, send structured summary digest via Gmail API, with selective checkbox approval and email inspection modal. **[COMPLETED & TESTED]**
   - **File & Folder Organization (`/files`)**: Natural language intent converted to structured action plans with native browser **File System Access API** directory execution and universal ZIP upload/reorganized download fallback. **[COMPLETED & TESTED]**
   - **Expense Tracking (`/expenses`)**: Natural language (text or speech) expense entry extracted into structured data and synchronized into Google Sheets with a live spending dashboard, instant search, category filters, and CSV export. **[COMPLETED & TESTED]**
   - **AI-Powered Lint Fixing (`/lint`)**: Code uploaded via local files, live code scratchpad, or public GitHub repo; errors detected across JS, TS, Python, and JSON, with before/after diffs and downloadable ZIP. **[COMPLETED & TESTED]**
3. **Stage 2 Gamification (Final Reward)**: Upon 4/4 completion (1000 XP), a separate interactive Manual Puzzle Challenge unlocks, allowing the user to solve a shuffled scenic/typography tile puzzle with Web Audio API sound effects, confetti celebrations, and cycle reset. **[COMPLETED & TESTED]**
4. **Google Cloud Run Ready Deployment**: Dockerized standalone container, `/api/health` monitoring, secure demo credentials on backend, clean responsive UI matching the requested cobalt/eggshell aesthetic (`#0755B5`, `#F4F2E8`). **[COMPLETED & TESTED]**
5. **Phase 12 Polish & Audio**: Zero-dependency Web Audio API synthesizer (`lib/sound.ts`) for tactile clicks, quadrant snaps, and celebration chimes with audio mute toggle in the navigation bar. **[COMPLETED & TESTED]**
6. **Phase 13 ChoreCraft Brand Elevation & Dynamic Web Artworks**: User `favicon.png` integration, platform brand elevation to **ChoreCraft**, automatic 12:00 AM IST progress tracker rollover, dynamic random internet photography loaded on every page load with instant re-roll control, scattered canvas pieces with rotational/translational offsets, and streamlined hero/footer decluttering. **[COMPLETED & TESTED]**
7. **Phase 14 Google Sheets Financial AI Copilot & Setup Guide**: Implemented interactive Financial AI Chatbot in `/expenses` connected to Google Sheet (`Expenses!A:H`) capable of querying trends and executing real-world row additions, edits, and deletions; enhanced lint engine with LLM refactoring; published `SETUP_GUIDE.md` and `.env.local` template for real Gemini, Sheets, and Gmail keys. **[COMPLETED & TESTED]**
8. **Phase 15 Initial Product Loader Animation & Cloud Deployment Automation**: Implemented `InitialProductLoader.tsx` with user-provided `product_loader.gif` executing strictly on first platform visit; built `cloudbuild.yaml` and `.github/workflows/cloud-run.yml` for automated Google Cloud Run continuous deployment. **[COMPLETED & TESTED]**
9. **Phase 16 Automated AI Judge & Evaluator Manifests**: Deployed `public/robots.txt`, `public/bots.txt`, `public/ai.txt`, `public/llms.txt`, `public/llms-full.txt`, `public/openapi.json`, and `/api/evaluation` route; published comprehensive `JUDGE.md` evaluation dossier with 50 passing automated test assertions. **[COMPLETED & TESTED]**
10. **Phase 17 Code Quality & Efficiency Optimization (Top 10 Push)**: 
    - Full ESLint configuration (`.eslintrc.json`) with `next/core-web-vitals` passing with 0 warnings / 0 errors.
    - 100% migration from HTML `<a>` tags to Next.js `<Link>` across all 7 views to leverage client-side prefetching, SPA routing, and avoid full-page reload penalties.
    - Optimized Next.js `<Image>` usage with WebP/AVIF formats and lazy loading.
    - Code splitting via `next/dynamic` for heavy client components (`ManualPuzzleModal`, `ExpenseChatbot`).
    - Enhanced `next.config.ts` with HTTP compression, security headers (`nosniff`, `DENY`), disabled `poweredByHeader`, and aggressive static asset caching (`immutable`, `stale-while-revalidate`).
    - Expanded test suite to 54 passing assertions in `scripts/test-api.mjs`. **[COMPLETED & TESTED]**

---

## 2. Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS with custom Nualt palette:
  - Cobalt Accent: `#0755B5`
  - Parchment / Eggshell Canvas: `#F4F2E8`
  - Slate Dark Text: `#0F172A`
  - Border/Muted: `#E2DFD2`
  - Emerald Success: `#10B981`
- **Icons**: Lucide React
- **Audio**: Web Audio API oscillator synthesis (tile clicks, quadrant snapping, victory fanfare)
- **Animations / Effects**: Canvas Confetti, CSS keyframes
- **UI Architecture**: Component-driven, semantic HTML5, high-contrast, fully keyboard and screen-reader accessible.

### Backend & Shared Services
- **Runtime**: Next.js Node.js Serverless Route Handlers (`app/api/*`)
- **Shared AI Service**: Modular adapter supporting Google Gemini (`gemini-1.5-flash`) and Groq (`llama-3.3-70b-versatile`) with structured JSON schema outputs and deterministic heuristic fallback.
- **Shared Integration Layer**: `googleapis` (Gmail API v1, Google Sheets API v4), `jszip` for archive handling, `whatsapp.ts` dispatcher.
- **Shared Gamification Engine**: Deterministic XP calculation (250 XP/task, 1000 XP max), cycle tracking, milestone state machine.

---

## 3. Operational & Testing Verification

1. **ESLint Static Code Quality Check (`npm run lint`)**:
   - `next lint` with `eslint-config-next` & `next/core-web-vitals` -> **0 errors, 0 warnings**.
2. **TypeScript Typecheck**:
   - `npx tsc --noEmit` -> Exited with code 0 (zero errors).
3. **Next.js Standalone Production Build**:
   - `npm run build` -> 24 routes compiled successfully with standalone trace outputs and zero build errors.
4. **Automated API & Security Test Suite (`npm test`)**:
   - `node scripts/test-api.mjs` -> **54 of 54 assertions passed (100%)** across 10 test suites including health, AI services, Google integrations, evaluation endpoint, and security response headers.
5. **Automated Headless Chrome Browser Suite (`npm run test:browser`)**:
   - `node scripts/test-browser.mjs` -> 5 views tested via Chrome with full screenshots captured.
6. **Automated Full-Cycle Walkthrough (`npm run test:cycle`)**:
   - `node scripts/test-full-cycle.mjs` -> Fully automated 7-step sequence executing all 4 chores, verifying 100% assembly, and capturing the unlocked Stage 2 manual puzzle challenge modal.
7. **Git Repository Footprint**:
   - Ultra-lightweight: ~180 KiB total tracked size (far below the 10 MB hackathon ceiling).
