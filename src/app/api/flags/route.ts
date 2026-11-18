import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getDb } from '@/db';
import { cvs,flags } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { limitRequest } from '@/lib/limits';
import { checkOrigin,jsonBody,privateResponse,respondError,HttpError } from '@/lib/security';
export async function POST(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);await limitRequest(req,'flags',10,60,u.id);
  const data=z.object({cvId:z.uuid(),reason:z.string().trim().min(10).max(500)}).parse(await jsonBody(req));
  const [cv]=await getDb().select({id:cvs.id}).from(cvs).where(eq(cvs.id,data.cvId));if(!cv)throw new HttpError(404,'Not found');
  const [record]=await getDb().insert(flags).values({cvId:data.cvId,reason:data.reason,reporterId:u.id}).returning({id:flags.id});await audit(u.id,'cv_flagged',data.cvId);return privateResponse({id:record.id},201);
}catch(e){return respondError(e);}}
