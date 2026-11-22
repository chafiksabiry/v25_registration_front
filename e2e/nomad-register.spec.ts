import { expect, test, type Page } from '@playwright/test';

// Constat du fondateur (22/11/2026, parcours Nomad) : adresse d'inscription nommée selon l'offre, ancienne adresse redirigée,
// bouton « Retour » vers la page Nomad (jamais /auth/choice). TAAS et CLOUD inchangés.
async function isolate(page: Page) {
  await page.route(/^http:\/\/(reg|company)\.test\//, (route) =>
    route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: '{}' }),
  );
  await page.route(/(railway\.app|harx\.ai\/api|googletagmanager|mouseflow|zohopublic|clarity\.ms|salesiq)/, (route) => route.abort());
}

async function withPlan(page: Page, plan: string | null) {
  await page.addInitScript((p) => {
    if (sessionStorage.getItem('e2e-plan-set')) return;
    sessionStorage.setItem('e2e-plan-set', '1');
    if (p) localStorage.setItem('harx_cc_pending_plan', p);
    else localStorage.removeItem('harx_cc_pending_plan');
  }, plan);
}

const backButton = (page: Page) => page.locator('button:has(svg.lucide-arrow-left)').first();

for (const lang of ['en', 'fr', 'es', 'ar'] as const) {
  test(`${lang} : ancienne adresse d'un visiteur Nomad → /${lang}/auth/register-nomad?product=nomad, Retour → page Nomad`, async ({ page }) => {
    await isolate(page);
    await withPlan(page, 'nomad_solo');
    await page.goto(`/${lang}/auth/register-call-center?product=callcentre`);
    await page.waitForURL((u) => u.pathname === `/${lang}/auth/register-nomad` && u.searchParams.get('product') === 'nomad', { timeout: 20_000 });
    await expect(backButton(page)).toBeVisible();
    await backButton(page).click();
    await page.waitForURL((u) => u.pathname.endsWith('/telephony/nomad'), { timeout: 20_000 });
    expect(new URL(page.url()).pathname).not.toContain('/auth/choice');
  });
}

test('adresse Nomad directe (lien d’e-mail, sans offre mémorisée) : texte Nomad, Retour → /telephony/nomad', async ({ page }) => {
  await isolate(page);
  await withPlan(page, null);
  await page.goto('/auth/register-nomad?product=nomad');
  await expect(page.locator('h1').first()).toContainText(/call station/i, { timeout: 20_000 });
  await backButton(page).click();
  await page.waitForURL((u) => u.pathname === '/telephony/nomad', { timeout: 20_000 });
});

test('CLOUD : /auth/register-call-center?product=callcentre reste tel quel, Retour inchangé (/auth/choice)', async ({ page }) => {
  await isolate(page);
  await withPlan(page, 'accueil');
  await page.goto('/fr/auth/register-call-center?product=callcentre');
  await expect(backButton(page)).toBeVisible({ timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe('/fr/auth/register-call-center');
  await backButton(page).click();
  await page.waitForURL((u) => u.pathname === '/fr/auth/choice', { timeout: 20_000 });
});

test('TAAS : inscription REPS, Retour inchangé (/auth/choice)', async ({ page }) => {
  await isolate(page);
  await withPlan(page, 'nomad_solo'); // un reste du parcours Nomad ne change rien à TAAS
  await page.goto('/fr/auth/register-rep');
  await expect(backButton(page)).toBeVisible({ timeout: 20_000 });
  await backButton(page).click();
  await page.waitForURL((u) => u.pathname === '/fr/auth/choice', { timeout: 20_000 });
});
