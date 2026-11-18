import 'server-only';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { userTable, sessions, audits, cvs, type CVContent } from '@/db/schema';
import { hashToken, token, sessionCookie, HttpError, assertUuid } from './security';
export type CurrentUser={id:string;email:string;role:'user'|'admin'|'recruiter'};
export async function currentUser(raw?:string):Promise<CurrentUser|null>{
  const c=raw??(await cookies()).get(sessionCookie())?.value;
  if(!c||c.length>128)return null;
  const db=getDb();
  const [rec]=await db.select({id:userTable.id,email:userTable.email,role:userTable.role}).from(sessions)
    .innerJoin(userTable,eq(sessions.userId,userTable.id)).where(and(eq(sessions.tokenHash,hashToken(c)),gt(sessions.expiresAt,new Date()),isNull(sessions.revokedAt),isNull(userTable.suspendedAt))).limit(1);
  return rec??null;
}
export async function requireUser(req?:NextRequest){
  const user=await currentUser(req?.cookies.get(sessionCookie())?.value);
  if(!user)throw new HttpError(401,'Sign in required');return user;
}
export async function requireAdmin(req?:NextRequest){const u=await requireUser(req);if(u.role!=='admin')throw new HttpError(403,'Forbidden');return u;}
export async function ownedCV(req:NextRequest,id:string){
  const u=await requireUser(req);assertUuid(id);
  const db=getDb();const [cv]=await db.select().from(cvs).where(and(eq(cvs.id,id),eq(cvs.userId,u.id))).limit(1);
  if(!cv)throw new HttpError(404,'CV not found');return {u,cv,db};
}
export async function createSession(res:NextResponse,userId:string,previous?:string){
  const db=getDb();
  if(previous)await db.update(sessions).set({revokedAt:new Date()}).where(eq(sessions.tokenHash,hashToken(previous)));
  const raw=token();const expires=new Date(Date.now()+7*86400000);
  await db.insert(sessions).values({userId,tokenHash:hashToken(raw),expiresAt:expires});
  res.cookies.set(sessionCookie(),raw,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',expires});
}
export async function logout(res:NextResponse,raw?:string){
  if(raw)await getDb().update(sessions).set({revokedAt:new Date()}).where(eq(sessions.tokenHash,hashToken(raw)));
  res.cookies.set(sessionCookie(),'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
}
export async function audit(actorId:string|null,action:string,targetId?:string){
  // Never persist CV content, tokens, plaintext emails or passwords in an audit record.
  try {await getDb().insert(audits).values({actorId,action,targetId});}
  catch {console.error(JSON.stringify({event:'audit_failed',action}));throw new HttpError(503,'Audit unavailable');}
}
export async function sanitizeCVContent(content:CVContent){
  // All rich content is treated as plain text; React encodes output and PDF renders text only.
  const clean=(s?:string)=>s?.replace(/[\u0000-\u001f]/g,' ').trim();
  return Object.fromEntries(Object.entries(content).map(([k,v])=>[k,typeof v==='string'?clean(v):v.map(x=>Object.fromEntries(Object.entries(x).map(([a,b])=>[a,typeof b==='string'?clean(b):b])))])) as CVContent;
}
