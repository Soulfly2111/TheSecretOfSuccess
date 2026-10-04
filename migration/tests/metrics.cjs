const { chromium } = require('playwright'),
  fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      headless: true,
    }),
    results = [];
  for (const [name, url] of [
    ['reference', 'http://127.0.0.1:8765/'],
    ['migration', 'http://127.0.0.1:8771/'],
  ])
    for (let run = 0; run < 3; run++) {
      const c = await browser.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }),
        p = await c.newPage();
      await p.goto(url + 'act1.html');
      await p.waitForTimeout(2500);
      results.push({
        name,
        run,
        ...(await p.evaluate(() => {
          const r = performance.getEntriesByType('resource'),
            n = performance.getEntriesByType('navigation')[0];
          return {
            requests: r.length,
            transferBytes: r.reduce((a, x) => a + x.transferSize, 0),
            decodedBytes: r.reduce((a, x) => a + x.decodedBodySize, 0),
            domReadyMs: n.domContentLoadedEventEnd,
            heapBytes: performance.memory?.usedJSHeapSize ?? null,
            jsHeapLimit: performance.memory?.jsHeapSizeLimit ?? null,
            renderer: document.getElementById('scene').dataset.renderer ?? 'reference-canvas',
          };
        })),
      });
      await c.close();
    }
  fs.mkdirSync('.qa', { recursive: true });
  fs.writeFileSync('.qa/metrics.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
