import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { userTable,uploads,profiles } from '@/db/schema';
import { del } from '@vercel/blob';
import { requireUser,audit } from '@/lib/auth';
import { checkOrigin,privateResponse,respondError } from '@/lib/security';
export async function DELETE(req:NextRequest){try{checkOrigin(req);const u=await requireUser(req);const db=getDb();
const files=await db.select({path:uploads.pathname}).from(uploads).where(eq(uploads.userId,u.id));
// Delete private files first. If deletion fails, don't falsely claim full erasure.
for(const file of files)await del(file.path);
const [profile]=await db.select({photoPath:profiles.photoPath}).from(profiles).where(eq(profiles.userId,u.id));if(profile?.photoPath)await del(profile.photoPath);
await audit(u.id,'account_deleted',u.id);
await db.delete(userTable).where(eq(userTable.id,u.id));
return privateResponse({ok:true});}catch(e){return respondError(e);}}
