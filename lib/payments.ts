import Stripe from 'stripe';
import { db } from './db';
import { ApiError } from './security';
import { releaseStock } from './orders';
import { Prisma } from '@prisma/client';
export interface PaymentProvider {create(order:{id:string;total:number;currency:string;expiresAt:Date},email:string):Promise<{id:string;url:string}>;verify(body:string,signature:string):Stripe.Event;cancel(id:string):Promise<void>;refund(intentId:string,orderId:string):Promise<void>}
export function stripeClient() {
 const key=process.env.PAYMENT_SECRET_KEY||''; const mode=process.env.PAYMENT_MODE;
 if(process.env.PAYMENT_PROVIDER!=='stripe' || !['test','production'].includes(mode||'')) throw new ApiError(503,'Платёжный провайдер не настроен');
 if(!(mode==='test'?key.startsWith('sk_test_'):key.startsWith('sk_live_'))) throw new ApiError(503,'Ключ Stripe не соответствует режиму оплаты');
 if(mode==='production' && (process.env.LEGAL_APPROVED!=='true' || !process.env.LEGAL_NAME || !process.env.LEGAL_ADDRESS || !process.env.SUPPORT_EMAIL || !process.env.APP_URL?.startsWith('https://'))) throw new ApiError(503,'Заполните реквизиты и подтвердите юридические документы');
 return new Stripe(key,{maxNetworkRetries:2});
}
export class StripeProvider implements PaymentProvider {
 async create(o:{id:string;total:number;currency:string;expiresAt:Date},email:string) {
  const s=await stripeClient().checkout.sessions.create({mode:'payment',customer_email:email,client_reference_id:o.id,metadata:{orderId:o.id},payment_intent_data:{metadata:{orderId:o.id}},line_items:[{price_data:{currency:o.currency,unit_amount:o.total,product_data:{name:`Заказ ${o.id}`}},quantity:1}],success_url:`${process.env.APP_URL}/success?order=${o.id}`,cancel_url:`${process.env.APP_URL}/payment-error?order=${o.id}`,expires_at:Math.floor(o.expiresAt.getTime()/1000),payment_method_types:['card']},{idempotencyKey:`checkout-${o.id}`});
  if(!s.url) throw new ApiError(502,'Stripe не вернул ссылку'); return {id:s.id,url:s.url};
 }
 verify(body:string,signature:string) {if(!process.env.PAYMENT_WEBHOOK_SECRET)throw new ApiError(503,'Webhook secret не настроен');return stripeClient().webhooks.constructEvent(body,signature,process.env.PAYMENT_WEBHOOK_SECRET);}
 async cancel(id:string){await stripeClient().checkout.sessions.expire(id);}
 async refund(intentId:string,orderId:string){await stripeClient().refunds.create({payment_intent:intentId},{idempotencyKey:`refund-${orderId}`});}
}
export const provider:PaymentProvider=new StripeProvider();
export async function createPayment(userId:string,orderId:string,email:string) {
 const order=await db.order.findFirst({where:{id:orderId,userId},include:{payment:true,items:{include:{product:{include:{game:true}}}}}});
 if(!order)throw new ApiError(404,'Заказ не найден');
 if(process.env.PAYMENT_MODE==='production' && order.items.some(i=>!i.product.game.saleAllowed || !i.product.game.permissionReference))throw new ApiError(400,'Продажа для игры не подтверждена');
 if(order.status!=='AWAITING_PAYMENT' || order.expiresAt<new Date())throw new ApiError(409,'Срок оплаты истёк или заказ уже оплачен');
 if(order.payment?.url)return {url:order.payment.url};
 if(order.expiresAt.getTime()<Date.now()+30*60000)throw new ApiError(409,'Создание платёжной сессии просрочено. Обратитесь в поддержку с номером заказа.');
 await db.payment.updateMany({where:{orderId,status:'CREATED'},data:{status:'CREATING'}});
 const session=await provider.create(order,email);
 await db.$transaction(async tx=>{await tx.payment.update({where:{orderId},data:{providerId:session.id,url:session.url}});await tx.payment.updateMany({where:{orderId,status:{in:['CREATED','CREATING']}},data:{status:'PENDING'}});});
 return {url:session.url};
}
export function checkPaymentIdentity(session:{id:string;amount_total:number|null;currency:string|null;metadata:Record<string,string>|null},payment:{providerId:string|null;amount:number;currency:string;orderId:string}) {
 return session.metadata?.orderId===payment.orderId && (!payment.providerId || session.id===payment.providerId) && session.amount_total===payment.amount && session.currency===payment.currency;
}
export async function handlePaymentEvent(event:Stripe.Event) {
 if(event.livemode !== (process.env.PAYMENT_MODE==='production'))throw new ApiError(400,'Неверный режим webhook');
 const supported=['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired','charge.refunded','payment_intent.payment_failed'];
 if(!supported.includes(event.type))return {ignored:true};
 try {return await db.$transaction(async tx=>{
  await tx.paymentEvent.create({data:{id:event.id,type:event.type,result:'RECEIVED'}});
  const obj=event.data.object as any;
  let payment;
  if(event.type.startsWith('checkout.session.')) payment=await tx.payment.findFirst({where:{OR:[{providerId:obj.id},...(obj.metadata?.orderId?[{orderId:obj.metadata.orderId}]:[])]}});
  else {const intent=typeof obj.payment_intent==='string'?obj.payment_intent:obj.payment_intent?.id;payment=await tx.payment.findFirst({where:{OR:[{intentId:intent||obj.id},...(obj.metadata?.orderId?[{orderId:obj.metadata.orderId}]:[])]}});}
  if(!payment)throw new ApiError(409,'Платёж ещё не зарегистрирован');
  await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${payment.orderId} FOR UPDATE`;
  const order=await tx.order.findUniqueOrThrow({where:{id:payment.orderId}});
  await tx.paymentEvent.update({where:{id:event.id},data:{paymentId:payment.id}});
  let result='IGNORED';
  if(event.type.startsWith('checkout.session.')) {
   if(!checkPaymentIdentity(obj,payment))throw new ApiError(400,'Сумма, валюта или ID платежа не совпадают');
   if(!payment.providerId)await tx.payment.update({where:{id:payment.id},data:{providerId:obj.id,url:obj.url}});
   if(['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type) && obj.payment_status==='paid') {
    if(order.status==='AWAITING_PAYMENT' && !order.stockReleased){await tx.order.update({where:{id:order.id},data:{status:'PAID',paidAt:new Date()}});await tx.payment.update({where:{id:payment.id},data:{status:'PAID',intentId:typeof obj.payment_intent==='string'?obj.payment_intent:obj.payment_intent?.id}});result='PAID';}
   } else if(['checkout.session.expired','checkout.session.async_payment_failed'].includes(event.type) && order.status==='AWAITING_PAYMENT') {
    const status=event.type==='checkout.session.expired'?'CANCELLED':'PAYMENT_FAILED';await releaseStock(tx,order.id,status);await tx.payment.update({where:{id:payment.id},data:{status}});result=status;
   }
  } else if(event.type==='charge.refunded') {
   if(obj.currency!==payment.currency || obj.amount!==payment.amount || obj.payment_intent!==payment.intentId)throw new ApiError(400,'Несоответствие возврата');
   if(obj.refunded && obj.amount_refunded===payment.amount && ['PAID','PROCESSING','COMPLETED'].includes(order.status)){await tx.order.update({where:{id:order.id},data:{status:'REFUNDED'}});await tx.payment.update({where:{id:payment.id},data:{status:'REFUNDED'}});result='REFUNDED';}
  } else { if(obj.amount!==payment.amount || obj.currency!==payment.currency || (payment.intentId && obj.id!==payment.intentId))throw new ApiError(400,'Несоответствие попытки оплаты');result='ATTEMPT_FAILED'; /* Checkout may permit retry. Keep reservation until session expiry. */ }
  await tx.paymentEvent.update({where:{id:event.id},data:{result}});return {received:true,result};
 });}catch(e){if(e instanceof Prisma.PrismaClientKnownRequestError && e.code==='P2002' && await db.paymentEvent.findUnique({where:{id:event.id}}))return {duplicate:true};throw e;}
}
