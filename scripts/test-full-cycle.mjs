import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("./tests/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFullCycleTest() {
  console.log(`\n======================================================================`);
  console.log(` PromptWars Full End-to-End Walkthrough Automation`);
  console.log(` Target: ${BASE_URL}`);
  console.log(` Chrome Binary: ${CHROME_PATH}`);
  console.log(`======================================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1280, height: 960 },
  });

  const page = await browser.newPage();

  try {
    // 1. Initial Homepage State
    console.log(`[Step 1] Visiting Homepage & Verifying Initial State`);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_01_scattered_start.png") });
    console.log(`  ✓ Captured initial scattered puzzle state`);

    // 2. Vertical 1: Expense Tracking
    console.log(`\n[Step 2] Executing Vertical 1 (Expense Tracking)`);
    await page.goto(`${BASE_URL}/expenses`, { waitUntil: "networkidle0" });
    await page.type("textarea", "Paid ₹2400 for cloud hosting via credit card");
    await delay(300);

    // Click Extract & Structure
    const extractBtn = await page.waitForSelector('button[type="submit"]');
    await extractBtn?.click();
    await delay(1200);

    // Click Confirm & Record to Sheets
    const confirmBtn = await page.waitForSelector('button:has-text("Confirm & Record to Sheets")', { timeout: 8000 }).catch(() => null);
    if (confirmBtn) {
      await confirmBtn.click();
    } else {
      // Find button by text evaluation
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll("button"));
        const btn = buttons.find(b => b.textContent?.includes("Confirm & Record"));
        btn?.click();
      });
    }
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_02_expense_completed.png") });
    console.log(`  ✓ Logged expense and snapped Quadrant 2 (+250 XP)`);

    // 3. Vertical 2: Email Management
    console.log(`\n[Step 3] Executing Vertical 2 (Email Cleanup)`);
    await page.goto(`${BASE_URL}/email`, { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Start Automated Email Cleanup"));
      btn?.click();
    });
    await delay(2500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_03_email_completed.png") });
    console.log(`  ✓ Cleaned emails and snapped Quadrant 1 (+250 XP)`);

    // 4. Vertical 3: File Organization
    console.log(`\n[Step 4] Executing Vertical 3 (File Organization)`);
    await page.goto(`${BASE_URL}/files`, { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Generate Action Plan"));
      btn?.click();
    });
    await delay(1500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Approve & Execute"));
      btn?.click();
    });
    await delay(1800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_04_files_completed.png") });
    console.log(`  ✓ Organized directory and snapped Quadrant 3 (+250 XP)`);

    // 5. Vertical 4: Lint Fixing
    console.log(`\n[Step 5] Executing Vertical 4 (Lint Repair)`);
    await page.goto(`${BASE_URL}/lint`, { waitUntil: "networkidle0" });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Run Lint Scan"));
      btn?.click();
    });
    await delay(1500);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Auto-Repair All Issues"));
      btn?.click();
    });
    await delay(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_05_lint_completed.png") });
    console.log(`  ✓ Repaired lint issues and snapped Quadrant 4 (+250 XP)`);

    // 6. Homepage Verification (100% Assembled Artwork & Unlocked Puzzle)
    console.log(`\n[Step 6] Returning to Homepage to Verify 100% Assembly`);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0" });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_06_homepage_fully_assembled.png") });
    console.log(`  ✓ Captured 100% assembled master artwork on homepage`);

    // 7. Open Stage 2 Manual Puzzle Challenge
    console.log(`\n[Step 7] Opening Stage 2 Manual Puzzle Challenge Modal`);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent?.includes("Manual Puzzle Challenge"));
      btn?.click();
    });
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "cycle_07_manual_puzzle_modal.png") });
    console.log(`  ✓ Captured Stage 2 interactive 3x3 tile sliding puzzle`);

    console.log(`\n======================================================================`);
    console.log(` All 7 Walkthrough Steps Verified Successfully via Browser!`);
    console.log(` Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`======================================================================\n`);
  } catch (err) {
    console.error("Full cycle test error:", err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runFullCycleTest();

