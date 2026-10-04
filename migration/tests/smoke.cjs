const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
  });
  for (const chapter of ['index', 'act1']) {
    const p = await b.newPage({ viewport: { width: 844, height: 390 } }),
      errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('response', (r) => {
      if (r.status() >= 400) errors.push(r.status() + ' ' + r.url());
    });
    await p.goto(
      (process.env.QA_URL || 'http://127.0.0.1:8770/') + chapter + '.html?chapter=prolog',
    );
    await p.waitForTimeout(3000);
    console.log(chapter, errors, await p.locator('#scene').getAttribute('data-renderer'));
    await p.screenshot({ path: '.qa/' + chapter + '-smoke.png' });
    if (errors.length) throw Error(errors.join('\n'));
    await p.close();
  }
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
