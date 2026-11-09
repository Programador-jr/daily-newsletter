const { expect, test } = require('@playwright/test');

test('exibe e encerra o carregamento global da página', async ({ page }) => {
  await page.goto('/historia', { waitUntil: 'domcontentloaded' });

  const overlay = page.locator('#page-loading-overlay');
  await expect(overlay).toHaveCount(1);
  await expect(overlay).toHaveAttribute('aria-label', 'Carregando página');
  await expect(overlay.locator('svg.page-loading-crown .page-loading-crown-jewel')).toHaveCount(3);
  await expect(overlay).toHaveText('');
  await expect(overlay).toHaveAttribute('aria-hidden', 'true');
  await expect(overlay).toHaveCSS('visibility', 'hidden');
  await expect(page.locator('html')).not.toHaveClass(/page-loader-active/);

  await page.goto('/editions');
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('reativa o carregamento antes de uma navegação interna', async ({ page }) => {
  await page.goto('/historia');

  await page.evaluate(() => {
    window.pageLoader.show();
  });

  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'false');
  await expect(page.locator('html')).toHaveClass(/page-loader-active/);
});

test('não prende o carregamento em links tratados na própria página', async ({ page }) => {
  await page.goto('/historia');
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => {
    const link = document.createElement('a');
    link.href = '?perfil=teste';
    link.id = 'link-em-pagina';
    link.textContent = 'abrir ficha';
    link.addEventListener('click', event => event.preventDefault());
    document.body.append(link);
    link.click();
  });

  await page.waitForTimeout(300);
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('esconde o carregamento ao voltar pelo cache do navegador', async ({ page }) => {
  await page.goto('/historia');
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => {
    window.pageLoader.show();
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });

  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('esconde o carregamento quando a saída da página não acontece', async ({ page }) => {
  await page.clock.install();
  await page.goto('/historia');
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');

  await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')));
  // Navegações rápidas não chegam a mostrar a coroa.
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
  await page.clock.runFor(200);
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'false');

  await page.clock.runFor(8500);
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
});

test('mostra o conteúdo sem esperar requisições travadas', async ({ page }) => {
  await page.route('**/api/**', () => {});
  await page.goto('/gastometro', { waitUntil: 'domcontentloaded' });

  // A página aparece logo; só a área de dados fica em skeleton.
  await expect(page.locator('#page-loading-overlay')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[aria-busy="true"] [data-meter-value]').first()).toHaveClass(/page-skeleton-value/);
});

test('prepara skeletons para imagens remotas e dados externos', async ({ page }) => {
  await page.goto('/gastometro', { waitUntil: 'domcontentloaded' });

  await expect.poll(() => page.evaluate(() => typeof window.pageSkeleton?.refresh)).toBe('function');
  await expect(page.locator('[aria-busy="true"] [data-meter-value]').first()).toHaveClass(/page-skeleton-value/);
});
