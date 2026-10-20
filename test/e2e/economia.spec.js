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
  await expect(page.getByRole('heading', { name: 'Entenda os números da economia.' })).toBeVisible();
  await expect(page.locator('#site-sidebar')).toHaveCount(1);
  await expect(page.locator('#sidebar-toggle')).toHaveCount(1);
  await expect(page.locator('#back-to-top')).toHaveCount(1);
  await expect(page.locator('.site-sidebar-nav a[href="/economia"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.live-indicator')).toHaveCount(4);\n  await expect(page.getByRole('button', { name: /Entenda o indicador/ }).first()).toBeVisible();\n  await expect(page.getByRole('heading', { name: 'Como funciona o arcabouço fiscal?' })).toBeVisible();
  await expect(page.locator('#economy-news')).toContainText('Exemplo de notícia econômica');
  await expect(page.locator('#economy-news')).toContainText('Fonte de teste');
  await expect(page.getByRole('heading', { name: 'Teste os cenários' })).toBeVisible();\n  await expect(page.locator('#basket-result')).toContainText('210,00');
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


test('indicadores abrem explicações em pop-up acessível', async ({ page }) => {
  await page.route('**/api/updates/active', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ update: null }) }));
  await page.route('**/api/news', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stories: [] }) }));
  await page.route('https://api.bcb.gov.br/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ data: '16/10/2026', valor: '15.00' }]) }));
  await page.goto('/economia');
  const firstIndicatorButton = page.getByRole('button', { name: /Entenda o indicador/ }).first();
  await firstIndicatorButton.click();
  await expect(page.locator('#economy-modal')).toHaveClass(/history-detail/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Taxa Selic' })).toBeVisible();
  await expect(page.locator('.history-detail-dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Fechar explicação' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await firstIndicatorButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(firstIndicatorButton).toBeFocused();
});

test('simuladores recalculam os resultados ao alterar os valores', async ({ page }) => {
  await page.route('**/api/updates/active', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ update: null }) }));
  await page.route('**/api/news', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ stories: [] }) }));
  await page.route('https://api.bcb.gov.br/**', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ data: '16/10/2026', valor: '15.00' }]) }));
  await page.goto('/economia');
  await page.locator('#basket-inflation').fill('10');
  await expect(page.locator('#basket-result')).toContainText('220,00');
  await page.locator('#fiscal-target').selectOption('no');
  await expect(page.locator('#fiscal-result')).toContainText('1,5%');
});
