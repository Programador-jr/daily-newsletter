const { expect, test } = require('@playwright/test');

test('fascism and Nazism comparison switches topics and sources', async ({ page }) => {
  await page.goto('/fascismo-nazismo');

  const panel = page.getByRole('tabpanel');
  await expect(panel).toContainText('ditadura de partido único');
  await expect(panel.getByRole('link', { name: /Ascensão nazista ao poder/ })).toBeVisible();

  const economyTab = page.getByRole('tab', { name: 'Economia e trabalho' });
  await economyTab.click();
  await expect(economyTab).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toContainText('propriedade privada');

  await economyTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Racismo e perseguição' })).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toContainText('Leis de Nuremberg');
});

test('fascism timeline dialog restores focus and search has an accessible name', async ({ page }) => {
  await page.goto('/fascismo-nazismo');

  await expect(page.getByRole('searchbox', {
    name: 'Buscar data ou acontecimento na linha do tempo'
  })).toBeVisible();

  const eventButton = page.locator('#fascism-timeline [data-event-year]').first();
  const eventYear = await eventButton.getAttribute('data-event-year');
  await eventButton.click();
  await expect(page.getByRole('dialog')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#fascism-timeline [data-event-year="' + eventYear + '"]')).toBeFocused();
});

test('comparison remains readable on narrow screens without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/fascismo-nazismo');

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  await expect(page.getByRole('tab', { name: 'Poder e democracia' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Guerra e violência' })).toBeVisible();
});
