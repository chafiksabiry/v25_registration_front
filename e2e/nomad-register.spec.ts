import { expect, test, type Page } from '@playwright/test';

// Constat du fondateur (22/11/2026, parcours Nomad) : adresse d'inscription nommée selon l'offre, ancienne adresse redirigée,
// bouton « Retour » vers la page Nomad (jamais /auth/choice). TAAS et CLOUD inchangés.
// Adresses NOMAD (24/11/2026) : inscription /nomad/inscription, connexion /nomad/connexion, page de l'offre /nomad (sans préfixe de
// langue : la langue de l'ancienne adresse est mémorisée).
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
  test(`${lang} : ancienne adresse d'un visiteur Nomad → /nomad/inscription (langue « ${lang} » gardée), Retour → /nomad`, async ({ page }) => {
    await isolate(page);
    await withPlan(page, 'nomad_solo');
    await page.goto(`/${lang}/auth/register-call-center?product=callcentre`);
    await page.waitForURL((u) => u.pathname === '/nomad/inscription' && !u.searchParams.has('product'), { timeout: 20_000 });
    expect(await page.evaluate(() => [localStorage.getItem('harxSiteLang'), localStorage.getItem('harxLangExplicit')])).toEqual([lang, '1']);
    await expect(backButton(page)).toBeVisible();
    await backButton(page).click();
    await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 20_000 });
    expect(new URL(page.url()).pathname).not.toContain('/auth/choice');
  });
}

test('ancienne adresse Nomad directe (lien d’e-mail, sans offre mémorisée) → /nomad/inscription : texte Nomad, Retour → /nomad', async ({ page }) => {
  await isolate(page);
  await withPlan(page, null);
  await page.goto('/auth/register-nomad?product=nomad');
  await page.waitForURL((u) => u.pathname === '/nomad/inscription' && !u.searchParams.has('product'), { timeout: 20_000 });
  await expect(page.locator('h1').first()).toContainText(/call station/i, { timeout: 20_000 });
  await backButton(page).click();
  await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 20_000 });
});

test('/nomad/inscription (carte Nomad Solo, publicité) : texte Nomad, offre Nomad Solo mémorisée comme par le relais, adresse stable', async ({ page }) => {
  await isolate(page);
  await withPlan(page, 'accueil'); // reste d'un parcours CLOUD : remplacé à l'arrivée, comme le faisait le relais Solo
  await page.goto('/nomad/inscription?utm_source=ads');
  await expect(page.locator('h1').first()).toContainText(/call station/i, { timeout: 20_000 });
  expect(await page.evaluate(() => [
    localStorage.getItem('harx_cc_pending_plan'),
    localStorage.getItem('harx_cc_pending_profile'),
    localStorage.getItem('harx_product'),
    sessionStorage.getItem('harx_nomad_door'),
  ])).toEqual(['nomad_solo', 'solo', 'callcentre', '1']);
  await page.waitForTimeout(800);
  const u = new URL(page.url());
  expect(u.pathname + u.search).toBe('/nomad/inscription?utm_source=ads');
});

test('/nomad/connexion : connexion NOMAD (mot NOMAD), porte NOMAD retenue ; « S’inscrire » → /nomad/inscription', async ({ page }) => {
  await isolate(page);
  await withPlan(page, null);
  await page.goto('/nomad/connexion');
  await expect(page.getByTestId('signin-offer-word')).toBeVisible({ timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe('/nomad/connexion');
  expect(await page.evaluate(() => [localStorage.getItem('harx_product'), sessionStorage.getItem('harx_nomad_door')])).toEqual(['callcentre', '1']);
  // Lien « Pas encore de compte ? S'inscrire » sous le formulaire (signIn.signUp, toutes langues).
  await page.getByRole('button', { name: /^(Sign up|S.inscrire|Registrarse|إنشاء حساب)$/ }).click();
  await page.waitForURL((u) => u.pathname === '/nomad/inscription', { timeout: 20_000 });
});

for (const from of ['/auth/signin?product=nomad', '/en/auth/signin?product=nomad']) {
  test(`ancienne connexion NOMAD ${from} → /nomad/connexion`, async ({ page }) => {
    await isolate(page);
    await page.goto(from);
    await page.waitForURL((u) => u.pathname === '/nomad/connexion' && !u.searchParams.has('product'), { timeout: 20_000 });
    await expect(page.getByTestId('signin-offer-word')).toBeVisible({ timeout: 20_000 });
  });
}

test('CLOUD : /auth/signin?product=callcentre reste tel quel, sans mot NOMAD', async ({ page }) => {
  await isolate(page);
  await withPlan(page, 'accueil');
  await page.goto('/fr/auth/signin?product=callcentre');
  await expect(page.getByTestId('signin-audience')).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(800);
  const u = new URL(page.url());
  expect(u.pathname + u.search).toBe('/fr/auth/signin?product=callcentre');
  await expect(page.getByTestId('signin-offer-word')).toHaveCount(0);
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
