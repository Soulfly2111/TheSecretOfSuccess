const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs');
const base = process.env.QA_URL || 'http://127.0.0.1:8770/',
  out = process.env.QA_OUTPUT || '.qa';
fs.mkdirSync(out, { recursive: true });
async function setup(mobile = true) {
  const browser = await chromium.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    }),
    context = await browser.newContext({
      viewport: mobile ? { width: 844, height: 390 } : { width: 1440, height: 900 },
      hasTouch: mobile,
      isMobile: mobile,
    }),
    p = await context.newPage(),
    errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const press = (l) => (mobile ? l.tap() : l.click()),
    panel = (n) => p.locator('#mobile-panel').getByRole('button', { name: n, exact: true }),
    rail = (n) => p.locator('.mobile-rail').getByRole('button', { name: n, exact: true });
  const settle = () =>
    p.waitForFunction(
      () =>
        !window.AdventureGame.snapshot().actor.moving &&
        (typeof window.AdventureGame.snapshot().transition === 'undefined' ||
          !window.AdventureGame.snapshot().transition) &&
        (typeof window.AdventureGame.snapshot().photoJob === 'undefined' ||
          !window.AdventureGame.snapshot().photoJob),
    );
  async function dismiss() {
    for (let i = 0; i < 14; i++) {
      if (await p.locator('#modal[open]').isVisible()) await press(p.locator('#close-modal'));
      const next = p
        .locator('#story-dialogue button')
        .filter({ hasText: /^(Weiter|Schließen)$/ })
        .last();
      if (!(await next.isVisible())) break;
      await press(next);
      await p.waitForTimeout(30);
    }
  }
  async function point(x, y) {
    if (mobile) await p.touchscreen.tap(x, y);
    else await p.mouse.click(x, y);
  }
  async function ensure(id) {
    for (let i = 0; i < 8; i++) {
      const r = await p.locator('[data-object="' + id + '"]').boundingBox(),
        s = await p.locator('#scene').boundingBox();
      if (r && r.x + r.width > s.x + 5 && r.x < s.x + s.width - 65) return;
      const left = await p.evaluate((id) => {
        const b = document.querySelector('[data-object="' + id + '"]');
        return Number(b.dataset.worldX) < Number(document.querySelector('#scene').dataset.cameraX);
      }, id);
      await point(s.x + s.width * (left ? 0.08 : 0.9), s.y + s.height * 0.88);
      await settle();
    }
    throw Error('cannot reach viewport ' + id);
  }
  async function target(id, radial = false) {
    await dismiss();
    await ensure(id);
    const l = p.locator('[data-object="' + id + '"]'),
      label = await l.getAttribute('aria-label'),
      r = await l.boundingBox();
    const sceneBox = await p.locator('#scene').boundingBox();
    const x = Math.max(
        sceneBox.x + 8,
        Math.min(sceneBox.x + sceneBox.width - 70, r.x + r.width / 2),
      ),
      y = r.y + r.height / 2;
    if (radial) {
      if (mobile) {
        const c = await context.newCDPSession(p);
        await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
        await p.waitForTimeout(560);
        await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await c.detach();
      } else await p.mouse.click(x, y, { button: 'right' });
    } else await point(x, y);
    if (
      (await p.locator('#mobile-panel[open]').isVisible()) &&
      (await p.locator('#mobile-panel h2').textContent()) === 'Welches Objekt?'
    )
      await press(panel(label));
  }
  async function action(id, v) {
    await target(id, true);
    await press(panel(v));
    await settle();
  }
  async function item(id, v = 'Benutze') {
    await dismiss();
    await press(rail('Inventar'));
    await press(p.locator('#mobile-panel [data-item="' + id + '"]'));
    await press(panel(v));
  }
  async function use(itemId, id, v = 'Benutze') {
    await dismiss();
    if (id !== 'hero') await ensure(id);
    await item(itemId, v);
    await target(id);
    await settle();
  }
  async function travel(dest) {
    await dismiss();
    if (await p.evaluate(() => window.AdventureGame.snapshot().chapter === 'prolog')) {
      if (
        (await p.evaluate(() => window.AdventureGame.snapshot().state.room)) !== 'yard' &&
        dest !== 'yard'
      )
        await action('yard', 'Gehe zu');
      if ((await p.evaluate(() => window.AdventureGame.snapshot().state.room)) !== dest)
        await action(dest, 'Gehe zu');
      return;
    }
    for (
      let i = 0;
      i < 8 && (await p.evaluate(() => window.AdventureGame.snapshot().state.room)) !== dest;
      i++
    ) {
      const edge = await p.evaluate((d) => window.AdventureGame.route(d)[0], dest);
      await action(edge.target, 'Gehe zu');
      if (edge.kind === 'elevator') await press(p.locator('[data-floor="' + edge.to + '"]'));
      await p.waitForFunction(
        (id) =>
          window.AdventureGame.snapshot().state.room === id &&
          (typeof window.AdventureGame.snapshot().transition === 'undefined' ||
            !window.AdventureGame.snapshot().transition),
        edge.to,
      );
      await settle();
    }
  }
  return {
    browser,
    context,
    p,
    errors,
    press,
    panel,
    rail,
    settle,
    dismiss,
    target,
    action,
    item,
    use,
    travel,
    point,
  };
}
module.exports = { setup, assert, base, out };
