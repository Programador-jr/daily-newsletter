const { expect, test } = require('@playwright/test');

test('history timeline loads and historical event buttons open their story', async ({ page }) => {
  await page.goto('/historia');

  const timelineItems = page.locator('#timeline .timeline-item');
  await expect(timelineItems.first()).toBeVisible();
  expect(await timelineItems.count()).toBeGreaterThan(0);

  const independenceButton = page.getByRole('button', { name: 'Independência — 1822' });
  await independenceButton.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Independência do Brasil' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('economy and culture accordions expand and collapse by keyboard', async ({ page }) => {
  await page.goto('/historia');

  for (const selector of [
    '#economia-sociedade .history-topic-accordion',
    '#cultura .history-topic-accordion'
  ]) {
    const accordion = page.locator(selector).first();
    const summary = accordion.locator('summary');

    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(accordion).toHaveAttribute('open', '');
    await expect(accordion.locator('.history-topic-content li').first()).toBeVisible();

    await page.keyboard.press('Enter');
    await expect(accordion).not.toHaveAttribute('open', '');
  }
});

test('mobile history page has no horizontal overflow and retains usable accordions', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/historia');

  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
  await expect(page.locator('#economia-sociedade .history-topic-accordion summary').first()).toBeVisible();
  await expect(page.locator('#cultura .history-topic-accordion summary').first()).toBeVisible();
});
