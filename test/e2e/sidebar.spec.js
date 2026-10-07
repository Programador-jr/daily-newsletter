const { expect, test } = require('@playwright/test');

const routes = [
  '/',
  '/editions',
  '/historia',
  '/presidentes',
  '/ideologias',
  '/politicas-publicas',
  '/tres-poderes',
  '/cargos-publicos',
  '/arrecadacao',
  '/about',
  '/subscription-status.html?status=confirmed',
  '/not-found'
];

test('sidebar is persistent and complete on every desktop screen', async ({ page }) => {
  test.setTimeout(60_000);
  for (const route of routes) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const openButton = page.getByRole('button', { name: 'Abrir menu de navegação' });
    const sidebar = page.getByRole('complementary', { name: 'Navegação principal' });
    const headerLinks = page.locator('.header-primary-links a');

    await expect(sidebar, route).toBeVisible();
    await expect(sidebar.locator('a')).toHaveCount(10);
    await expect(headerLinks, route).toHaveCount(10);
    await expect(page.locator('#header-theme-toggle')).toHaveCount(0);
    await expect(sidebar.getByRole('button', { name: /tema/ })).toBeVisible();
    await expect(openButton).toBeHidden();
    await expect(sidebar).toHaveCSS('position', 'fixed');
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const editionsLink = page.locator('.header-primary-links a[href="/editions"]');
  const normalBackground = await editionsLink.evaluate(link => getComputedStyle(link).backgroundColor);
  await editionsLink.hover();
  const hoverBackground = await editionsLink.evaluate(link => getComputedStyle(link).backgroundColor);
  expect(hoverBackground).not.toBe(normalBackground);
});

test('sidebar remains a drawer on small screens', async ({ page }) => {
  for (const route of ['/subscription-status.html?status=confirmed', '/not-found']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route, { waitUntil: 'domcontentloaded' });

    const openButton = page.getByRole('button', { name: 'Abrir menu de navegação' });
    const sidebar = page.getByRole('complementary', { name: 'Navegação principal' });

    await expect(sidebar, route).toBeHidden();
    await expect(openButton, route).toBeVisible();
    await openButton.click();
    await expect(sidebar, route).toBeVisible();
    await expect(openButton, route).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(sidebar, route).toBeHidden();
    await expect(openButton, route).toHaveAttribute('aria-expanded', 'false');
  }
});

test('theme choice is available in the sidebar and persists across pages', async ({ page }) => {
  await page.goto('/');

  const themeToggle = page.locator('#theme-toggle');
  await expect(themeToggle).toHaveAttribute('aria-pressed', 'false');
  await themeToggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.goto('/about');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('#header-theme-toggle')).toHaveCount(0);

  await page.locator('#theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('back-to-top button is shared by every page', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const expectedButtonCount = route === '/editions' ? 0 : 1;
    await expect(page.locator('#back-to-top'), route).toHaveCount(expectedButtonCount);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/historia', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    document.body.style.minHeight = '1800px';
    window.scrollTo(0, 700);
  });

  const backToTop = page.getByRole('button', { name: 'Voltar ao topo' });
  await expect(backToTop).toBeVisible();
  await backToTop.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

test('accordion animation is available wherever accordions appear', async ({ page }) => {
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => typeof window.accordionMotion?.setOpen)).toBe('function');
  }

  for (const route of ['/historia', '/presidentes', '/ideologias', '/politicas-publicas', '/tres-poderes']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    const accordion = page.locator('details').first();
    const summary = accordion.locator(':scope > summary');

    await expect(accordion, route).toBeVisible();
    await summary.click();
    await expect(accordion, route).toHaveAttribute('open', '');
    await summary.click();
    await expect.poll(() => accordion.evaluate(element => element.open), { timeout: 3000 }).toBe(false);
  }
});
