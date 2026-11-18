import { NextRequest } from 'next/server';
import { eq,and } from 'drizzle-orm';
import { getDb } from '@/db';
import { cvs,profiles,userTable } from '@/db/schema';
import { requireUser } from '@/lib/auth';
import { privateResponse,respondError,HttpError,assertUuid } from '@/lib/security';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const u=await requireUser(req);if(u.role==='user')throw new HttpError(403,'Forbidden');
  const id=assertUuid((await params).id);const [rec]=await getDb().select({cv:cvs,profile:profiles}).from(cvs).innerJoin(profiles,eq(profiles.userId,cvs.userId)).innerJoin(userTable,eq(userTable.id,cvs.userId)).where(and(eq(cvs.id,id),eq(cvs.publicDiscoverable,true),eq(userTable.role,'user')));
  if(!rec)throw new HttpError(404,'Not found');
  return privateResponse({cv:{title:rec.cv.title,template:rec.cv.template,content:rec.cv.content},owner:{name:rec.profile.name,headline:rec.profile.headline,location:rec.profile.location}});
}catch(e){return respondError(e);}}
