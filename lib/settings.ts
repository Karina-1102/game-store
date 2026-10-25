import { db } from './db';
export async function storeSettings() {
 const saved = await db.storeSetting.findUnique({where:{id:'main'}});
 return {name:saved?.name || process.env.STORE_NAME || 'NEXUS',supportEmail:saved?.supportEmail ?? process.env.SUPPORT_EMAIL ?? '',currency:process.env.STORE_CURRENCY || 'rub'};
}
