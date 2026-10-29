const { expect, test } = require('@playwright/test');

test('/livros mantém a biblioteca completa em 12 eixos', async ({ page }) => {
  await page.goto('/livros');

  await expect(page.locator('#atlas-tabs')).toHaveCount(0);
  await expect(page.locator('#atlas-legend-grid li')).toHaveCount(12);
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

  const dialog = page.locator('#atlas-dialog');
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

test('/ideologias vira guia conceitual e aponta para o catálogo', async ({ page }) => {
  await page.goto('/ideologias');

  await expect(page.locator('h1')).toHaveText('Entenda as ideias antes de escolher os rótulos.');
  await expect(page.locator('#atlas-grid')).toHaveCount(0);
  await expect(page.locator('#atlas-dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Explorar o catálogo', exact: true })).toHaveAttribute('href', '/catalogo-politico?catalogo=ideologias');
  await expect(page.getByRole('link', { name: 'Fazer o teste político' })).toHaveAttribute('href', '/teste-politico');
  await expect(page.locator('#atalhos .ideology-card')).toHaveCount(5);
});
