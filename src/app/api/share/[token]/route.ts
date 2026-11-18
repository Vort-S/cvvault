import { NextRequest } from 'next/server';
import { eq,and,isNull,or,gt } from 'drizzle-orm';
import { getDb } from '@/db';
import { shareLinks,cvs,profiles,userTable } from '@/db/schema';
import { limitRequest } from '@/lib/limits';
import { hashToken,privateResponse,respondError,HttpError } from '@/lib/security';
export const dynamic='force-dynamic';
export async function GET(req:NextRequest,{params}:{params:Promise<{token:string}>}){try{
  await limitRequest(req,'public-share',60,15);
  const raw=(await params).token;if(!/^[A-Za-z0-9_-]{40,64}$/.test(raw))throw new HttpError(404,'CV not found');
  const db=getDb();const [record]=await db.select({cv:cvs,owner:profiles,email:userTable.email,hidePhone:shareLinks.hidePhone,hideEmail:shareLinks.hideEmail}).from(shareLinks)
    .innerJoin(cvs,eq(shareLinks.cvId,cvs.id)).innerJoin(userTable,eq(cvs.userId,userTable.id)).innerJoin(profiles,eq(profiles.userId,userTable.id))
    .where(and(eq(shareLinks.tokenHash,hashToken(raw)),isNull(shareLinks.revokedAt),or(isNull(shareLinks.expiresAt),gt(shareLinks.expiresAt,new Date())),isNull(userTable.suspendedAt))).limit(1);
  if(!record)throw new HttpError(404,'CV not found');
  return privateResponse({cv:{title:record.cv.title,template:record.cv.template,content:record.cv.content},owner:{name:record.owner.name,headline:record.owner.headline,location:record.owner.location,phone:record.hidePhone?null:record.owner.phone,email:record.hideEmail?null:record.email}});
}catch(e){return respondError(e);}}
