import { expect, test } from '@playwright/test';

// Arbitrage 12 : un compte Call Center qui se connecte arrive sur /telephony (plus jamais sur /call-center).
const USER_ID = 'a1b2c3d4e5f6a1b2c3d4e5f6';
const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const TOKEN = `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ userId: USER_ID, exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

test('connexion d’un compte Call Center : arrivée sur /telephony', async ({ page }) => {
  const calls: string[] = [];
  await page.route(/^http:\/\/(reg|company)\.test\//, (route) => {
    const req = route.request();
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    const path = new URL(req.url()).pathname;
    calls.push(path);
    const json = (body: unknown) => route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (path === '/api/auth/login') return json({ data: { userId: USER_ID } });
    if (path === '/api/auth/verify-email') return json({ token: TOKEN });
    if (path === '/api/auth/check-user-type') return json({ userType: 'call-center' });
    if (path === '/api/agent-invitations/mine') return json({ data: [] });
    if (path.endsWith('/onboardingProgress')) return json({ currentPhase: 1, phases: [] });
    return json({});
  });
  // Les deux destinations possibles sont remplacées par une page témoin : on ne vérifie que l'adresse d'arrivée.
  await page.route(/\/(telephony|call-center)(\/|\?|$)/, (route) =>
    route.request().resourceType() === 'document'
      ? route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><h1>arrivee</h1></body></html>' })
      : route.continue(),
  );

  // Garde-fou : aucun appel ne doit partir vers un vrai serveur HARX pendant le test.
  await page.route(/(railway\.app|harx\.ai\/api)/, (route) => route.abort());
  // Scripts tiers (mesure d'audience, chat) inutiles ici.
  await page.route(/(googletagmanager|mouseflow|zohopublic|clarity\.ms)/, (route) => route.abort());

  await page.goto('/auth/signin');
  await page.locator('input[type="email"]').fill('centre@example.com');
  await page.locator('input[type="password"]').fill('motdepasse');
  await page.locator('button.btn-primary').first().click();
  await page.locator('input[maxlength="6"]').fill('123456');
  await page.locator('button.btn-primary').first().click();

  await page.waitForURL((u) => u.pathname === '/telephony' || u.pathname.startsWith('/call-center'), { timeout: 20_000 });
  expect(new URL(page.url()).pathname).toBe('/telephony');
  expect(calls).toContain('/api/auth/check-user-type');
});
