const { expect, test } = require('@playwright/test');

test('subscription form exposes a resend confirmation action after a request', async ({ page }) => {
  let requestCount = 0;
  await page.route('**/api/subscribe', async route => {
    requestCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Se este endereço puder receber uma confirmação, enviaremos um link por e-mail.'
      })
    });
  });

  await page.goto('/');
  await page.locator('#subscriber-email').fill('reader@example.com');
  await page.getByRole('button', { name: 'Quero receber' }).click();

  const resendButton = page.getByRole('button', { name: 'Reenviar confirmação' });
  await expect(resendButton).toBeVisible();
  await page.getByRole('button', { name: 'Fechar' }).click();
  await resendButton.click();

  expect(requestCount).toBe(2);
  await expect(page.getByRole('status')).toContainText('Se este endereço puder receber');
});

test('expired confirmation status links back to the resend flow', async ({ page }) => {
  await page.goto('/subscription-status.html?status=invalid');

  await page.getByRole('link', { name: 'Reenviar confirmação' }).click();
  await expect(page).toHaveURL(/resend=1/);
  await expect(page.getByRole('button', { name: 'Reenviar confirmação' })).toBeVisible();
});
