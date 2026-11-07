// Vérification de la configuration des offres : node --experimental-strip-types scripts/check-offers.ts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { OFFERS, getAvailableOffers, getSoonOffers, resolveOfferHref } from '../src/config/offers.ts';

const ids = OFFERS.map((o) => o.id);
assert.equal(new Set(ids).size, ids.length, 'identifiants uniques');

assert.deepEqual(getAvailableOffers().map((o) => o.id), ['taas', 'telephony']);
assert.deepEqual(getSoonOffers().map((o) => o.id), ['more']);

const byId = Object.fromEntries(OFFERS.map((o) => [o.id, o]));
assert.equal(resolveOfferHref(byId.taas, 'fr'), '/fr/taas');
assert.equal(resolveOfferHref(byId.taas, 'en'), '/en/taas');
assert.equal(resolveOfferHref(byId.telephony, 'fr'), '/telephony');
assert.equal(resolveOfferHref(byId.telephony, 'en'), '/telephony');
assert.equal(resolveOfferHref(byId.more, 'fr'), null);

for (const o of OFFERS) {
  if (o.status === 'available') assert.ok(o.route?.startsWith('/'), `${o.id} : route absolue`);
  else assert.equal(o.route, null, `${o.id} : pas de lien`);
}

// Toutes les clés i18n référencées existent en fr et en (le dernier bloc dupliqué prime, comme JSON.parse).
const lookup = (obj: any, path: string) => path.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
for (const lang of ['fr', 'en']) {
  const json = JSON.parse(readFileSync(new URL(`../src/locales/${lang}/translation.json`, import.meta.url), 'utf8'));
  for (const o of OFFERS) {
    for (const key of [o.titleKey, o.navKey, o.taglineKey, o.ctaKey, ...o.bulletKeys]) {
      const v = lookup(json, key);
      assert.ok(typeof v === 'string' && v.trim(), `${lang} : clé manquante ${key}`);
      assert.ok(!/centre d.appels|call cent(re|er)/i.test(v), `${lang} : vocabulaire interdit dans ${key}`);
    }
  }
}
console.log('check-offers : OK');
