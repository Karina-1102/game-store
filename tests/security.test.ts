import { test } from 'node:test';
import assert from 'node:assert/strict';
import { totalMinor,validateDelivery,checkoutSchema,passwordSchema,normalizeSearch } from '../lib/validation';
import { checkPaymentIdentity } from '../lib/payments';
test('money arithmetic uses integers',()=>{assert.equal(totalMinor([{price:199,quantity:3},{price:250,quantity:2}]),1097);assert.throws(()=>totalMinor([{price:Number.MAX_SAFE_INTEGER,quantity:100}]));});
test('checkout rejects a client-supplied price',()=>{assert.equal(checkoutSchema.safeParse({checkoutKey:crypto.randomUUID(),items:[{productId:'p',quantity:1,deliveryData:{},price:1}]}).success,false);});
test('delivery required and select fields are validated',()=>{const fields:any=[{key:'platform',label:'Платформа',type:'select',required:true,options:['PC'],sortOrder:0}];assert.throws(()=>validateDelivery(fields,{}));assert.throws(()=>validateDelivery(fields,{platform:'fake'}));assert.deepEqual(validateDelivery(fields,{platform:'PC'}),{platform:'PC'});assert.throws(()=>validateDelivery(fields,{platform:'PC',extra:'value'}));});
test('password bcrypt byte limit, normalization',()=>{assert.equal(passwordSchema.safeParse('а'.repeat(40)).success,false);assert.equal(passwordSchema.safeParse('123456789012').success,true);assert.equal(normalizeSearch(' ЗВЁЗДЫ '),'звезды');});
test('payment checks ID, amount, currency and order',()=>{const p={providerId:'cs_1',amount:199,currency:'usd',orderId:'order'};const s={id:'cs_1',amount_total:199,currency:'usd',metadata:{orderId:'order'}};assert.equal(checkPaymentIdentity(s,p),true);for(const x of [{...s,id:'cs_2'},{...s,amount_total:1},{...s,currency:'eur'},{...s,metadata:{orderId:'evil'}}])assert.equal(checkPaymentIdentity(x,p),false);});

test('major price input keeps exact kopecks', async()=>{
 const {majorToMinor,minorToMajor}=await import('../lib/money');
 assert.equal(majorToMinor('799'),79900);
 assert.equal(majorToMinor('749,90'),74990);
 assert.equal(majorToMinor('0.29'),29);
 assert.equal(majorToMinor('1,2'),120);
 for(const value of ['-1','1.999','Infinity','1e3','hello'])assert.throws(()=>majorToMinor(value));
 assert.equal(minorToMajor(79900),'799');assert.equal(minorToMajor(74990),'749,90');
});
test('generated game addresses support Cyrillic and readable names',async()=>{
 const {slugify}=await import('../lib/slug');assert.equal(slugify('PUBG Mobile'),'pubg-mobile');assert.equal(slugify('Звёзды Telegram'),'zvezdy-telegram');assert.equal(slugify('1000 Gold'),'1000-gold');
});
test('mobile LAN HTTP can generate checkout UUID without randomUUID',async()=>{
 const {clientId}=await import('../lib/client-id');
 const id=clientId({getRandomValues:<T extends ArrayBufferView|null>(bytes:T):T=>{new Uint8Array(bytes!.buffer,bytes!.byteOffset,bytes!.byteLength).fill(7);return bytes;}});
 assert.match(id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
 assert.equal(checkoutSchema.safeParse({checkoutKey:id,items:[{productId:'p',quantity:1,deliveryData:{}}]}).success,true);
});
