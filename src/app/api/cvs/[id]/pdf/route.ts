import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { profiles } from '@/db/schema';
import { ownedCV } from '@/lib/auth';
import { makePDF } from '@/lib/pdf';
import { respondError } from '@/lib/security';
export const runtime='nodejs';
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){try{
  const {u,cv,db}=await ownedCV(req,(await params).id);
  const [p]=await db.select().from(profiles).where(eq(profiles.userId,u.id));
  const pdf=await makePDF({title:cv.title,template:cv.template,content:cv.content,name:p?.name||'',headline:p?.headline||'',location:p?.location||'',email:u.email,phone:p?.phone});
  return new Response(Buffer.from(pdf),{headers:{'Content-Type':'application/pdf','Content-Disposition':`attachment; filename="cv-${cv.id.slice(0,8)}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}catch(e){return respondError(e);}}
