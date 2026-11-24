import { expect, test, type BrowserContext } from '@playwright/test';
import { writeFileSync } from 'node:fs';

/**
 * « Besoin d'aide ? » sous les erreurs de « Mot de passe oublié » (maquette validée le 24/11/2026). API simulée (reg.test) ;
 * RÉSEAU EXTÉRIEUR COUPÉ : toute requête qui n'est ni locale ni vers l'API simulée est abandonnée et listée (incident du 24/11 : un rendu
 * local de harx.ai avait appelé le vrai serveur de développement). `SHOTS=<dossier>` : captures 1440×900 et 390×844 (deviceScaleFactor 2).
 */
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
const SHOTS = process.env.SHOTS || '';
const outside: string[] = [];
const allHosts = new Set<string>();

async function guard(ctx: BrowserContext, apiStatus: number, apiBody: object) {
  ctx.on('request', (r) => { try { allHosts.add(new URL(r.url()).host); } catch { /* data: */ } });
  await ctx.route(() => true, (route) => {
    const url = route.request().url();
    if (/^(data:|blob:)/.test(url) || /^http:\/\/localhost(:\d+)?\//.test(url)) return route.continue();
    outside.push(url.split('?')[0]);
    return route.abort('blockedbyclient');
  });
  await ctx.routeWebSocket(() => true, (ws) => { outside.push(ws.url()); return ws.close(); });
  await ctx.route(/^http:\/\/reg\.test\//, (route) =>
    route.request().method() === 'OPTIONS'
      ? route.fulfill({ status: 204, headers: CORS })
      : route.fulfill({ status: apiStatus, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(apiBody) }),
  );
}

const CASES = [
  { code: 'PWD-SERVER', status: 500, body: { error: 'INTERNAL' } },
  { code: 'PWD-SEND', status: 502, body: { error: 'EMAIL_SEND_FAILED' } },
  { code: 'PWD-UNKNOWN-EMAIL', status: 404, body: { error: 'EMAIL_NOT_REGISTERED' } },
];
const SIZES = [
  { tag: '1440x900', viewport: { width: 1440, height: 900 }, isMobile: false },
  { tag: '390x844', viewport: { width: 390, height: 844 }, isMobile: true },
];
const TEXTS: Record<string, string[]> = {
  fr: ['Besoin d’aide ?', 'Contacter le support sur WhatsApp', 'Écrire à support@harx.ai', 'Code'],
  en: ['Need help?', 'Contact support on WhatsApp', 'Email support@harx.ai'],
  es: ['¿Necesita ayuda?', 'Contactar con el soporte por WhatsApp', 'Escribir a support@harx.ai'],
  ar: ['هل تحتاج إلى مساعدة؟', 'التواصل مع الدعم عبر واتساب'],
};

for (const size of SIZES) {
  for (const c of CASES) {
    for (const lang of c.code === 'PWD-SERVER' ? ['fr', 'en', 'es', 'ar'] : ['fr']) {
      test(`mot de passe oublié ${c.code} ${lang} ${size.tag} : encadré « Besoin d’aide ? »`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: size.viewport, deviceScaleFactor: 2, isMobile: size.isMobile, hasTouch: size.isMobile, locale: lang === 'fr' ? 'fr-FR' : lang });
        await ctx.addInitScript((l) => { try { localStorage.setItem('harxSiteLang', l); localStorage.setItem('i18nextLng', l); localStorage.setItem('harxLangExplicit', '1'); } catch { /* */ } }, lang);
        await guard(ctx, c.status, c.body);
        const page = await ctx.newPage();
        await page.goto('/auth/recovery');
        await page.locator('input[type=email]').fill('client.prive@exemple.fr');
        await page.locator('button.btn-primary').click();
        const box = page.getByTestId('support-help');
        await expect(box).toBeVisible({ timeout: 20000 });
        await expect(box).toHaveAttribute('data-code', c.code);
        const text = await box.innerText();
        for (const s of TEXTS[lang]) expect(text).toContain(s);
        const wa = await box.locator('a[href^="https://wa.me/"]').getAttribute('href');
        const mail = decodeURIComponent((await box.locator('a[href^="mailto:"]').getAttribute('href')) || '');
        const u = new URL(wa || '');
        expect(u.pathname).toBe('/212711311388');
        const msg = u.searchParams.get('text') || '';
        expect(msg).toContain(c.code);
        expect(mail.startsWith('mailto:support@harx.ai?subject=')).toBe(true);
        expect(mail).toContain(c.code);
        // Jamais l'e-mail saisi (ni aucune autre adresse), ni un numéro de téléphone.
        for (const s of [msg, mail.replace(/support@harx\.ai/g, '')]) {
          expect(s).not.toMatch(/exemple|client\.prive|@/);
          expect(s).not.toMatch(/\d{9,}/);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)).toBe(false);
        // Aucun libellé qui déborde de son bouton ou lien (ex. espagnol à 390 px).
        expect(await box.evaluate((el) => [...el.querySelectorAll('a')].filter((x) => x.scrollWidth > x.clientWidth + 1).map((x) => x.textContent))).toEqual([]);
        if (SHOTS && c.code === 'PWD-SERVER') {
          await box.evaluate((el) => el.scrollIntoView({ block: 'center' }));
          await page.waitForTimeout(400);
          await page.screenshot({ path: `${SHOTS}/04-mot-de-passe-oublie${lang === 'fr' ? '' : `-${lang}`}-${size.tag}.png` });
        }
        await ctx.close();
      });
    }
  }
}

test('saisie incomplète : pas d’encadré (la personne corrige seule)', async ({ browser }) => {
  const ctx = await browser.newContext();
  await guard(ctx, 500, {});
  const page = await ctx.newPage();
  await page.goto('/auth/recovery');
  await page.locator('button.btn-primary').click();
  await expect(page.getByTestId('support-help')).toHaveCount(0);
  await ctx.close();
});

test.afterAll(() => {
  const report = { hostsSeen: [...allHosts].sort(), blockedOutside: [...new Set(outside)].sort() };
  console.log('RÉSEAU ' + JSON.stringify(report));
  if (process.env.NET_REPORT) writeFileSync(process.env.NET_REPORT, JSON.stringify(report, null, 2));
});
