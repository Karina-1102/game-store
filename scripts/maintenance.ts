import { db } from '../lib/db';
import { releaseStock } from '../lib/orders';
import { stripeClient } from '../lib/payments';
async function main(){await db.session.deleteMany({where:{expiresAt:{lt:new Date()}}});await db.passwordReset.deleteMany({where:{expiresAt:{lt:new Date()}}});await db.rateLimit.deleteMany({where:{expiresAt:{lt:new Date()}}});
const orders=await db.order.findMany({where:{status:'AWAITING_PAYMENT',expiresAt:{lt:new Date(Date.now()-86400000)}},include:{payment:true},take:100});
for(const o of orders){ // Recover missing webhook; never infer PAID from a browser return.
 if(o.payment?.providerId){const session=await stripeClient().checkout.sessions.retrieve(o.payment.providerId);if(session.status!=='expired')continue;}else if(o.payment?.status!=='CREATED'){ // A crashed API may have created a session; recover via the same idempotency key inside Stripe's 24-hour retention window is unsafe here.
 console.warn('Manual Stripe reconciliation required for order',o.id);continue;}
 await db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${o.id} FOR UPDATE`;const current=await tx.order.findUniqueOrThrow({where:{id:o.id}});if(current.status==='AWAITING_PAYMENT'){await releaseStock(tx,o.id,'CANCELLED');await tx.payment.update({where:{orderId:o.id},data:{status:'CANCELLED'}});await tx.paymentEvent.create({data:{id:'reconcile-expired-'+o.id,paymentId:o.payment!.id,type:'RECONCILE_EXPIRED',result:'CANCELLED'}});}});
}}
main().catch(e=>{console.error(e.name);process.exitCode=1;}).finally(()=>db.$disconnect());
