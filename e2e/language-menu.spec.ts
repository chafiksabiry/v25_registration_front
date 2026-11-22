import { expect, test, type Page } from '@playwright/test';

// Menu de langue unique (globe + nom de la langue), le même que sur les pages Téléphonie : plus aucun drapeau dans le bandeau.
async function isolate(page: Page) {
  await page.route(/^http:\/\/(reg|company)\.test\//, (route) =>
    route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: '{}' }),
  );
  await page.route(/(railway\.app|harx\.ai\/api|googletagmanager|mouseflow|zohopublic|clarity\.ms|salesiq)/, (route) => route.abort());
}

test('bureau : globe + nom de la langue, choix au clavier, préfixe /es conservé', async ({ page }) => {
  await isolate(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/taas');
  const bar = page.getByTestId('harx-bar');
  const button = bar.getByTestId('language-menu-button');
  await expect(button).toBeVisible({ timeout: 20_000 });
  await expect(button).toHaveText('English');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(bar.locator('svg[viewBox="0 0 3 2"], svg[viewBox="0 0 60 30"]')).toHaveCount(0);

  await button.focus();
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toBeFocused();
  await expect(page.getByRole('menuitemradio', { name: 'English' })).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('Escape');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toBeFocused();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitemradio', { name: 'Español' })).toBeFocused();
  await page.keyboard.press('Enter');
  await page.waitForURL((u) => u.pathname === '/es/taas', { timeout: 20_000 });
  expect(await page.evaluate(() => [localStorage.getItem('harxSiteLang'), localStorage.getItem('harxLangExplicit')])).toEqual(['es', '1']);
  await expect(page.getByTestId('harx-bar').getByTestId('language-menu-button')).toHaveText('Español');
});

test('mobile : le menu de langue est dans le menu du bandeau, arabe en RTL', async ({ page }) => {
  await isolate(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/privacy');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl', { timeout: 20_000 });
  const bar = page.getByTestId('harx-bar');
  await expect(bar.getByTestId('language-menu-button')).toBeHidden();
  await bar.getByRole('button', { name: 'Open menu' }).click();
  const button = bar.locator('[data-testid="language-menu-button"]:visible');
  await expect(button).toBeVisible();
  await expect(button).toHaveText('العربية');
  await button.click();
  await page.getByRole('menuitemradio', { name: 'Français' }).click();
  await page.waitForURL((u) => u.pathname === '/fr/privacy', { timeout: 20_000 });
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
});
