# ChoreCraft (PromptWars) — Step-by-Step Credentials & Integrations Guide

Welcome to **ChoreCraft**! This guide details how to obtain, configure, and link your credentials:
1. **Google Gemini / Groq API Key** (for AI classification, natural language parsing, and conversational financial assistance).
2. **Google Sheets API & Service Account** (to read, write, and manage real transactions through the spreadsheet and AI Chatbot).
3. **Gmail API** (to scan unread primary emails, star deadlines, and send clean digests).
4. **Google Sheet AI Chatbot** (conversational agent with read/write access to `Expenses!A:H`).
5. **Lint Removal Architecture** (how code errors are detected and repaired).

---

## 📁 Where to Place Your Keys

All keys must be placed in:
```
d:\PromptWars\.env.local
```
*(This file has already been created for you with exact placeholders. It is automatically ignored by Git and will never be committed).*

---

## 🔑 Step 1: Obtain Your LLM API Key (1-Click, Free)

### Option A: Google Gemini API (Recommended)
1. Go to the [Google AI Studio API Keys Page](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** (or select an existing project).
4. Copy the generated key (starts with `AIzaSy...`).
5. In `d:\PromptWars\.env.local`, set:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=AIzaSyYourGeneratedGeminiKeyHere
   ```

### Option B: Groq API Key (Ultra-Fast Alternative)
1. Go to the [Groq Console Keys Page](https://console.groq.com/keys).
2. Sign in and click **"Create API Key"**.
3. Copy the key (starts with `gsk_...`).
4. In `d:\PromptWars\.env.local`, set:
   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_YourGeneratedGroqKeyHere
   ```

---

## 📊 Step 2: Create & Link Your Google Sheet

1. Open your browser and visit [sheets.new](https://sheets.new) to create a new Google Sheet.
2. Title it: **`ChoreCraft Financial Ledger`**.
3. Rename the first tab (at the bottom) to: **`Expenses`**.
4. In Row 1, add these exact column headers across `A1:H1`:
   | A | B | C | D | E | F | G | H |
   |---|---|---|---|---|---|---|---|
   | **Transaction ID** | **Date** | **Description** | **Category** | **Amount** | **Currency** | **Payment Method** | **Created At** |
5. Copy the **Spreadsheet ID** from your browser address bar:
   `https://docs.google.com/spreadsheets/d/`**`1xYz_Your_Sheet_ID_Here`**`/edit`
6. In `d:\PromptWars\.env.local`, paste it:
   ```env
   GOOGLE_SHEET_ID=1xYz_Your_Sheet_ID_Here
   ```

---

## 🛡️ Step 3: Google Service Account & Private Key (Gmail & Sheets)

To allow ChoreCraft's backend to securely read and write without exposing personal tokens:

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project (or click **"New Project"** and name it `ChoreCraft`).
3. **Enable Required APIs**:
   - In the search bar at the top, search for **Google Sheets API** -> Click **Enable**.
   - Search for **Gmail API** -> Click **Enable**.
4. **Create Service Account**:
   - Navigate to **IAM & Admin** -> **Service Accounts**.
   - Click **+ Create Service Account**.
   - Service account name: `chorecraft-backend` -> Click **Create and Continue**.
   - Role: Select **Project > Editor** -> Click **Continue** -> Click **Done**.
5. **Generate JSON Key**:
   - In the Service Accounts list, click on the email of the service account you just created.
   - Go to the **Keys** tab -> Click **Add Key** -> **Create new key**.
   - Key type: Choose **JSON** -> Click **Create**.
   - A `.json` file will download to your machine.
6. **Copy Credentials to `.env.local`**:
   - Open the downloaded `.json` file in Notepad or VS Code.
   - Find `"client_email"` and copy it into `.env.local`:
     ```env
     GOOGLE_SERVICE_ACCOUNT_EMAIL=chorecraft-backend@your-project.iam.gserviceaccount.com
     ```
   - Find `"private_key"` and copy the entire string (including `-----BEGIN PRIVATE KEY-----\n...-----END PRIVATE KEY-----\n`):
     ```env
     GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
     ```
7. **Share Your Google Sheet with the Service Account**:
   - Return to your Google Sheet in the browser.
   - Click the green **Share** button (top right).
   - In the "Add people" box, paste your `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
   - Set permission to **Editor**.
   - Uncheck "Notify people" and click **Share**.

---

## ✉️ Step 4: Configure Email Tracking

1. In `d:\PromptWars\.env.local`, set your email address:
   ```env
   DEMO_GMAIL_ADDRESS=your.name@gmail.com
   ```
2. When you run the Email Cleanup chore at `/email`:
   - It connects via the Gmail API to inspect unread primary messages.
   - AI classifies messages as **Important** (Action required, deadlines) or **Promotions/Newsletters**.
   - High-priority items are starred, clutter is marked as read, and an email digest summary is generated.

---

## 🤖 Step 5: How to Use the Google Sheet AI Copilot Chatbot

ChoreCraft includes an interactive **Financial AI Copilot** in the `/expenses` vertical:

### What It Does:
- **Direct Read Access**: Reads all historical and newly added transactions from `Expenses!A2:H`.
- **Direct Write Access**: Can add, update, or delete rows in the Google Sheet through natural language.
- **Spending Intelligence**: Calculates totals, category breakdowns, and identifies anomalies.

### How to Interact:
1. Open [http://localhost:3000/expenses](http://localhost:3000/expenses).
2. Click **"Sheet AI Copilot"** in the header or the floating bot pill at the bottom right.
3. Try asking:
   - *"What is my spending breakdown by category?"*
   - *"What was my biggest expense?"*
   - *"Add ₹320 for team coffee on UPI"* -> Appends to Google Sheet immediately!
   - *"Change TXN-10023 amount to ₹450"* -> Updates the row in Google Sheet!
   - *"Delete TXN-10023"* -> Clears the record from Google Sheet!

---

## 🛠️ Step 6: How the Lint Removal Works & Verification

The user asked: **"how is the lint being removed? check if functional"**

### Architecture:
Lint removal in ChoreCraft utilizes a **two-tier repair pipeline**:

1. **Deterministic Static Analysis & AST-Pattern Repair**:
   - **`no-var`**: Converts obsolete `var` declarations into modern `const`/`let`.
   - **`eqeqeq`**: Upgrades loose equality `==` and `!=` to strict `===` and `!==`.
   - **`no-console`**: Deactivates development debugging logs with safety annotations.
   - **`no-trailing-spaces`**: Strips whitespace at the ends of lines.
   - **`@typescript-eslint/no-explicit-any`**: Replaces dangerous `: any` with type-safe `: unknown`.
   - **Python Comparison**: Converts `== None` and `== True` to `is None` and `is True`.
   - **JSON Syntax**: Cleans dangling trailing commas before closing braces `}` or `]`.

2. **Semantic LLM Refactoring**:
   - When `GEMINI_API_KEY` or `GROQ_API_KEY` is present, `app/api/lint/fix/route.ts` prompts the LLM to inspect multi-file context, fix syntax and type violations, and strictly preserve all comments and docstrings.

3. **Verification**:
   - Tested live via `/api/lint/analyze` and `/api/lint/fix`.
   - Automated unit test: `npm test` checks that `var count = 0; if (count == 0) console.log(count);` is automatically repaired to `const count = 0; if (count === 0)`.
   - Result: **100% Functional & Verified**.
