import { createHmac, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
export class ApiError extends Error { constructor(public status:number,message:string) {super(message);} }
export function secret() {const v=process.env.AUTH_SECRET; if(!v || v.length<32) throw new ApiError(503,'AUTH_SECRET не настроен'); return v;}
export function hashToken(v:string) {return createHmac('sha256',secret()).update(v).digest('hex');}
export const safeUser = {id:true,email:true,name:true,role:true,blocked:true,createdAt:true} as const;
export async function currentUser() {return userForToken((await cookies()).get('session')?.value);}
export async function userForToken(token:string|undefined) {
 if(!token) return null;
 const session=await db.session.findUnique({where:{tokenHash:hashToken(token)},include:{user:{select:safeUser}}});
 return session && session.expiresAt>new Date() && !session.user.blocked ? session.user : null;
}
export async function requireUser(admin=false) {const u=await currentUser(); if(!u) throw new ApiError(401,'Войдите в аккаунт'); if(admin && u.role!=='ADMIN') throw new ApiError(403,'Доступ запрещён'); return u;}
export async function newSession(userId:string) {
 const token=randomBytes(32).toString('hex'); const expires=new Date(Date.now()+1000*60*60*24*7);
 await db.session.create({data:{userId,tokenHash:hashToken(token),expiresAt:expires}});
 (await cookies()).set('session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires});
}
export async function clearSession() {
 const c=await cookies(); const token=c.get('session')?.value;
 if(token) await db.session.deleteMany({where:{tokenHash:hashToken(token)}});
 c.set('session','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
}
export function checkOrigin(req:NextRequest) {
 const expected=new URL(process.env.APP_URL || 'http://localhost:3000').origin;
 const permitted=process.env.NODE_ENV==='development'?(process.env.DEV_ALLOWED_ORIGINS||'').split(',').filter(Boolean):[];
 if(req.headers.get('origin')!==expected && !permitted.includes(req.headers.get('origin')||'')) throw new ApiError(403,'Неверный источник запроса');
 if(req.headers.get('sec-fetch-site')==='cross-site') throw new ApiError(403,'Недопустимый запрос');
}
export async function rateLimit(req:NextRequest,scope:string,limit=30,seconds=60,identity='') {
 const ip=process.env.TRUST_PROXY==='true' ? (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown') : 'shared';
 const bucket=Math.floor(Date.now()/(seconds*1000));
 const key=hashToken(`${scope}:${identity || ip}:${bucket}`);
 const row=await db.rateLimit.upsert({where:{key},create:{key,count:1,expiresAt:new Date((bucket+1)*seconds*1000)},update:{count:{increment:1}}});
 if(row.count>limit) throw new ApiError(429,'Слишком много запросов. Повторите позже.');
}
export async function readBounded(req:NextRequest,maxBytes:number) {
 if(Number(req.headers.get('content-length'))>maxBytes)throw new ApiError(413,'Запрос слишком большой');
 const reader=req.body?.getReader();if(!reader)return Buffer.alloc(0);const parts:Uint8Array[]=[];let length=0;
 while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>maxBytes){await reader.cancel();throw new ApiError(413,'Запрос слишком большой');}parts.push(value);}
 return Buffer.concat(parts);
}
export async function readJson(req:NextRequest) {
 const bytes=await readBounded(req,65536);
 try{return JSON.parse(Buffer.from(bytes).toString('utf8'));}catch{throw new ApiError(400,'Некорректный JSON');}
}
