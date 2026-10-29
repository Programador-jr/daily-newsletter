const { test, expect } = require('@playwright/test');

test('páginas próprias de personalidades e países carregam sua categoria e preservam a rota nas fichas', async ({ page }) => {
  await page.goto('/personalidades');
  await expect(page).toHaveURL(/\/personalidades$/);
  await expect(page.locator('#catalog-title')).toContainText('Personalidades');
  await expect(page.locator('.catalog-personality-card').first()).toBeVisible();
  await page.locator('.catalog-personality-card').first().click();
  await expect(page.locator('#catalog-dialog')).toBeVisible();
  await expect(page).toHaveURL(/\/personalidades#/);
  await page.locator('.catalog-profile-close').click();

  await page.goto('/paises');
  await expect(page).toHaveURL(/\/paises$/);
  await expect(page.locator('#catalog-title')).toContainText('Países');
  await expect(page.locator('.catalog-country-card').first()).toBeVisible();
  await page.locator('.catalog-country-card').first().click();
  await expect(page.locator('#catalog-dialog')).toBeVisible();
  await expect(page).toHaveURL(/\/paises#/);

  await page.goto('/partidos');
  await expect(page).toHaveURL(/\/partidos$/);
  await expect(page.locator('#catalog-title')).toContainText('Partidos');
  await expect(page.locator('.catalog-party-card').first()).toBeVisible();
  await page.locator('.catalog-party-card').first().click();
  await expect(page.locator('#catalog-dialog')).toBeVisible();
  await expect(page).toHaveURL(/\/partidos#/);
});

test('escopos, chips e busca', async ({ page }) => {
  await page.goto('/catalogo-politico');
  await expect(page.locator('.catalog-idea-card')).toHaveCount(393);

  await page.locator('#catalog-scope .catalog-scope-button', { hasText: 'Valores' }).click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(110);
  await expect(page.locator('.catalog-group')).toHaveCount(6);
  await expect(page).toHaveURL(/catalogo=valores$/);
  await expect(page.locator('#catalog-method-note')).toBeVisible();

  await page.locator('#catalog-scope .catalog-scope-button', { hasText: 'Ideologias' }).click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(283);
  await expect(page.locator('.catalog-group')).toHaveCount(8);
  await expect(page).toHaveURL(/catalogo=ideologias$/);

  await page.locator('#catalog-scope .catalog-scope-button', { hasText: 'Tudo' }).click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(393);
  await expect(page).toHaveURL(/catalogo-politico$/);

  const chip = page.locator('#catalog-chips .catalog-chip').first();
  await chip.click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(30);
  await expect(page.locator('.catalog-group')).toHaveCount(1);
  await chip.click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(283);

  await page.locator('#catalog-search').fill('social');
  await expect(page.locator('#catalog-result-count')).toContainText('resultados');
  const count = await page.locator('.catalog-idea-card').count();
  expect(count).toBeGreaterThan(0);
  await page.locator('#catalog-search').fill('');
  await expect(page.locator('.catalog-idea-card')).toHaveCount(283);

  await page.keyboard.press('/');
  await expect(page.locator('#catalog-search')).toBeFocused();
});

test('drawer de eixos', async ({ page }) => {
  await page.goto('/catalogo-politico');
  await page.locator('#catalog-filter-toggle').click();
  await expect(page.locator('#catalog-filter-drawer')).toBeVisible();
  await expect(page.locator('.catalog-axis-card')).toHaveCount(12);

  await page.getByRole('button', { name: 'Estrutura: Federal' }).click();
  await expect(page.locator('#catalog-filter-count')).toHaveText('1');
  await expect(page.locator('#catalog-active-pills .catalog-active-pill')).toHaveCount(1);
  const federal = await page.locator('.catalog-idea-card').count();
  expect(federal).toBeGreaterThan(0);
  expect(federal).toBeLessThan(393);

  await page.getByLabel('Posição forte').check();
  const strong = await page.locator('.catalog-idea-card').count();
  expect(strong).toBeGreaterThan(0);
  expect(strong).toBeLessThan(federal);

  await page.locator('#catalog-drawer-apply').click();
  await expect(page.locator('#catalog-filter-drawer')).toBeHidden();
  await expect(page.locator('#catalog-filter-toggle')).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#catalog-filter-count')).toHaveText('2');

  await page.locator('#catalog-active-clear').click();
  await expect(page.locator('.catalog-idea-card')).toHaveCount(393);
  await expect(page.locator('#catalog-active-filters')).toBeHidden();
  await expect(page.locator('#catalog-filter-count')).toBeHidden();
});

test('fichas de ideologia e valor', async ({ page }) => {
  await page.goto('/catalogo-politico');
  await page.locator('.catalog-idea-card a[href="#social-democracia"]').click();
  await expect(page.locator('#catalog-dialog')).toBeVisible();
  await expect(page.locator('#catalog-dialog-title')).toHaveText('Social-democracia');
  await expect(page.locator('.atlas-axis-row')).toHaveCount(12);
  await expect(page.locator('.atlas-axis-row.is-unknown')).toHaveCount(0);
  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Países' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="paises"]')).toContainText('Brasil');
  await page.keyboard.press('Escape');
  await expect(page.locator('#catalog-dialog')).not.toBeVisible();
  await expect(page).toHaveURL(/catalogo-politico$/);

  await page.goto('/catalogo-politico?catalogo=valores');
  await page.locator('.catalog-idea-card a[href="#valor-autocracia"]').click();
  await expect(page.locator('#catalog-dialog-title')).toHaveText('Autocracia');
  await expect(page.locator('.atlas-axis-row')).toHaveCount(12);
  const unknown = await page.locator('.atlas-axis-row.is-unknown').count();
  expect(unknown).toBe(9);
});

test('fichas sem vínculo explícito recebem referências por proximidade', async ({ page }) => {
  await page.goto('/catalogo-politico#marxismo');
  await expect(page.locator('.catalog-profile-reference')).toHaveCount(2);

  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Personalidades' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="personalidades"] .atlas-related a').first()).toBeVisible();

  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Países' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="paises"] .atlas-related a').first()).toBeVisible();
});

test('abas genéricas', async ({ page }) => {
  await page.goto('/catalogo-politico?catalogo=personalidades');
  await expect(page.locator('#catalog-generic-view')).toBeVisible();
  await expect(page.locator('#catalog-ideology-view')).toBeHidden();
  await expect(page.locator('#catalog-featured')).toBeHidden();
  await expect(page.locator('#catalog-generic-grid .catalog-card')).toHaveCount(36);
  await expect(page.locator('#catalog-generic-count')).toContainText('Exibindo 36 de 667');

  await page.locator('#catalog-generic-sort').selectOption('az');
  await page.locator('#catalog-generic-load-more').click();
  await expect(page.locator('#catalog-generic-grid .catalog-card')).toHaveCount(72);

  await page.locator('#catalog-generic-search').fill('marx');
  await expect(page.locator('#catalog-generic-count')).toContainText('de');

  await page.goto('/catalogo-politico?catalogo=paises');
  await expect(page.locator('#catalog-generic-grid .catalog-card')).toHaveCount(36);
  await page.goto('/catalogo-politico?catalogo=partidos');
  await expect(page.locator('#catalog-generic-grid .catalog-card')).toHaveCount(36);
});

test('países e regimes têm distribuição, cards de bandeira e ficha própria', async ({ page }) => {
  await page.goto('/catalogo-politico?catalogo=paises');
  await expect(page.locator('#catalog-country-spectrum')).toBeVisible();
  await expect(page.locator('#catalog-stats')).toContainText('países atuais');
  await expect(page.locator('.catalog-country-card')).toHaveCount(36);

  await page.locator('#catalog-generic-search').fill('Afeg');
  await expect(page.locator('.catalog-country-card').first()).toBeVisible();
  await page.locator('.catalog-country-card').first().click();
  await expect(page.locator('.catalog-profile-shell')).toBeVisible();
  await expect(page.locator('.catalog-profile-axis-list .catalog-profile-axis')).toHaveCount(12);
  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Ideologias' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="ideologias"] .atlas-related a').first()).toBeVisible();
});

test('personalidades têm distribuição, retratos e ficha própria', async ({ page }) => {
  await page.goto('/catalogo-politico?catalogo=personalidades');
  await expect(page.locator('#catalog-personality-spectrum')).toBeVisible();
  await expect(page.locator('#catalog-stats')).toContainText('667');
  await expect(page.locator('.catalog-personality-card')).toHaveCount(36);

  await page.locator('#catalog-generic-search').fill('Angela Davis');
  await expect(page.locator('.catalog-personality-card').first()).toContainText('Angela Davis');
  await expect(page.locator('.catalog-personality-card').first().locator('img')).toBeVisible();

  await page.locator('#catalog-generic-search').fill('Abdullah II');
  await expect(page.locator('.catalog-personality-card').first()).toBeVisible();
  await page.locator('.catalog-personality-card').first().click();
  await expect(page.locator('.catalog-profile-shell')).toBeVisible();
  await expect(page.locator('.catalog-profile-axis-list .catalog-profile-axis')).toHaveCount(12);
  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Ideologias' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="ideologias"] .atlas-related a').first()).toBeVisible();
});

test('partidos têm distribuição, logos e ficha própria', async ({ page }) => {
  await page.goto('/catalogo-politico?catalogo=partidos');
  await expect(page.locator('#catalog-party-spectrum')).toBeVisible();
  await expect(page.locator('#catalog-stats')).toContainText('211');
  await expect(page.locator('.catalog-party-card')).toHaveCount(36);

  await page.locator('#catalog-generic-search').fill('die-linke');
  await expect(page.locator('.catalog-party-card').first()).toContainText('A Esquerda');
  await expect(page.locator('.catalog-party-card').first().locator('img')).toBeVisible();
  await page.locator('.catalog-party-card').first().click();
  await expect(page.locator('.catalog-profile-shell')).toBeVisible();
  await expect(page.locator('#catalog-dialog-title')).toHaveText('A Esquerda');
  await expect(page.locator('.catalog-profile-axis-list .catalog-profile-axis')).toHaveCount(12);
  await page.locator('.catalog-profile-tabs button').filter({ hasText: 'Ideologias' }).click();
  await expect(page.locator('.catalog-profile-tab-panel[data-panel="ideologias"] .atlas-related a').first()).toBeVisible();
});

test('mobile e tema escuro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/catalogo-politico');
  await expect(page.locator('.catalog-ideas-grid').first()).toBeVisible();
  await page.locator('#catalog-filter-toggle').click();
  await expect(page.locator('#catalog-filter-drawer')).toBeVisible();
  await page.locator('#catalog-drawer-close').click();

  await page.locator('#sidebar-toggle').click();
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#site-sidebar-close').click();
  await expect(page.locator('.catalog-idea-card').first()).toBeVisible();
});
