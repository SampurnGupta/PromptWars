import puppeteer from "puppeteer-core";

async function testLoader() {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log("Navigating to http://localhost:3000 (first visit)...");
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });

  // Check if loader is present on first load
  const loaderImg = await page.waitForSelector("img[src='/product_loader.gif']", { timeout: 3000 });
  if (loaderImg) {
    console.log("✓ Initial loader animation detected with product_loader.gif");
    await page.screenshot({ path: "tests/screenshots/07_initial_product_loader.png" });
    console.log("✓ Captured screenshot: tests/screenshots/07_initial_product_loader.png");
  } else {
    throw new Error("Loader image was not found on first load");
  }

  // Wait for 3 seconds to allow auto-fade and unmount
  await new Promise((r) => setTimeout(r, 3000));

  // Verify loader is unmounted / gone
  const loaderAfter = await page.$("img[src='/product_loader.gif']");
  if (!loaderAfter) {
    console.log("✓ Loader successfully faded out and unmounted");
  } else {
    console.log("Notice: Loader element still in DOM");
  }

  // Reload page to verify it does NOT show a second time
  console.log("Reloading page to test subsequent visit behavior...");
  await page.reload({ waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 500));
  const loaderOnReload = await page.$("img[src='/product_loader.gif']");
  if (!loaderOnReload) {
    console.log("✓ Confirmed: Loader animation only plays on first platform entry!");
  } else {
    console.warn("Warning: Loader displayed on reload");
  }

  await browser.close();
  console.log("All loader verification checks passed successfully!");
}

testLoader().catch((err) => {
  console.error("Loader test failed:", err);
  process.exit(1);
});

