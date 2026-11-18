import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { del } from '@vercel/blob';
import { userTable,sessions,uploads,profiles } from '@/db/schema';
import { requireAdmin,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,HttpError,assertUuid } from '@/lib/security';
import { adminUserSchema } from '@/lib/validators';
const param=async(p:Promise<{id:string}>)=>assertUuid((await p).id);
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{checkOrigin(req);const admin=await requireAdmin(req);const id=await param(params);if(id===admin.id)throw new HttpError(403,'Cannot modify your own admin account');
const data=adminUserSchema.parse(await jsonBody(req));const [target]=await getDb().update(userTable).set({...(data.role?{role:data.role}:{}),...(data.suspended!==undefined?{suspendedAt:data.suspended?new Date():null}:{})}).where(eq(userTable.id,id)).returning({id:userTable.id});
if(!target)throw new HttpError(404,'Not found');await getDb().update(sessions).set({revokedAt:new Date()}).where(eq(sessions.userId,id));await audit(admin.id,'user_role_or_status_changed',id);return privateResponse({ok:true});
}catch(e){return respondError(e);}}
export async function DELETE(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{checkOrigin(req);const admin=await requireAdmin(req);const id=await param(params);if(id===admin.id)throw new HttpError(403,'Cannot delete your own admin account');
// Accounts with private uploads should be deleted via coordinated retention/Blob cleanup rather than orphaning objects.
const db=getDb();const files=await db.select({pathname:uploads.pathname}).from(uploads).where(eq(uploads.userId,id));const [profile]=await db.select({photoPath:profiles.photoPath}).from(profiles).where(eq(profiles.userId,id));for(const file of files)await del(file.pathname);if(profile?.photoPath)await del(profile.photoPath);
const [removed]=await db.delete(userTable).where(eq(userTable.id,id)).returning({id:userTable.id});if(!removed)throw new HttpError(404,'Not found');await audit(admin.id,'user_deleted',id);return privateResponse({ok:true});
}catch(e){return respondError(e);}}
