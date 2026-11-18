import { NextRequest } from 'next/server';
import { desc,count,eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { userTable,cvs,audits,flags } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { privateResponse,respondError,HttpError } from '@/lib/security';
export async function GET(req:NextRequest,{params}:{params:Promise<{kind:string}>}){try{
  await requireAdmin(req);const db=getDb(),kind=(await params).kind;const page=Math.max(1,Number(req.nextUrl.searchParams.get('page'))||1);
  if(kind==='stats'){
    const [users]=await db.select({n:count()}).from(userTable);const [docs]=await db.select({n:count()}).from(cvs);const [reports]=await db.select({n:count()}).from(flags).where(eq(flags.status,'open'));
    return privateResponse({users:users.n,cvs:docs.n,openFlags:reports.n});
  }
  if(kind==='users'){
    const rows=await db.select({id:userTable.id,email:userTable.email,role:userTable.role,suspendedAt:userTable.suspendedAt,createdAt:userTable.createdAt}).from(userTable).orderBy(desc(userTable.createdAt)).limit(25).offset((page-1)*25);return privateResponse({rows,page});
  }
  if(kind==='cvs'){
    const rows=await db.select({id:cvs.id,userId:cvs.userId,title:cvs.title,updatedAt:cvs.updatedAt,publicDiscoverable:cvs.publicDiscoverable}).from(cvs).orderBy(desc(cvs.updatedAt)).limit(25).offset((page-1)*25);return privateResponse({rows,page});
  }
  if(kind==='audits'){const rows=await db.select().from(audits).orderBy(desc(audits.createdAt)).limit(60).offset((page-1)*60);return privateResponse({rows,page});}
  if(kind==='flags'){const rows=await db.select().from(flags).orderBy(desc(flags.createdAt)).limit(50).offset((page-1)*50);return privateResponse({rows,page});}
  throw new HttpError(404,'Not found');
}catch(e){return respondError(e);}}
