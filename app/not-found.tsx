import Link from 'next/link';
export default function NotFound(){return <main className="error-page"><span className="eyebrow">NEXUS / 404</span><h1>Здесь пока пусто</h1><p>Страница не найдена или товар снят с публикации.</p><Link className="button" href="/catalog">Открыть каталог</Link></main>;}
