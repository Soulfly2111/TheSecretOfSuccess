const { setup, assert, base } = require('./qa-radial.cjs');
(async () => {
  const q = await setup(),
    { p, press, rail, panel } = q;
  await p.goto(base + 'act1.html');
  await p.waitForFunction(() => window.AdventureGame.snapshot().story === 'approach');
  await p.reload();
  await p.waitForFunction(() => window.AdventureGame.snapshot().story === 'approach');
  await press(rail('Menü'));
  await p.waitForTimeout(2000);
  assert.equal(await p.evaluate(() => window.AdventureGame.snapshot().story), 'approach');
  await press(panel('Hilfe'));
  await press(panel('Rätselhinweis'));
  assert(await panel('Firmenausweis').isVisible());
  await press(panel('Schließen'));
  await p.waitForFunction(() => window.AdventureGame.snapshot().story === 'talk');
  await press(rail('Menü'));
  await press(panel('Kapitelauswahl'));
  assert(await p.locator('#modal').isVisible());
  await press(p.locator('#close-modal'));
  await q.dismiss();
  await p.waitForFunction(() => window.AdventureGame.snapshot().state.flags.introDone);
  await press(rail('Menü'));
  await press(panel('Neustart'));
  assert(await p.locator('#modal').isVisible());
  await press(p.locator('#close-modal'));
  assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.introDone));
  assert.deepEqual(q.errors, []);
  await q.browser.close();
  console.log('PASS greeting pause/resume, menus during dialogue, restart confirmation');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
