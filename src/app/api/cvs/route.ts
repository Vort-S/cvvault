import { NextRequest } from 'next/server';
import { eq, ilike, and, desc, count } from 'drizzle-orm';
import { getDb } from '@/db';
import { cvs,cvVersions,emptyCV } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError } from '@/lib/security';
import { cvCreateSchema } from '@/lib/validators';
export async function GET(req:NextRequest){try{
  const u=await requireUser(req);const db=getDb();const search=req.nextUrl.searchParams.get('q')?.slice(0,100)||'';
  const page=Math.max(1,Math.min(1000,Number(req.nextUrl.searchParams.get('page'))||1));
  const where=and(eq(cvs.userId,u.id),...(search?[ilike(cvs.title,`%${search}%`)]:[]));
  const rows=await db.select({id:cvs.id,title:cvs.title,template:cvs.template,revision:cvs.revision,updatedAt:cvs.updatedAt,publicDiscoverable:cvs.publicDiscoverable}).from(cvs).where(where).orderBy(desc(cvs.updatedAt)).limit(12).offset((page-1)*12);
  const [{total}]=await db.select({total:count()}).from(cvs).where(where);
  return privateResponse({rows,total,page});
}catch(e){return respondError(e);}}
export async function POST(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);if(u.role==='recruiter')return privateResponse({error:'Forbidden'},403);
  const data=cvCreateSchema.parse(await jsonBody(req));const db=getDb();
  const [cv]=await db.insert(cvs).values({userId:u.id,title:data.title,content:emptyCV}).returning();
  await db.insert(cvVersions).values({cvId:cv.id,revision:1,title:cv.title,template:cv.template,content:cv.content});
  await audit(u.id,'cv_created',cv.id);return privateResponse({cv},201);
}catch(e){return respondError(e);}}
