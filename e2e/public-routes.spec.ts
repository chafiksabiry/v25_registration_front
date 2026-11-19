import { expect, test, type Page } from '@playwright/test';

// Audit du 19/11 : constat n° 3 (page 404 de développeur), T2 (register-company par adresse directe), n° 7 (téléphone).
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

async function isolate(page: Page) {
  const calls: { path: string; body: unknown }[] = [];
  await page.route(/^http:\/\/(reg|company)\.test\//, (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;
    let body: unknown = null;
    try { body = req.postDataJSON(); } catch { body = null; }
    calls.push({ path, body });
    const json = (status: number, b: unknown) => route.fulfill({ status, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(b) });
    if (path === '/api/auth/check-email') return json(200, { available: true });
    if (path === '/api/auth/check-phone') return json(200, { available: true });
    if (path === '/api/auth/register') return json(201, { message: 'Registration successful', data: { _id: 'a1b2c3d4e5f6a1b2c3d4e5f6' } });
    if (path === '/api/auth/send-otp') return json(400, { message: 'SMS unavailable' });
    return json(200, {});
  });
  await page.route(/(railway\.app|harx\.ai\/api)/, (route) => route.abort());
  await page.route(/(googletagmanager|mouseflow|zohopublic|clarity\.ms|salesiq)/, (route) => route.abort());
  return calls;
}

const DEV_ERROR = /Unexpected Application Error|Hey developer/;

test('adresse inconnue : page 404 à la charte HARX, sans erreur de développeur', async ({ page }) => {
  await isolate(page);
  for (const url of ['/cette-page-n-existe-pas', '/en/auth/inconnu', '/fr/nimporte/quoi']) {
    await page.goto(url);
    await expect(page.getByTestId('not-found-page')).toBeVisible({ timeout: 20_000 });
    await expect(page.locator('body')).not.toContainText(DEV_ERROR);
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cette page n’existe pas');
  await expect(page.getByTestId('not-found-home')).toHaveAttribute('href', '/fr');
});

for (const [from, to, lang] of [
  ['/en/telephony', '/telephony', 'en'],
  ['/en/telephony/nomad', '/telephony/nomad', 'en'],
  ['/fr/telephony', '/telephony', 'fr'],
] as const) {
  test(`${from} monté par erreur dans ce module : renvoi vers ${to} en « ${lang} »`, async ({ page }) => {
    await isolate(page);
    await page.route(/\/telephony(\/|\?|$)/, (route) =>
      route.request().resourceType() === 'document' && !/^\/(fr|en|es|ar)\//.test(new URL(route.request().url()).pathname)
        ? route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><h1>telephonie</h1></body></html>' })
        : route.continue(),
    );
    await page.goto(from);
    await page.waitForURL((u) => u.pathname === to, { timeout: 20_000 });
    await expect(page.locator('body')).not.toContainText(DEV_ERROR);
    expect(await page.evaluate(() => [localStorage.getItem('harxSiteLang'), localStorage.getItem('harxLangExplicit')])).toEqual([lang, '1']);
  });
}

test('T2 : /fr/auth/register-company renvoie vers la page TAAS Company tant que l’offre est « bientôt »', async ({ page }) => {
  await isolate(page);
  await page.goto('/fr/auth/register-company');
  await page.waitForURL((u) => u.pathname === '/fr/taas/company', { timeout: 20_000 });
  await expect(page.getByTestId('register-stepper')).toHaveCount(0);
});

test('T1 : la carte COMPANY de /fr/taas annonce « Bientôt disponible »', async ({ page }) => {
  await isolate(page);
  await page.goto('/fr/taas');
  await expect(page.getByTestId('taas-door-company-soon')).toContainText('Bientôt disponible', { timeout: 20_000 });
});

test('n° 7 : téléphone facultatif, aucun SMS envoyé, exemple de numéro selon le pays', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'en-GB' });
  const page = await context.newPage();
  const calls = await isolate(page);
  await page.goto('/en/auth/register-call-center?product=callcentre');
  await page.locator('input[type="text"]').first().fill('Jane Doe');
  await page.locator('button.btn-primary').click();
  await page.locator('input[type="email"]').fill('jane@example.com');
  await page.locator('button.btn-primary').click();
  await page.locator('input[type="password"]').first().fill('motdepasse1');
  await page.getByTestId('confirm-password').fill('motdepasse1');
  await page.locator('button.btn-primary').click();

  const phone = page.getByTestId('register-phone');
  await expect(phone).toBeVisible();
  await expect(phone).toHaveAttribute('placeholder', '+44 7700 900123');
  await expect(page.getByTestId('register-phone-optional')).toBeVisible();
  await page.locator('button.btn-primary').click(); // champ vide : on passe

  await page.locator('input[type="checkbox"]').check();
  await page.locator('button.btn-primary').click();
  await expect(page.locator('input[maxlength="6"]').first()).toBeVisible({ timeout: 20_000 });

  const register = calls.find((c) => c.path === '/api/auth/register');
  expect(register?.body).not.toHaveProperty('phone');
  expect(calls.map((c) => c.path)).not.toContain('/api/auth/send-otp');
  expect(calls.map((c) => c.path)).not.toContain('/api/auth/check-phone');
  await expect(page.locator('body')).not.toContainText(/SMS (verification is )?temporarily unavailable/i);
  await context.close();
});
