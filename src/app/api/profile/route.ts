import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { profiles } from '@/db/schema';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError } from '@/lib/security';
import { profileSchema } from '@/lib/validators';
export async function GET(req:NextRequest){try{const u=await requireUser(req);const [profile]=await getDb().select().from(profiles).where(eq(profiles.userId,u.id));return privateResponse({profile});}catch(e){return respondError(e);}}
export async function PUT(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);const data=profileSchema.parse(await jsonBody(req));
const [profile]=await getDb().update(profiles).set({...data,updatedAt:new Date()}).where(eq(profiles.userId,u.id)).returning();
await audit(u.id,'profile_updated');return privateResponse({profile});}catch(e){return respondError(e);}}
