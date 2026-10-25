import sharp from 'sharp';
import { randomUUID } from 'node:crypto';
import { mkdir,writeFile } from 'node:fs/promises';
import path from 'node:path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ApiError } from './security';
export async function uploadImage(file:File) {
 if(!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size>5*1024*1024 || file.size<1)throw new ApiError(400,'Нужен PNG, JPEG или WEBP до 5 MB');
 const input=Buffer.from(await file.arrayBuffer());
 let output:Buffer;
 try{const instance=sharp(input,{limitInputPixels:16000000,animated:false});const meta=await instance.metadata();if(!['png','jpeg','webp'].includes(meta.format||'') || ({png:'image/png',jpeg:'image/jpeg',webp:'image/webp'} as Record<string,string>)[meta.format!]!==file.type)throw new Error(); output=await instance.rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();}catch{throw new ApiError(400,'Файл не является безопасным изображением');}
 const name=`${randomUUID()}.webp`;
 if(process.env.STORAGE_PROVIDER==='s3') {
  if(!process.env.S3_BUCKET || !process.env.S3_PUBLIC_URL)throw new ApiError(503,'S3 не настроен');
  const client=new S3Client({endpoint:process.env.S3_ENDPOINT||undefined,region:process.env.S3_REGION||'auto',forcePathStyle:true,credentials:process.env.S3_ACCESS_KEY?{accessKeyId:process.env.S3_ACCESS_KEY,secretAccessKey:process.env.S3_SECRET_KEY||''}:undefined});
  await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET,Key:name,Body:output,ContentType:'image/webp',CacheControl:'public,max-age=31536000,immutable'}));
  return `${process.env.S3_PUBLIC_URL.replace(/\/$/,'')}/${name}`;
 }
 const folder=path.join(process.cwd(),'public','uploads');await mkdir(folder,{recursive:true});await writeFile(path.join(folder,name),output,{flag:'wx'});return `/api/images/${name}`;
}
