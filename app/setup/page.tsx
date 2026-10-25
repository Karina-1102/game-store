import SetupForm from '@/components/setup-form';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
export const dynamic='force-dynamic';
export const metadata={title:'Первоначальная настройка магазина',robots:{index:false,follow:false}};
export default async function SetupPage(){if(process.env.NODE_ENV!=='development'||process.env.DEV_LOCAL_ONLY!=='true'||await db.user.count({where:{role:'ADMIN'}})>0)redirect('/login?next=/admin');return <SetupForm/>;}
