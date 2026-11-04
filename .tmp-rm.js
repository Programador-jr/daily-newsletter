const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  const out = {};

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:3000/personalidades', { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  await page.locator('#catalog-generic-grid .catalog-personality-card').first().click();
  await page.waitForTimeout(700);

  out.sections = await page.evaluate(() => [...document.querySelectorAll('.catalog-profile-shell .atlas-dialog-section h3')].map((h) => h.innerText.trim()));
  out.creditNodes = await page.evaluate(() => document.querySelectorAll('.catalog-profile-shell .catalog-dialog-credit').length);
  out.lastBlocks = await page.evaluate(() => [...document.querySelector('.catalog-profile-content').children].map((c) => c.className || c.tagName));
  await page.evaluate(() => { const s = document.querySelector('.catalog-profile-shell'); s.scrollTop = s.scrollHeight; });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'C:/Users/mello/AppData/Local/Temp/opencode/after-removal.png' });

  const paises = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  paises.on('pageerror', (e) => errors.push('paises: ' + e.message));
  await paises.goto('http://localhost:3000/catalogo-politico?catalogo=paises', { waitUntil: 'networkidle' });
  await paises.waitForTimeout(400);
  await paises.locator('#catalog-generic-grid .catalog-card').first().click();
  await paises.waitForTimeout(700);
  out.paisesSections = await paises.evaluate(() => [...document.querySelectorAll('.catalog-profile-shell .atlas-dialog-section h3')].map((h) => h.innerText.trim()));

  out.errors = errors;
  console.log(JSON.stringify(out, null, 2));
  await browser.close();
})();
