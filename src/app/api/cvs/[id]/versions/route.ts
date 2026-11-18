import { NextRequest } from 'next/server';
import { eq,desc,and } from 'drizzle-orm';
import { cvs,cvVersions } from '@/db/schema';
import { ownedCV,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,HttpError } from '@/lib/security';
import { z } from 'zod';
type Params={params:Promise<{id:string}>};
export async function GET(req:NextRequest,{params}:Params){try{const {cv,db}=await ownedCV(req,(await params).id);const versions=await db.select({id:cvVersions.id,revision:cvVersions.revision,createdAt:cvVersions.createdAt}).from(cvVersions).where(eq(cvVersions.cvId,cv.id)).orderBy(desc(cvVersions.revision)).limit(30);return privateResponse({versions});}catch(e){return respondError(e);}}
export async function POST(req:NextRequest,{params}:Params){try{checkOrigin(req);const {u,cv,db}=await ownedCV(req,(await params).id);const {revision}=z.object({revision:z.number().int().positive()}).parse(await jsonBody(req));
const [version]=await db.select().from(cvVersions).where(and(eq(cvVersions.cvId,cv.id),eq(cvVersions.revision,revision)));if(!version)throw new HttpError(404,'Version not found');
const [saved]=await db.update(cvs).set({title:version.title,template:version.template,content:version.content,revision:cv.revision+1,updatedAt:new Date()}).where(and(eq(cvs.id,cv.id),eq(cvs.userId,u.id),eq(cvs.revision,cv.revision))).returning();if(!saved)throw new HttpError(409,'Reload and try again');
await db.insert(cvVersions).values({cvId:cv.id,revision:saved.revision,title:saved.title,template:saved.template,content:saved.content});await audit(u.id,'cv_version_restored',cv.id);return privateResponse({cv:saved});
}catch(e){return respondError(e);}}
