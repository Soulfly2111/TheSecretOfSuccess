const { setup, assert, base } = require('./qa-radial.cjs');

async function prepare(touch) {
  const q = await setup(touch);
  await q.context.addInitScript(() =>
    localStorage.setItem(
      'success-act1-exploration-v1',
      JSON.stringify({ room: 'lobby', inventory: ['smartphone'], flags: { introDone: true } }),
    ),
  );
  await q.p.goto(base + 'act1.html');
  await q.p.waitForFunction(() => window.AdventureGame);
  await q.dismiss();
  return q;
}

async function points(p) {
  return p.evaluate(() => {
    const entrance = document.querySelector('[data-object="entrance"]').getBoundingClientRect();
    const display = document.querySelector('[data-object="brochureStand"]').getBoundingClientRect();
    return {
      overlap: {
        x: (Math.max(entrance.left, display.left) + Math.min(entrance.right, display.right)) / 2,
        y: (Math.max(entrance.top, display.top) + Math.min(entrance.bottom, display.bottom)) / 2,
      },
      freeDoor: { x: entrance.right - 8, y: entrance.top + entrance.height * 0.2 },
    };
  });
}

(async () => {
  {
    const q = await prepare(false),
      { p } = q,
      at = await points(p);
    await p.mouse.move(at.overlap.x, at.overlap.y);
    assert.equal(await p.locator('.object-tooltip').textContent(), 'Vitrine mit Firmenbroschüre');

    await p.mouse.click(at.overlap.x, at.overlap.y, { button: 'right' });
    assert.equal(await p.locator('#mobile-panel h2').textContent(), 'Vitrine mit Firmenbroschüre');
    await p.keyboard.press('Escape');

    await p.mouse.click(at.overlap.x, at.overlap.y);
    await p.waitForFunction(
      () =>
        window.AdventureGame.snapshot().actor.pending?.target === 'brochureStand' ||
        document.querySelector('#story-dialogue')?.textContent.includes('Vitrine'),
    );
    await p.mouse.click(at.freeDoor.x, at.freeDoor.y);
    await p.mouse.move(at.freeDoor.x, at.freeDoor.y);
    assert.equal(await p.locator('.object-tooltip').textContent(), 'Haupteingang');
    assert.deepEqual(q.errors, []);
    await q.browser.close();
  }

  {
    const q = await prepare(true),
      { p } = q,
      at = await points(p),
      c = await q.context.newCDPSession(p);
    await p.touchscreen.tap(at.overlap.x, at.overlap.y);
    await p.waitForFunction(
      () =>
        window.AdventureGame.snapshot().actor.pending?.target === 'brochureStand' ||
        document.querySelector('#story-dialogue')?.textContent.includes('Vitrine'),
    );
    await p.reload();
    await p.waitForFunction(() => window.AdventureGame);
    await q.dismiss();
    const again = await points(p);
    await c.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: again.overlap.x, y: again.overlap.y }],
    });
    await p.waitForTimeout(560);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    assert.equal(await p.locator('#mobile-panel h2').textContent(), 'Vitrine mit Firmenbroschüre');
    assert.deepEqual(q.errors, []);
    await c.detach();
    await q.browser.close();
  }
  console.log('PASS front hotspot priority for hover, click, context click, tap and hold');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
