import { NextRequest } from 'next/server';
import { eq,desc } from 'drizzle-orm';
import { shareLinks } from '@/db/schema';
import { ownedCV,audit } from '@/lib/auth';
import { checkOrigin,jsonBody,privateResponse,respondError,token,hashToken } from '@/lib/security';
import { shareSchema } from '@/lib/validators';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{const {cv,db}=await ownedCV(req,(await params).id);const links=await db.select({id:shareLinks.id,expiresAt:shareLinks.expiresAt,revokedAt:shareLinks.revokedAt,createdAt:shareLinks.createdAt}).from(shareLinks).where(eq(shareLinks.cvId,cv.id)).orderBy(desc(shareLinks.createdAt));return privateResponse({links});}catch(e){return respondError(e);}}
export async function POST(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{checkOrigin(req);const {u,cv,db}=await ownedCV(req,(await params).id);const data=shareSchema.parse(await jsonBody(req));
const expiresAt=data.expiresAt?new Date(data.expiresAt):null;if(expiresAt&&expiresAt<=new Date())return privateResponse({error:'Expiry must be in the future'},400);
const raw=token();const [record]=await db.insert(shareLinks).values({cvId:cv.id,tokenHash:hashToken(raw),expiresAt,hideEmail:data.hideEmail,hidePhone:data.hidePhone}).returning({id:shareLinks.id});
await audit(u.id,'share_created',record.id);
const origin=process.env.NEXT_PUBLIC_APP_URL||new URL(req.url).origin;
return privateResponse({link:`${origin}/share/${raw}`,id:record.id},201);
}catch(e){return respondError(e);}}
