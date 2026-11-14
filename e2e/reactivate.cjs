/**
 * Test de bout en bout de /auth/reactivate (page des REPS importés de la V1), réseau simulé.
 * Usage : lancer `npm run dev` (ou `vite --port 5199`) puis
 *   BASE_URL=http://127.0.0.1:5199 node e2e/reactivate.cjs
 * Nécessite Playwright (non ajouté aux dépendances du projet).
 */
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5199';
const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
}

async function open(browser, { viewport, lang, query = '' }) {
  const ctx = await browser.newContext({ viewport, locale: lang === 'fr' ? 'fr-FR' : 'en-GB' });
  await ctx.addInitScript((l) => {
    try { localStorage.setItem('i18nextLng', l); localStorage.setItem('harxLangExplicit', '1'); } catch {}
  }, lang);
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/auth/reactivate${query}`, { waitUntil: 'networkidle' });
  return { ctx, page, pageErrors };
}

(async () => {
  const browser = await chromium.launch();

  for (const [label, viewport] of [['desktop 1280x720', { width: 1280, height: 720 }], ['mobile 390x844', { width: 390, height: 844 }]]) {
    for (const lang of ['fr', 'en']) {
      const tag = `${label} ${lang}`;
      const { ctx, page, pageErrors } = await open(browser, { viewport, lang });
      await page.waitForSelector('[data-testid="reactivate-banner"]');
      const text = await page.locator('main').innerText();
      check(`${tag}: bandeau + logo présents`, (await page.locator('[data-testid="harx-logo"]').count()) === 1);
      check(`${tag}: titre`, text.includes(lang === 'fr' ? 'Votre espace HARX vous attend' : 'Your HARX space is waiting for you'));
      check(`${tag}: offre 6 mois + REPS2027 + 31 décembre 2026`,
        text.includes('REPS2027') && /6 (mois offerts|months free)/.test(text) && /31 (décembre|December) 2026/.test(text));
      check(`${tag}: 5 étapes`, (await page.locator('[data-testid="reactivate-steps"] li').count()) === 5);
      const btn = page.locator('button[type="submit"]');
      const box = await btn.boundingBox();
      check(`${tag}: bouton d'action visible sans défiler`, box && box.y + box.height <= viewport.height, box ? `bas du bouton à ${Math.round(box.y + box.height)} px / fenêtre ${viewport.height} px` : 'introuvable');
      const bg = await btn.evaluate((el) => getComputedStyle(el).backgroundImage);
      check(`${tag}: le bouton est en dégradé HARX`, bg.includes('gradient'));
      const offerBg = await page.locator('[data-testid="reactivate-offer"]').evaluate((el) => getComputedStyle(el).backgroundImage);
      check(`${tag}: l'offre n'est PAS en dégradé (le bouton est seul à ressortir)`, !offerBg.includes('gradient'), offerBg);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      check(`${tag}: pas de défilement horizontal`, !overflow);
      check(`${tag}: aucune erreur de page`, pageErrors.length === 0, pageErrors.join(' | '));
      await ctx.close();
    }
  }

  // Envoi du formulaire : succès, erreur, champ vide.
  {
    const { ctx, page } = await open(browser, { viewport: { width: 1280, height: 720 }, lang: 'fr' });
    const posts = [];
    await page.route('**/auth/reengage-request', async (route) => {
      posts.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ sent: true }) });
    });
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);
    check('formulaire: champ vide, rien n\'est envoyé', posts.length === 0);
    await page.fill('#reactivate-email', '  Rep.Test@Example.com ');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=Consultez votre boîte mail');
    check('formulaire: envoi du bon corps (e-mail nettoyé)', posts.length === 1 && posts[0].email === 'Rep.Test@Example.com', JSON.stringify(posts));
    check('formulaire: message « boîte mail » affiché', true);
    await page.locator('text=Utiliser une autre adresse').click();
    check('formulaire: « autre adresse » ramène au formulaire', (await page.locator('#reactivate-email').count()) === 1);
    await ctx.close();
  }
  {
    const { ctx, page } = await open(browser, { viewport: { width: 1280, height: 720 }, lang: 'en' });
    await page.route('**/auth/reengage-request', (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
    await page.fill('#reactivate-email', 'rep@example.com');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=This did not work');
    check('formulaire: erreur serveur → message d\'erreur lisible (EN)', true);
    await ctx.close();
  }

  // Lien personnel : expiré, invalide, jeton retiré de l'adresse.
  for (const [code, titleFr] of [['LINK_EXPIRED', 'Ce lien a expiré'], ['LINK_INVALID', 'Ce lien n’est pas valide']]) {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, locale: 'fr-FR' });
    await ctx.addInitScript(() => { try { localStorage.setItem('i18nextLng', 'fr'); localStorage.setItem('harxLangExplicit', '1'); } catch {} });
    const page = await ctx.newPage();
    const bodies = [];
    await page.route('**/auth/reengage-login', async (route) => {
      bodies.push(route.request().postDataJSON());
      await route.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ code }) });
    });
    await page.goto(`${BASE}/auth/reactivate?t=secret-token-123`, { waitUntil: 'networkidle' });
    await page.waitForSelector(`text=${titleFr}`);
    check(`lien ${code}: titre « ${titleFr} »`, true);
    check(`lien ${code}: le jeton a été envoyé au serveur`, bodies.length === 1 && bodies[0].token === 'secret-token-123');
    check(`lien ${code}: le jeton n'est plus dans l'adresse`, !page.url().includes('secret-token-123'), page.url());
    check(`lien ${code}: bouton pour redemander un lien`, (await page.locator('button:has-text("Reprendre mon compte")').count()) === 1);
    await page.locator('button:has-text("Reprendre mon compte")').click();
    check(`lien ${code}: le formulaire s'ouvre`, (await page.locator('#reactivate-email').count()) === 1);
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} vérifications réussies`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
