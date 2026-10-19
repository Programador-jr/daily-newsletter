const { expect, test } = require('@playwright/test');

test('fascism and Nazism comparison switches topics and updates both regimes', async ({ page }) => {
  await page.goto('/fascismo-nazismo');

  await expect(page.getByRole('heading', { name: 'Dois regimes, semelhanças e diferenças' })).toBeVisible();
  const italy = page.locator('[data-italy]');
  const germany = page.locator('[data-germany]');
  await expect(italy).toContainText('Ultranacionalismo');
  await expect(germany).toContainText('racismo biológico');

  const racialTab = page.getByRole('tab', { name: 'Racismo e antissemitismo' });
  await racialTab.click();
  await expect(racialTab).toHaveAttribute('aria-selected', 'true');
  await expect(italy).toContainText('1938');
  await expect(germany).toContainText('seis milhões');
  await expect(page.locator('[data-insight]')).toContainText('Não se deve apagar');

  await racialTab.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('tab', { name: 'Repressão' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Repressão' })).toHaveAttribute('aria-selected', 'true');
});

test('human consequences and primary sources are available', async ({ page }) => {
  await page.goto('/fascismo-nazismo');
  await expect(page.getByRole('heading', { name: 'As consequências humanas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fontes primárias em contexto' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Leis|USHMM.*leis/i })).toHaveCount(1);
  await expect(page.locator('#fontes-primarias a[target="_blank"]')).toHaveCount(4);
});

test('comparison fits mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/fascismo-nazismo');
  await expect(page.getByRole('tab', { name: 'Ideologia' })).toBeVisible();
  await page.getByRole('tab', { name: 'Expansionismo' }).click();
  await expect(page.locator('[data-insight]')).toContainText('expansão imperial');
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
});


test('historical gallery filters sources and opens an accessible detail viewer', async ({ page }) => {
  await page.goto('/fascismo-nazismo');
  const gallery = page.locator('[data-historical-gallery]');
  await expect(gallery.locator('[data-gallery-type]:visible')).toHaveCount(8);
  const posters = page.getByRole('button', { name: 'Cartazes' });
  await posters.click();
  await expect(posters).toHaveAttribute('aria-pressed', 'true');
  await expect(gallery.locator('[data-gallery-type]:visible')).toHaveCount(3);
  await page.getByRole('button', { name: /Todos/ }).click();
  await gallery.getByRole('button', { name: /A Marcha sobre Roma/ }).click();
  const dialog = page.getByRole('dialog', { name: 'A Marcha sobre Roma' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('28 de outubro de 1922');
  await expect(dialog.getByRole('link', { name: /registro original/i })).toHaveAttribute('href', /commons\.wikimedia\.org/);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});
