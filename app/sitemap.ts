import { db } from '@/lib/db';
import type { MetadataRoute } from 'next';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.APP_URL||'http://localhost:3000';const [games,products]=await Promise.all([db.game.findMany({where:{published:true}}),db.product.findMany({where:{published:true,game:{published:true}}})]);return [{url:base},{url:base+'/catalog'},...games.map(g=>({url:base+'/games/'+g.slug,lastModified:g.updatedAt})),...products.map(p=>({url:base+'/products/'+p.slug,lastModified:p.updatedAt}))];}
