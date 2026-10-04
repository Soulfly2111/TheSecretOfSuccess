const { setup, assert, base, out } = require('./qa-radial.cjs');
(async () => {
  for (const mobile of [true, false]) {
    const q = await setup(mobile),
      { p, press, panel, rail, action, item, use, travel, dismiss, settle, target } = q;
    await p.goto(base + 'act1.html');
    await p.waitForFunction(() => window.AdventureGame.snapshot().story === 'talk');
    await dismiss();
    await p.waitForFunction(() => window.AdventureGame.snapshot().state.flags.introDone);
    await action('walter', 'Rede mit');
    await dismiss();
    assert(!(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.wcClue)));
    await action('walter', 'Rede mit');
    await dismiss();
    await press(p.locator('[data-topic="lastSeen"]'));
    await dismiss();
    await press(p.locator('[data-topic="continue"]'));
    await dismiss();
    await travel('restroom');
    assert.equal(await p.locator('[data-object="keycard"]').count(), 0);
    await action('radiator', 'Schau an');
    await action('keycard', 'Nimm');
    assert(
      !(await p.evaluate(() =>
        window.AdventureGame.snapshot().state.inventory.includes('keycard'),
      )),
    );
    await travel('kitchen');
    await action('drawer', 'Öffne');
    await action('knife', 'Nimm');
    await travel('restroom');
    await use('knife', 'keycard');
    await travel('lobby');
    await use('keycard', 'walter', 'Gib');
    await dismiss();
    assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.cardReturned));
    await action('reception', 'Rede mit');
    await press(p.locator('[data-topic="badge"]'));
    await dismiss();
    await use('smartphone', 'hero');
    await action('brochureStand', 'Nimm');
    await item('smartphone');
    await press(rail('Inventar'));
    await press(p.locator('[data-item="brochure"]'));
    await settle();
    await travel('upper');
    await use('smartphone', 'graphicsPC');
    assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.photoSent));
    await action('graphicsPC', 'Schau an');
    assert.match(await p.locator('#modal-content').textContent(), /Datei gesendet/);
    await dismiss();
    await travel('lobby');
    await action('reception', 'Rede mit');
    await dismiss();
    await settle();
    assert(await p.evaluate(() => window.AdventureGame.snapshot().ready));
    await item('vipBadge', 'Schau an');
    await p.screenshot({ path: out + '/' + mobile + '-badge.png' });
    await dismiss();
    await travel('corridor');
    assert.equal(await p.locator('.hotspot').count(), 2);
    await action('lightSwitch', 'Mach an');
    await target('lightSwitch', true);
    assert.equal(await p.locator('[data-action="Mach an"]').count(), 0);
    await press(panel('Mach aus'));
    await settle();
    await p.reload();
    await p.waitForFunction(() => window.AdventureGame.snapshot().state.room === 'corridor');
    assert(!(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.cleaningLightOn)));
    await travel('second');
    await action('elevator', 'Gehe zu');
    assert(await p.locator('[data-floor="second"]').isDisabled());
    await press(p.locator('#close-modal'));
    assert.equal(await p.evaluate(() => window.AdventureGame.snapshot().state.room), 'second');
    for (const room of ['teamOffice', 'ems', 'lounge', 'delivery', 'upper', 'lobby']) {
      await travel(room);
      await p.reload();
      await p.waitForFunction((id) => window.AdventureGame.snapshot().state.room === id, room);
      assert(await p.evaluate(() => window.AdventureGame.snapshot().state.flags.badgeIssued));
    }
    assert.deepEqual(q.errors, []);
    await q.browser.close();
  }
  console.log(
    'PASS radial Act 1 touch+mouse: Walter, photo, inventory, contextual doors, lifts, three floors, dark room, saves',
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
