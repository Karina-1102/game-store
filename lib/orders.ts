import { Prisma } from '@prisma/client';
import { db } from './db';
import { ApiError } from './security';
import { checkoutSchema, fieldsSchema, totalMinor, validateDelivery } from './validation';
export const orderInclude = {items:true,payment:true} as const;
export async function createOrder(userId:string,body:unknown) {
 const input=checkoutSchema.parse(body);
 const existing=await db.order.findUnique({where:{userId_checkoutKey:{userId,checkoutKey:input.checkoutKey}},include:orderInclude});
 if(existing) return existing;
 if(new Set(input.items.map(i=>i.productId)).size!==input.items.length) throw new ApiError(400,'Объедините повторяющиеся товары');
 try {return await db.$transaction(async tx=>{
  const rows=[];
  for(const item of [...input.items].sort((a,b)=>a.productId.localeCompare(b.productId))) {
   await tx.$queryRaw`SELECT id FROM "Product" WHERE id=${item.productId} FOR UPDATE`;
   const p=await tx.product.findUnique({where:{id:item.productId},include:{game:true,fields:{orderBy:{sortOrder:'asc'}}}});
   if(!p || !p.published || !p.game.published) throw new ApiError(400,'Товар недоступен');
   if(process.env.PAYMENT_MODE==='production' && (!p.game.saleAllowed || !p.game.permissionReference)) throw new ApiError(400,'Продажи для этой игры не разрешены');
   if(item.quantity<p.minQuantity || item.quantity>p.maxQuantity || item.quantity>p.stock) throw new ApiError(400,`Недопустимое количество: ${p.name}`);
   if(p.currency!==(process.env.STORE_CURRENCY||'rub')) throw new ApiError(400,'Валюта товара не соответствует валюте магазина');
   const fields=fieldsSchema.parse(p.fields.length?p.fields:p.game.fields);
   let deliveryData;try{deliveryData=validateDelivery(fields,item.deliveryData);}catch(e){throw new ApiError(400,(e as Error).message);}
   await tx.product.update({where:{id:p.id},data:{stock:{decrement:item.quantity}}});
   rows.push({productId:p.id,name:p.name,gameName:p.game.name,quantity:item.quantity,unitPrice:p.price,deliveryData,fieldsSnapshot:fields});
  }
  const total=totalMinor(rows.map(r=>({price:r.unitPrice,quantity:r.quantity})));
  return tx.order.create({data:{userId,checkoutKey:input.checkoutKey,status:'AWAITING_PAYMENT',total,currency:process.env.STORE_CURRENCY||'rub',expiresAt:new Date(Date.now()+35*60000),items:{create:rows},payment:{create:{amount:total,currency:process.env.STORE_CURRENCY||'rub'}}},include:orderInclude});
 });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2002'){const o=await db.order.findUnique({where:{userId_checkoutKey:{userId,checkoutKey:input.checkoutKey}},include:orderInclude});if(o)return o;}throw e;}
}
export async function releaseStock(tx:Prisma.TransactionClient,id:string,status:'CANCELLED'|'PAYMENT_FAILED'|'REFUNDED') {
 const order=await tx.order.findUniqueOrThrow({where:{id},include:{items:true}});
 if(!order.stockReleased) {
  for(const i of [...order.items].sort((a,b)=>a.productId.localeCompare(b.productId))) await tx.product.update({where:{id:i.productId},data:{stock:{increment:i.quantity}}});
 }
 await tx.order.update({where:{id},data:{status,stockReleased:true}});
}
export function publicOrder(o:any) {const {internalComment,userId,checkoutKey,...rest}=o; if(rest.payment){const {url,...payment}=rest.payment;rest.payment=payment;}return rest;}
