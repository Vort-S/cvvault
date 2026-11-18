import { NextRequest } from 'next/server';
import { eq,desc } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { getDb } from '@/db';
import { uploads } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { limitRequest } from '@/lib/limits';
import { checkOrigin,privateResponse,respondError,HttpError } from '@/lib/security';
import { MAX_UPLOAD,verifyUpload } from '@/lib/uploads';
import { randomUUID } from 'node:crypto';
export const runtime='nodejs';
export async function GET(req:NextRequest){try{const u=await requireUser(req);const rows=await getDb().select({id:uploads.id,filename:uploads.filename,bytes:uploads.bytes,createdAt:uploads.createdAt}).from(uploads).where(eq(uploads.userId,u.id)).orderBy(desc(uploads.createdAt));return privateResponse({rows});}catch(e){return respondError(e);}}
export async function POST(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);await limitRequest(req,'uploads',20,60,u.id);
  const length=Number(req.headers.get('content-length')||0);if(length>MAX_UPLOAD+100000)throw new HttpError(413,'File too large');
  const form=await req.formData();const file=form.get('file');if(!(file instanceof File))throw new HttpError(400,'File missing');
  if(file.size>MAX_UPLOAD)throw new HttpError(413,'File too large');
  const bytes=new Uint8Array(await file.arrayBuffer());const kind=verifyUpload(file.name,bytes,file.type);
  if(!kind)throw new HttpError(415,'Only valid PDF or DOCX files up to 5 MB are accepted');
  // This upload accepts documents for storage only; it never parses, executes or renders them as HTML.
  const pathname=`resumes/${u.id}/${randomUUID()}.${kind==='application/pdf'?'pdf':'docx'}`;
  const blob=await put(pathname,Buffer.from(bytes),{access:'private',contentType:kind,addRandomSuffix:false});
  const [entry]=await getDb().insert(uploads).values({userId:u.id,filename:file.name,pathname:blob.pathname,mime:kind,bytes:file.size}).returning({id:uploads.id,filename:uploads.filename});
  await audit(u.id,'file_uploaded',entry.id);return privateResponse({file:entry},201);
}catch(e){return respondError(e);}}
