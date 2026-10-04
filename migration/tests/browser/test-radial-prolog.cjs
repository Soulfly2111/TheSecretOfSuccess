const { setup, assert, base, out } = require('./qa-radial.cjs');
(async () => {
  const q = await setup(),
    { p, press, panel, rail, action, item, use, travel, dismiss, settle } = q;
  await p.goto(base + 'index.html?chapter=prolog');
  await p.waitForFunction(() => document.body.classList.contains('unified-game'));
  for (const [w, h] of [
    [667, 375],
    [844, 390],
    [932, 430],
    [1180, 820],
    [1440, 900],
  ]) {
    await p.setViewportSize({ width: w, height: h });
    await p.waitForTimeout(60);
    const r = await p.locator('#scene').boundingBox();
    assert(Math.abs(r.width / r.height - 16 / 9) < 0.01);
    assert.equal(await p.locator('.mobile-rail button').count(), 3);
    assert(await p.locator('header').isHidden());
    await press(rail('Menü'));
    assert(await p.locator('.menu-location').isVisible());
    await p.screenshot({ path: out + '/menu-' + w + '.png' });
    await press(panel('Schließen'));
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollHeight > innerHeight + 1),
      false,
    );
  }
  await p.setViewportSize({ width: 844, height: 390 });
  await travel('house');
  await action('manual', 'Nimm');
  await item('manual', 'Schau an');
  await dismiss();
  await action('key', 'Nimm');
  await action('cup', 'Nimm');
  await action('cupboard', 'Öffne');
  await action('grounds', 'Nimm');
  await travel('yard');
  await use('cup', 'well');
  await travel('house');
  await use('water', 'pot');
  await use('grounds', 'pot');
  await action('stove', 'Mach an');
  await use('cup', 'pot');
  await travel('garage');
  await use('coffee', 'mechanic', 'Gib');
  await action('toolbox', 'Öffne');
  await action('toolbox', 'Nimm');
  await action('rag', 'Nimm');
  await travel('barn');
  await use('wrench', 'tractor');
  await item('rag');
  await press(rail('Inventar'));
  await press(p.locator('[data-item="dirtybelt"]'));
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.inventory.includes('belt')));
  await travel('yard');
  await action('car', 'Öffne');
  await use('wrench', 'car');
  await use('belt', 'car');
  await p.reload();
  await p.waitForFunction(() => window.AdventureGame.snapshot().state.flags.tight);
  await use('key', 'car');
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.won));
  assert.deepEqual(q.errors, []);
  await q.browser.close();
  console.log(
    'PASS radial prolog full touch chain, inventory combination, contextual verbs, reload and five viewport sizes',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
