import Store from '@/components/store';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/security';
import { notFound,redirect } from 'next/navigation';
import type { Metadata } from 'next';
export const dynamic='force-dynamic';
const pages=['','catalog','search','cart','checkout','success','payment-error','login','register','forgot-password','reset-password','account','orders','support','faq','terms','privacy','refunds','contacts','admin'];
export async function generateMetadata({params}:{params:Promise<{path?:string[]}>}):Promise<Metadata> {
 const path=(await params).path||[];let title='Игровые ценности';let description='Цифровые игровые товары, каталог и поддержка.';let image='';
 if(path[0]==='games' && path[1]){const g=await db.game.findUnique({where:{slug:path[1]}});if(g){title=g.name;description=g.description.slice(0,160);image=g.image;}}
 if(path[0]==='products' && path[1]){const p=await db.product.findUnique({where:{slug:path[1]}});if(p){title=p.name;description=p.description.slice(0,160);image=p.image;}}
 const privatePage=['admin','account','orders','checkout','login','register','cart','success','payment-error','reset-password','forgot-password'].includes(path[0]);
 return {title,description,alternates:{canonical:'/'+path.join('/')},openGraph:{title,description,images:image?[image]:[]},robots:privatePage?{index:false,follow:false}:undefined};
}
export default async function Page({params}:{params:Promise<{path?:string[]}>}) {
 const path=(await params).path||[];
 if(path.length>2 || (path.length===2 && !['games','products','orders'].includes(path[0])) || (path.length<2 && !pages.includes(path[0]||'')))notFound();
 if(path[0]==='games'){if(!path[1] || !await db.game.findFirst({where:{slug:path[1],published:true}}))notFound();}
 if(path[0]==='products'){if(!path[1] || !await db.product.findFirst({where:{slug:path[1],published:true,game:{published:true}}}))notFound();}
 if(['admin','account','orders','checkout'].includes(path[0])){const user=await currentUser();if(!user)redirect('/login?next='+encodeURIComponent('/'+path.join('/')));if(path[0]==='admin' && user.role!=='ADMIN')redirect('/account');if(path[0]==='orders' && path[1] && !await db.order.findFirst({where:{id:path[1],userId:user.id}}))notFound();}
 return <Store path={path}/>;
}
