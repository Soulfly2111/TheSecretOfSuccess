const { setup, assert, base } = require('./qa-radial.cjs');
(async () => {
  const q = await setup(false),
    { p, press, action, dismiss, settle } = q;
  const source = JSON.stringify({
    room: 'lobby',
    inventory: ['smartphone', 'selfie', 'marble'],
    flags: {
      introDone: true,
      selfieTaken: true,
      marbleTaken: true,
      selfieUploaded: true,
      marbleUploaded: true,
      photoSent: true,
      printPending: true,
    },
  });
  await q.context.addInitScript((value) => {
    if (!localStorage.getItem('success-act1-exploration-v1'))
      localStorage.setItem('success-act1-exploration-v1', value);
  }, source);
  await p.goto(base + 'act1.html');
  await p.waitForFunction(() => window.AdventureGame);
  await dismiss();
  await settle();
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.badgeIssued));
  await p.reload();
  await p.waitForFunction(() => window.AdventureGame);
  await dismiss();
  assert.equal(
    await p.evaluate(
      () => window.AdventureGame.snapshot().state.inventory.filter((x) => x === 'vipBadge').length,
    ),
    1,
  );
  assert.equal(await p.evaluate(() => localStorage.getItem('success-act1-exploration-v1')), source);
  // Directed Euler route covers all six distinct elevator journeys.
  for (const destination of ['upper', 'second', 'lobby', 'second', 'upper', 'lobby']) {
    await action('elevator', 'Gehe zu');
    const current = await p.evaluate(() => window.AdventureGame.snapshot().state.room);
    assert(await p.locator('[data-floor="' + current + '"]').isDisabled());
    await press(p.locator('#close-modal'));
    assert.equal(await p.evaluate(() => window.AdventureGame.snapshot().state.room), current);
    await action('elevator', 'Gehe zu');
    await press(p.locator('[data-floor="' + destination + '"]'));
    await p.waitForFunction(
      (id) =>
        window.AdventureGame.snapshot().state.room === id &&
        !window.AdventureGame.snapshot().transition,
      destination,
    );
    await settle();
  }
  assert.deepEqual(q.errors, []);
  await q.browser.close();
  console.log(
    'PASS all six elevator journeys/cancel and interrupted print/save without duplicates or source mutation',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
