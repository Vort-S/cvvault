import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { userTable, profiles, sessions, resetTokens } from '@/db/schema';
import { registerSchema,loginSchema,email,password } from '@/lib/validators';
import { checkOrigin,jsonBody,respondError,privateResponse,token,hashToken,sessionCookie,HttpError } from '@/lib/security';
import { createSession,logout,audit,requireUser } from '@/lib/auth';
import { limitRequest } from '@/lib/limits';
import { z } from 'zod';
export const runtime='nodejs';
export async function GET(req:NextRequest,{params}:{params:Promise<{action:string}>}){
  if((await params).action!=='me')return privateResponse({error:'Not found'},404);
  try{const user=await requireUser(req);return privateResponse({user});}
  catch{return privateResponse({user:null});}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{action:string}>}){
  try{
    checkOrigin(req);const {action}=await params;const db=getDb();
    if(action==='logout'){
      const u=await requireUser(req);const response=privateResponse({ok:true});
      await logout(response,req.cookies.get(sessionCookie())?.value);await audit(u.id,'logout');return response;
    }
    if(action==='register'){
      await limitRequest(req,'register',5,60);
      const data=registerSchema.parse(await jsonBody(req));
      const exists=await db.select({id:userTable.id}).from(userTable).where(eq(userTable.email,data.email)).limit(1);
      if(exists.length)throw new HttpError(409,'Unable to create account with these details');
      const digest=await bcrypt.hash(data.password,12);
      const [user]=await db.insert(userTable).values({email:data.email,passwordHash:digest}).returning({id:userTable.id});
      await db.insert(profiles).values({userId:user.id,name:data.name});
      await audit(user.id,'register');const response=privateResponse({ok:true},201);
      await createSession(response,user.id);return response;
    }
    if(action==='login'){
      const data=loginSchema.parse(await jsonBody(req));
      await limitRequest(req,'login',10,15,data.email);
      const [user]=await db.select().from(userTable).where(eq(userTable.email,data.email)).limit(1);
      const valid=await bcrypt.compare(data.password,user?.passwordHash??'$2a$12$8C6pKkChvZ.QUXxV/ZrO2.tShl3QDhxX/UuDMMkbg82DXPsqAs.8O');
      if(!user||!valid||user.suspendedAt||user.lockedUntil&&user.lockedUntil>new Date()){
        if(user){const attempts=user.failedLogins+1;await db.update(userTable).set({failedLogins:attempts,lockedUntil:attempts>=5?new Date(Date.now()+Math.min(60,2**Math.min(attempts-4,6))*60000):null}).where(eq(userTable.id,user.id));await audit(user.id,'login_failed');}
        throw new HttpError(401,'Invalid email or password');
      }
      await db.update(userTable).set({failedLogins:0,lockedUntil:null}).where(eq(userTable.id,user.id));
      const response=privateResponse({ok:true,role:user.role});await createSession(response,user.id,req.cookies.get(sessionCookie())?.value);
      await audit(user.id,'login_success');return response;
    }
    if(action==='request-reset'){
      await limitRequest(req,'password-reset',3,60);
      const data=z.object({email}).parse(await jsonBody(req));
      const [user]=await db.select({id:userTable.id}).from(userTable).where(eq(userTable.email,data.email)).limit(1);
      if(user){const raw=token();await db.insert(resetTokens).values({userId:user.id,tokenHash:hashToken(raw),expiresAt:new Date(Date.now()+15*60000)});
        // Intentionally do not expose the token without configured, verified email delivery.
        // Implement an email provider before offering password recovery in production.
        await audit(user.id,'password_reset_requested');}
      return privateResponse({message:'If an account exists, recovery instructions will be sent.'});
    }
    if(action==='reset-password'){
      await limitRequest(req,'reset-confirm',5,30);
      const data=z.object({token:z.string().min(32).max(128),password}).parse(await jsonBody(req));
      const [rec]=await db.select().from(resetTokens).where(and(eq(resetTokens.tokenHash,hashToken(data.token)),gt(resetTokens.expiresAt,new Date()),isNull(resetTokens.consumedAt))).limit(1);
      if(!rec)throw new HttpError(400,'Invalid or expired reset link');
      // Atomic consume guards against concurrent replay.
      const [consumed]=await db.update(resetTokens).set({consumedAt:new Date()}).where(and(eq(resetTokens.id,rec.id),isNull(resetTokens.consumedAt))).returning({id:resetTokens.id});
      if(!consumed)throw new HttpError(400,'Invalid or expired reset link');
      await db.update(userTable).set({passwordHash:await bcrypt.hash(data.password,12),failedLogins:0,lockedUntil:null}).where(eq(userTable.id,rec.userId));
      await db.update(sessions).set({revokedAt:new Date()}).where(eq(sessions.userId,rec.userId));
      await audit(rec.userId,'password_reset');return privateResponse({ok:true});
    }
    throw new HttpError(404,'Not found');
  }catch(e){return respondError(e);}
}
