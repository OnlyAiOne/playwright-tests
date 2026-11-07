// Opens an ultimateqa.com page and waits until it is ready for clicks.
//
// The site delays about 30 of its scripts (WP Rocket "delay JavaScript") until the visitor
// first moves the mouse, scrolls or presses a key. Until they load, the page swallows
// clicks: radio buttons and checkboxes do not change and buttons do not submit. A real
// visitor never notices, but a test that clicks straight away fails at random.
//
// So after loading, this moves the mouse until the delayed scripts have run. It repeats
// the move because one made before the site starts listening is missed.

const DELAYED_SCRIPT = 'script[type="rocketlazyloadscript"]';

async function openPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Usually done in 2-3 seconds; allow 30 for a slow site or many tests in parallel
  for (let attempt = 0; attempt < 60; attempt++) {
    await page.mouse.move(5 + (attempt % 40), 5);
    await page.mouse.move(50, 50 + (attempt % 40));
    if ((await page.locator(DELAYED_SCRIPT).count()) === 0) return;
    await page.waitForTimeout(500);
  }
  const waiting = await page
    .locator(DELAYED_SCRIPT)
    .evaluateAll((scripts) => scripts.map((s) => s.dataset.rocketSrc || s.src || 'inline script'));
  throw new Error(`The page's delayed scripts did not load within 30s: ${url}\nStill waiting: ${waiting.join(', ')}`);
}

module.exports = { openPage };
