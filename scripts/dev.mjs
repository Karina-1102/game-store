import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync,readFileSync,writeFileSync } from 'node:fs';
import { networkInterfaces } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const args=process.argv.slice(2);
const lan=args.includes('--lan');
const portIndex=args.indexOf('--port');
const port=portIndex>=0?Number(args[portIndex+1]):3000;
if(!Number.isInteger(port)||port<1024||port>65535){console.error('Неверный порт. Например: npm run dev -- --port 3001');process.exit(1);}
let child;
const npm=process.platform==='win32'?'npm.cmd':'npm';
function run(command,arguments_){return new Promise((resolve,reject)=>{const p=spawn(command,arguments_,{cwd:root,env:process.env,stdio:'inherit',shell:process.platform==='win32'});p.on('error',reject);p.on('exit',code=>code===0?resolve():reject(new Error('Команда завершилась с ошибкой')));});}
function updateEnv(source,key,value){const line=`${key}=${value}`;const pattern=new RegExp(`^${key}=.*$`,'m');return pattern.test(source)?source.replace(pattern,line):source+'\n'+line+'\n';}
try{
 let source=existsSync('.env')?readFileSync('.env','utf8'):readFileSync('.env.example','utf8');
 const initial=!existsSync('.env');
 if(initial){const password=randomBytes(24).toString('hex');source=updateEnv(source,'POSTGRES_PASSWORD',password);source=updateEnv(source,'DATABASE_URL',process.env.DATABASE_URL||`postgresql://store:${password}@localhost:5432/game_store?schema=public`);source=updateEnv(source,'AUTH_SECRET',process.env.AUTH_SECRET||randomBytes(32).toString('hex'));writeFileSync('.env',source,{mode:0o600});console.log('Создан файл локальных настроек .env. Секреты сгенерированы автоматически.');}
 process.loadEnvFile('.env');
 if(!process.env.AUTH_SECRET){const secret=randomBytes(32).toString('hex');source=updateEnv(source,'AUTH_SECRET',secret);writeFileSync('.env',source,{mode:0o600});process.env.AUTH_SECRET=secret;}
 process.env.NODE_ENV='development';
 process.env.DEV_LOCAL_ONLY=lan?'false':'true';
 let address='localhost';
 if(lan){const candidates=Object.values(networkInterfaces()).flat().filter(v=>v?.family==='IPv4'&&!v.internal);address=candidates[0]?.address||'localhost';}
 // Explicit launcher-generated origins are allowed only in development. Production uses APP_URL alone.
 process.env.APP_URL=`http://${address}:${port}`;
 process.env.DEV_ALLOWED_ORIGINS=[`http://localhost:${port}`,`http://127.0.0.1:${port}`,...(lan&&address!=='localhost'?[`http://${address}:${port}`]:[])].join(',');
 console.log('Подготавливаем магазин…');
 await run(npm,['run','db:generate']);
 const {PrismaClient}=await import('@prisma/client');
 const db=new PrismaClient();
 let connected=false;
 try{await db.$queryRaw`SELECT 1`;connected=true;}catch{}
 if(!connected){console.log('Запускаем PostgreSQL через Docker. Docker Desktop должен быть открыт.');try{await run('docker',['compose','up','-d','db']);}catch{throw new Error('Не удалось запустить базу данных. Откройте Docker Desktop и повторите npm run dev. Если используете свою PostgreSQL, проверьте DATABASE_URL в .env.');}
  for(let i=0;i<30;i++){try{await db.$queryRaw`SELECT 1`;connected=true;break;}catch{await new Promise(r=>setTimeout(r,1000));}}
 }
 await db.$disconnect();if(!connected)throw new Error('PostgreSQL не отвечает. Проверьте, что Docker Desktop запущен.');
 await run(npm,['run','db:migrate']);
 await run(npm,['run','db:seed']);
 const check=new PrismaClient();const needsAdmin=await check.user.count({where:{role:'ADMIN'}})===0;await check.$disconnect();
 child=spawn(process.execPath,[path.join(root,'node_modules','next','dist','bin','next'),'dev','--webpack','--hostname',lan?'0.0.0.0':'127.0.0.1','--port',String(port)],{cwd:root,env:process.env,stdio:['inherit','pipe','inherit']});
 let announced=false;
 child.stdout.on('data',data=>{process.stdout.write(data);if(!announced&&data.toString().includes('Ready')){announced=true;console.log(`\nСайт запущен: http://localhost:${port}\nАдмин-панель: http://localhost:${port}/admin`);if(lan)console.log(`На телефоне в этой Wi-Fi сети: http://${address}:${port}`);if(needsAdmin&&!lan)console.log(`Создайте администратора в браузере: http://localhost:${port}/setup`);if(needsAdmin&&lan)console.log('Сначала создайте администратора: остановите сервер и выполните npm run dev без --lan.');}});
 child.on('exit',code=>process.exit(code??0));
 process.on('SIGINT',()=>child?.kill('SIGINT'));process.on('SIGTERM',()=>child?.kill('SIGTERM'));
}catch(e){console.error('\n'+(e instanceof Error?e.message:'Не удалось запустить магазин'));process.exit(1);}
