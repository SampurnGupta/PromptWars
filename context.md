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

1. **TypeScript Typecheck**:
   - `npx tsc --noEmit` -> Exited with code 0 (zero errors).
2. **Next.js Standalone Production Build**:
   - `npm run build` -> 20 routes compiled successfully with standalone trace outputs in 39.8s.
3. **Automated API Test Suite (`npm test`)**:
   - `node scripts/test-api.mjs` -> 33 of 33 assertions passed (Health, Expense extraction, Expense sync, Email fetch & process, File planning, Lint analyze & fix, Gamification state).
4. **Automated Headless Chrome Browser Suite (`npm run test:browser`)**:
   - `node scripts/test-browser.mjs` -> 5 views tested via Chrome with full screenshots captured.
5. **Automated Full-Cycle Walkthrough (`npm run test:cycle`)**:
   - `node scripts/test-full-cycle.mjs` -> Fully automated 7-step sequence executing all 4 chores, verifying 100% assembly, and capturing the unlocked Stage 2 manual puzzle challenge modal.
6. **Git Repository Footprint**:
   - Ultra-lightweight: ~180 KiB total tracked size (far below the 10 MB hackathon ceiling).
