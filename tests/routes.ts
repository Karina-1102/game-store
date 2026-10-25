import { test } from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.APP_URL||'http://localhost:3000';
test('public pages, 404, protected redirects and production headers',async()=>{
 const paths=['/','/catalog','/games/telegram','/games/standoff-2','/games/roblox','/games/warface','/products/telegram-50','/search?q=stars','/cart','/login','/register','/forgot-password','/reset-password','/support','/faq','/terms','/privacy','/refunds','/contacts','/not-a-page','/games/missing-game','/products/missing-product','/admin','/account','/orders','/checkout','/sitemap.xml','/robots.txt'];
 for(const p of paths){const r=await fetch(base+p,{redirect:'manual'});const expected=['/not-a-page','/games/missing-game','/products/missing-product'].includes(p)?404:['/admin','/account','/orders','/checkout'].includes(p)?307:200;assert.equal(r.status,expected,p);}
 const r=await fetch(base);for(const h of ['x-content-type-options','x-frame-options','content-security-policy','referrer-policy'])assert.ok(r.headers.has(h),h);
 const html=await r.text();const assets=[...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.(?:js|css))"/g)].map(m=>m[1]);assert.ok(assets.some(v=>v.endsWith('.js')));assert.ok(assets.some(v=>v.endsWith('.css')));for(const asset of new Set(assets))assert.equal((await fetch(base+asset)).status,200,asset);
});
