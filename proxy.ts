import { NextRequest,NextResponse } from 'next/server';
import { db } from './lib/db';
import { userForToken } from './lib/security';
const publicPages=new Set(['','catalog','search','cart','checkout','success','payment-error','login','register','forgot-password','reset-password','account','orders','support','faq','terms','privacy','refunds','contacts','admin','setup','404']);
export async function proxy(req:NextRequest) {
 const parts=req.nextUrl.pathname.split('/').filter(Boolean);
 let exists=parts.length<=1 && publicPages.has(parts[0]||'');
 if(parts.length===2 && parts[0]==='games')exists=!!await db.game.findFirst({where:{slug:parts[1],published:true},select:{id:true}});
 if(parts.length===2 && parts[0]==='products')exists=!!await db.product.findFirst({where:{slug:parts[1],published:true,game:{published:true}},select:{id:true}});
 if(parts.length===2 && parts[0]==='orders')exists=true;
 if(exists && ['admin','account','orders','checkout'].includes(parts[0])){const user=await userForToken(req.cookies.get('session')?.value);if(!user){const login=new URL('/login',process.env.APP_URL||req.url);login.searchParams.set('next',req.nextUrl.pathname);return NextResponse.redirect(login);}if(parts[0]==='admin' && user.role!=='ADMIN')return NextResponse.redirect(new URL('/account',process.env.APP_URL||req.url));if(parts[0]==='orders' && parts[1])exists=!!await db.order.findFirst({where:{id:parts[1],userId:user.id},select:{id:true}});}
 if(!exists){const url=req.nextUrl.clone();url.pathname='/404';return NextResponse.rewrite(url,{status:404});}
 return NextResponse.next();
}
export const config={matcher:['/((?!api(?:/|$)|_next(?:/|$)|assets(?:/|$)|uploads(?:/|$)|favicon.ico|robots.txt|sitemap.xml).*)']};
