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
  const trigger = page.getByRole('button', { name: 'Abrir nota de lançamento' });
  const panel = page.getByRole('region', { name: 'Novidades da newsletter' });
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(panel).toBeHidden();
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.site-update-mark .fa-crown')).toBeVisible();
  await expect(panel).toContainText('NOTA DE RELEASE');
  await expect(panel).not.toContainText('Rio Branco');
  await expect(panel.locator('.site-update-markdown li')).toHaveCount(2);
  await expect(panel.locator('.site-update-markdown strong')).toContainText('Mudamos a navegação.');
  await expect(panel.locator('.site-update-markdown a')).toHaveAttribute('href', 'https://example.com/');
  await expect(panel).not.toContainText('disponível até');
  await expect(page.locator('.site-update-overlay')).toHaveCount(0);
  await panel.getByRole('button', { name: 'Fechar nota de lançamento' }).click();
  await expect(panel).toBeHidden();

  await page.reload();
  const secondTrigger = page.getByRole('button', { name: 'Abrir nota de lançamento' });
  await expect(secondTrigger).toBeVisible();
  await secondTrigger.click();
  await expect(panel).toBeVisible();
  await panel.getByRole('button', { name: 'Fechar nota de lançamento' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Abrir nota de lançamento' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Novidades da newsletter' })).toHaveCount(0);

  activationId = 'campaign-version-2';
  await page.reload();
  const nextVersionTrigger = page.getByRole('button', { name: 'Abrir nota de lançamento' });
  await expect(nextVersionTrigger).toBeVisible();
  await nextVersionTrigger.click();
  await expect(panel).toBeVisible();
  const browserId = await page.evaluate(() => localStorage.getItem('kings-newsletter:notice-browser-id'));
  expect(browserId).toBeTruthy();
});
