require('node:fs').mkdirSync('.qa', { recursive: true });
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const base = process.env.QA_URL || 'http://127.0.0.1:4181/';
(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  try {
    for (const [width, height] of [
      [667, 375],
      [844, 390],
      [932, 430],
      [1024, 768],
      [1440, 900],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        hasTouch: width < 1100,
      });
      const page = await context.newPage(),
        errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(() => {
        if (!localStorage.getItem('success-migration-v1-act1'))
          localStorage.setItem(
            'success-act1-exploration-v1',
            JSON.stringify({
              room: 'lounge',
              inventory: ['smartphone', 'creatineCapsules', 'coffee'],
              flags: { introDone: true, creatineTaken: true, coffeePrepared: true },
              journal: [],
            }),
          );
      });
      const layout = async () => {
        const { width, height } = page.viewportSize();
        const scene = await page.locator('#scene').boundingBox(),
          rail = await page.locator('.mobile-rail').boundingBox();
        assert(rail.x >= scene.x + scene.width + 7);
        assert(rail.x + rail.width <= width);
        assert(Math.abs(scene.width / scene.height - 16 / 9) < 0.02);
        for (const button of await page.locator('.mobile-rail button').all()) {
          const b = await button.boundingBox();
          assert(b.width >= 48 && b.height >= 48);
          assert(b.y >= 0 && b.y + b.height <= height + 1);
        }
        assert(
          await page.evaluate(
            () =>
              document.documentElement.scrollWidth <= innerWidth &&
              document.documentElement.scrollHeight <= innerHeight,
          ),
        );
      };
      const clickObject = async (id, right = false) => {
        const r = await page.locator('[data-object="' + id + '"]').boundingBox();
        const x = r.x + r.width / 2,
          y = r.y + r.height / 2;
        if (width < 1100) {
          if (right) {
            const c = await context.newCDPSession(page);
            await c.send('Input.dispatchTouchEvent', {
              type: 'touchStart',
              touchPoints: [{ x, y }],
            });
            await page.waitForTimeout(600);
            await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
            await c.detach();
          } else await page.touchscreen.tap(x, y);
        } else await page.mouse.click(x, y, { button: right ? 'right' : 'left' });
      };
      const room = async (id) => {
        await page.evaluate((id) => {
          const s = AdventureGame.snapshot().state;
          s.room = id;
          localStorage.setItem(
            'success-migration-v1-act1',
            JSON.stringify({ schemaVersion: 1, chapter: 'act1', state: s }),
          );
        }, id);
        await page.reload();
        await page.waitForTimeout(400);
      };
      await page.goto(base + 'act1.html');
      await page.waitForTimeout(1100);
      await layout();
      await page.screenshot({ path: '.qa/lounge-rail-' + width + '.png' });
      await clickObject('wheyPowder', true);
      await page.locator('[data-action="Nimm"]').click();
      await page.waitForFunction(() => AdventureGame.snapshot().state.flags.wheyTaken === true);
      assert.equal(await page.locator('[data-object="wheyPowder"]').count(), 0);
      await page.reload();
      await page.waitForTimeout(350);
      assert.equal(await page.locator('[data-object="wheyPowder"]').count(), 0);
      await room('ems');
      await page.locator('.mobile-rail [aria-label="Inventar"]').click();
      await page.locator('[data-item="coffee"]').click();
      await page.getByRole('button', { name: 'Benutze', exact: true }).click();
      await clickObject('shaker');
      await page.waitForFunction(() => AdventureGame.snapshot().state.flags.shakeMixed === true);
      await room('second');
      await clickObject('elevator');
      await page.locator('.lift-grid').waitFor();
      const checkGrid = async () => {
        const { height } = page.viewportSize();
        const buttons = await page.locator('.lift-grid button').all();
        assert.equal(buttons.length, 9);
        for (const button of buttons) {
          const b = await button.boundingBox();
          assert(b.height >= 48 && b.y >= 0 && b.y + b.height <= height);
        }
        assert.equal(
          await page.locator('#modal').evaluate((e) => e.scrollHeight > e.clientHeight),
          false,
        );
      };
      await checkGrid();
      const locked = await page.locator('[data-floor="seventh"]').boundingBox();
      await page.mouse.click(locked.x + locked.width / 2, locked.y + locked.height / 2);
      assert(
        await page
          .locator('.lift-status')
          .textContent()
          .then((t) => t.includes('Vorstand')),
      );
      assert.equal(await page.locator('#modal').evaluate((e) => e.open), true);
      await page.screenshot({ path: '.qa/lift-grid-' + width + '.png' });
      await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
      assert.equal((await page.evaluate(() => AdventureGame.snapshot())).state.room, 'second');
      for (const destination of ['upper', 'lobby', 'second']) {
        await clickObject('elevator');
        await page.locator('.lift-grid').waitFor();
        await checkGrid();
        await page.locator('[data-floor="' + destination + '"]').click();
        await page.waitForFunction(
          (id) =>
            AdventureGame.snapshot().state.room === id && !AdventureGame.snapshot().transition,
          destination,
        );
      }
      await clickObject('elevator');
      await page.locator('.lift-grid').waitFor();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#modal').evaluate((e) => e.open), false);
      await page.setViewportSize({ width, height: Math.min(height, 290) });
      await page.waitForTimeout(200);
      await layout();
      await clickObject('elevator');
      await page.locator('.lift-grid').waitFor();
      await checkGrid();
      await page.keyboard.press('Escape');
      await page.setViewportSize({ width, height });
      await page.goto(base + 'index.html?chapter=prolog');
      await page.waitForTimeout(700);
      await layout();
      assert.deepEqual(errors, []);
      console.log('PASS rail, whey, shaker, lifts, reload and Prolog', width, height);
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
