import { NextRequest } from 'next/server';
import { and,eq,ilike,desc } from 'drizzle-orm';
import { getDb } from '@/db';
import { cvs,profiles,userTable } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { privateResponse,respondError,HttpError } from '@/lib/security';
export async function GET(req:NextRequest){try{const u=await requireUser(req);
  if(u.role==='user')throw new HttpError(403,'Forbidden');
  const db=getDb(),params=req.nextUrl.searchParams;
  const q=params.get('q')?.slice(0,100).trim()||'',skill=params.get('skill')?.slice(0,60).toLowerCase().trim()||'',
   location=params.get('location')?.slice(0,80).trim()||'',education=params.get('education')?.slice(0,100).trim()||'';
  const page=Math.min(1000,Math.max(1,Number(params.get('page'))||1));
  // Public discoverability is mandatory, even for recruiters; admins inspect private CV metadata separately.
  const rows=await db.select({id:cvs.id,title:cvs.title,content:cvs.content,ownerName:profiles.name,location:profiles.location,updatedAt:cvs.updatedAt}).from(cvs)
    .innerJoin(profiles,eq(profiles.userId,cvs.userId)).innerJoin(userTable,eq(userTable.id,cvs.userId))
    .where(and(eq(cvs.publicDiscoverable,true),eq(userTable.role,'user'),
      ...(q?[ilike(cvs.title,`%${q}%`)]:[]),...(location?[ilike(profiles.location,`%${location}%`)]:[])))
    .orderBy(desc(cvs.updatedAt)).limit(100);
  const filtered=rows.filter(r=>(!skill||r.content.skills.some(s=>(s.title+' '+(s.description||'')).toLowerCase().includes(skill)))&&(!education||r.content.education.some(e=>(e.title+' '+(e.subtitle||'')).toLowerCase().includes(education))));
  // Prevent dumping full CVs in discovery responses; return metadata + short summary only.
  return privateResponse({rows:filtered.slice((page-1)*12,page*12).map(r=>({id:r.id,title:r.title,ownerName:r.ownerName,location:r.location,summary:r.content.summary.slice(0,180)})),total:filtered.length,page});
}catch(e){return respondError(e);}}
