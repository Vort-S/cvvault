import { redirect } from 'next/navigation';
import { eq,and } from 'drizzle-orm';
import { getDb } from '@/db';
import { cvs,profiles } from '@/db/schema';
import { currentUser } from '@/lib/auth';
import CVPreview from '@/components/CVPreview';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{id:string}>}){const u=await currentUser();if(!u)redirect('/login');const id=(await params).id;const db=getDb();
  const [cv]=await db.select().from(cvs).where(and(eq(cvs.id,id),eq(cvs.userId,u.id)));if(!cv)return <p className="panel">CV not found.</p>;
  const [p]=await db.select().from(profiles).where(eq(profiles.userId,u.id));return <div className="mx-auto max-w-3xl"><p className="no-print mb-5 rounded-xl bg-blue-50 p-3 text-sm text-ocean">Use your browser’s Print command (Ctrl/Cmd + P).</p><CVPreview title={cv.title} template={cv.template} content={cv.content} owner={{...p,email:u.email}}/></div>;
}
