const puppeteer = require('puppeteer');
(async () => {
  const url = 'http://127.0.0.1:5173/products';
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => logs.push({ type: 'pageerror', text: err.message }));
  page.on('requestfailed', req => logs.push({ type: 'requestfailed', url: req.url(), error: req.failure().errorText }));
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (err) {
    logs.push({ type: 'goto_error', text: String(err.message) });
  }
  // wait a bit for any client async logs
  await page.waitForTimeout(1500);
  console.log('CONSOLE_CAPTURE_RESULT_START');
  console.log(JSON.stringify(logs, null, 2));
  console.log('CONSOLE_CAPTURE_RESULT_END');
  await browser.close();
})();
