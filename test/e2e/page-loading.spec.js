const { expect, test } = require('@playwright/test');

test('exibe e encerra o carregamento global da página', async ({ page }) => {
  await page.goto('/historia', { waitUntil: 'domcontentloaded' });

  const overlay = page.locator('#page-loading-overlay');
  await expect(overlay).toHaveCount(1);
  await expect(overlay.locator('.page-loading-brand-top')).toHaveText("KING'S");
  await expect(overlay.locator('.page-loading-brand-bottom')).toHaveText('Newsletter');
  await expect(overlay).toHaveAttribute('aria-hidden', 'true');
  await expect(overlay).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('html')).not.toHaveClass(/page-loader-active/);

  await page.goto('/editions');
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('reativa o carregamento antes de uma navegação interna', async ({ page }) => {
  await page.goto('/historia');

  await page.evaluate(() => {
    window.pageLoader.show('Abrindo a próxima página…');
  });

  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('#page-loading-overlay')).toContainText('Abrindo a próxima página');
  await expect(page.locator('html')).toHaveClass(/page-loader-active/);
});

test('prepara skeletons para imagens remotas e dados externos', async ({ page }) => {
  await page.goto('/gastometro', { waitUntil: 'domcontentloaded' });

  await expect.poll(() => page.evaluate(() => typeof window.pageSkeleton?.refresh)).toBe('function');
  await expect(page.locator('[aria-busy="true"] [data-meter-value]').first()).toHaveClass(/page-skeleton-value/);
});
