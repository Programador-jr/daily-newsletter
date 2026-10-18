const { expect, test } = require('@playwright/test');

test('aviso público respeita o limite de aparições por navegador e versão', async ({ page }) => {
  let activationId = 'campaign-version-1';
  await page.route('**/api/updates/active', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ update: {
      title: 'Novidades da newsletter', body: '## Novidades\n- **Mudamos a navegação.**\n- Agora está compartilhada.\n[Leia mais](https://example.com)',
      startsAt: '2026-10-10T12:00:00.000Z', endsAt: '2026-10-20T12:00:00.000Z',
      maxDisplays: 2, activationId
    } })
  }));

  await page.goto('/historia');
  const panel = page.getByRole('region', { name: 'Novidades da newsletter' });
  await expect(panel).toBeVisible();
  await expect(panel.locator('.site-update-mark .fa-crown')).toBeVisible();
  await expect(panel).toContainText('NOTA DE RELEASE');
  await expect(panel).not.toContainText('Rio Branco');
  await expect(panel.locator('.site-update-markdown li')).toHaveCount(2);
  await expect(panel.locator('.site-update-markdown strong')).toContainText('Mudamos a navegação.');
  await expect(panel.locator('.site-update-markdown a')).toHaveAttribute('href', 'https://example.com/');
  await expect(panel).not.toContainText('disponível até');
  await expect(page.locator('.site-update-overlay')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Fechar' }).first().click();

  await page.reload();
  await expect(page.getByRole('region', { name: 'Novidades da newsletter' })).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Novidades da newsletter' })).toHaveCount(0);

  activationId = 'campaign-version-2';
  await page.reload();
  await expect(page.getByRole('region', { name: 'Novidades da newsletter' })).toBeVisible();
  const browserId = await page.evaluate(() => localStorage.getItem('kings-newsletter:notice-browser-id'));
  expect(browserId).toBeTruthy();
});
