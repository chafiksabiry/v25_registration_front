import { expect, test, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Inbox admin + agent support IA, de bout en bout, contre un FAUX serveur : le vrai code de l'Inbox et de l'agent (dépôt
 * v25_comporchestrator_back, scripts/supportAgentFakeServer.mjs) avec stockages en mémoire, Claude scripté et canaux simulés.
 * Réseau extérieur coupé : toute requête du navigateur hors du site local et du faux serveur est bloquée et listée.
 *
 * Lancement : INBOX_FAKE_SERVER_SCRIPT=<chemin du script> [SCREENSHOT_DIR=<dossier>] npx playwright test e2e/admin-inbox-agent.spec.ts
 */
const SCRIPT = process.env.INBOX_FAKE_SERVER_SCRIPT || '';
const SHOTS = process.env.SCREENSHOT_DIR || '';
const SECRET = 'e2e-secret';
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };

const b64url = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const adminToken = () => {
  const head = b64url({ alg: 'HS256', typ: 'JWT' });
  const body = b64url({ userId: 'a0a0a0a0a0a0a0a0a0a0a0a0', typeUser: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 });
  return `${head}.${body}.${crypto.createHmac('sha256', SECRET).update(`${head}.${body}`).digest('base64url')}`;
};

test.describe.configure({ mode: 'serial' });
test.skip(!SCRIPT, 'INBOX_FAKE_SERVER_SCRIPT absent : faux serveur non disponible');

let server: ChildProcess | null = null;
let api = '';
const requests: Array<{ url: string; outcome: 'local' | 'faux-serveur' | 'bloquée' }> = [];

test.beforeAll(async () => {
  server = spawn(process.execPath, [SCRIPT, '0'], { cwd: path.resolve(path.dirname(SCRIPT), '..'), env: { ...process.env, JWT_SECRET: SECRET, HTTPS_PROXY: '', HTTP_PROXY: '' } });
  api = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('faux serveur muet')), 20000);
    server!.stdout!.on('data', (d) => {
      const m = /READY (\d+)/.exec(String(d));
      if (m) { clearTimeout(timer); resolve(`http://127.0.0.1:${m[1]}`); }
    });
    server!.stderr!.on('data', (d) => process.stderr.write(d));
  });
});
test.afterAll(async () => {
  server?.kill();
  if (SHOTS) fs.writeFileSync(path.join(SHOTS, 'e2e-requetes.json'), JSON.stringify({ total: requests.length, horsLocal: requests.filter((r) => r.outcome === 'bloquée'), requests }, null, 2));
});

async function openInbox(page: Page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript((t) => localStorage.setItem('token', t), adminToken());
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') { requests.push({ url: url.href, outcome: 'local' }); return route.continue(); }
    if (url.hostname === 'company.test') {
      requests.push({ url: url.href, outcome: 'faux-serveur' });
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
      try {
        const res = await route.fetch({ url: `${api}${url.pathname}${url.search}` });
        const body = await res.body();
        return await route.fulfill({ status: res.status(), headers: { ...res.headers(), ...CORS }, body });
      } catch {
        return undefined; // page fermée pendant la requête (fin du test)
      }
    }
    if (url.hostname === 'reg.test') { requests.push({ url: url.href, outcome: 'faux-serveur' }); return route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: '{}' }); }
    requests.push({ url: url.href, outcome: 'bloquée' });
    return route.abort();
  });
  await page.routeWebSocket(/\/support-inbox/, (ws) => { ws.send(JSON.stringify({ type: 'connected' })); });
  await page.goto('/admin/inbox');
  await expect(page.getByTestId('admin-inbox')).toBeVisible({ timeout: 30000 });
}
const state = async () => (await fetch(`${api}/__e2e/state`)).json();
const open = async (page: Page, name: string) => {
  await page.getByRole('button', { name: new RegExp(name) }).first().click();
  await expect(page.getByTestId('agent-panel')).toBeVisible({ timeout: 15000 });
};

test('brouillon visible dans l’Inbox -> « Envoyer » -> livré sur WhatsApp ; isolation et aucune donnée sensible', async ({ page }) => {
  await openInbox(page);
  await expect(page.getByTestId('agent-badge').first()).toBeVisible();
  await open(page, 'Sofia Benali');
  const draft = page.getByTestId('agent-draft').first();
  await expect(draft).toContainText('Brouillon de l’agent');
  await expect(page.getByTestId('agent-draft-text')).toContainText('Réglages › Notifications');
  await expect(page.getByTestId('agent-classification')).toContainText('Identité du client prouvée');
  const panel = (await page.getByTestId('agent-panel').innerText()) + (await page.getByTestId('agent-draft-text').innerText());
  // Isolation : rien de la société B (autre client) ; aucun secret, identifiant interne ni contact étranger.
  expect(panel).not.toMatch(/Camille|\+3314|Contact Centre|companyB/);
  expect(panel).not.toMatch(/sk-ant|eyJ[A-Za-z0-9_-]{10,}\.|\b[0-9a-f]{24}\b|@(?!harx\.ai)[a-z0-9.-]+\.[a-z]{2,}/i);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'inbox-brouillon-1440x900.png') });
  expect((await state()).sentWhatsApp).toHaveLength(0);
  await page.getByTestId('agent-send').click();
  await expect(page.getByTestId('agent-draft')).toHaveCount(0, { timeout: 15000 });
  await expect(page.getByTestId('agent-panel')).toContainText('en attente du client');
  const s = await state();
  expect(s.sentWhatsApp).toHaveLength(1);
  expect(s.sentWhatsApp[0].to).toBe('33612345678');
  expect(s.sentWhatsApp[0].text).toContain('Réglages › Notifications');
});

test('« Modifier » puis envoyer : le texte corrigé part par e-mail (support@)', async ({ page }) => {
  await openInbox(page);
  await open(page, 'Lucía Gómez');
  await expect(page.getByTestId('agent-classification')).toContainText('espagnol');
  await page.getByTestId('agent-edit').click();
  await page.getByTestId('agent-draft-edit').fill('Hola Lucía, descargue la app HARX Nomad en harx.ai/app y entre con su cuenta HARX.');
  await page.getByTestId('agent-send').click();
  await expect(page.getByTestId('agent-draft')).toHaveCount(0, { timeout: 15000 });
  const s = await state();
  expect(s.sentEmail).toEqual([{ to: 'email:thread-e2e-1', text: 'Hola Lucía, descargue la app HARX Nomad en harx.ai/app y entre con su cuenta HARX.' }]);
});

test('cas interdit -> escalade, notification au fondateur ; validation en un clic -> réponse finale en brouillon', async ({ page }) => {
  await openInbox(page);
  await open(page, 'Visiteur du site');
  const esc = page.getByTestId('agent-escalation');
  await expect(esc).toContainText('Décision requise');
  await expect(esc).toContainText('Remboursement');
  await expect(esc).toContainText('Recommandation');
  await expect(esc).toContainText('e-mail envoyé');
  await expect(page.getByTestId('agent-draft-text')).toContainText('réponse sous 24 h ouvrées');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'inbox-escalade-1440x900.png') });
  const s = await state();
  expect(s.notifications.some((n: { subject: string; text: string }) => /décision requise/.test(n.text))).toBe(true);
  expect(s.webhooks).toBeGreaterThan(0);
  await page.getByTestId('agent-approve').click();
  await expect(esc).toContainText('Recommandation validée', { timeout: 15000 });
  await expect(page.getByTestId('agent-draft-text').last()).toContainText('remboursement de votre mois de novembre');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'inbox-escalade-validee-1440x900.png') });
});

test('indicateurs hebdomadaires dans l’Inbox ; réseau extérieur coupé (liste des requêtes)', async ({ page }) => {
  await openInbox(page);
  await page.getByTestId('toggle-metrics').click();
  await expect(page.getByTestId('agent-metrics')).toBeVisible();
  await expect(page.getByTestId('kpi-requests')).toContainText(/\d/);
  await expect(page.getByTestId('by-channel')).toContainText('WhatsApp');
  await expect(page.getByTestId('kpi-open-24h')).toContainText('1');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'inbox-indicateurs-1440x900.png') });
  const s = await state();
  expect(s.blockedOutbound).toEqual([]);
  // Toute requête hors local / faux serveur a été bloquée avant de partir (aucune n'a atteint l'extérieur).
  const outside = requests.filter((r) => r.outcome === 'bloquée');
  expect(outside.every((r) => !/harx\.ai\/api|railway\.app|anthropic|graph\.facebook|googleapis\.com\/gmail|brevo/.test(r.url))).toBe(true);
  console.log(`requêtes : ${requests.length} (local ${requests.filter((r) => r.outcome === 'local').length}, faux serveur ${requests.filter((r) => r.outcome === 'faux-serveur').length}, bloquées ${outside.length})`);
});
