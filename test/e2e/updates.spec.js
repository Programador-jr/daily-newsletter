const { expect, test } = require('@playwright/test');

test('aviso público respeita o limite de aparições por navegador e versão', async ({ page }) => {
  let activationId = 'campaign-version-1';
  await page.route('**/api/updates/active', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ update: {
      title: 'Novidades da newsletter', body: 'Mudamos a navegação.\nAgora está compartilhada.',
      startsAt: '2026-10-10T12:00:00.000Z', endsAt: '2026-10-20T12:00:00.000Z',
      maxDisplays: 2, activationId
    } })
  }));

  await page.goto('/historia');
  const dialog = page.getByRole('dialog', { name: 'Novidades da newsletter' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.site-update-mark .fa-crown')).toBeVisible();
  await expect(dialog).toContainText('NOTA DE RELEASE');
  await expect(dialog).not.toContainText('Rio Branco');
  await expect(dialog.locator('.site-update-changes li')).toHaveCount(2);
  await expect(dialog).not.toContainText('disponível até');
  await expect(dialog.locator('.site-update-changes')).toContainText('Mudamos a navegação.');
  await dialog.getByRole('button', { name: 'Entendi' }).click();

  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Novidades da newsletter' })).toBeVisible();
  await page.getByRole('button', { name: 'Entendi' }).click();
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  activationId = 'campaign-version-2';
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Novidades da newsletter' })).toBeVisible();
  const browserId = await page.evaluate(() => localStorage.getItem('kings-newsletter:notice-browser-id'));
  expect(browserId).toBeTruthy();
});
