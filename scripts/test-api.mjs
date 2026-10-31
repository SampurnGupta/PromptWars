// Automated Unit & API Integration Test Suite for PromptWars
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(` PromptWars API & Integration Test Suite`);
  console.log(` Testing target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // 1. Health Endpoint
  console.log(`[Test 1] Health Check (/api/health)`);
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, "Health status is 200 OK");
    const json = await res.json();
    assert(json.status === "healthy", "Service status is 'healthy'");
    assert(json.version === "1.0.0", "Service version is '1.0.0'");
  } catch (err) {
    assert(false, `Health check failed: ${err.message}`);
  }

  // 2. Expense Extraction
  console.log(`\n[Test 2] Expense Extraction (/api/expenses/extract)`);
  try {
    const res = await fetch(`${BASE_URL}/api/expenses/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Spent ₹850 on team lunch yesterday" }),
    });
    assert(res.status === 200, "Extraction status is 200 OK");
    const json = await res.json();
    assert(json.success === true, "Extraction success is true");
    assert(json.extracted.amount === 850, "Extracted amount is 850");
    assert(json.extracted.category === "Food & Dining", "Extracted category is Food & Dining");
  } catch (err) {
    assert(false, `Expense extraction failed: ${err.message}`);
  }

  // 3. Expense Sync (POST & GET)
  console.log(`\n[Test 3] Expense Sync & Dashboard (/api/expenses/sync)`);
  try {
    const postRes = await fetch(`${BASE_URL}/api/expenses/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 850,
        currency: "INR",
        category: "Food & Dining",
        description: "Team lunch",
        paymentMethod: "UPI",
      }),
    });
    assert(postRes.status === 200, "Sync write status is 200 OK");
    const postJson = await postRes.json();
    assert(postJson.success === true, "Write operation recorded successfully");
    assert(Boolean(postJson.record.transactionId), "Transaction ID generated");

    const getRes = await fetch(`${BASE_URL}/api/expenses/sync`);
    const getJson = await getRes.json();
    assert(getJson.success === true, "Ledger fetch success is true");
    assert(Array.isArray(getJson.records), "Ledger records returned as array");
    assert(getJson.analytics.totalAmount > 0, "Analytics total amount is calculated");
  } catch (err) {
    assert(false, `Expense sync failed: ${err.message}`);
  }

  // 4. Email Management
  console.log(`\n[Test 4] Email Fetch & Processing (/api/email/fetch & /process)`);
  try {
    const fetchRes = await fetch(`${BASE_URL}/api/email/fetch`);
    assert(fetchRes.status === 200, "Email fetch status is 200 OK");
    const fetchJson = await fetchRes.json();
    assert(Array.isArray(fetchJson.emails), "Emails returned as array");
    assert(fetchJson.totalUnread >= 0, "Total unread count is valid");

    const procRes = await fetch(`${BASE_URL}/api/email/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    assert(procRes.status === 200, "Email processing status is 200 OK");
    const procJson = await procRes.json();
    assert(procJson.success === true, "Processing returned success true");
    assert(typeof procJson.starredCount === "number", "Starred count returned");
    assert(typeof procJson.markedReadCount === "number", "Marked read count returned");
  } catch (err) {
    assert(false, `Email processing failed: ${err.message}`);
  }

  // 5. File Organization Planning
  console.log(`\n[Test 5] File Planning Engine (/api/files/plan)`);
  try {
    const res = await fetch(`${BASE_URL}/api/files/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [{ name: "thesis.pdf" }, { name: "thesis (1).pdf" }, { name: "icon.svg" }],
        prompt: "Organize files by type and identify duplicates",
      }),
    });
    assert(res.status === 200, "File planning status is 200 OK");
    const json = await res.json();
    assert(json.success === true, "Planning success is true");
    assert(json.plan.actions.length === 3, "Plan generated 3 actions");
    assert(json.plan.detectedDuplicates.includes("thesis (1).pdf"), "Duplicate thesis copy detected");
  } catch (err) {
    assert(false, `File planning failed: ${err.message}`);
  }

  // 6. Lint Analysis & Repair
  console.log(`\n[Test 6] Lint Inspection & Repair (/api/lint/analyze & /fix)`);
  try {
    const analyzeRes = await fetch(`${BASE_URL}/api/lint/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [{ path: "main.js", content: "var count = 0;\nif (count == 0) {\n  console.log(count); \n}\n" }],
      }),
    });
    assert(analyzeRes.status === 200, "Lint analyze status is 200 OK");
    const analyzeJson = await analyzeRes.json();
    assert(analyzeJson.issues.length >= 3, "Detected at least 3 lint issues (no-var, eqeqeq, no-console)");

    const fixRes = await fetch(`${BASE_URL}/api/lint/fix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: [{ path: "main.js", content: "var count = 0;\nif (count == 0) {\n  console.log(count); \n}\n" }],
        issues: analyzeJson.issues,
      }),
    });
    assert(fixRes.status === 200, "Lint fix status is 200 OK");
    const fixJson = await fixRes.json();
    assert(fixJson.success === true, "Lint fix success is true");
    assert(fixJson.results[0].fixedContent.includes("const count = 0;"), "'var' was replaced with 'const'");
    assert(fixJson.results[0].fixedContent.includes("==="), "'==' was upgraded to '==='");
  } catch (err) {
    assert(false, `Lint repair failed: ${err.message}`);
  }

  // 7. Gamification State
  console.log(`\n[Test 7] Gamification State Machine (/api/gamification/state)`);
  try {
    const res = await fetch(`${BASE_URL}/api/gamification/state`);
    assert(res.status === 200, "Gamification state status is 200 OK");
    const json = await res.json();
    assert(json.state.maxCycleXp === 1000, "Max cycle XP is 1000");
    assert(Boolean(json.verticals.email_management), "Verticals configuration exposed");
  } catch (err) {
    assert(false, `Gamification state failed: ${err.message}`);
  }

  // 8. Financial AI Chatbot & Google Sheet Copilot
  console.log(`\n[Test 8] Financial AI Copilot & Google Sheet Chatbot (/api/expenses/chat)`);
  try {
    // 8a. Ask question about spending
    const chatQueryRes = await fetch(`${BASE_URL}/api/expenses/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "What is my category breakdown?" }),
    });
    assert(chatQueryRes.status === 200, "Chatbot query status is 200 OK");
    const queryJson = await chatQueryRes.json();
    assert(queryJson.success === true, "Chatbot query returned success true");
    assert(typeof queryJson.answer === "string" && queryJson.answer.length > 10, "Chatbot returned descriptive answer");

    // 8b. Add expense via chatbot
    const chatAddRes = await fetch(`${BASE_URL}/api/expenses/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Add ₹350 for team snacks on UPI" }),
    });
    assert(chatAddRes.status === 200, "Chatbot add command status is 200 OK");
    const addJson = await chatAddRes.json();
    assert(addJson.success === true, "Chatbot add command returned success true");
    assert(Boolean(addJson.actionTaken), "Action was executed on Google Sheet");
    assert(addJson.actionTaken?.type === "ADD", "Action type is ADD");
    assert(Array.isArray(addJson.updatedRecords), "Updated records returned after execution");
  } catch (err) {
    assert(false, `Chatbot test failed: ${err.message}`);
  }

  console.log(`\n======================================================`);
  console.log(` Test Summary: ${passedCount} Passed, ${failedCount} Failed`);
  console.log(`======================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();

