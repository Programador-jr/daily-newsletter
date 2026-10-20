const { expect, test } = require('@playwright/test');

test('página de economia reutiliza a navegação compartilhada e exibe fontes oficiais', async ({ page }) => {
  await page.route('**/api/updates/active', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ update: null })
  }));
  await page.route('**/api/news', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      date: '20/10/2026',
      stories: [{
        category: 'Economia',
        title: 'Exemplo de notícia econômica',
        summary: 'Resumo de teste.',
        context: 'Contexto de teste.',
        source: 'Fonte de teste',
        publishedAt: '20/10/2026',
        url: 'https://example.com/economia'
      }]
    })
  }));

  await page.goto('/economia');
  await expect(page.getByRole('heading', { name: 'Os números por trás das decisões.' })).toBeVisible();
  await expect(page.locator('#site-sidebar')).toHaveCount(1);
  await expect(page.locator('#sidebar-toggle')).toHaveCount(1);
  await expect(page.locator('#back-to-top')).toHaveCount(1);
  await expect(page.locator('.site-sidebar-nav a[href="/economia"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: /Consultar Banco Central/ })).toHaveAttribute('href', 'https://www.bcb.gov.br/controleinflacao/taxaselic');
  await expect(page.locator('#economy-news')).toContainText('Exemplo de notícia econômica');
  await expect(page.locator('#economy-news')).toContainText('Fonte de teste');
  await expect(page.getByText('Exemplo hipotético')).toBeVisible();
});

test('página de economia informa quando a API de notícias está indisponível', async ({ page }) => {
  await page.route('**/api/updates/active', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ update: null })
  }));
  await page.route('**/api/news', route => route.fulfill({ status: 503, body: 'Indisponível' }));

  await page.goto('/economia');
  await expect(page.locator('#economy-news')).toContainText('Não foi possível carregar as notícias econômicas agora');
  await expect(page.locator('#site-sidebar')).toHaveCount(1);
  await expect(page.locator('#back-to-top')).toHaveCount(1);
});

test('página de economia adapta a grade para dispositivos móveis', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/api/updates/active', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ update: null })
  }));
  await page.route('**/api/news', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ date: '20/10/2026', stories: [] })
  }));

  await page.goto('/economia');
  await expect(page.locator('.economy-indicator')).toHaveCount(4);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    page: document.documentElement.scrollWidth
  }));
  expect(dimensions.page).toBeLessThanOrEqual(dimensions.viewport + 1);
});
