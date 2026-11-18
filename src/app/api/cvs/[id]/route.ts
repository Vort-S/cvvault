import { NextRequest } from 'next/server';
import { eq,and } from 'drizzle-orm';
import { cvs,cvVersions } from '@/db/schema';
import { ownedCV,sanitizeCVContent,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,HttpError } from '@/lib/security';
import { cvUpdateSchema } from '@/lib/validators';
type Params={params:Promise<{id:string}>};
export async function GET(req:NextRequest,{params}:Params){try{const {cv}=await ownedCV(req,(await params).id);return privateResponse({cv});}catch(e){return respondError(e);}}
export async function PUT(req:NextRequest,{params}:Params){try{
  checkOrigin(req);const {u,cv,db}=await ownedCV(req,(await params).id);const data=cvUpdateSchema.parse(await jsonBody(req));
  if(data.revision!==cv.revision)throw new HttpError(409,'This CV has changed. Reload before saving.');
  const next=await sanitizeCVContent(data.content);
  // Optimistic concurrency: stale browser tabs cannot overwrite a later revision.
  const [saved]=await db.update(cvs).set({title:data.title,content:next,template:data.template,publicDiscoverable:data.publicDiscoverable,revision:cv.revision+1,updatedAt:new Date()}).where(and(eq(cvs.id,cv.id),eq(cvs.userId,u.id),eq(cvs.revision,cv.revision))).returning();
  if(!saved)throw new HttpError(409,'This CV has changed. Reload before saving.');
  await db.insert(cvVersions).values({cvId:saved.id,revision:saved.revision,title:saved.title,template:saved.template,content:saved.content});
  await audit(u.id,'cv_updated',cv.id);return privateResponse({cv:saved});
}catch(e){return respondError(e);}}
export async function DELETE(req:NextRequest,{params}:Params){try{checkOrigin(req);const {u,cv,db}=await ownedCV(req,(await params).id);await audit(u.id,'cv_deleted',cv.id);await db.delete(cvs).where(and(eq(cvs.id,cv.id),eq(cvs.userId,u.id)));return privateResponse({ok:true});}catch(e){return respondError(e);}}
