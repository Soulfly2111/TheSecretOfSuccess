const { setup, assert, base, out } = require('./qa-radial.cjs');
(async () => {
  for (const touch of [false, true]) {
    const q = await setup(touch),
      { p } = q;
    await p.goto(base + 'index.html?chapter=prolog');
    await q.dismiss();
    const well = p.locator('[data-object="well"]'),
      r = await well.boundingBox();
    if (!touch) {
      await well.hover();
      assert.equal(await p.locator('.object-tooltip').textContent(), 'Brunnen');
      assert(await p.locator('.object-tooltip').isVisible());
      await p.screenshot({ path: out + '/mouseover.png' });
    }
    await q.target('well');
    assert(!(await p.locator('#mobile-panel').isVisible()));
    await q.settle();
    assert(
      await p
        .locator('#story-dialogue')
        .getByRole('button', { name: 'Aktionen', exact: true })
        .isVisible(),
    );
    await q.press(
      p.locator('#story-dialogue').getByRole('button', { name: 'Aktionen', exact: true }),
    );
    assert(await p.locator('.wheel-panel').isVisible());
    await p.keyboard.press('Escape');
    await q.dismiss();
    await q.target('house');
    await p.waitForFunction(() => window.AdventureGame.snapshot().state.room === 'house');
    await q.dismiss();
    await q.target('cupboard');
    await q.settle();
    assert(!(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.cupboard)));
    await q.action('cupboard', 'Öffne');
    assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.cupboard));
    await q.travel('yard');
    await q.dismiss();
    if (touch) {
      const c = await q.context.newCDPSession(p),
        b = await p.locator('[data-object="house"]').boundingBox(),
        x = b.x + b.width / 2,
        y = b.y + b.height / 2;
      const start = () =>
        c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      const end = () => c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      for (const mode of ['move', 'cancel', 'multi']) {
        await start();
        await p.waitForTimeout(100);
        if (mode === 'move')
          await c.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: x + 25, y }],
          });
        if (mode === 'multi')
          await c.send('Input.dispatchTouchEvent', {
            type: 'touchStart',
            touchPoints: [
              { x, y },
              { x: x + 80, y: y + 10 },
            ],
          });
        if (mode === 'cancel')
          await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
        else await end();
        await p.waitForTimeout(600);
        assert(!(await p.locator('#mobile-panel').isVisible()));
        assert.equal(await p.evaluate(() => window.AdventureGame.snapshot().state.room), 'yard');
      }
      await start();
      await p.waitForTimeout(560);
      assert(await p.locator('.wheel-panel').isVisible());
      await end();
      assert(await p.locator('.wheel-panel').isVisible());
      await p.keyboard.press('Escape');
      await c.detach();
    }
    await q.dismiss();
    await q.target('house');
    const s = await p.locator('#scene').boundingBox();
    await q.point(s.x + s.width * 0.65, s.y + s.height * 0.93);
    await q.settle();
    assert.equal(await p.evaluate(() => window.AdventureGame.snapshot().state.room), 'yard');
    assert.deepEqual(q.errors, []);
    await q.browser.close();
  }
  console.log(
    'PASS direct mouse/touch: hover, default examine, Actions button, direct exits, closed objects, superseded movement, long press, cancellation and multi-touch',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
