const { test, expect } = require('@playwright/test');

const directComparison =
  '/comparar?perfis=ideologias:social-democracia,paises:brasil,personalidades:angela-davis';

test('comparação direta mostra os 12 eixos e a compatibilidade par a par', async ({ page }) => {
  await page.goto(directComparison);

  await expect(page.locator('.compare-profile')).toHaveCount(3);
  await expect(page.locator('.compare-profile .compare-name')).toHaveText([
    'Social-democracia',
    'Brasil',
    'Angela Davis'
  ]);
  await expect(page.locator('#compare-results')).toBeVisible();
  await expect(page.locator('.compare-axis')).toHaveCount(12);
  await expect(page.locator('.compare-axis .compare-marker')).toHaveCount(36);
  await expect(page.locator('.compare-axis .compare-value')).toHaveCount(36);
  await expect(page.locator('.compare-pair')).toHaveCount(3);
  await expect(page.locator('.compare-pair-score')).toHaveCount(3);
  await expect(page.locator('#compare-summary')).toContainText('Social-democracia');
  await expect(page.locator('#compare-summary')).toContainText('Brasil');
  await expect(page.locator('#compare-summary')).toContainText('Angela Davis');
  await expect(page).toHaveURL(
    /perfis=ideologias:social-democracia,paises:brasil,personalidades:angela-davis/
  );
});

test('busca, teclado e limite de três perfis', async ({ page }) => {
  await page.goto('/comparar');
  await expect(page.locator('#compare-workbench')).toHaveAttribute('aria-busy', 'false');

  const input = page.locator('#compare-search');
  await page.keyboard.press('/');
  await expect(input).toBeFocused();
  await expect(page.locator('#compare-options')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');

  await input.fill('brasil');
  await expect(page.locator('#compare-options')).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page.locator('.compare-profile')).toHaveCount(1);
  await expect(page.locator('.compare-profile .compare-name').first()).toHaveText('Brasil');
  await expect(page.locator('#compare-empty')).toBeVisible();
  await expect(page.locator('#compare-results')).toBeHidden();
  await expect(page).toHaveURL(/perfis=paises:brasil/);

  await input.fill('social-democracia');
  await expect(page.locator('#compare-options .compare-option-name').first()).toContainText(
    'Social-democracia'
  );
  await page.keyboard.press('Enter');
  await expect(page.locator('.compare-profile')).toHaveCount(2);
  await expect(page.locator('#compare-results')).toBeVisible();

  await input.fill('angela');
  await page.locator('#compare-options .compare-option').first().click();
  await expect(page.locator('.compare-profile')).toHaveCount(3);
  await expect(page.locator('#compare-picker')).toBeHidden();
  await expect(page.locator('#compare-limit')).toBeVisible();
  await expect(page.locator('.compare-axis')).toHaveCount(12);
  await expect(page.locator('.compare-pair')).toHaveCount(3);
  await expect(page).toHaveURL(/perfis=paises:brasil,ideologias:social-democracia/);
  await expect(page).toHaveURL(/personalidades:angela-davis/);

  await page.locator('.compare-profile-remove').first().click();
  await expect(page.locator('.compare-profile')).toHaveCount(2);
  await expect(page.locator('#compare-picker')).toBeVisible();
  await expect(page.locator('#compare-limit')).toBeHidden();
  await expect(page).not.toHaveURL(/paises:brasil/);
});

test('fichas do catálogo apontam para o comparador', async ({ page }) => {
  const cases = [
    {
      url: '/catalogo-politico?catalogo=ideologias#social-democracia',
      token: 'ideologias:social-democracia',
      shell: '.catalog-profile-shell'
    },
    {
      url: '/catalogo-politico?catalogo=paises#brasil',
      token: 'paises:brasil',
      shell: '.catalog-profile-shell'
    },
    {
      url: '/catalogo-politico?catalogo=paises#uniao-sovietica',
      token: 'regimes:uniao-sovietica',
      shell: '.catalog-profile-shell'
    },
    {
      url: '/catalogo-politico?catalogo=personalidades#angela-davis',
      token: 'personalidades:angela-davis',
      shell: '.catalog-profile-shell'
    },
    {
      url: '/catalogo-politico?catalogo=partidos#pt',
      token: 'partidos:pt',
      shell: '.catalog-profile-shell'
    },
    {
      url: '/catalogo-politico?catalogo=valores#valor-democracia',
      token: 'valores:democracia',
      shell: '.atlas-dialog-shell'
    }
  ];

  for (const entry of cases) {
    await page.goto(entry.url);
    await expect(page.locator(entry.shell), entry.url).toBeVisible();
    const link = page.locator('#catalog-dialog .catalog-profile-actions a').first();
    await expect(link, entry.url).toHaveAttribute(
      'href',
      `/comparar?perfis=${entry.token}`
    );
  }

  await page.goto('/catalogo-politico?catalogo=ideologias#social-democracia');
  await page.locator('#catalog-dialog .catalog-profile-actions a').first().click();
  await expect(page).toHaveURL(/\/comparar\?perfis=ideologias:social-democracia/);
  await expect(page.locator('.compare-profile')).toHaveCount(1);
  await expect(page.locator('#compare-empty')).toBeVisible();
});

test('links no formato do 12 Axes abrem a mesma comparação', async ({ page }) => {
  await page.goto(
    '/comparar?items=personality:renan-santos,personality:lula-da-silva'
  );

  await expect(page.locator('.compare-profile')).toHaveCount(2);
  await expect(page.locator('.compare-profile .compare-name')).toHaveText([
    'Renan Santos',
    'Luiz Inácio Lula da Silva'
  ]);
  await expect(page.locator('#compare-results')).toBeVisible();
  await expect(page).toHaveURL(
    /perfis=personalidades:renan-santos,personalidades:lula/
  );

  await page.goto('/comparar?items=ideology:social-democracia,country:brasil');
  await expect(page.locator('.compare-profile .compare-name')).toHaveText([
    'Social-democracia',
    'Brasil'
  ]);
  await expect(page).toHaveURL(
    /perfis=ideologias:social-democracia,paises:brasil/
  );
});

test('conceitos com perfil parcial comparam apenas os eixos definidos', async ({ page }) => {
  await page.goto('/comparar?perfis=valores:democracia,ideologias:social-democracia');

  await expect(page.locator('.compare-axis')).toHaveCount(12);
  await expect(page.locator('.compare-axis .compare-marker')).toHaveCount(15);
  await expect(page.locator('.compare-axis .compare-value.is-unknown')).toHaveCount(9);
  await expect(page.locator('.compare-pair-note')).toContainText('3 de 12 eixos em comum');
  await expect(page.locator('.compare-values .compare-value.is-unknown').first()).toContainText(
    'sem posição'
  );
});

test('o comparador responde no mobile e no tema escuro', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/comparar?perfis=ideologias:social-democracia,regimes:uniao-sovietica');

  await expect(page.locator('.compare-profile')).toHaveCount(2);
  await expect(page.locator('.compare-axis')).toHaveCount(12);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);

  await page.locator('#sidebar-toggle').click();
  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.locator('#site-sidebar-close').click();

  await expect(page.locator('.compare-profile').first()).toBeVisible();
  await expect(page.locator('.compare-legend')).toContainText('União Soviética');
});

test('seções de proximidade mostram ideologia, países, personalidades e partidos', async ({ page }) => {
  await page.goto('/comparar?items=personality:renan-santos,personality:lula-da-silva');

  await expect(page.locator('.compare-common-ideology')).toContainText('Centrismo Social');
  await expect(page.locator('.compare-common-ideology')).toContainText('97%');
  await expect(page.locator('.compare-ideology-card')).toHaveCount(2);
  await expect(page.locator('.compare-ideology-card .compare-ideology-copy h4')).toHaveText([
    'Atlantismo',
    'Socialismo democrático'
  ]);

  const currentCountries = page.locator('#compare-countries .compare-near-info h4');
  await expect(currentCountries).toHaveText(['Ucrânia', 'África do Sul']);
  await expect(page.locator('#compare-countries .compare-near-also')).toHaveCount(2);

  await page.locator('#compare-country-tabs [data-mode="historical"]').click();
  await expect(page.locator('#compare-country-tabs [data-mode="historical"]')).toHaveAttribute(
    'aria-pressed',
    'true'
  );
  await expect(currentCountries).toHaveText(['Roma Republicana', 'Chile de Allende']);

  await expect(page.locator('#compare-personalities .compare-near-info h4')).toHaveText([
    'Alex Karp',
    'Zohran Mamdani'
  ]);

  const currentParties = page.locator('#compare-parties .compare-near-info h4');
  await expect(currentParties).toHaveText([
    'Partido Missão (MISSÃO)',
    'Partido dos Trabalhadores'
  ]);
  await page.locator('#compare-party-tabs [data-mode="historical"]').click();
  await expect(currentParties).toHaveText([
    'Liberais italianos (Giolitti)',
    'Mencheviques'
  ]);
});

test('valores e bússola acompanham os perfis selecionados', async ({ page }) => {
  await page.goto('/comparar?items=personality:renan-santos,personality:lula-da-silva');

  await expect(page.locator('.compare-value-family')).toHaveCount(6);
  const firstFamily = page.locator('.compare-value-family').first();
  await expect(firstFamily).toContainText('Política');
  await expect(firstFamily.locator('.compare-value-pick-value')).toHaveText([
    'Monarquismo Constitucional',
    'Democracia'
  ]);

  const immigrationFamily = page.locator('.compare-value-family').nth(3);
  await expect(immigrationFamily).toContainText('Imigração');
  await expect(immigrationFamily.locator('.compare-value-pick-value')).toHaveText([
    'Equilíbrio',
    'Multiculturalismo'
  ]);

  await expect(page.locator('.compare-compass-grid .compare-compass-marker')).toHaveCount(2);
  await expect(page.locator('.compare-compass-strip .compare-compass-marker')).toHaveCount(2);
  await expect(page.locator('.compare-compass-legend li')).toHaveCount(2);
  await expect(page.locator('.compare-compass-legend')).toContainText('Renan Santos');
  await expect(page.locator('.compare-compass-legend')).toContainText('Luiz Inácio Lula da Silva');
  await expect(page.locator('.compare-compass-chart')).toHaveAttribute(
    'aria-label',
    /Renan Santos, 65% à direita.*Luiz Inácio Lula da Silva, 21% à direita/
  );
  await expect(page.locator('.compare-pair-score').first()).toHaveText('57,1%');
});

test('Lula fica mais próximo do PT do que do PDT', async ({ page }) => {
  // Regressão do caso que motivou a calibração: o vetor antigo aproximava
  // Lula do PDT e o afastava do próprio PT.
  await page.goto('/comparar?perfis=personalidades:lula,partidos:pt,partidos:pdt');

  const pairs = page.locator('.compare-pair');
  await expect(pairs).toHaveCount(3);
  await expect(pairs.nth(0)).toContainText('Luiz Inácio Lula da Silva');
  await expect(pairs.nth(0)).toContainText('Partido dos Trabalhadores');
  await expect(pairs.nth(0).locator('.compare-pair-score')).toHaveText('99,3%');
  await expect(pairs.nth(1)).toContainText('Partido Democrático Trabalhista');
  await expect(pairs.nth(1).locator('.compare-pair-score')).toHaveText('96,1%');
});
