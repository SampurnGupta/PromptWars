# PromptWars — Gamified AI Productivity Platform

> **Transform tedious digital chores into a rewarding, two-stage interactive puzzle experience. Real chores executed in the background through verified AI workflows.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Cloud Run](https://img.shields.io/badge/Google%20Cloud-Run%20Ready-4285F4?style=flat&logo=google-cloud)](https://cloud.google.com/run)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Problem Statement

Every knowledge worker procrastinates on repetitive, high-friction digital maintenance:
- Sifting through hundreds of unread marketing emails to find crucial deadline notices.
- Keeping track of casual daily receipts, UPI expenses, and bills in spreadsheets.
- Untangling chaotic `Downloads` directories filled with duplicate files and random versions.
- Hunting down syntax, type, and formatting lint errors scattered across codebases.

**PromptWars** eliminates procrastination by replacing chore friction with game-loop gratification. Instead of dreading digital maintenance, users trigger focused background AI automations that execute genuine operations while unlocking a satisfying two-stage gamification puzzle.

---

## 2. Product Overview & Architecture

```
                                +--------------------------------------------+
                                |          PromptWars Frontend Shell         |
                                |     Nualt Design System (#0755B5/#F4F2E8)  |
                                +----------------------+---------------------+
                                                       |
                          +----------------------------+----------------------------+
                          |                                                         |
                          v                                                         v
         +--------------------------------+                        +--------------------------------+
         |     Stage 1: Scattered Canvas  |                        |    Stage 2: Manual Puzzle      |
         |  4 Quadrants assemble on chore |                        |   Unlocked upon 4/4 completion |
         |   completion (+250 XP each)    |                        |     Tile swap sliding challenge|
         +----------------+---------------+                        +--------------------------------+
                          |
                          | (Triggers Verified Background Operations)
                          v
         +------------------------------------------------------------------------------------------+
         |                                Shared Service Monolith                                   |
         |  Next.js 15 Standalone Container • Google Cloud Run Ready • Deterministic Gamification   |
         +-------------+-----------------------+---------------------+------------------------------+
                       |                       |                     |
                       v                       v                     v
            +--------------------+   +--------------------+   +--------------------+
            |  Shared AI Engine  |   | Integration Layer  |   |  Browser / Client  |
            |  Gemini / Groq /   |   | Gmail API / Sheets |   | FileSystem Access  |
            |  Structured JSON   |   | API / GitHub API   |   | API & ZIP Fallback |
            +--------------------+   +--------------------+   +--------------------+
```

---

## 3. The Four Productivity Verticals

### 1. Email Inbox Intelligence (`/email`)
- **Scope**: Scans unread emails in the **Primary** inbox category.
- **AI Classification**: Distinguishes actionable, high-priority correspondence (deadlines, contracts, bills, academic notices) from promotional noise (flash sales, marketing newsletters).
- **Verified Operations**: Stars important emails and extracts concrete action items with due dates; automatically marks marketing spam as read (never deletes).
- **Summary Digest**: Dispatches a structured cleanup digest via the **Gmail API** to the user's inbox and displays it on the dashboard.

### 2. Natural Language Expense Tracking (`/expenses`)
- **Natural Language Input**: Type casual phrases (*"Spent ₹450 on lunch with team"*, *"Paid ₹1,200 for electricity yesterday via UPI"*) or use the Web Speech microphone button.
- **AI Structured Parsing**: Extracts amount, currency, category, date, payment method, and description with strict schema validation.
- **Google Sheets Synchronization**: Appends validated transaction records directly to Google Sheets (`Expenses!A:H`) and displays a live spending dashboard.

### 3. AI File & Folder Reorganizer (`/files`)
- **Natural Language Intent**: Declare desired structures (*"Group academic PDFs together and identify duplicate files"*).
- **Dual Execution Engine**:
  - **Browser Native**: Direct file restructuring via the browser's `showDirectoryPicker()` (File System Access API).
  - **Universal Fallback**: Server-side ZIP upload that categorizes and returns a clean reorganized archive for immediate download.
- **Safety First**: Never deletes files; flags duplicate copies (*e.g., `report (1).pdf`*) for user review.

### 4. AI-Powered Lint & Code Repair (`/lint`)
- **Flexible Ingestion**: Upload code files or provide any public GitHub repository URL (`https://github.com/owner/repo`) with built-in SSRF guards.
- **Rule Engine**: Scans for real production code defects: `no-console`, `no-var`, loose equality `==`, trailing spaces, and untyped `any`.
- **Targeted AI Repair**: Produces side-by-side interactive code diffs preserving program logic, and generates a downloadable ZIP of the corrected codebase.

---

## 4. Two-Stage Gamification System

| Stage | Mode | Mechanic | Reward |
|---|---|---|---|
| **Stage 1** | **Productivity Assembly** | Homepage displays 4 floating, scattered puzzle quadrants. As each vertical succeeds, its quadrant smoothly snaps into place. | **+250 XP** per vertical (1,000 XP max per cycle). |
| **Stage 2** | **Manual Puzzle Challenge** | Unlocked **only** when all 4 tasks are complete (100%). Users solve an interactive tile-sliding puzzle. | Move counter, timer, confetti celebration, and cycle restart option. |

---

## 5. Technology Stack & Design System

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Color Palette**: Inspired by [nualt.fr](https://nualt.fr/en):
  - Cobalt Accent: `#0755B5`
  - Parchment / Eggshell Canvas: `#F4F2E8`
  - Slate Charcoal Text: `#0F172A`
  - Subtle Border: `#E2DFD2`
  - Emerald Confirmation: `#10B981`
- **Backend**: Next.js Serverless Route Handlers, Node.js v22.
- **Shared AI Service**: Google Gemini API (`@google/generative-ai`) and Groq (`groq-sdk`) with structured JSON validation and prompt injection sanitization.
- **Integrations**: `googleapis` (Gmail API v1, Google Sheets API v4), `jszip`.
- **Target Deployment**: Google Cloud Run (multi-stage Docker container).

---

## 6. Environment Variables

Create `.env.local` using `.env.example`:

```bash
# AI Model Provider
GEMINI_API_KEY="your-google-ai-studio-gemini-key"
GROQ_API_KEY="your-groq-api-key"
AI_PROVIDER="gemini" # Options: "gemini" | "groq"

# Demo Mode & Integration Toggles
DEMO_MODE=true

# Google Service Account / Backend Credentials
GOOGLE_SERVICE_ACCOUNT_EMAIL="demo-account@promptwars-prod.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID="your_google_sheet_id_here"
DEMO_GMAIL_ADDRESS="demo.promptwars@gmail.com"

# Server Port
PORT=8080
```

---

## 7. Local Setup & Execution

### Prerequisites
- Node.js 20+ or 22+
- npm 10+

### Steps
```bash
# 1. Clone repository
git clone https://github.com/SampurnGupta/PromptWars.git
cd PromptWars

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Testing & Validation

```bash
# Type check TypeScript codebase
npx tsc --noEmit

# Production build check (standalone traces)
npm run build

# Test health check endpoint
curl http://localhost:3000/api/health
```

---

## 9. Google Cloud Run Deployment

PromptWars includes an optimized multi-stage `Dockerfile`:

```bash
# Build Docker image
docker build -t promptwars:latest .

# Run container locally on port 8080
docker run -p 8080:8080 --env-file .env.local promptwars:latest

# Deploy to Google Cloud Run
gcloud run deploy promptwars \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

---

## 10. Security & Privacy

1. **Backend-Only Secrets**: Google API credentials, private keys, and LLM tokens remain exclusively on the server. Zero tokens are transmitted to the browser client.
2. **Untrusted Input Protection**: Prompt injection guards sanitize emails, user inputs, and uploaded repositories before passing to models.
3. **SSRF Guard**: GitHub repository fetching strictly whitelists `github.com` and validates path segments.
4. **Path Traversal Protection**: ZIP archive handling validates entries to prevent directory traversal attacks (`../`).
5. **Least Privilege**: Gmail API uses read/modify scopes; deletion is completely prohibited.

---

## 11. Evaluation Checklist

- [x] Responsive, professional Nualt-inspired UI (#0755B5, #F4F2E8).
- [x] Four functional productivity verticals with real-world background execution.
- [x] Deterministic XP & Stage 1 automatic puzzle assembly.
- [x] Stage 2 manual interactive puzzle challenge unlocked after 4/4 completion.
- [x] Shared AI client with Google Gemini & Groq fallback adapters.
- [x] Shared Google Sheets & Gmail API integration layer.
- [x] Production Dockerfile and `/api/health` monitoring ready for Google Cloud Run.
- [x] Repository footprint well under 10MB.

