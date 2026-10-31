# Implementation Roadmap — Gamified AI Productivity Platform (PromptWars)

## Priority Definitions
- **P0**: Mandatory for submission (Core MVP, 4 functional verticals, 2-stage gamification, Cloud Run readiness).
- **P1**: Important improvements (Polish, deeper validations, UX refinements, enhanced diffs).
- **P2**: Optional enhancements (WhatsApp integration, advanced animations, additional lint rules).

---

## Phase 1: Requirement Finalization & Project Setup
- [x] **TASK-1.1** [P0] Initialize Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons).
- [x] **TASK-1.2** [P0] Configure environment variables and `.env.example`.
- [x] **TASK-1.3** [P0] Create Health Check endpoint (`/api/health`) and Dockerfile for Cloud Run.

---

## Phase 2: Design System & Shared UI Foundations
- [x] **TASK-2.1** [P0] Implement Nualt-inspired Design System (#0755B5, #F4F2E8, typography, responsive layout).
- [x] **TASK-2.2** [P0] Build App Navigation & Layout Shell.

---

## Phase 3: Shared Backend & Core Services
- [x] **TASK-3.1** [P0] Shared AI Service (`lib/ai/`).
- [x] **TASK-3.2** [P0] Shared Gamification Engine (`lib/gamification/`).
- [x] **TASK-3.3** [P0] Shared Integration Client (`lib/integrations/`).

---

## Phase 4: Stage 1 Gamification & Interactive Homepage
- [x] **TASK-4.1** [P0] Build Homepage Hero & Scattered Puzzle Canvas.
- [x] **TASK-4.2** [P0] Wire Deterministic Puzzle Assembly & Progress Bar.

---

## Phase 5: Productivity Vertical 1 — Expense Tracking
- [x] **TASK-5.1** [P0] Expense Extraction AI Engine (`/api/expenses/extract`).
- [x] **TASK-5.2** [P0] Google Sheets Integration (`/api/expenses/sync`).
- [x] **TASK-5.3** [P0] Expense Tracking UI & Dashboard (`/expenses`).

---

## Phase 6: Productivity Vertical 2 — Email Management
- [x] **TASK-6.1** [P0] Gmail API Client & Email Fetcher (`/api/email/fetch`).
- [x] **TASK-6.2** [P0] Email AI Classification & Action Planner (`/api/email/process`).
- [x] **TASK-6.3** [P0] Summary Generator & Gmail Dispatcher (`/api/email/summary`).
- [x] **TASK-6.4** [P0] Email Management UI (`/email`).

---

## Phase 7: Productivity Vertical 3 — File & Folder Organization
- [x] **TASK-7.1** [P0] File Organization Engine (`/api/files/plan`).
- [x] **TASK-7.2** [P0] Browser File System Access API Implementation (`/files`).
- [x] **TASK-7.3** [P0] ZIP Archive Fallback Mode (`/api/files/zip-organize`).
- [x] **TASK-7.4** [P0] File Organization UI & Gamification Trigger.

---

## Phase 8: Productivity Vertical 4 — AI-Powered Lint Fixing
- [x] **TASK-8.1** [P0] Code Analysis & Lint Error Extraction (`/api/lint/analyze`).
- [x] **TASK-8.2** [P0] AI Code Repair & Verification Engine (`/api/lint/fix`).
- [x] **TASK-8.3** [P0] GitHub Public Repo Ingestion (`/api/lint/github`).
- [x] **TASK-8.4** [P0] Lint Fixing UI (`/lint`).

---

## Phase 9: Stage 2 Gamification — Manual Puzzle Challenge
- [x] **TASK-9.1** [P0] Manual Puzzle Engine (`components/puzzle/ManualPuzzleModal.tsx`).
- [x] **TASK-9.2** [P0] Artwork Selection & Responsive Interaction.

---

## Phase 10: Testing, Hardening & Security
- [x] **TASK-10.1** [P0] End-to-End Workflow & Unit Testing.
- [x] **TASK-10.2** [P0] Security & Prompt Injection Audit.

---

## Phase 11: Google Cloud Run Deployment & Documentation
- [x] **TASK-11.1** [P0] Container Optimization & Cloud Run Readiness.
- [x] **TASK-11.2** [P0] Documentation & README Finalization.
- [x] **TASK-11.3** [P1/P2] Stretch Polish (WhatsApp integration design, sound effects, advanced metrics).

---

## Phase 12: Advanced Vertical Features & Complete Gamified Cycle
- [x] **TASK-12.1** [P1] Web Audio API Audio Synthesizer (`lib/sound.ts`) for tactile clicks, quadrant snaps, and celebration chimes.
- [x] **TASK-12.2** [P1] Interactive Code Lint Scratchpad & Multi-Language (Python/JSON/TS) rule additions in `/lint`.
- [x] **TASK-12.3** [P1] Expense search, category filtering & CSV ledger download in `/expenses`.
- [x] **TASK-12.4** [P1] Email selective batch approval checkboxes & detail inspection modal in `/email`.
- [x] **TASK-12.5** [P1] Automated End-to-End Full Cycle Browser Walkthrough script (`scripts/test-full-cycle.mjs`).

---

## Phase 13: ChoreCraft Brand Elevation, Dynamic Web Artworks & 12 AM IST Rollover
- [x] **TASK-13.1** [P1] Add user-provided `favicon.png` and wire app metadata (`app/layout.tsx`).
- [x] **TASK-13.2** [P1] Brand elevation from PromptWars to **ChoreCraft** across Navbar, Footer, and Page metadata.
- [x] **TASK-13.3** [P1] Automated 12:00 AM IST midnight progress tracker rollover using IANA timezone `Asia/Kolkata`.
- [x] **TASK-13.4** [P1] Dynamic random internet photography selected on every page load (`lib/gamification/artwork.ts`).
- [x] **TASK-13.5** [P1] Scattered interactive puzzle canvas with rotational & translational tilts, hover un-tilt, and live re-roll control.
- [x] **TASK-13.6** [P1] Declutter hero and footer: remove redundant badges and deployment credit lines, rename "Real-World Actions Execution Log" to "Execution log".

---

## Phase 14: Google Sheets Financial AI Copilot, Real Credentials & Setup Guide
- [x] **TASK-14.1** [P0] Google Sheets CRUD Operations: Added `updateExpenseInSheet` and `deleteExpenseFromSheet` in `lib/integrations/sheets.ts`.
- [x] **TASK-14.2** [P0] Financial AI Copilot API: Implemented `/api/expenses/chat` with intelligent tool-calling for querying, adding, updating, and deleting Google Sheet rows.
- [x] **TASK-14.3** [P0] Chatbot UI: Built `components/expenses/ExpenseChatbot.tsx` with live sync status, suggested chips, and real-time ledger updates.
- [x] **TASK-14.4** [P0] LLM-Powered Code Lint Repair: Enhanced `app/api/lint/fix/route.ts` with Gemini/Groq semantic refactoring support alongside deterministic AST rules.
- [x] **TASK-14.5** [P0] Credentials & Setup Guide: Created `SETUP_GUIDE.md` and `.env.local` template with step-by-step walkthrough for obtaining Gemini keys, Google Sheets ID, Service Account JSON, and Gmail tracking.

---

## Phase 15: Initial Product Loader Animation & Cloud Deployment Automation
- [x] **TASK-15.1** [P0] Initial Platform Loader: Created `components/layout/InitialProductLoader.tsx` utilizing user-provided `product_loader.gif` with session persistence, smooth progress bar, and auto-dismiss.
- [x] **TASK-15.2** [P0] Google Cloud Run Build Configuration: Authored `cloudbuild.yaml` for building and deploying containerized standalone image to `gcr.io/$PROJECT_ID/chorecraft`.
- [x] **TASK-15.3** [P0] Continuous Cloud Deployment: Configured `.github/workflows/cloud-run.yml` for automated CI/CD pipeline on push to `main`.
- [x] **TASK-15.4** [P0] Verification: Tested loader behavior via headless browser (`scripts/test-loader.mjs`), confirming single first-load execution and zero reload intrusion.
