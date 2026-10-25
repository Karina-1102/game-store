import { z } from 'zod';
export const emailSchema = z.email().max(254).transform(v => v.toLowerCase().trim());
export const passwordSchema = z.string().min(12, 'Минимум 12 символов').refine(v => Buffer.byteLength(v, 'utf8') <= 72, 'Максимум 72 байта');
export const fieldSchema = z.object({ key: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/), label: z.string().min(1).max(100), type: z.enum(['text','number','select','checkbox']), required: z.boolean().default(true), options: z.array(z.string().min(1).max(100)).max(50).default([]), sortOrder: z.number().int().default(0) }).refine(f => f.type !== 'select' || f.options.length > 0, 'Добавьте варианты выбора');
export const fieldsSchema = z.array(fieldSchema).max(20).refine(f => new Set(f.map(v => v.key)).size === f.length, 'Ключи полей должны быть уникальны');
export type DeliveryField = z.infer<typeof fieldSchema>;
const image = z.string().max(2048).refine(v => v === '' || /^\/api\/images\/[a-f0-9-]+\.webp$/.test(v) || /^\/assets\/[a-z0-9-]+\.webp$/.test(v) || (process.env.S3_PUBLIC_URL && v.startsWith(process.env.S3_PUBLIC_URL.replace(/\/$/,'') + '/')), 'Используйте загрузку изображения');
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100);
export const gameSchema = z.object({ name:z.string().min(1).max(100), slug, description:z.string().max(10000), aliases:z.array(z.string().max(100)).max(50).default([]), image:image.default(''), logo:image.default(''), published:z.boolean().default(true), sortOrder:z.number().int().min(0).default(0), fields:fieldsSchema.default([]), saleAllowed:z.boolean().default(false), permissionReference:z.string().max(2000).default('') }).refine(v => !v.saleAllowed || v.permissionReference.length > 10, 'Укажите основание разрешения продаж');
export const productSchema = z.object({ name:z.string().min(1).max(150), slug, gameId:z.string().min(1), categoryId:z.string().nullable().default(null), parentId:z.string().nullable().default(null), description:z.string().max(10000), image:image.default(''), images:z.array(image).max(10).default([]), aliases:z.array(z.string().max(100)).max(50).default([]), tags:z.array(z.string().max(100)).max(50).default([]), price:z.number().int().min(50).max(100000000), oldPrice:z.number().int().min(0).max(100000000).nullable().default(null), currency:z.string().regex(/^[a-z]{3}$/).default(process.env.STORE_CURRENCY||'rub'), amount:z.number().int().min(1).max(100000000), stock:z.number().int().min(0).max(1000000), published:z.boolean().default(true), minQuantity:z.number().int().min(1).max(100).default(1), maxQuantity:z.number().int().min(1).max(100).default(10), deliveryMethod:z.enum(['MANUAL']).default('MANUAL'), instruction:z.string().max(10000).default(''), fields:fieldsSchema.default([]) }).refine(v => v.maxQuantity >= v.minQuantity, 'Максимум меньше минимума').refine(v => !v.oldPrice || v.oldPrice >= v.price, 'Старая цена меньше текущей');
export const checkoutSchema = z.object({ checkoutKey:z.uuid(), items:z.array(z.object({ productId:z.string().min(1), quantity:z.number().int().min(1).max(100), deliveryData:z.record(z.string(),z.union([z.string().max(500),z.boolean(),z.number().finite()])) }).strict()).min(1).max(30) }).strict();
export function validateDelivery(fields: DeliveryField[], raw: Record<string, unknown>) {
 const result: Record<string,string|number|boolean> = {};
 for (const f of fields) {
  const v = raw[f.key];
  if (v === undefined || v === '' || v === null) { if(f.required) throw new Error(`Заполните поле «${f.label}»`); continue; }
  if(f.type==='checkbox') { if(typeof v!=='boolean' || (f.required && !v)) throw new Error(`Подтвердите «${f.label}»`); result[f.key]=v; }
  else if(f.type==='number') { const n=Number(v); if(!Number.isSafeInteger(n) || n<0) throw new Error(`Неверное число: ${f.label}`); result[f.key]=n; }
  else { if(typeof v!=='string' || v.length>500 || !v.trim()) throw new Error(`Неверное поле: ${f.label}`); if(f.type==='select' && !f.options.includes(v)) throw new Error(`Неверный вариант: ${f.label}`); result[f.key]=v.trim(); }
 }
 if(Object.keys(raw).some(k=>!fields.some(f=>f.key===k))) throw new Error('Неизвестное поле доставки');
 return result;
}
export function totalMinor(lines: {price:number;quantity:number}[]) {
 const sum=lines.reduce((a,l)=>a+l.price*l.quantity,0);
 if(!Number.isSafeInteger(sum) || sum<50 || sum>100000000) throw new Error('Недопустимая сумма заказа');
 return sum;
}
export function normalizeSearch(q:string) { return q.toLowerCase().replace(/ё/g,'е').trim(); }
