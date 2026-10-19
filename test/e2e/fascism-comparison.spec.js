const { expect, test } = require('@playwright/test');

test('fascism and Nazism comparison switches topics and keeps primary sources available', async ({ page }) => {
  await page.goto('/fascismo-nazismo');

  const panel = page.getByRole('tabpanel');
  await expect(panel).toContainText('Ultranacionalismo');
  await expect(panel).toContainText('racismo biológico');
  await expect(page.locator('#fontes-primarias a[href*="the-nuremberg-race-laws"]')).toBeVisible();

  const racialTab = page.getByRole('tab', { name: 'Racismo e antissemitismo' });
  await racialTab.click();
  await expect(racialTab).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toContainText('Holocausto');

  await racialTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Expansionismo' })).toHaveAttribute('aria-selected', 'true');
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
  await expect(page.getByRole('tab', { name: 'Ideologia' })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Expansionismo' })).toBeVisible();
});
