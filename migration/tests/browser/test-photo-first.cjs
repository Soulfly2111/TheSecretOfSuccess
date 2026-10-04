const { setup, assert, base } = require('./qa-radial.cjs');
(async () => {
  const q = await setup(false),
    { p, press, rail, action, item, use, travel, dismiss, settle } = q;
  await q.context.addInitScript(() => {
    if (!localStorage.getItem('success-act1-exploration-v1'))
      localStorage.setItem(
        'success-act1-exploration-v1',
        JSON.stringify({ room: 'lobby', inventory: ['smartphone'], flags: { introDone: true } }),
      );
  });
  await p.goto(base + 'act1.html');
  await p.waitForFunction(() => window.AdventureGame);
  await dismiss();
  // Photos before the reception request; upload files separately and repeat an upload.
  await use('smartphone', 'hero');
  await travel('upper');
  await use('smartphone', 'graphicsPC');
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.selfieUploaded));
  assert(!(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.photoSent)));
  await p.reload();
  await p.waitForFunction(() => window.AdventureGame.snapshot().state.room === 'upper');
  await dismiss();
  await use('smartphone', 'graphicsPC');
  await travel('lobby');
  await use('smartphone', 'brochureStand');
  await travel('upper');
  await use('smartphone', 'graphicsPC');
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.photoSent));
  await use('smartphone', 'graphicsPC');
  await travel('lobby');
  await action('reception', 'Rede mit');
  await dismiss();
  await settle();
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.badgeIssued));
  assert(!(await p.evaluate(() => window.AdventureGame.snapshot().ready)));
  await action('reception', 'Rede mit');
  await press(p.locator('[data-topic="bye"]'));
  await dismiss();
  assert.equal(
    await p.evaluate(
      () => window.AdventureGame.snapshot().state.inventory.filter((x) => x === 'vipBadge').length,
    ),
    1,
  );
  // Discover and recover the card before ever asking Walter.
  await travel('kitchen');
  await action('drawer', 'Öffne');
  await action('knife', 'Nimm');
  await travel('restroom');
  await action('radiator', 'Schau an');
  await use('knife', 'radiator');
  await p.reload();
  await p.waitForFunction(() => window.AdventureGame.snapshot().state.room === 'restroom');
  await dismiss();
  assert(
    await p.evaluate(() => window.AdventureGame.snapshot().state.inventory.includes('keycard')),
  );
  await travel('lobby');
  await use('keycard', 'walter', 'Gib');
  await dismiss();
  assert(await p.evaluate(() => window.AdventureGame.snapshot().ready));
  assert.deepEqual(q.errors, []);
  await q.browser.close();
  console.log('PASS photo before Walter, early photos/card, separate/repeated uploads and saves');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
