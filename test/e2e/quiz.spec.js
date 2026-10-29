const fs = require('node:fs');
const { expect, test } = require('@playwright/test');

const legacyProfileQuery = 'est=55&rep=57&pod=41.8&imi=28.7&dip=61.3&int=70&eco=60&con=71&com=47&rel=90&mor=38.8&tec=31.3';

test('o questionário curto calcula o perfil e abre o resultado completo', async ({ page }) => {
  await page.goto('/teste-politico');

  await expect(page.locator('.quiz-choice-card')).toHaveCount(3);
  await page.locator('.quiz-choice-card').first().click();
  await expect(page.locator('#quiz-progress-label')).toHaveText('Pergunta 1 de 36');
  await page.locator('#quiz-auto-advance').evaluate((element) => { element.checked = false; });

  for (let index = 0; index < 36; index += 1) {
    await page.locator('#quiz-answers .quiz-answer-option').nth(2).click();
    await page.locator('#quiz-next').click();
  }

  await expect(page.locator('#quiz-progress-label')).toHaveText('Identificando seu arquétipo');
  await expect(page.locator('#quiz-progress-percent')).toHaveText('1 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Sociedade');
  await expect(page.locator('#quiz-question')).toHaveText('A sociedade deve se apoiar em quê?');
  await expect(page.locator('.quiz-question-number')).toHaveText('01');
  await expect(page.locator('.quiz-archetype-option')).toHaveCount(6);
  await expect(page.locator('.quiz-archetype-letter')).toHaveText(['A', 'B', 'C', 'D', 'E', 'F']);
  await expect(page.locator('#quiz-progress-segments span')).toHaveCount(13);
  await expect(page.locator('#quiz-progress-segments span').last()).toHaveClass(/is-partial/);
  await expect(page.locator('#quiz-auto-advance-label')).toBeHidden();
  await expect(page.locator('#quiz-skip')).toBeVisible();
  await expect(page.locator('#quiz-next')).toBeHidden();

  await page.locator('.quiz-archetype-option').nth(3).click();
  await expect(page.locator('#quiz-progress-percent')).toHaveText('2 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Poder');

  // Voltar preserva a resposta; da primeira pergunta, retorna à última afirmação.
  await page.locator('#quiz-back').click();
  await expect(page.locator('#quiz-progress-percent')).toHaveText('1 de 6');
  await expect(page.locator('.quiz-archetype-option').nth(3).locator('input')).toBeChecked();
  await page.locator('#quiz-back').click();
  await expect(page.locator('#quiz-progress-label')).toHaveText('Pergunta 36 de 36');
  await expect(page.locator('#quiz-next')).toContainText('Ver meu perfil');

  // Retomar o arquétipo mantém a escolha, e clicar na mesma opção avança.
  await page.locator('#quiz-next').click();
  await expect(page.locator('#quiz-progress-percent')).toHaveText('1 de 6');
  await expect(page.locator('.quiz-archetype-option').nth(3).locator('input')).toBeChecked();
  await page.locator('.quiz-archetype-option').nth(3).click();
  await expect(page.locator('#quiz-progress-percent')).toHaveText('2 de 6');

  // Pular remove a resposta desta pergunta.
  await page.locator('#quiz-skip').click();
  await expect(page.locator('#quiz-progress-percent')).toHaveText('3 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Economia');
  await expect(page.locator('.quiz-archetype-option')).toHaveCount(6);
  await page.locator('.quiz-archetype-option').first().click();

  await expect(page.locator('#quiz-progress-percent')).toHaveText('4 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Mundo');
  await page.locator('.quiz-archetype-option').nth(2).click();

  await expect(page.locator('#quiz-progress-percent')).toHaveText('5 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Tecnologia');
  await page.locator('.quiz-archetype-option').nth(2).click();

  await expect(page.locator('#quiz-progress-percent')).toHaveText('6 de 6');
  await expect(page.locator('#quiz-axis-label')).toHaveText('Religião');
  await expect(page.locator('.quiz-archetype-tile')).toHaveCount(7);
  await expect(page.locator('.quiz-archetype-tile.is-wide')).toHaveCount(1);
  await expect(page.locator('.quiz-archetype-tile.is-wide')).toContainText('Sem religião');
  await page.locator('.quiz-archetype-tile.is-wide').click();

  await expect(page).toHaveURL(/\/resultado-politico\?perfil=/);
  await expect(page.locator('#quiz-results')).toBeVisible();
  await expect(page.locator('#results-empty')).toBeHidden();
  await expect(page.locator('.quiz-result-axis')).toHaveCount(12);
  await expect(page.locator('#bussola')).toBeVisible();
  await expect(page.locator('#bussola .quiz-compass-grid > span:not(.quiz-compass-x)')).toHaveCount(81);
  await expect(page.locator('#bussola .quiz-compass-strip > span:not(.quiz-compass-x)')).toHaveCount(9);
  await expect(page.locator('#bussola .quiz-compass-sentence')).toContainText('com valores sociais');
  await expect(page.locator('#results-toc a[href="#bussola"]')).toHaveCount(1);
  const tocLabels = await page.locator('#results-toc a').allTextContents();
  expect(tocLabels.map((label) => label.replace(/\s+/g, ' ').trim())).toEqual([
    '01 12 eixos',
    '02 Distinção',
    '03 Países',
    '04 Personalidades',
    '05 Áreas',
    '06 Livros',
    '07 Partidos',
    '08 Valores',
    '09 Ideologias',
    '10 Bússola',
    '11 Comparar'
  ]);
  const sectionOrder = await page.locator('#quiz-results > section[id]').evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(sectionOrder).toEqual([
    'eixos-resultado',
    'assinatura',
    'resultado-paises',
    'resultado-figuras',
    'areas',
    'resultado-livros',
    'resultado-partidos',
    'valores',
    'resultado-ideologias',
    'bussola',
    'comparar'
  ]);
  const economyRow = page.locator('.quiz-result-axis').filter({
    has: page.locator('.quiz-result-axis-heading strong', { hasText: 'Economia' })
  });
  await expect(economyRow.locator('.quiz-result-axis-percent')).toHaveText('60,5%');
  await expect(economyRow.locator('.quiz-result-poles span').first()).toHaveText('Público');
  const representationRow = page.locator('.quiz-result-axis').filter({
    has: page.locator('.quiz-result-axis-heading strong', { hasText: 'Representação' })
  });
  await expect(representationRow.locator('.quiz-result-axis-percent')).toHaveText('50%');
  await expect(page.locator('.quiz-profile-affinity')).toContainText('Maior proximidade nesta seleção');
  await expect(page.locator('.quiz-match-group')).toHaveCount(4);
  await expect(page.locator('.quiz-match-group > h3').nth(0)).toContainText('Países mais próximos de você (194)');
  await expect(page.locator('.quiz-match-group > h3').nth(1)).toContainText('Personalidades mais próximas de você (667)');
  await expect(page.locator('.quiz-match-group > h3').nth(2)).toContainText('Partidos mais próximos de você (211)');
  await expect(page.locator('.quiz-match-group > h3').nth(3)).toContainText('Ideologias mais próximas de você (283)');
  await expect(page.locator('#resultado-paises .quiz-match-subgroup > h4')).toHaveText('Regimes e modelos políticos (114)');
  await expect(page.locator('.quiz-match-card')).toHaveCount(15);
  await expect(page.locator('#assinatura .quiz-distinction-card')).toHaveCount(2);
  await expect(page.locator('#areas .quiz-rank-row')).toHaveCount(8);
  await expect(page.locator('#valores .quiz-value-card')).toHaveCount(6);
  await expect(page.locator('.quiz-books .quiz-book-card')).toHaveCount(6);

  const areas = page.locator('#areas');
  await expect(areas.locator('.quiz-areas-tab')).toHaveCount(2);
  await expect(areas.getByRole('tab', { name: 'Compatibilidade geral' })).toHaveAttribute('aria-selected', 'true');
  await areas.getByRole('tab', { name: 'Área de atuação' }).click();
  await expect(areas.getByRole('tab', { name: 'Área de atuação' })).toHaveAttribute('aria-selected', 'true');
  await expect(areas.locator('.quiz-panel-title')).toHaveText('Os mais próximos por área de atuação');
  await expect(areas.locator('.quiz-rank-row')).toHaveCount(8);
  const areaLabels = await areas.locator('.quiz-rank-info small').allTextContents();
  expect(new Set(areaLabels).size).toBe(8);

  await areas.getByRole('tab', { name: 'Área de atuação' }).press('ArrowLeft');
  await expect(areas.getByRole('tab', { name: 'Compatibilidade geral' })).toHaveAttribute('aria-selected', 'true');
  await expect(areas.locator('.quiz-areas-panel')).toHaveAttribute('aria-labelledby', 'areas-tab-general');
});

test('o resultado importado mostra eixos, afinidades, leituras e reinício', async ({ page }) => {
  await page.goto(`/resultado-politico?${legacyProfileQuery}`);

  await expect(page.locator('#results-empty')).toBeHidden();
  await expect(page.locator('#quiz-results > h3')).toHaveText('Perfil convertido do 12axes');
  await expect(page.locator('.quiz-result-axis')).toHaveCount(12);
  await expect(page.locator('#quiz-results details')).toHaveCount(0);
  await expect(page.locator('.quiz-result-axis .quiz-axis-help')).toHaveCount(12);
  await expect(page.locator('.quiz-match-card').first().getByRole('button', { name: /^Comparar os 12 eixos com / })).toBeVisible();
  await expect(page.locator('.quiz-books-intro')).toContainText('não endossos');
  await expect(page.locator('.quiz-book-card').first().locator('strong')).not.toBeEmpty();

  await expect(page.locator('#bussola')).toBeVisible();
  await expect(page.locator('#bussola .quiz-compass-sentence')).toContainText('com valores sociais');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Baixar cartão' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('meu-perfil-politico.png');
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  expect(fs.readFileSync(downloadPath).subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');

  await page.getByRole('button', { name: 'Refazer questionário' }).click();
  await expect(page).toHaveURL('/teste-politico#quiz-politico');
  await expect(page.locator('#quiz-intro, .quiz-intro')).toBeVisible();
});

test('o resultado concentra detalhes em pop-ups com links internos', async ({ page }) => {
  await page.goto(`/resultado-politico?${legacyProfileQuery}`);

  await expect(page.locator('#quiz-results details')).toHaveCount(0);
  const dialog = page.locator('#result-help-dialog');

  const economyRow = page.locator('.quiz-result-axis').filter({
    has: page.locator('.quiz-result-axis-heading strong', { hasText: 'Economia' })
  });
  await economyRow.getByRole('button', { name: 'Entender o eixo Economia' }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#result-help-dialog-title')).toHaveText('Eixo · Economia');
  await expect(dialog).toContainText('O que mede');
  await expect(dialog.getByRole('link', { name: 'Ver no guia dos 12 eixos' })).toHaveAttribute('href', '/teste-politico#eixo-economia');
  await page.locator('#result-help-close').click();
  await expect(dialog).not.toBeVisible();

  await page.locator('#bussola').getByRole('button', { name: /Como a bússola é feita/ }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#result-help-dialog-title')).toHaveText('Como a bússola é feita');
  await expect(dialog.getByRole('link', { name: 'Ver o guia dos 12 eixos' })).toHaveAttribute('href', '/teste-politico#guia-eixos');
  await page.locator('#result-help-close').click();
  await expect(dialog).not.toBeVisible();

  const ideologyCard = page.locator('#resultado-ideologias .quiz-match-card').first();
  await expect(ideologyCard.locator('.quiz-match-catalog-link')).toHaveAttribute('href', /^\/catalogo-politico\?catalogo=ideologias#/);
  await ideologyCard.getByRole('button', { name: /^Comparar os 12 eixos com / }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#result-help-dialog-title')).toHaveText('Comparar os 12 eixos');
  await expect(dialog.locator('.quiz-axis-comparison-row')).toHaveCount(12);
  await expect(dialog.locator('.quiz-axis-comparison-row').first()).toContainText('Você');
  await expect(dialog.getByRole('link', { name: /^Ver ficha de .* no catálogo$/ })).toHaveAttribute('href', /^\/catalogo-politico\?catalogo=ideologias#/);
  await page.locator('#result-help-close').click();
  await expect(dialog).not.toBeVisible();

  await expect(page.locator('#quiz-results .quiz-match-card > a[target="_blank"]')).toHaveCount(0);
});

test('o perfil de referência mantém Distinção e Valores do 12 Axes', async ({ page }) => {
  const atlasProfile = 'WzQwLjUsNjUsMzMuNyw0MCwzNSw2NSwzMSw1OC41LDM2LjMsNjQuNSw0Miw2Ny41XQ';
  await page.goto(`/resultado-politico?perfil=${atlasProfile}&v=2`);

  await expect(page.locator('#assinatura .quiz-distinction-card').first().locator('h3')).toHaveText('Economia');
  await expect(page.locator('#assinatura .quiz-distinction-card').nth(1).locator('h3')).toHaveText('Moral');

  const expectedValues = [
    ['Política', 'Democracia social'],
    ['Política externa', 'Diplomacia moderada'],
    ['Economia', 'Liberal-desenvolvimentismo'],
    ['Imigração', 'Integração cultural'],
    ['Sociedade', 'Moderado secular'],
    ['Tecnologia', 'Modernismo tecnológico']
  ];
  await expect(page.locator('#valores .quiz-value-card')).toHaveCount(expectedValues.length);
  for (let index = 0; index < expectedValues.length; index += 1) {
    const card = page.locator('#valores .quiz-value-card').nth(index);
    await expect(card.locator('.quiz-value-group')).toHaveText(expectedValues[index][0]);
    await expect(card.locator('h3')).toHaveText(expectedValues[index][1]);
    await expect(card.locator('p')).not.toBeEmpty();
    await expect(card.locator('.quiz-value-score')).toContainText('%');
  }
});

test('a seção de comparação busca perfis, cruza os 12 eixos e permite remover', async ({ page }) => {
  const atlasProfile = 'WzQwLjUsNjUsMzMuNyw0MCwzNSw2NSwzMSw1OC41LDM2LjMsNjQuNSw0Miw2Ny41XQ';
  await page.goto(`/resultado-politico?perfil=${atlasProfile}&v=2`);

  const section = page.locator('#comparar');
  await expect(section).toBeVisible();
  await expect(section.locator('.quiz-compare-profile')).toHaveCount(1);
  await expect(section.locator('.quiz-compare-empty')).toBeVisible();
  await expect(section.locator('.quiz-compare-result')).toBeHidden();

  const input = section.getByRole('combobox', { name: 'Buscar perfil para comparar' });
  await expect(input).toBeVisible();
  await input.focus();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await expect(section.locator('.quiz-compare-option')).toHaveCount(6);
  await input.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', 'compare-option-0');
  await input.press('Escape');
  await expect(input).toHaveAttribute('aria-expanded', 'false');

  await input.fill('Arist');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  await section.locator('.quiz-compare-option').filter({ hasText: 'Aristóteles' }).first().click();
  await expect(section.locator('.quiz-compare-profile')).toHaveCount(2);
  await expect(section.locator('.quiz-compare-profile').nth(1)).toContainText('Aristóteles');
  await expect(section.locator('.quiz-compare-result')).toBeVisible();
  await expect(section.locator('.quiz-compare-axis')).toHaveCount(12);
  await expect(section.locator('.quiz-compare-axis').first().locator('.quiz-compare-marker')).toHaveCount(2);
  await expect(section.locator('.quiz-compare-axis').first().locator('.quiz-compare-value')).toHaveCount(2);
  await expect(section.locator('.quiz-compare-readout-card')).toHaveCount(3);
  await expect(section.locator('.quiz-compare-legend span')).toHaveCount(2);

  await input.fill('Social-democracia');
  await section.locator('.quiz-compare-option').filter({ hasText: 'Social-democracia' }).first().click();
  await expect(section.locator('.quiz-compare-profile')).toHaveCount(3);
  await expect(section.locator('.quiz-compare-axis').first().locator('.quiz-compare-marker')).toHaveCount(3);
  await expect(input).toBeHidden();
  await expect(section.locator('.quiz-compare-limit')).toBeVisible();
  await expect(section.locator('.quiz-compare-legend span')).toHaveCount(3);

  await section.getByRole('button', { name: 'Remover Aristóteles da comparação' }).click();
  await expect(section.locator('.quiz-compare-profile')).toHaveCount(2);
  await expect(input).toBeVisible();
  await expect(section.locator('.quiz-compare-result')).toBeVisible();

  await section.getByRole('button', { name: 'Remover Social-democracia da comparação' }).click();
  await expect(section.locator('.quiz-compare-profile')).toHaveCount(1);
  await expect(section.locator('.quiz-compare-result')).toBeHidden();
  await expect(section.locator('.quiz-compare-empty')).toBeVisible();
});

test('a seção de perguntas segue o modelo visual com ajuda em modal', async ({ page }) => {
  await page.goto('/teste-politico');
  await page.locator('.quiz-choice-card').nth(1).click();

  await expect(page.locator('#quiz-progress-label')).toHaveText('Pergunta 1 de 60');
  await expect(page.locator('#quiz-progress-percent')).toHaveText('0% concluído');
  await expect(page.locator('.quiz-question-card')).toBeVisible();
  await expect(page.locator('.quiz-answer-option')).toHaveCount(5);
  await expect(page.locator('.quiz-question-number')).toHaveText('01');

  await page.locator('#quiz-help-button').click();
  await expect(page.locator('#quiz-help-dialog')).toBeVisible();
  await expect(page.locator('.quiz-help-block')).toHaveCount(3);
  await expect(page.locator('#quiz-help-dialog')).toContainText('Sobre esta pergunta');
  await page.locator('#quiz-help-close').click();
  await expect(page.locator('#quiz-help-dialog')).not.toBeVisible();
});

test('o resultado sem perfil convida a fazer o teste', async ({ page }) => {
  await page.goto('/resultado-politico');

  await expect(page.locator('#results-empty')).toBeVisible();
  await expect(page.locator('#results-empty')).toContainText('Nenhum perfil foi informado');
  await expect(page.locator('#ideology-quiz')).toBeHidden();
  await page.getByRole('link', { name: 'Fazer o teste político' }).click();
  await expect(page).toHaveURL('/teste-politico');
  await expect(page.locator('.quiz-choice-card')).toHaveCount(3);
});

test('o resultado aponta para o catálogo completo sem expandir os perfis', async ({ page }) => {
  await page.goto(`/resultado-politico?${legacyProfileQuery}`);

  const figuresGroup = page.locator('.quiz-match-group').nth(1);
  await expect(figuresGroup.locator('.quiz-all-matches')).toHaveCount(0);
  await expect(figuresGroup.locator('.quiz-match-grid').first().locator('.quiz-match-card')).toHaveCount(3);
  await expect(figuresGroup.getByRole('link', { name: 'Ver os 667 no catálogo completo' })).toHaveAttribute('href', '/catalogo-politico?catalogo=personalidades');
});

test('o guia explica os doze eixos políticos', async ({ page }) => {
  await page.goto('/teste-politico');

  await expect(page.locator('#guia-eixos')).toBeVisible();
  await expect(page.locator('#quiz-axis-guide-grid .quiz-axis-card')).toHaveCount(12);
  await expect(page.locator('#eixo-economia')).toContainText('Economia');
  await expect(page.locator('.quiz-axis-card').first()).toContainText('Estrutura');
  await expect(page.locator('.quiz-axis-card').first()).toContainText('Federal');
  await expect(page.locator('.quiz-axis-card').last()).toContainText('Tecnologia');

  await page.goto('/teste-politico#eixo-economia');
  const economyCard = page.locator('#eixo-economia');
  await expect(economyCard).toBeInViewport();
  const top = await economyCard.evaluate((element) => Math.round(element.getBoundingClientRect().top));
  expect(top).toBeGreaterThan(0);
});
