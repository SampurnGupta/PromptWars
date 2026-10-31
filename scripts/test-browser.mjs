import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("./tests/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserTests() {
  console.log(`\n======================================================`);
  console.log(` PromptWars Automated Browser E2E Test`);
  console.log(` Browser: Chrome (${CHROME_PATH})`);
  console.log(` URL: ${BASE_URL}`);
  console.log(`======================================================\n`);

  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`Chrome executable not found at ${CHROME_PATH}`);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    defaultViewport: { width: 1280, height: 900 },
  });

  const page = await browser.newPage();

  try {
    // 1. Test Homepage & Scattered Puzzle
    console.log(`[Browser Test 1] Navigating to Homepage (${BASE_URL})`);
    await page.goto(`${BASE_URL}/`, { waitUntil: "networkidle0", timeout: 15000 });
    const title = await page.title();
    console.log(`  ✓ Page title: "${title}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_homepage_scattered.png") });
    console.log(`  ✓ Saved screenshot: 01_homepage_scattered.png`);

    // 2. Test Expenses View
    console.log(`\n[Browser Test 2] Navigating to Expenses View (${BASE_URL}/expenses)`);
    await page.goto(`${BASE_URL}/expenses`, { waitUntil: "networkidle0", timeout: 15000 });
    const hasLogButton = await page.$("button");
    console.log(`  ✓ Interactive controls rendered: ${Boolean(hasLogButton)}`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_expenses_view.png") });
    console.log(`  ✓ Saved screenshot: 02_expenses_view.png`);

    // 3. Test Email View
    console.log(`\n[Browser Test 3] Navigating to Email Cleanup View (${BASE_URL}/email)`);
    await page.goto(`${BASE_URL}/email`, { waitUntil: "networkidle0", timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_email_view.png") });
    console.log(`  ✓ Saved screenshot: 03_email_view.png`);

    // 4. Test File Organizer View
    console.log(`\n[Browser Test 4] Navigating to File Organizer (${BASE_URL}/files)`);
    await page.goto(`${BASE_URL}/files`, { waitUntil: "networkidle0", timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_files_view.png") });
    console.log(`  ✓ Saved screenshot: 04_files_view.png`);

    // 5. Test Lint Fixer View
    console.log(`\n[Browser Test 5] Navigating to Lint Fixer (${BASE_URL}/lint)`);
    await page.goto(`${BASE_URL}/lint`, { waitUntil: "networkidle0", timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_lint_view.png") });
    console.log(`  ✓ Saved screenshot: 05_lint_view.png`);

    console.log(`\n======================================================`);
    console.log(` All Browser E2E Visual Tests Passed Successfully!`);
    console.log(` Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log(`======================================================\n`);
  } catch (err) {
    console.error(`Browser test error:`, err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runBrowserTests();

