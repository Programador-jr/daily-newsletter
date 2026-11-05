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

test('filtros do catálogo seguem o padrão de livros', async ({ page }) => {
  await page.goto('/livros');
  const booksFilterButton = page.locator('#atlas-filter-accordion > summary');
  await expect(booksFilterButton).toHaveCSS('height', '42px');
  await expect(booksFilterButton).toHaveCSS('border-radius', '8px');

  await page.goto('/catalogo-politico');
  const filter = page.locator('#catalog-filter-accordion');
  const filterButton = filter.locator(':scope > summary');
  await expect(filterButton).toHaveCSS('height', '42px');
  await expect(filterButton).toHaveCSS('border-radius', '8px');

  await filterButton.click();
  await expect(filter.locator('.atlas-filters')).toBeVisible();
  await expect(filter).not.toContainText('filtros ·');
  await page.locator('#catalog-title').click();
  await expect(filter).toHaveAttribute('open', '');
  await filterButton.click();
  await expect(filter.locator('.atlas-filters')).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(filterButton).toHaveCSS('width', '44px');
  await expect(filterButton.locator('b')).toBeHidden();

  await page.goto('/livros');
  await expect(booksFilterButton).toHaveCSS('width', '44px');

  await page.goto('/catalogo-politico?catalogo=personalidades');
  const genericFilter = page.locator('#catalog-generic-filter-accordion');
  const genericFilterButton = genericFilter.locator(':scope > summary');
  await expect(genericFilterButton).toBeVisible();
  await expect(genericFilterButton).toHaveCSS('width', '44px');
  await expect(genericFilterButton.locator('b')).toBeHidden();
});

test('cards do catálogo seguem o padrão de livros', async ({ page }) => {
  const cardStyle = async (card, summary, cta) => card.evaluate((element, selectors) => {
    const style = window.getComputedStyle(element);
    const summaryStyle = window.getComputedStyle(element.querySelector(selectors.summary));
    const ctaStyle = window.getComputedStyle(element.querySelector(selectors.cta));

    return {
      borderLeftWidth: style.borderLeftWidth,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
      summary: {
        fontSize: summaryStyle.fontSize,
        lineHeight: summaryStyle.lineHeight,
        margin: summaryStyle.margin,
        minHeight: summaryStyle.minHeight,
        lineClamp: summaryStyle.webkitLineClamp,
      },
      cta: {
        borderRadius: ctaStyle.borderRadius,
        fontSize: ctaStyle.fontSize,
        minHeight: ctaStyle.minHeight,
        padding: ctaStyle.padding,
      },
    };
  }, { summary, cta });
  const cardFrame = card => card.evaluate(element => {
    const style = window.getComputedStyle(element);
    return {
      borderLeftWidth: style.borderLeftWidth,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
    };
  });

  await page.goto('/livros');
  const bookCard = page.locator('.books-page .atlas-grid .atlas-card').first();
  await expect(bookCard).toBeVisible();
  const bookStyle = await cardStyle(bookCard, '.atlas-card-summary', '.atlas-card-cta');

  await page.goto('/catalogo-politico');
  const ideaCard = page.locator('.catalog-idea-card').first();
  await expect(ideaCard).toBeVisible();
  await expect(ideaCard.locator(':scope > a')).toHaveCSS('padding', '16px');
  expect(await cardStyle(ideaCard, '.catalog-idea-summary', '.catalog-idea-go')).toEqual(bookStyle);

  await page.goto('/catalogo-politico?catalogo=personalidades');
  const genericCard = page.locator('.catalog-generic-view .atlas-card').first();
  await expect(genericCard).toBeVisible();
  expect(await cardStyle(genericCard, '.catalog-card-summary', '.catalog-card-cta')).toEqual(bookStyle);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/livros');
  const mobileBookCard = page.locator('.books-page .atlas-grid .atlas-card').first();
  await expect(mobileBookCard).toBeVisible();
  const mobileBookFrame = await cardFrame(mobileBookCard);

  await page.goto('/catalogo-politico');
  const mobileIdeaCard = page.locator('.catalog-idea-card').first();
  expect(await cardFrame(mobileIdeaCard)).toEqual(mobileBookFrame);
  await expect(mobileIdeaCard.locator(':scope > a')).toHaveCSS('padding', '12px');

  await page.goto('/catalogo-politico?catalogo=personalidades');
  const mobileGenericCard = page.locator('.catalog-generic-view .atlas-card').first();
  expect(await cardFrame(mobileGenericCard)).toEqual(mobileBookFrame);
  await expect(mobileGenericCard).toHaveCSS('padding', '12px');
});

test('busca e filtros permanecem fixos durante a rolagem', async ({ page }) => {
  for (const viewport of [
    { width: 1280, height: 800, top: 88 },
    { width: 390, height: 844, top: 76 },
  ]) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const catalog of [
      { url: '/catalogo-politico', selector: '.catalog-ideology-view .catalog-controls' },
      { url: '/catalogo-politico?catalogo=personalidades', selector: '.catalog-generic-view .atlas-controls-shell' },
    ]) {
      await page.goto(catalog.url);
      const controls = page.locator(catalog.selector);
      await expect(controls).toHaveCSS('position', 'sticky');
      await expect(controls).toHaveCSS('top', `${viewport.top}px`);
      await page.evaluate(() => window.scrollTo(0, 3000));
      await expect.poll(async () => (await controls.boundingBox()).y).toBeCloseTo(viewport.top, 0);
    }
  }
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

  await page.locator('#catalog-generic-sort-trigger').click();
  await page.locator('#catalog-generic-sort-menu .atlas-sort-option[data-value="az"]').click();
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
