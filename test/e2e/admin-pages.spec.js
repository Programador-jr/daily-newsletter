const { expect, test } = require('@playwright/test');

const workerSchedule = {
  intervalHours: 3, enabled: true, workerEnabled: true, workerOnline: true,
  workerRunning: false, nextRunAt: new Date(Date.now() + 60_000).toISOString(),
  lastRunAt: null, lastRunStatus: null, lastRunErrorCode: null, lastHeartbeatAt: new Date().toISOString(),
  scheduleHistory: []
};

const dashboard = {
  generatedAt: new Date().toISOString(), periodDays: 7, workerSchedule,
  subscribers: { total: 8, confirmed: 5, pending: 2, expiredPending: 1 },
  latestEdition: { date: '10/10/2026', totalStories: 3, deliveredStories: 2, pendingStories: 1,
    status: 'pending', lastRun: null },
  emails: { messages: 0, acceptedMessages: 0, acceptedRecipients: 0, failedMessages: 0,
    rejectedRecipients: 0, byKind: {} },
  recentEmails: [], recentRuns: []
};

test('painel navega entre páginas internas e mostra o editor de atualizações', async ({ page }) => {
  let authenticated = false;
  await page.route('**/api/admin/login', route => {
    authenticated = true;
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/api/admin/dashboard**', route => route.fulfill({
    status: authenticated ? 200 : 401, contentType: 'application/json',
    body: JSON.stringify(authenticated ? dashboard : { error: 'Não autorizado.' })
  }));
  await page.route('**/api/admin/schedule', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workerSchedule }) }));
  await page.route('**/api/admin/updates', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ updates: [] }) }));

  await page.goto('/admin');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('test-password');
  await page.getByRole('button', { name: /Entrar no painel/ }).click();
  await expect(page.getByRole('heading', { name: 'Operação da newsletter' })).toBeVisible();
  await expect(page.locator('#overview-snapshot-title')).toBeVisible();
  await expect(page.locator('#overview-confirmed-count')).toHaveText('5');
  await expect(page.locator('#overview-news-count')).toHaveText('3');

  await page.getByRole('link', { name: /Audiência/ }).click();
  await expect(page.getByRole('heading', { name: 'Assinantes e entregabilidade' })).toBeVisible();
  await expect(page.locator('#subscriber-cards')).toBeVisible();
  await expect(page.locator('#runs-list')).toBeHidden();

  await page.getByRole('link', { name: /Atualizações/ }).click();
  await expect(page.getByRole('heading', { name: 'Avisos de atualização' })).toBeVisible();
  await expect(page.locator('#updates-list')).toContainText('Sua primeira nota começa aqui');
  await expect(page.locator('#update-form')).toBeHidden();
  await page.getByRole('button', { name: /Nova nota/ }).click();
  await expect(page.locator('#update-form')).toBeVisible();
  await expect(page.locator('#update-starts')).toHaveAttribute('type', 'datetime-local');
  await page.locator('#update-title').fill('Versão 2');
  await page.locator('#update-body').fill('Nova navegação\nCorreção de avisos');
  await expect(page.locator('#update-preview-title')).toHaveText('Versão 2');
  await expect(page.locator('#update-preview-changes li')).toHaveCount(2);
});

test('administrador pode excluir nota após confirmar', async ({ page }) => {
  const now = Date.now();
  let updates = [{
    id: '507f1f77bcf86cd799439011', title: 'Correções de outubro',
    body: 'Melhorias de navegação\nAjustes de acessibilidade',
    startsAt: new Date(now - 60_000).toISOString(), endsAt: new Date(now + 86_400_000).toISOString(),
    maxDisplays: 2, active: true, activationId: 'campaign-test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
  }];
  let authenticated = false;
  await page.route('**/api/admin/login', route => {
    authenticated = true;
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
  await page.route('**/api/admin/dashboard**', route => route.fulfill({
    status: authenticated ? 200 : 401, contentType: 'application/json',
    body: JSON.stringify(authenticated ? dashboard : { error: 'Não autorizado.' })
  }));
  await page.route('**/api/admin/schedule', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ workerSchedule }) }));
  await page.route('**/api/admin/updates', async route => {
    if (route.request().method() === 'DELETE') {
      updates = [];
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ deleted: true }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ updates }) });
  });

  await page.goto('/admin');
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('test-password');
  await page.getByRole('button', { name: /Entrar no painel/ }).click();
  await page.getByRole('link', { name: /Atualizações/ }).click();
  const card = page.locator('.update-card');
  await expect(card).toContainText('Correções de outubro');
  await card.getByRole('button', { name: 'Excluir' }).click();
  await expect(page.getByRole('dialog', { name: 'Excluir esta nota?' })).toBeVisible();
  await page.getByRole('button', { name: 'Excluir nota' }).click();
  await expect(page.locator('#updates-list')).toContainText('Sua primeira nota começa aqui');
});
