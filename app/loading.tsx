export default function Loading(){return <main className="container"><div className="skeleton hero"/><div className="grid">{[1,2,3,4].map(i=><div key={i} className="skeleton card"/>)}</div></main>;}
