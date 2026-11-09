const { expect, test } = require('@playwright/test');

test('/livros mantém a biblioteca completa em 12 eixos', async ({ page }) => {
  await page.goto('/livros');

  await expect(page.locator('#atlas-tabs')).toHaveCount(0);
  await expect(page.locator('#atlas-featured-grid .atlas-card')).toHaveCount(3);
  await expect(page.locator('#atlas-grid .atlas-card')).toHaveCount(321);
  await expect(page.locator('#atlas-grid .atlas-book-card-image, #atlas-grid .atlas-book-card-fallback').first()).toBeVisible();
  await expect(page.locator('#atlas-grid .atlas-fp').first().locator('.atlas-fp-col')).toHaveCount(12);
  await expect(page.locator('[data-atlas-stat="total"]')).toHaveText('321');
  await expect(page.locator('[data-atlas-stat="eixos"]')).toHaveText('12');
  await expect(page.locator('[data-atlas-stat="areas"]')).toHaveText('8');
  await expect(page.locator('#atlas-book-spectrum')).toContainText('Distribuição por área');
  await expect(page.locator('.atlas-book-spectrum-segment')).toHaveCount(8);
});

test('a página de livros não cria uma segunda navegação', async ({ page }) => {
  await page.goto('/livros');
  await expect(page.locator('.atlas-tabs')).toHaveCount(0);
});

test('a ficha de um livro mostra apenas ficha e por que ler', async ({ page }) => {
  await page.goto('/livros#leviata');

  // Books open in the history-style detail panel, not in the native catalog dialog.
  const dialog = page.locator('#atlas-book-detail [role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(page.locator('#atlas-dialog-title')).toContainText('Leviatã');
  await expect(dialog.locator('.atlas-dialog-section')).toHaveCount(2);
  await expect(dialog).toContainText('Ficha');
  await expect(dialog).toContainText('Por que ler');
  await expect(dialog.locator('.atlas-book-card-image, .atlas-book-card-fallback')).toHaveCount(0);
  await expect(dialog.locator('.atlas-axis-row')).toHaveCount(0);
  await expect(dialog.locator('.atlas-nearby-item')).toHaveCount(0);

  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test.describe('filtros no celular', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  for (const path of ['/livros', '/partidos']) {
    test(`${path} abre o painel de filtros visível e tocável`, async ({ page }) => {
      await page.goto(path);
      const toggle = page.locator('.atlas-filter-accordion > summary').filter({ visible: true }).first();
      await toggle.scrollIntoViewIfNeeded();
      await toggle.tap();

      const panel = page.locator('.atlas-filter-accordion[open] .atlas-filters');
      // O <details> não pode cortar o painel suspenso (antes a regra global de cards aplicava overflow: hidden).
      await expect(page.locator('.atlas-filter-accordion[open]')).toHaveCSS('overflow', 'visible');
      const box = await panel.boundingBox();
      expect(box.height).toBeGreaterThan(100);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);

      const option = panel.locator('button').nth(1);
      await option.tap();
      await expect(option).toHaveAttribute('aria-pressed', 'true');
    });
  }
});

test('/ideologias vira guia conceitual e aponta para o catálogo', async ({ page }) => {
  await page.goto('/ideologias');

  await expect(page.locator('h1')).toHaveText('Entenda as ideias antes de escolher os rótulos.');
  await expect(page.locator('#atlas-grid')).toHaveCount(0);
  await expect(page.locator('#atlas-dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Explorar o catálogo', exact: true })).toHaveAttribute('href', '/catalogo-politico?catalogo=ideologias');
  await expect(page.getByRole('link', { name: 'Fazer o teste político' })).toHaveAttribute('href', '/teste-politico');
  await expect(page.locator('#atalhos .ideology-card')).toHaveCount(5);
});
