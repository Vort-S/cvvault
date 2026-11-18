import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { put,get,del } from '@vercel/blob';
import { getDb } from '@/db';
import { profiles } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,respondError,privateResponse,HttpError } from '@/lib/security';
export const runtime='nodejs';
function imageType(bytes:Uint8Array){const b=Buffer.from(bytes);if(b.subarray(0,3).toString('hex')==='ffd8ff')return {mime:'image/jpeg',ext:'jpg'};if(b.subarray(0,8).toString('hex')==='89504e470d0a1a0a')return {mime:'image/png',ext:'png'};if(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP')return {mime:'image/webp',ext:'webp'};return null;}
export async function POST(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);const form=await req.formData();const file=form.get('photo');if(!(file instanceof File)||file.size>1024*1024||file.size===0)throw new HttpError(413,'Upload a photo below 1 MB');
const bytes=new Uint8Array(await file.arrayBuffer());const type=imageType(bytes);if(!type||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new HttpError(415,'JPEG, PNG or WebP required');
const db=getDb();const [old]=await db.select({path:profiles.photoPath}).from(profiles).where(eq(profiles.userId,u.id));const fileBlob=await put(`photos/${u.id}/${randomUUID()}.${type.ext}`,Buffer.from(bytes),{access:'private',contentType:type.mime,addRandomSuffix:false});
await db.update(profiles).set({photoPath:fileBlob.pathname,updatedAt:new Date()}).where(eq(profiles.userId,u.id));if(old?.path)await del(old.path);await audit(u.id,'profile_photo_updated');return privateResponse({ok:true});
}catch(e){return respondError(e);}}
export async function GET(req:NextRequest){try{const u=await requireUser(req);const [p]=await getDb().select({path:profiles.photoPath}).from(profiles).where(eq(profiles.userId,u.id));if(!p?.path)throw new HttpError(404,'No photo');const r=await get(p.path,{access:'private'});if(!r||r.statusCode!==200)throw new HttpError(404,'No photo');return new Response(r.stream,{headers:{'Content-Type':r.blob.contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}catch(e){return respondError(e);}}
export async function DELETE(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);const db=getDb();const [p]=await db.select({path:profiles.photoPath}).from(profiles).where(eq(profiles.userId,u.id));if(p?.path)await del(p.path);await db.update(profiles).set({photoPath:null}).where(eq(profiles.userId,u.id));return privateResponse({ok:true});}catch(e){return respondError(e);}}
