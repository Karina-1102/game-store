import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.APP_URL||'http://localhost:3000'),title:{default:'NEXUS — игровые ценности',template:'%s | NEXUS'},description:'Магазин цифровых игровых товаров с безопасной оплатой и поддержкой.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="ru"><body>{children}</body></html>;}
