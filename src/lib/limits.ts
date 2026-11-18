import { sql, eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { getDb } from '@/db';
import { rateLimits } from '@/db/schema';
import { HttpError, opaqueKey } from './security';
export function clientIp(req:NextRequest){return req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()||req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';}
export async function limitRequest(req:NextRequest,purpose:string,maxHits:number,minutes:number,identifier=''){
  const key=opaqueKey(`${purpose}:${clientIp(req)}:${identifier.toLowerCase()}`);
  const db=getDb();const windowEnd=new Date(Date.now()+minutes*60_000);
  await db.insert(rateLimits).values({key,hits:1,windowEnd}).onConflictDoUpdate({
    target:rateLimits.key,
    set:{hits:sql`CASE WHEN ${rateLimits.windowEnd} <= now() THEN 1 ELSE ${rateLimits.hits}+1 END`,windowEnd:sql`CASE WHEN ${rateLimits.windowEnd} <= now() THEN ${windowEnd} ELSE ${rateLimits.windowEnd} END`}
  });
  const [record]=await db.select().from(rateLimits).where(eq(rateLimits.key,key));
  if(record&&record.hits>maxHits)throw new HttpError(429,'Too many requests; try again later');
}
