import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and,eq,desc,count } from 'drizzle-orm';
import { FileText,PlusCircle,Activity,CheckCircle2,ArrowUpRight } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import { getDb } from '@/db';
import { profiles,cvs,audits } from '@/db/schema';
export const dynamic='force-dynamic';
export default async function Dashboard(){const u=await currentUser();if(!u)redirect('/login');const db=getDb();
  const [[p],[cvCount],recent,latest]=await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId,u.id)),
    db.select({total:count()}).from(cvs).where(eq(cvs.userId,u.id)),
    db.select({action:audits.action,createdAt:audits.createdAt}).from(audits).where(eq(audits.actorId,u.id)).orderBy(desc(audits.createdAt)).limit(5),
    db.select().from(cvs).where(eq(cvs.userId,u.id)).orderBy(desc(cvs.updatedAt)).limit(1)
  ]);
  const cv=latest[0];const content=cv?.content;const n=content?Object.values(content).filter(v=>typeof v==='string'?v.trim().length>0:v.length>0).length:0;
  const completeness=Math.round(((p?.name?1:0)+(p?.headline?1:0)+(p?.location?1:0)+(p?.phone?1:0)+n)/12*100);
  return <div><div className="mb-9 flex flex-wrap items-end justify-between gap-4"><div><p className="chip">Your workspace</p><h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Welcome back, {p?.name?.split(' ')[0]||'there'}.</h1><p className="mt-2 text-slate-500">Keep your CVs fresh and your opportunities close.</p></div><Link href="/cvs" className="btn"><PlusCircle size={18}/> Create or edit a CV</Link></div>
  <div className="grid gap-5 md:grid-cols-3"><div className="panel"><FileText className="text-ocean"/><p className="mt-5 text-3xl font-extrabold">{cvCount.total}</p><p className="muted">CVs in your library</p></div><div className="panel"><CheckCircle2 className="text-mint"/><p className="mt-5 text-3xl font-extrabold">{completeness}%</p><p className="muted">Profile and latest CV completeness</p><div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-mint" style={{width:`${completeness}%`}}/></div></div><div className="panel"><Activity className="text-ocean"/><p className="mt-5 text-3xl font-extrabold">{recent.length}</p><p className="muted">Latest audit events shown</p></div></div>
  <div className="mt-7 grid gap-6 lg:grid-cols-2"><section className="panel"><div className="flex justify-between"><h2 className="text-xl font-bold">Quick actions</h2><ArrowUpRight className="text-ocean"/></div><div className="mt-5 grid gap-3"><Link className="btn-secondary !justify-start" href="/cvs">Manage your CVs</Link><Link className="btn-secondary !justify-start" href="/profile">Update profile and privacy</Link><Link className="btn-secondary !justify-start" href="/uploads">Upload an existing resume</Link></div></section><section className="panel"><h2 className="text-xl font-bold">Recent activity</h2><ul className="mt-5 space-y-4">{recent.map((a,i)=><li className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 text-sm" key={i}><span>{a.action.replaceAll('_',' ')}</span><time className="text-xs text-slate-500">{a.createdAt.toLocaleDateString()}</time></li>)}{recent.length===0&&<li className="muted">Activity will appear here after you use the app.</li>}</ul></section></div>
 </div>;
}
