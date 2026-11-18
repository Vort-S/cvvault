import { NextRequest } from 'next/server';
import { cvs,cvVersions } from '@/db/schema';
import { ownedCV,audit } from '@/lib/auth';
import { checkOrigin,privateResponse,respondError } from '@/lib/security';
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{checkOrigin(req);const {u,cv,db}=await ownedCV(req,(await params).id);
  const [copy]=await db.insert(cvs).values({userId:u.id,title:(cv.title+' Copy').slice(0,150),template:cv.template,content:cv.content}).returning();
  await db.insert(cvVersions).values({cvId:copy.id,revision:1,title:copy.title,template:copy.template,content:copy.content});await audit(u.id,'cv_duplicated',copy.id);return privateResponse({cv:copy},201);
}catch(e){return respondError(e);}}
