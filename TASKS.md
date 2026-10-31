# Implementation Roadmap — Gamified AI Productivity Platform (PromptWars)

## Priority Definitions
- **P0**: Mandatory for submission (Core MVP, 4 functional verticals, 2-stage gamification, Cloud Run readiness).
- **P1**: Important improvements (Polish, deeper validations, UX refinements, enhanced diffs).
- **P2**: Optional enhancements (WhatsApp integration, advanced animations, additional lint rules).

---

## Phase 1: Requirement Finalization & Project Setup
- [x] **TASK-1.1** [P0] Initialize Next.js (App Router, TypeScript, Tailwind CSS, Lucide icons).
  - *Dependencies*: None
  - *Status*: Completed. Next.js 15 + React 19 + TypeScript + Tailwind configured with standalone output.
- [x] **TASK-1.2** [P0] Configure environment variables and `.env.example`.
  - *Dependencies*: TASK-1.1
  - *Status*: Completed. `.env.example` defined with all necessary variables and security notes.
- [x] **TASK-1.3** [P0] Create Health Check endpoint (`/api/health`) and Dockerfile for Cloud Run.
  - *Dependencies*: TASK-1.1
  - *Status*: Completed. Multi-stage Dockerfile and verified `/api/health` diagnostic route created.

---

## Phase 2: Design System & Shared UI Foundations
- [x] **TASK-2.1** [P0] Implement Nualt-inspired Design System (#0755B5, #F4F2E8, typography, responsive layout).
  - *Dependencies*: TASK-1.1
  - *Status*: Completed. Custom color tokens, typography, and responsive styles configured in `tailwind.config.ts` and `app/globals.css`.
- [x] **TASK-2.2** [P0] Build App Navigation & Layout Shell.
  - *Dependencies*: TASK-2.1
  - *Status*: Completed. `Navbar.tsx`, `DemoBanner.tsx`, and `Footer.tsx` integrated with live XP and cycle status tracking.

---

## Phase 3: Shared Backend & Core Services
- [x] **TASK-3.1** [P0] Shared AI Service (`lib/ai/`).
  - *Dependencies*: TASK-1.2
  - *Status*: Completed. Modular adapter supporting Gemini, Groq, and deterministic heuristic fallback with prompt sanitization.
- [x] **TASK-3.2** [P0] Shared Gamification Engine (`lib/gamification/`).
  - *Dependencies*: TASK-1.1
  - *Status*: Completed. Deterministic XP tracking (250 XP/task, 1000 XP total), cycle reset, and duplicate prevention.
- [x] **TASK-3.3** [P0] Shared Integration Client (`lib/integrations/`).
  - *Dependencies*: TASK-1.2
  - *Status*: Completed. Gmail API and Google Sheets API integration with graceful sandbox fallback mode.

---

## Phase 4: Stage 1 Gamification & Interactive Homepage
- [x] **TASK-4.1** [P0] Build Homepage Hero & Scattered Puzzle Canvas.
  - *Dependencies*: TASK-2.2, TASK-3.2
  - *Status*: Completed. Scattered canvas displaying 4 quadrant puzzle pieces with direct links to unfinished verticals.
- [x] **TASK-4.2** [P0] Wire Deterministic Puzzle Assembly & Progress Bar.
  - *Dependencies*: TASK-4.1, TASK-3.2
  - *Status*: Completed. Pieces dynamically snap into place on chore completion with illuminated badges and +250 XP.

---

## Phase 5: Productivity Vertical 1 — Expense Tracking
- [x] **TASK-5.1** [P0] Expense Extraction AI Engine (`/api/expenses/extract`).
  - *Dependencies*: TASK-3.1
  - *Status*: Completed. Natural language parser with Web Speech API support.
- [x] **TASK-5.2** [P0] Google Sheets Integration (`/api/expenses/sync`).
  - *Dependencies*: TASK-3.3, TASK-5.1
  - *Status*: Completed. Writes validated transaction rows to Google Sheets and serves dashboard analytics.
- [x] **TASK-5.3** [P0] Expense Tracking UI & Dashboard (`/expenses`).
  - *Dependencies*: TASK-5.1, TASK-5.2
  - *Status*: Completed. Full view with speech recognition, transaction table, and category distribution.

---

## Phase 6: Productivity Vertical 2 — Email Management
- [x] **TASK-6.1** [P0] Gmail API Client & Email Fetcher (`/api/email/fetch`).
  - *Dependencies*: TASK-3.3
  - *Status*: Completed. Retrieves unread primary emails with metadata headers.
- [x] **TASK-6.2** [P0] Email AI Classification & Action Planner (`/api/email/process`).
  - *Dependencies*: TASK-3.1, TASK-6.1
  - *Status*: Completed. Stars important deadline emails and marks promotional spam as read.
- [x] **TASK-6.3** [P0] Summary Generator & Gmail Dispatcher (`/api/email/summary`).
  - *Dependencies*: TASK-6.2
  - *Status*: Completed. Dispatches email digest via Gmail API.
- [x] **TASK-6.4** [P0] Email Management UI (`/email`).
  - *Dependencies*: TASK-6.1, TASK-6.2, TASK-6.3
  - *Status*: Completed. Complete inbox view with priority badges and action item summaries.

---

## Phase 7: Productivity Vertical 3 — File & Folder Organization
- [x] **TASK-7.1** [P0] File Organization Engine (`/api/files/plan`).
  - *Dependencies*: TASK-3.1
  - *Status*: Completed. Natural language intent to structured directory action planner.
- [x] **TASK-7.2** [P0] Browser File System Access API Implementation (`/files`).
  - *Dependencies*: TASK-7.1
  - *Status*: Completed. Interactive directory picker, plan preview, and execution confirmation.
- [x] **TASK-7.3** [P0] ZIP Archive Fallback Mode (`/api/files/zip-organize`).
  - *Dependencies*: TASK-7.1
  - *Status*: Completed. Server-side ZIP upload that reorganizes and returns a reorganized archive.
- [x] **TASK-7.4** [P0] File Organization UI & Gamification Trigger.
  - *Dependencies*: TASK-7.2, TASK-7.3
  - *Status*: Completed. UI with side-by-side moves and duplicate detection.

---

## Phase 8: Productivity Vertical 4 — AI-Powered Lint Fixing
- [x] **TASK-8.1** [P0] Code Analysis & Lint Error Extraction (`/api/lint/analyze`).
  - *Dependencies*: TASK-3.1
  - *Status*: Completed. AST/regex rule engine scanning `no-console`, `no-var`, `eqeqeq`, and typing issues.
- [x] **TASK-8.2** [P0] AI Code Repair & Verification Engine (`/api/lint/fix`).
  - *Dependencies*: TASK-3.1, TASK-8.1
  - *Status*: Completed. Auto-repairs violations, preserves program logic, and outputs clean diffs.
- [x] **TASK-8.3** [P0] GitHub Public Repo Ingestion (`/api/lint/github`).
  - *Dependencies*: TASK-8.1, TASK-8.2
  - *Status*: Completed. Validates GitHub URL with SSRF guards and extracts files.
- [x] **TASK-8.4** [P0] Lint Fixing UI (`/lint`).
  - *Dependencies*: TASK-8.1, TASK-8.2, TASK-8.3
  - *Status*: Completed. Before/after diff viewer with downloadable corrected ZIP archive.

---

## Phase 9: Stage 2 Gamification — Manual Puzzle Challenge
- [x] **TASK-9.1** [P0] Manual Puzzle Engine (`components/puzzle/ManualPuzzleModal.tsx`).
  - *Dependencies*: TASK-4.2, TASK-3.2
  - *Status*: Completed. Interactive 3x3 tile sliding puzzle unlocked exclusively upon 4/4 task completion.
- [x] **TASK-9.2** [P0] Artwork Selection & Responsive Interaction.
  - *Dependencies*: TASK-9.1
  - *Status*: Completed. Move counter, timer, reference goal preview, celebratory confetti, and cycle reset.

---

## Phase 10: Testing, Hardening & Security
- [x] **TASK-10.1** [P0] End-to-End Workflow & Unit Testing.
  - *Dependencies*: All Phase 4-9 tasks
  - *Status*: Completed. Verified TypeScript typecheck (`tsc --noEmit`), Next.js production build (`next build`), and route responses.
- [x] **TASK-10.2** [P0] Security & Prompt Injection Audit.
  - *Dependencies*: TASK-10.1
  - *Status*: Completed. Sanitization on LLM inputs, zip path traversal guards, SSRF protection on GitHub URLs.

---

## Phase 11: Google Cloud Run Deployment & Documentation
- [x] **TASK-11.1** [P0] Container Optimization & Cloud Run Readiness.
  - *Dependencies*: TASK-1.3, TASK-10.2
  - *Status*: Completed. Multi-stage Dockerfile verified with standalone trace output.
- [x] **TASK-11.2** [P0] Documentation & README Finalization.
  - *Dependencies*: TASK-11.1
  - *Status*: Completed. Comprehensive `README.md` created with architectural diagrams and setup guides.
- [ ] **TASK-11.3** [P1/P2] Stretch Polish (WhatsApp integration design, sound effects, advanced metrics).
