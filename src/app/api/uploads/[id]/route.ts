import { NextRequest } from 'next/server';
import { eq,and } from 'drizzle-orm';
import { get,del } from '@vercel/blob';
import { getDb } from '@/db';
import { uploads } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,respondError,HttpError,privateResponse,assertUuid } from '@/lib/security';
type Params={params:Promise<{id:string}>};
async function owner(req:NextRequest,id:string){const u=await requireUser(req);const [item]=await getDb().select().from(uploads).where(and(eq(uploads.id,assertUuid(id)),eq(uploads.userId,u.id)));if(!item)throw new HttpError(404,'Not found');return {u,item};}
export async function GET(req:NextRequest,{params}:Params){try{const {item}=await owner(req,(await params).id);const result=await get(item.pathname,{access:'private'});if(result?.statusCode!==200)throw new HttpError(404,'Not found');
  return new Response(result.stream,{headers:{'Content-Type':item.mime,'Content-Disposition':`attachment; filename="resume-${item.id}.${item.mime==='application/pdf'?'pdf':'docx'}"`,'X-Content-Type-Options':'nosniff','Cache-Control':'private, no-store'}});
}catch(e){return respondError(e);}}
export async function DELETE(req:NextRequest,{params}:Params){try{checkOrigin(req);const {u,item}=await owner(req,(await params).id);await del(item.pathname);await getDb().delete(uploads).where(and(eq(uploads.id,item.id),eq(uploads.userId,u.id)));await audit(u.id,'file_deleted',item.id);return privateResponse({ok:true});}catch(e){return respondError(e);}}
