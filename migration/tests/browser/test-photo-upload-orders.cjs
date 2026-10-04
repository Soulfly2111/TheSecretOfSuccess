const { setup, assert, base } = require('./qa-radial.cjs');

const cases = [
  ['selfie', 'marble'],
  ['marble', 'selfie'],
  ['smartphone'],
  ['selfie', 'smartphone'],
];

(async () => {
  for (const order of cases) {
    const q = await setup(false),
      { p, use, dismiss } = q;
    await q.context.addInitScript(() =>
      localStorage.setItem(
        'success-act1-exploration-v1',
        JSON.stringify({
          room: 'upper',
          inventory: ['smartphone', 'selfie', 'marble'],
          flags: { introDone: true, selfieTaken: true, marbleTaken: true },
        }),
      ),
    );
    await p.goto(base + 'act1.html');
    await p.waitForFunction(() => window.AdventureGame);
    await dismiss();

    await use(order[0], 'graphicsPC');
    const first = await p.evaluate(() => window.AdventureGame.snapshot().state.flags);
    if (order[0] === 'selfie') {
      assert.equal(first.selfieUploaded, true);
      assert.equal(first.marbleUploaded, false);
    } else if (order[0] === 'marble') {
      assert.equal(first.marbleUploaded, true);
      assert.equal(first.selfieUploaded, false);
    } else assert.equal(first.photoSent, true);

    if (order.length > 1) {
      await p.reload();
      await p.waitForFunction(() => window.AdventureGame.snapshot().state.room === 'upper');
      await dismiss();
      await use(order[1], 'graphicsPC');
    }
    const completed = await p.evaluate(() => window.AdventureGame.snapshot().state);
    assert.equal(completed.flags.selfieUploaded, true);
    assert.equal(completed.flags.marbleUploaded, true);
    assert.equal(completed.flags.photoSent, true);
    assert.equal(completed.inventory.filter((item) => item === 'selfie').length, 1);
    assert.equal(completed.inventory.filter((item) => item === 'marble').length, 1);

    await use(order.at(-1), 'graphicsPC');
    const repeated = await p.evaluate(() => window.AdventureGame.snapshot().state);
    assert.equal(repeated.inventory.filter((item) => item === 'selfie').length, 1);
    assert.equal(repeated.inventory.filter((item) => item === 'marble').length, 1);
    assert.deepEqual(q.errors, []);
    await q.browser.close();
  }
  console.log('PASS direct and smartphone photo upload orders, persistence and repeat protection');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
