import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { flags } from '@/db/schema';
import { getDb } from '@/db';
import { requireAdmin,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,assertUuid } from '@/lib/security';
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{checkOrigin(req);const admin=await requireAdmin(req);const id=assertUuid((await params).id);const {status}=z.object({status:z.enum(['reviewed','dismissed','open'])}).parse(await jsonBody(req));await getDb().update(flags).set({status}).where(eq(flags.id,id));await audit(admin.id,'flag_moderated',id);return privateResponse({ok:true});}catch(e){return respondError(e);}}
