import { NextRequest } from 'next/server';
import { eq,and } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db';
import { shareLinks,cvs } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,HttpError } from '@/lib/security';
export async function POST(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);const {id}=z.object({id:z.uuid()}).parse(await jsonBody(req));const db=getDb();
const [record]=await db.select({id:shareLinks.id}).from(shareLinks).innerJoin(cvs,eq(shareLinks.cvId,cvs.id)).where(and(eq(shareLinks.id,id),eq(cvs.userId,u.id))).limit(1);
if(!record)throw new HttpError(404,'Not found');await db.update(shareLinks).set({revokedAt:new Date()}).where(eq(shareLinks.id,id));await audit(u.id,'share_revoked',id);return privateResponse({ok:true});
}catch(e){return respondError(e);}}
