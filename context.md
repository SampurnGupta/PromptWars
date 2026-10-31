# Project Context — Gamified AI Productivity Platform (PromptWars)

*Single Source of Truth for Architecture, Progress, Decisions, and Operational State.*
*Last Updated: 2026-10-31*

---

## 1. Project Objectives & Finalized Scope
PromptWars transforms repetitive, high-friction digital chores into a rewarding, interactive experience. Genuine real-world chores execute automatically in the background while users engage with a two-stage gamification puzzle.

### Core Deliverables Status
1. **Homepage with Stage 1 Gamification**: Visual representation of digital clutter as 4 scattered puzzle quadrants; pieces assemble automatically as the user completes 4 productivity verticals (25% each, 250 XP each) revealing slices of a curated scenic master artwork. **[COMPLETED & TESTED]**
2. **Four Productivity Verticals**:
   - **Email Management (`/email`)**: Classify unread Primary emails in Gmail, star high-priority/action items, mark newsletters/promotions as read, send structured summary digest via Gmail API. **[COMPLETED & TESTED]**
   - **File & Folder Organization (`/files`)**: Natural language intent converted to structured action plans with native browser **File System Access API** directory execution and universal ZIP upload/reorganized download fallback. **[COMPLETED & TESTED]**
   - **Expense Tracking (`/expenses`)**: Natural language (text or speech) expense entry extracted into structured data and synchronized into Google Sheets with a visual spending dashboard. **[COMPLETED & TESTED]**
   - **AI-Powered Lint Fixing (`/lint`)**: Code uploaded via local files or fetched from a public GitHub repo; errors detected and fixed by AI with before/after diffs and downloadable ZIP. **[COMPLETED & TESTED]**
3. **Stage 2 Gamification (Final Reward)**: Upon 4/4 completion (1000 XP), a separate interactive Manual Puzzle Challenge unlocks, allowing the user to solve a shuffled scenic/typography tile puzzle with confetti celebrations and cycle reset. **[COMPLETED & TESTED]**
4. **Google Cloud Run Ready Deployment**: Dockerized standalone container, `/api/health` monitoring, secure demo credentials on backend, clean responsive UI matching the requested cobalt/eggshell aesthetic (`#0755B5`, `#F4F2E8`). **[COMPLETED & TESTED]**
5. **Stretch P2 Integrations**: WhatsApp notification dispatcher layer (`lib/integrations/whatsapp.ts`) for mobile notification delivery. **[COMPLETED & TESTED]**

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
- **Animations / Effects**: Canvas Confetti, CSS keyframes
- **UI Architecture**: Component-driven, semantic HTML5, high-contrast, fully keyboard and screen-reader accessible.

### Backend & Shared Services
- **Runtime**: Next.js Node.js Serverless Route Handlers (`app/api/*`)
- **Shared AI Service**: Modular adapter supporting Google Gemini (`gemini-1.5-flash`) and Groq (`llama-3.3-70b-versatile`) with structured JSON schema outputs and deterministic heuristic fallback.
- **Shared Integration Layer**: `googleapis` (Gmail API v1, Google Sheets API v4), `jszip` for archive handling, `whatsapp.ts` dispatcher.
- **Shared Gamification Engine**: Deterministic XP calculation (250 XP/task, 1000 XP max), cycle tracking, milestone state machine.

---

## 3. Operational & Testing Verification

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` -> Exited with code 0 (zero errors).
2. **Next.js Production Build**:
   - `npm run build` -> All 20 routes compiled successfully with standalone trace outputs in 31.6s.
3. **Automated API Test Suite (`npm test`)**:
   - `node scripts/test-api.mjs` -> 33 of 33 assertions passed (Health, Expense extraction, Expense sync, Email fetch & process, File planning, Lint analyze & fix, Gamification state).
4. **Automated Headless Chrome Browser E2E Suite (`npm run test:browser`)**:
   - `node scripts/test-browser.mjs` -> 5 views tested via Chrome with full screenshots captured (Homepage, Expenses, Email, Files, Lint).
5. **Git Repository Footprint**:
   - Ultra-lightweight: ~120 KiB total tracked size (far below the 10 MB hackathon ceiling).
