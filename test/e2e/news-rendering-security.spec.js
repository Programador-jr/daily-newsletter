const { expect, test } = require('@playwright/test');

const maliciousStory = {
  category: '<img src=x onerror="window.__xssExecuted=1">',
  title: '<svg onload="window.__xssExecuted=1">Título de teste</svg>',
  summary: '<script>window.__xssExecuted=1</script>Resumo malicioso',
  context: '<iframe srcdoc="<script>window.__xssExecuted=1</script>"></iframe>Contexto',
  source: '<img src=x onerror="window.__xssExecuted=1">',
  publishedAt: '15/10/2026',
  url: 'javascript:window.__xssExecuted=1'
};

async function mockNewsApi(page) {
  await page.addInitScript(() => {
    window.__xssExecuted = 0;
  });

  await page.route('**/api/news**', async route => {
    const url = new URL(route.request().url());

    if (url.searchParams.get('history') === 'true') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          date: '06/10/2026',
          issueNumber: 7,
          title: '<img src=x onerror="window.__xssExecuted=1">Arquivo malicioso',
          stories: 1
        }])
      });
      return;
    }

    if (url.searchParams.has('date')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ date: '06/10/2026', stories: [maliciousStory] })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ date: '15/10/2026', stories: [maliciousStory] })
    });
  });
}

test('news content is rendered as text and dangerous source URLs are rejected', async ({ page }) => {
  await mockNewsApi(page);
  await page.goto('/editions');

  const card = page.locator('#news-grid .story').first();
  await expect(card.locator('h2')).toHaveText(maliciousStory.title);
  await expect(card.locator('.summary')).toHaveCount(0);
  await expect(card).toContainText('Resumo malicioso');
  await expect(card.locator('img, svg, script, iframe')).toHaveCount(0);
  await expect(card.locator('a.source-link')).toHaveCount(0);
  await expect(card.locator('.source-link[aria-disabled="true"]')).toHaveText('Fonte indisponível');
  expect(await page.evaluate(() => window.__xssExecuted)).toBe(0);
});

test('category values are text, not markup, and valid HTTPS source links remain available', async ({ page }) => {
  await mockNewsApi(page);
  await page.route('**/api/news**', async route => {
    const url = new URL(route.request().url());
    if (url.searchParams.has('date') || url.searchParams.has('history')) {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        date: '15/10/2026',
        stories: [{
          ...maliciousStory,
          category: '<img src=x onerror="window.__xssExecuted=1">',
          url: 'https://example.com/article'
        }]
      })
    });
  });

  await page.goto('/editions');

  const category = page.locator('#filter-buttons button').filter({ hasText: maliciousStory.category });
  await expect(category).toHaveCount(1);
  await expect(page.locator('#filter-buttons img')).toHaveCount(0);
  await expect(page.locator('#news-grid a.source-link')).toHaveAttribute('href', 'https://example.com/article');
  expect(await page.evaluate(() => window.__xssExecuted)).toBe(0);
});

test('archive titles are rendered as text and archive dates are safely encoded', async ({ page }) => {
  await mockNewsApi(page);
  await page.goto('/editions');
  await page.locator('#history-toggle').click();

  const historyItem = page.locator('#history-list .history-item').first();
  await expect(historyItem.locator('.history-date')).toHaveText('Edição #007 · 06/10/2026');
  await expect(historyItem.locator('.history-meta')).toHaveText('1 notícias');
  await expect(historyItem).not.toContainText('Arquivo malicioso');
  await expect(page.locator('#history-list img')).toHaveCount(0);
  expect(await page.evaluate(() => window.__xssExecuted)).toBe(0);
});
