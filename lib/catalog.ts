import { Prisma } from '@prisma/client';
import { db } from './db';
import { normalizeSearch } from './validation';
export const productInclude={game:true,category:true,fields:{orderBy:{sortOrder:'asc' as const}},images:{orderBy:{sortOrder:'asc' as const}}} as const;
export function pageParams(params:URLSearchParams){const page=Math.max(1,Math.min(10000,Number(params.get('page'))||1));return {page,take:24,skip:(page-1)*24};}
export async function search(q:string) {
 q=normalizeSearch(q).slice(0,100);if(!q)return {games:[],products:[]};
 // Parameterized SQL supports aliases/tags, Cyrillic, substrings and ё/е normalization.
 const pattern='%'+q.replace(/[\\%_]/g,'\\$&')+'%';
 const gameIds=await db.$queryRaw<{id:string}[]>`SELECT id FROM "Game" WHERE published=true AND (replace(lower(name),'ё','е') LIKE ${pattern} OR EXISTS (SELECT 1 FROM unnest(aliases) a WHERE replace(lower(a),'ё','е') LIKE ${pattern})) ORDER BY "sortOrder" LIMIT 8`;
 const productIds=await db.$queryRaw<{id:string}[]>`SELECT p.id FROM "Product" p JOIN "Game" g ON g.id=p."gameId" WHERE p.published=true AND g.published=true AND (replace(lower(p.name),'ё','е') LIKE ${pattern} OR replace(lower(g.name),'ё','е') LIKE ${pattern} OR EXISTS (SELECT 1 FROM unnest(p.aliases || p.tags || g.aliases) a WHERE replace(lower(a),'ё','е') LIKE ${pattern})) ORDER BY p.price LIMIT 24`;
 const [games,products]=await Promise.all([db.game.findMany({where:{id:{in:gameIds.map(r=>r.id)}},orderBy:{sortOrder:'asc'}}),db.product.findMany({where:{id:{in:productIds.map(r=>r.id)}},include:productInclude,orderBy:{price:'asc'}})]);
 return {games,products};
}
export async function catalog(params:URLSearchParams,admin=false) {
 const {page,take,skip}=pageParams(params);const where:Prisma.ProductWhereInput=admin?{}:{published:true,game:{published:true}};
 if(params.get('game'))where.gameId=params.get('game')!;
 if(params.get('category'))where.categoryId=params.get('category')!;
 if(params.get('q'))where.name={contains:params.get('q')!.slice(0,100),mode:'insensitive'};
 if(admin && params.get('published'))where.published=params.get('published')==='true';
 if(params.get('stock')==='true')where.stock={gt:0};if(params.get('stock')==='false')where.stock=0;
 if(params.get('min') || params.get('max'))where.price={...(params.get('min')?{gte:Math.max(0,Number(params.get('min'))||0)}:{}),...(params.get('max')?{lte:Math.max(0,Number(params.get('max'))||0)}:{})};
 if(params.get('sort')==='popular' && !admin){const ranked=await db.orderItem.groupBy({by:['productId'],where:{order:{paidAt:{not:null},status:{not:'REFUNDED'}}},_sum:{quantity:true},orderBy:{_sum:{quantity:'desc'}},take:24});const products=await db.product.findMany({where,include:productInclude,orderBy:{createdAt:'desc'},take:24});const popular=await db.product.findMany({where:{...where,id:{in:ranked.map(r=>r.productId)}},include:productInclude});const ordered=ranked.map(r=>popular.find(v=>v.id===r.productId)).filter(Boolean);return {items:[...ordered,...products.filter(v=>!ordered.some(p=>p?.id===v.id))].slice(0,24),count:await db.product.count({where}),page:1,pages:1};}
 const [items,count]=await Promise.all([db.product.findMany({where,include:productInclude,orderBy:{createdAt:'desc'},take,skip}),db.product.count({where})]);return {items,count,page,pages:Math.ceil(count/take)};
}
