import nodemailer from 'nodemailer';
export async function sendReset(email:string,token:string) {
 const link=`${process.env.APP_URL}/reset-password?token=${token}`;
 if(!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new Error('SMTP не настроен');
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:process.env.SMTP_SECURE==='true',auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});
 await transport.sendMail({from:process.env.SMTP_FROM,to:email,subject:'Восстановление пароля NEXUS',text:`Для изменения пароля откройте ${link}\nСсылка действительна 30 минут. Если вы не запрашивали сброс, проигнорируйте письмо.`});
}
