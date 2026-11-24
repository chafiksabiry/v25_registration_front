import { expect, test, type Page } from '@playwright/test';

// Décision du fondateur (24/11/2026) : sur l'accueil harx.ai, chaque lien de la carte NOMAD et la pastille NOMAD du bandeau mènent aux
// adresses NOMAD (jamais /telephony). Liens TAAS et CLOUD inchangés.
async function isolate(page: Page) {
  await page.route(/^http:\/\/(reg|company)\.test\//, (route) =>
    route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'application/json' }, body: '{}' }),
  );
  await page.route(/(railway\.app|harx\.ai\/api|googletagmanager|mouseflow|zohopublic|clarity\.ms|salesiq)/, (route) => route.abort());
}

const href = (page: Page, testId: string) => page.getByTestId(testId).first().getAttribute('href');

for (const start of ['/', '/fr', '/en']) {
  test(`accueil ${start} : carte NOMAD et pastille NOMAD vers les adresses NOMAD ; TAAS et CLOUD inchangés`, async ({ page }) => {
    await isolate(page);
    await page.goto(start);
    await expect(page.getByTestId('hub-panel-nomad')).toBeVisible({ timeout: 20_000 });
    // Langue de la page : préfixe de l'adresse, sinon langue par défaut du site (celle du lien TAAS du bandeau).
    const taasMark = (await href(page, 'offer-mark-taas')) ?? '';
    const lang = /^\/(fr|en|es|ar)(\/|$)/.exec(new URL(page.url()).pathname)?.[1] ?? /^\/(fr|en|es|ar)\//.exec(taasMark)?.[1];
    expect(lang).toBeTruthy();

    // Carte NOMAD
    expect(await href(page, 'panel-cta-nomad')).toBe('/nomad'); // « Découvrir NOMAD »
    expect(await href(page, 'offer-child-nomad-nomad_solo')).toBe('/nomad/inscription'); // pastille « Nomad » (inscription)
    expect(await href(page, 'offer-signin-nomad')).toBe('/nomad/connexion'); // « Déjà client ? Se connecter »
    const nomadLinks = await page.getByTestId('hub-panel-nomad').locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(nomadLinks.length).toBeGreaterThanOrEqual(3);
    for (const h of nomadLinks) expect(h, String(h)).toMatch(/^\/nomad(\/|$)/);

    // Bandeau TAAS / CLOUD / NOMAD
    expect(await href(page, 'offer-mark-nomad')).toBe('/nomad');
    expect(await href(page, 'offer-mark-cloud')).toBe('/telephony');
    expect(await href(page, 'offer-mark-taas')).toBe(`/${lang}/taas`);

    // Cartes CLOUD et TAAS : inchangées
    expect(await href(page, 'panel-cta-cloud')).toBe('/telephony');
    expect(await href(page, 'offer-signin-cloud')).toBe('/auth/signin?product=callcentre');
    expect(await href(page, 'offer-child-cloud-accueil')).toBe('/telephony/start?plan=accueil');
    expect(await href(page, 'panel-cta-taas')).toBe(`/${lang}/taas`);
    expect(await href(page, 'offer-signin-taas')).toBe(`/${lang}/auth/signin`);
  });
}

test('clic sur « Découvrir NOMAD » : chargement de /nomad', async ({ page }) => {
  await isolate(page);
  await page.route(/\/nomad(\/|\?|$)/, (route) =>
    route.request().resourceType() === 'document' ? route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body>nomad</body></html>' }) : route.continue(),
  );
  await page.goto('/fr');
  await page.getByTestId('panel-cta-nomad').click();
  await page.waitForURL((u) => u.pathname === '/nomad', { timeout: 20_000 });
});
