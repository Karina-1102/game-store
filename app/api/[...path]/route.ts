import { NextRequest,NextResponse } from 'next/server';
import { Prisma,OrderStatus } from '@prisma/client';
import { z,ZodError } from 'zod';
import bcrypt from 'bcryptjs';
import { storeSettings } from '@/lib/settings';
import { slugify } from '@/lib/slug';
import { randomUUID, randomBytes } from 'node:crypto';
import { db } from '@/lib/db';
import { ApiError,checkOrigin,currentUser,requireUser,newSession,clearSession,hashToken,rateLimit,readJson,readBounded,safeUser } from '@/lib/security';
import { emailSchema,passwordSchema,gameSchema,productSchema } from '@/lib/validation';
import { catalog,search,productInclude,pageParams } from '@/lib/catalog';
import { createOrder,orderInclude,publicOrder } from '@/lib/orders';
import { createPayment,provider,handlePaymentEvent } from '@/lib/payments';
import { uploadImage } from '@/lib/storage';
import { readFile } from 'node:fs/promises';
import nodePath from 'node:path';
import { sendReset } from '@/lib/mail';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const json=(v:unknown,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}});
const idSchema=z.string().min(1).max(100);
async function route(req:NextRequest,{params}:{params:Promise<{path:string[]}>}) {
 try {
 const path=(await params).path;const key=path.join('/');const method=req.method;const p=req.nextUrl.searchParams;
 if(key==='webhooks/payment' && method==='POST') {
  if(Number(req.headers.get('content-length'))>1048576)throw new ApiError(413,'Webhook слишком большой');
  const raw=(await readBounded(req,1048576)).toString('utf8');if(Buffer.byteLength(raw)>1048576)throw new ApiError(413,'Webhook слишком большой');
  let event;try{event=provider.verify(raw,req.headers.get('stripe-signature')||'');}catch(e){if(e instanceof ApiError)throw e;throw new ApiError(400,'Неверная подпись webhook');}
  return json(await handlePaymentEvent(event));
 }
 if(path[0]==='images' && path.length===2 && method==='GET'){if(!/^[a-f0-9-]{36}\.webp$/.test(path[1]))throw new ApiError(404,'Файл не найден');try{const file=await readFile(nodePath.join(process.cwd(),'public','uploads',path[1]));return new NextResponse(new Uint8Array(file),{headers:{'Content-Type':'image/webp','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}});}catch{throw new ApiError(404,'Файл не найден');}}
 if(!['GET','HEAD'].includes(method))checkOrigin(req);
 if(key==='config' && method==='GET')return json({...await storeSettings(),paymentMode:process.env.PAYMENT_MODE||'test',currency:process.env.STORE_CURRENCY||'rub',legalName:process.env.LEGAL_NAME||'',legalAddress:process.env.LEGAL_ADDRESS||'',legalApproved:process.env.LEGAL_APPROVED==='true'});
 if(key==='auth/setup' && method==='GET')return json({available:process.env.NODE_ENV==='development' && process.env.DEV_LOCAL_ONLY==='true' && await db.user.count({where:{role:'ADMIN'}})===0});
 if(key==='auth/setup' && method==='POST') {
  if(process.env.NODE_ENV!=='development' || process.env.DEV_LOCAL_ONLY!=='true')throw new ApiError(403,'Первоначальная настройка доступна только на этом компьютере при локальном запуске');
  await rateLimit(req,'setup',5,600);
  const input=z.object({email:emailSchema,name:z.string().max(100).default(''),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));
  const passwordHash=await bcrypt.hash(input.password,12);
  const user=await db.$transaction(async tx=>{await tx.$executeRaw`SELECT pg_advisory_xact_lock(67321893)`;if(await tx.user.count({where:{role:'ADMIN'}}))throw new ApiError(409,'Администратор уже создан. Войдите в существующий аккаунт.');const u=await tx.user.create({data:{email:input.email,name:input.name,passwordHash,role:'ADMIN'},select:safeUser});await tx.adminLog.create({data:{adminId:u.id,action:'LOCAL_SETUP_ADMIN',object:'User',objectId:u.id,after:{role:'ADMIN'}}});return u;});
  await clearSession();await newSession(user.id);return json({user},201);
 }
 if(key==='auth/me' && method==='GET')return json({user:await currentUser()});
 if(key==='auth/register' && method==='POST') {
  await rateLimit(req,'register',5,600);const input=z.object({email:emailSchema,password:passwordSchema,confirmPassword:z.string(),name:z.string().max(100).default('')}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));
  const user=await db.user.create({data:{email:input.email,passwordHash:await bcrypt.hash(input.password,12),name:input.name},select:safeUser});await newSession(user.id);return json({user},201);
 }
 if(key==='auth/login' && method==='POST') {
  await rateLimit(req,'login-ip',20,600);const input=z.object({email:emailSchema,password:z.string().min(1).max(200)}).parse(await readJson(req));await rateLimit(req,'login-email',8,600,input.email);
  const u=await db.user.findUnique({where:{email:input.email}});
  const valid=await bcrypt.compare(input.password,u?.passwordHash||'$2b$12$C6UzMDM.H6dfI/f/IKcEe.3sDyqpSHNuDyYKQsBWGjRVHKZaikqiS');
  if(!u || !valid || u.blocked)throw new ApiError(401,'Неверные данные для входа');await clearSession();await newSession(u.id);return json({user:await currentUser()});
 }
 if(key==='auth/logout' && method==='POST'){await clearSession();return json({ok:true});}
 if(key==='auth/forgot-password' && method==='POST') {
  await rateLimit(req,'forgot',5,600);const {email}=z.object({email:emailSchema}).parse(await readJson(req));
  if(!process.env.SMTP_HOST)throw new ApiError(503,'Восстановление недоступно: SMTP не настроен');
  const u=await db.user.findUnique({where:{email}});if(u && !u.blocked){const token=randomBytes(32).toString('hex');await db.passwordReset.create({data:{userId:u.id,tokenHash:hashToken(token),expiresAt:new Date(Date.now()+30*60000)}});try{await sendReset(email,token);}catch{throw new ApiError(503,'Не удалось отправить письмо');}}
  return json({message:'Если аккаунт существует, письмо отправлено.'});
 }
 if(key==='auth/reset-password' && method==='POST') {
  await rateLimit(req,'reset',10,600);const input=z.object({token:z.string().length(64),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));const passwordHash=await bcrypt.hash(input.password,12);
  await db.$transaction(async tx=>{const reset=await tx.passwordReset.findUnique({where:{tokenHash:hashToken(input.token)},include:{user:true}});if(!reset || reset.expiresAt<new Date() || reset.user.blocked)throw new ApiError(400,'Ссылка истекла или уже использована');await tx.passwordReset.delete({where:{id:reset.id}});await tx.user.update({where:{id:reset.userId},data:{passwordHash}});await tx.session.deleteMany({where:{userId:reset.userId}});await tx.passwordReset.deleteMany({where:{userId:reset.userId}});});return json({ok:true});
 }
 if(key==='auth/change-password' && method==='POST') {
  const user=await requireUser();await rateLimit(req,'change-password',5,600,user.id);const input=z.object({currentPassword:z.string().max(200),password:passwordSchema,confirmPassword:z.string()}).refine(v=>v.password===v.confirmPassword,'Пароли не совпадают').parse(await readJson(req));const u=await db.user.findUniqueOrThrow({where:{id:user.id}});if(!await bcrypt.compare(input.currentPassword,u.passwordHash))throw new ApiError(400,'Текущий пароль неверен');
  await db.$transaction([db.user.update({where:{id:user.id},data:{passwordHash:await bcrypt.hash(input.password,12)}}),db.session.deleteMany({where:{userId:user.id}}),db.passwordReset.deleteMany({where:{userId:user.id}})]);await newSession(user.id);return json({ok:true});
 }
 if(key==='account' && method==='PATCH'){const u=await requireUser();const {name}=z.object({name:z.string().max(100)}).parse(await readJson(req));return json(await db.user.update({where:{id:u.id},data:{name},select:safeUser}));}
 if(key==='games' && method==='GET')return json(await db.game.findMany({where:{published:true},orderBy:{sortOrder:'asc'},include:{categories:true,products:{where:{published:true},select:{price:true,currency:true,stock:true},orderBy:{price:'asc'}}}}));
 if(path[0]==='games' && path.length===2 && method==='GET'){const game=await db.game.findFirst({where:{slug:path[1],published:true},include:{categories:true}});if(!game)throw new ApiError(404,'Игра не найдена');const qp=new URLSearchParams(p);qp.set('game',game.id);return json({game,...await catalog(qp)});}
 if(key==='cart-products' && method==='POST'){const {ids}=z.object({ids:z.array(idSchema).max(30)}).parse(await readJson(req));return json(await db.product.findMany({where:{id:{in:ids},published:true,game:{published:true}},include:productInclude}));}
 if(key==='products' && method==='GET')return json(await catalog(p));
 if(path[0]==='products' && path.length===2 && method==='GET'){const product=await db.product.findFirst({where:{slug:path[1],published:true,game:{published:true}},include:{...productInclude,variants:{where:{published:true},include:productInclude}}});if(!product)throw new ApiError(404,'Товар не найден');return json(product);}
 if(key==='search' && method==='GET'){await rateLimit(req,'search',120,60);return json(await search(p.get('q')||''));}
 if(key==='orders' && method==='POST'){const u=await requireUser();await rateLimit(req,'orders',10,60,u.id);return json(publicOrder(await createOrder(u.id,await readJson(req))),201);}
 if(key==='orders' && method==='GET'){const u=await requireUser();const {take,skip,page}=pageParams(p);const [items,count]=await Promise.all([db.order.findMany({where:{userId:u.id},include:orderInclude,orderBy:{createdAt:'desc'},take,skip}),db.order.count({where:{userId:u.id}})]);return json({items:items.map(publicOrder),page,pages:Math.ceil(count/take),count});}
 if(path[0]==='orders' && path.length===2 && method==='GET'){const u=await requireUser();const order=await db.order.findFirst({where:{id:path[1],userId:u.id},include:orderInclude});if(!order)throw new ApiError(404,'Заказ не найден');return json(publicOrder(order));}
 if(key==='payments/create' && method==='POST'){const u=await requireUser();await rateLimit(req,'payments',10,60,u.id);const {orderId}=z.object({orderId:idSchema}).parse(await readJson(req));return json(await createPayment(u.id,orderId,u.email));}
 if(key==='support' && method==='GET'){const u=await requireUser();return json(await db.ticket.findMany({where:{userId:u.id},orderBy:{createdAt:'desc'},take:50}));}
 if(key==='support' && method==='POST'){const u=await requireUser();await rateLimit(req,'support',5,600,u.id);const input=z.object({subject:z.string().min(3).max(150),message:z.string().min(10).max(5000)}).parse(await readJson(req));return json(await db.ticket.create({data:{...input,userId:u.id}}),201);}
 if(path[0]==='admin') {
 const admin=await requireUser(true);if(method!=='GET')await rateLimit(req,'admin',120,60,admin.id);
 const entity=path[1];const id=path[2];
 if(entity==='settings' && method==='GET')return json(await storeSettings());
 if(entity==='settings' && method==='PATCH'){const input=z.object({name:z.string().trim().min(1).max(80),supportEmail:z.union([emailSchema,z.literal('')])}).parse(await readJson(req));return json(await db.$transaction(async tx=>{const before=await tx.storeSetting.findUnique({where:{id:'main'}});const after=await tx.storeSetting.upsert({where:{id:'main'},create:{id:'main',...input},update:input});await tx.adminLog.create({data:{adminId:admin.id,action:'UPDATE_SETTINGS',object:'Store',objectId:'main',before:before?JSON.parse(JSON.stringify(before)):Prisma.JsonNull,after:JSON.parse(JSON.stringify(after))}});return {...after,currency:process.env.STORE_CURRENCY||'rub'};}));}
 if(['games','products'].includes(entity) && id && path[3]==='visibility' && method==='PATCH') {
  const input=z.object({published:z.boolean()}).strict().parse(await readJson(req));
  return json(await db.$transaction(async tx=>{let before,after;if(entity==='products'){before=await tx.product.findUniqueOrThrow({where:{id}});after=await tx.product.update({where:{id},data:input,include:productInclude});}else{before=await tx.game.findUniqueOrThrow({where:{id}});after=await tx.game.update({where:{id},data:input});}await tx.adminLog.create({data:{adminId:admin.id,action:input.published?'PUBLISH':'HIDE',object:entity,objectId:id,before:{published:before.published},after:{published:after.published}}});return after;}));
 }
 if(entity==='dashboard' && method==='GET') {
  const today=new Date();today.setUTCHours(0,0,0,0);const week=new Date(Date.now()-7*86400000);const paid={paidAt:{not:null},status:{not:'REFUNDED' as OrderStatus}};
  const [statuses,revenue,day,seven,popular]=await Promise.all([db.order.groupBy({by:['status'],_count:true}),db.order.aggregate({where:paid,_sum:{total:true}}),db.order.aggregate({where:{...paid,paidAt:{gte:today}},_sum:{total:true}}),db.order.aggregate({where:{...paid,paidAt:{gte:week}},_sum:{total:true}}),db.orderItem.groupBy({by:['productId','name'],where:{order:paid},_sum:{quantity:true},orderBy:{_sum:{quantity:'desc'}},take:5})]);return json({statuses,revenue:revenue._sum.total||0,today:day._sum.total||0,week:seven._sum.total||0,popular,currency:process.env.STORE_CURRENCY||'rub'});
 }
 if(entity==='uploads' && method==='POST'){if(Number(req.headers.get('content-length'))>6*1024*1024)throw new ApiError(413,'Слишком большой файл');const bytes=await readBounded(req,6*1024*1024);if(bytes.byteLength>6*1024*1024)throw new ApiError(413,'Слишком большой файл');const form=await new Response(new Uint8Array(bytes),{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();const f=form.get('file');if(!(f instanceof File))throw new ApiError(400,'Файл отсутствует');const url=await uploadImage(f);await db.adminLog.create({data:{adminId:admin.id,action:'UPLOAD',object:'Image',objectId:url,after:{url}}});return json({url});}
 if(entity==='logs' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.adminLog.findMany({orderBy:{createdAt:'desc'},take,skip,include:{admin:{select:{email:true}}}}),page,count:await db.adminLog.count()});}
 if(entity==='payments' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.paymentEvent.findMany({orderBy:{createdAt:'desc'},take,skip,include:{payment:true}}),page,count:await db.paymentEvent.count()});}
 if(entity==='games' && method==='GET')return json(await db.game.findMany({orderBy:{sortOrder:'asc'},include:{categories:true}}));
 if(entity==='products' && method==='GET'){if(id){const v=await db.product.findUnique({where:{id},include:productInclude});if(!v)throw new ApiError(404,'Товар не найден');return json(v);}return json(await catalog(p,true));}
 if(entity==='categories' && method==='GET')return json(await db.category.findMany({include:{game:true},orderBy:{name:'asc'}}));
 if(['games','products','categories'].includes(entity) && ['POST','PATCH','DELETE'].includes(method)) {
  if(method!=='POST' && !id)throw new ApiError(400,'Требуется ID');
  const raw=method==='DELETE'?null:await readJson(req);
  if(raw && method==='POST' && !raw.slug){const prefix=entity==='products' && raw.gameId?(await db.game.findUnique({where:{id:raw.gameId},select:{slug:true}}))?.slug+'-':'';const base=slugify((prefix||'')+(typeof raw.name==='string'?raw.name:''));const exists=entity==='games'?await db.game.findUnique({where:{slug:base}}):entity==='products'?await db.product.findUnique({where:{slug:base}}):await db.category.findUnique({where:{slug:base}});raw.slug=exists?base+'-'+randomUUID().slice(0,8):base;}
  const data=entity==='games'?raw&&gameSchema.parse(raw):entity==='products'?raw&&productSchema.parse(raw):raw&&z.object({name:z.string().min(1).max(100),slug:z.string().regex(/^[a-z0-9-]+$/).max(100),gameId:idSchema}).parse(raw);
  return json(await db.$transaction(async tx=>{
   let before:any=null;let after:any;
   if(entity==='games') {
    if(id)before=await tx.game.findUniqueOrThrow({where:{id}});
    if(method==='DELETE')after=await tx.game.delete({where:{id}});else if(method==='POST')after=await tx.game.create({data});else after=await tx.game.update({where:{id},data});
   } else if(entity==='categories') {
    if(id)before=await tx.category.findUniqueOrThrow({where:{id}});
    if(method==='DELETE')after=await tx.category.delete({where:{id}});else if(method==='POST')after=await tx.category.create({data});else after=await tx.category.update({where:{id},data});
   } else {
    if(id){await tx.$queryRaw`SELECT id FROM "Product" WHERE id=${id} FOR UPDATE`;before=await tx.product.findUniqueOrThrow({where:{id},include:productInclude});if(method==='PATCH' && (!raw.updatedAt || new Date(raw.updatedAt).getTime()!==before.updatedAt.getTime()))throw new ApiError(409,'Товар изменился после открытия формы. Обновите страницу перед сохранением.');}
    if(method==='DELETE')after=await tx.product.delete({where:{id}});
    else {
     const {fields,images,...base}=data;
     if(base.currency!==(process.env.STORE_CURRENCY||'rub'))throw new ApiError(400,'Укажите валюту магазина');
     if(base.categoryId){const cat=await tx.category.findUnique({where:{id:base.categoryId}});if(!cat || cat.gameId!==base.gameId)throw new ApiError(400,'Категория не принадлежит игре');}
     if(base.parentId){const parent=await tx.product.findUnique({where:{id:base.parentId}});if(!parent || parent.gameId!==base.gameId || base.parentId===id || parent.parentId)throw new ApiError(400,'Недопустимый родитель варианта');}
     if(id){await tx.productField.deleteMany({where:{productId:id}});await tx.productImage.deleteMany({where:{productId:id}});}
     const values={...base,fields:{create:fields},images:{create:images.map((url:string,sortOrder:number)=>({url,sortOrder}))}};
     after=method==='POST'?await tx.product.create({data:values,include:productInclude}):await tx.product.update({where:{id},data:values,include:productInclude});
    }
   }
   await tx.adminLog.create({data:{adminId:admin.id,action:method,object:entity,objectId:after.id,before:before?JSON.parse(JSON.stringify(before)):Prisma.JsonNull,after:JSON.parse(JSON.stringify(after))}});return after;
  }),method==='POST'?201:200);
 }
 if(entity==='orders' && method==='GET') {
  if(id){const o=await db.order.findUnique({where:{id},include:{...orderInclude,user:{select:safeUser}}});if(!o)throw new ApiError(404,'Заказ не найден');return json(o);}
  const {take,skip,page}=pageParams(p);const q=(p.get('q')||'').slice(0,100);const where:Prisma.OrderWhereInput={};
  if(q)where.OR=[{id:{contains:q}},{user:{email:{contains:q,mode:'insensitive'}}},{items:{some:{OR:[{name:{contains:q,mode:'insensitive'}},{gameName:{contains:q,mode:'insensitive'}}]}}}];
  if(p.get('status'))where.status=z.enum(OrderStatus).parse(p.get('status'));
  if(p.get('from') || p.get('to'))where.createdAt={...(p.get('from')?{gte:z.coerce.date().parse(p.get('from'))}:{}),...(p.get('to')?{lte:new Date(z.coerce.date().parse(p.get('to')).getTime()+86400000-1)}:{})};
  if(p.get('user'))where.userId=p.get('user')!;
  const [items,count]=await Promise.all([db.order.findMany({where,include:{...orderInclude,user:{select:safeUser}},orderBy:{createdAt:'desc'},take,skip}),db.order.count({where})]);return json({items,count,page,pages:Math.ceil(count/take)});
 }
 if(entity==='orders' && id && method==='PATCH') {
  const input=z.object({status:z.enum(['PROCESSING','COMPLETED']).optional(),internalComment:z.string().max(10000).optional()}).parse(await readJson(req));
  return json(await db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "Order" WHERE id=${id} FOR UPDATE`;const before=await tx.order.findUniqueOrThrow({where:{id}});if(input.status && !((before.status==='PAID' && input.status==='PROCESSING') || (before.status==='PROCESSING' && input.status==='COMPLETED') || before.status===input.status))throw new ApiError(409,'Сначала подтвердите оплату; соблюдайте порядок выполнения');const after=await tx.order.update({where:{id},data:input,include:orderInclude});await tx.adminLog.create({data:{adminId:admin.id,action:'UPDATE_ORDER',object:'Order',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));
 }
 if(entity==='refunds' && id && method==='POST'){const o=await db.order.findUniqueOrThrow({where:{id},include:{payment:true}});if(!['PAID','PROCESSING','COMPLETED'].includes(o.status) || !o.payment?.intentId)throw new ApiError(409,'Возврат недоступен');await provider.refund(o.payment.intentId,id);await db.adminLog.create({data:{adminId:admin.id,action:'REQUEST_REFUND',object:'Order',objectId:id}});return json({message:'Возврат запрошен. Статус изменит webhook.'});}
 if(entity==='users' && method==='GET'){if(id){const u=await db.user.findUnique({where:{id},select:{...safeUser,orders:{include:orderInclude,orderBy:{createdAt:'desc'},take:50}}});if(!u)throw new ApiError(404,'Пользователь не найден');return json(u);}const {take,skip,page}=pageParams(p);const where={email:{contains:(p.get('q')||'').slice(0,100),mode:'insensitive' as const}};return json({items:await db.user.findMany({where,select:safeUser,take,skip,orderBy:{createdAt:'desc'}}),count:await db.user.count({where}),page});}
 if(entity==='users' && id && method==='PATCH'){const input=z.object({blocked:z.boolean()}).parse(await readJson(req));if(id===admin.id)throw new ApiError(400,'Нельзя заблокировать себя');return json(await db.$transaction(async tx=>{const before=await tx.user.findUniqueOrThrow({where:{id},select:safeUser});if(before.role==='ADMIN')throw new ApiError(400,'Блокировку администратора выполняйте через серверную процедуру');const after=await tx.user.update({where:{id},data:input,select:safeUser});if(input.blocked)await tx.session.deleteMany({where:{userId:id}});await tx.adminLog.create({data:{adminId:admin.id,action:'BLOCK_USER',object:'User',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));}
 if(entity==='support' && method==='GET'){const {take,skip,page}=pageParams(p);return json({items:await db.ticket.findMany({include:{user:{select:safeUser}},orderBy:{createdAt:'desc'},take,skip}),count:await db.ticket.count(),page});}
 if(entity==='support' && id && method==='PATCH'){const input=z.object({reply:z.string().min(1).max(5000),status:z.enum(['OPEN','CLOSED'])}).parse(await readJson(req));return json(await db.$transaction(async tx=>{const before=await tx.ticket.findUniqueOrThrow({where:{id}});const after=await tx.ticket.update({where:{id},data:input});await tx.adminLog.create({data:{adminId:admin.id,action:'REPLY_TICKET',object:'Ticket',objectId:id,before:JSON.parse(JSON.stringify(before)),after:JSON.parse(JSON.stringify(after))}});return after;}));}
 }
 throw new ApiError(404,'Endpoint не найден');
 } catch(e) {
 if(e instanceof ApiError)return json({error:e.message},e.status);
 if(e instanceof ZodError)return json({error:e.issues.map(i=>i.message).join('; ')},400);
 if(e instanceof Prisma.PrismaClientKnownRequestError){if(e.code==='P2002')return json({error:'Такое значение уже существует'},409);if(e.code==='P2025')return json({error:'Запись не найдена'},404);if(e.code==='P2003')return json({error:'Запись связана с другими данными. Снимите с публикации вместо удаления.'},409);}
 console.error('API failure',e instanceof Error?e.name:'Unknown');return json({error:'Внутренняя ошибка сервера'},500);
 }
}
export {route as GET,route as POST,route as PATCH,route as DELETE};
