import puppeteer from "puppeteer-core";

async function testChatbot() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://localhost:3000/expenses", { waitUntil: "networkidle2" });
  console.log("✓ Expenses page loaded");

  // Click on Sheet AI Copilot button
  await page.waitForSelector("button");
  const buttons = await page.$$("button");
  let clicked = false;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes("Sheet AI Copilot") || text.includes("Ask Sheet Copilot")) {
      await b.click();
      clicked = true;
      break;
    }
  }

  if (clicked) {
    console.log("✓ Clicked Copilot button");
    await page.waitForSelector("input[type='text']");
    console.log("✓ Chatbot input is visible");

    // Take screenshot of open chatbot
    await page.screenshot({ path: "tests/screenshots/06_expenses_chatbot.png" });
    console.log("✓ Saved screenshot to tests/screenshots/06_expenses_chatbot.png");
  } else {
    throw new Error("Could not find Sheet AI Copilot button");
  }

  await browser.close();
}

testChatbot().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

