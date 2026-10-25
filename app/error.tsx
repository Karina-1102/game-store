'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><span className="eyebrow">NEXUS / 500</span><h1>Не удалось загрузить страницу</h1><p>Попробуйте ещё раз. Если ошибка повторится, обратитесь в поддержку.</p><button onClick={reset}>Повторить</button><a href="/support">Поддержка</a></main>;}
