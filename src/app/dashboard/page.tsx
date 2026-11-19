import Link from 'next/link';
import {redirect} from 'next/navigation';
import {eq,desc,count} from 'drizzle-orm';
import {ArrowRight,ArrowUpRight,FilePlus2,FileText,UserRound,UploadCloud,Clock3,CheckCircle2} from 'lucide-react';
import {currentUser} from '@/lib/auth';
import {getDb} from '@/db';
import {profiles,cvs,audits} from '@/db/schema';
export const dynamic='force-dynamic';
export default async function Dashboard(){
  const user=await currentUser();if(!user)redirect('/login');const db=getDb();
  const [profileRows,counts,recent,documents]=await Promise.all([
    db.select().from(profiles).where(eq(profiles.userId,user.id)).limit(1),
    db.select({total:count()}).from(cvs).where(eq(cvs.userId,user.id)),
    db.select({action:audits.action,createdAt:audits.createdAt}).from(audits).where(eq(audits.actorId,user.id)).orderBy(desc(audits.createdAt)).limit(4),
    db.select().from(cvs).where(eq(cvs.userId,user.id)).orderBy(desc(cvs.updatedAt)).limit(4),
  ]);
  const p=profileRows[0];const latest=documents[0];const content=latest?.content;
  const filledSections=content?Object.values(content).filter(value=>typeof value==='string'?value.trim().length>0:Array.isArray(value)&&value.length>0).length:0;
  const stepsCompleted=[p?.name,p?.headline,p?.location,p?.phone].filter(Boolean).length+filledSections;
  const readiness=Math.min(100,Math.round(stepsCompleted/12*100));
  const nextAction=!p?.headline?{name:'Add a professional headline',href:'/profile',detail:'Tell people the kind of work you do.'}:!latest?{name:'Create your first CV',href:'/cvs',detail:'Start with your experience, education and skills.'}:readiness<65?{name:'Continue your latest CV',href:`/cvs/${latest.id}`,detail:'Complete a few more sections before sharing.'}:{name:'Review your latest CV',href:`/cvs/${latest.id}`,detail:'Keep it current and ready for your next application.'};
  return <div>
    <header className="page-head"><div><p className="eyebrow">Your workspace</p><h1 className="display-title mt-4 text-5xl sm:text-6xl">Good to see you{p?.name?`, ${p.name.split(' ')[0]}`:''}.</h1><p className="mt-4 text-base text-[#63766c]">Here is where things stand with your CVs.</p></div><Link href="/cvs" className="btn"><FilePlus2 size={18}/> New CV</Link></header>
    <section aria-label="Workspace overview" className="grid grid-cols-1 divide-y divide-[#dce2d8] rounded-xl border border-[#dce2d8] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      <div className="px-7 py-6"><p className="text-sm font-medium text-[#66776f]">CVs in your library</p><p className="mt-2 font-display text-5xl tracking-tight">{counts[0].total}</p><p className="mt-2 text-xs text-[#89958d]">Saved in your account</p></div>
      <div className="px-7 py-6"><p className="text-sm font-medium text-[#66776f]">Profile and CV progress</p><p className="mt-2 font-display text-5xl tracking-tight">{readiness}<span className="ml-1 text-2xl text-[#819287]">%</span></p><div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#e7ece5]" role="progressbar" aria-valuenow={readiness} aria-valuemin={0} aria-valuemax={100} aria-label="CV completion"><div className="h-full rounded-full bg-ocean" style={{width:`${readiness}%`}}/></div></div>
      <div className="px-7 py-6"><p className="text-sm font-medium text-[#66776f]">Latest document</p><p className="mt-4 truncate text-lg font-semibold">{latest?.title||'Not created yet'}</p><p className="mt-2 text-xs text-[#89958d]">{latest?`Updated ${latest.updatedAt.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`:'Ready whenever you are'}</p></div>
    </section>
    <div className="mt-8 grid gap-6 lg:grid-cols-[1.28fr_.72fr]">
      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl bg-pine p-7 text-white sm:p-9"><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[.19em] text-[#b3d4bf]">Your next step</p><CheckCircle2 className="text-[#b3d4bf]" size={21}/></div><h2 className="section-title mt-6 max-w-md text-3xl sm:text-4xl">{nextAction.name}</h2><p className="mt-3 max-w-sm text-sm leading-7 text-[#d2e3d7]">{nextAction.detail}</p><Link href={nextAction.href} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#f3f7ed] px-5 py-3 text-sm font-semibold text-pine hover:bg-white">Continue <ArrowRight size={17}/></Link></section>
        <section className="panel !p-0"><div className="flex items-center justify-between gap-4 border-b border-[#e2e6dd] px-7 py-5"><h2 className="text-lg font-semibold">Recently edited CVs</h2><Link href="/cvs" className="inline-flex items-center gap-1 text-sm font-semibold text-ocean">View library <ArrowUpRight size={16}/></Link></div>
        {documents.length?documents.map(d=><Link key={d.id} href={`/cvs/${d.id}`} className="flex items-center gap-4 border-b border-[#edf0e9] px-7 py-5 transition last:border-0 hover:bg-[#f8fbf7]"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e8f0e9] text-ocean"><FileText size={21}/></span><span className="min-w-0 flex-1"><strong className="block truncate text-sm font-semibold">{d.title}</strong><span className="mt-1 block text-xs text-[#7a897d]">{d.template} template · Revision {d.revision}</span></span><ArrowUpRight size={18} className="shrink-0 text-[#6d8475]"/></Link>):<div className="px-7 py-10"><p className="font-display text-2xl">Your library starts here.</p><p className="muted mt-2">Create a CV to see your recent documents in this space.</p><Link href="/cvs" className="btn-secondary mt-5">Create your first CV <ArrowRight size={16}/></Link></div>}
        </section>
      </div>
      <div className="space-y-6"><section className="panel"><h2 className="text-lg font-semibold">Shortcuts</h2><div className="mt-5 space-y-2">{[{href:'/profile',label:'Update your profile',Icon:UserRound},{href:'/uploads',label:'Store an existing resume',Icon:UploadCloud},{href:'/cvs',label:'Browse all CVs',Icon:FileText}].map(({href,label,Icon})=><Link key={href} href={href} className="flex items-center justify-between gap-3 rounded-lg border border-[#e6eae2] px-4 py-4 text-sm font-medium transition hover:border-[#bad0bd] hover:bg-[#f4f8f2]"><span className="flex items-center gap-3"><Icon size={18} className="text-ocean"/>{label}</span><ArrowUpRight size={16} className="text-[#88968c]"/></Link>)}</div></section><section className="panel"><h2 className="flex items-center gap-2 text-lg font-semibold"><Clock3 size={18} className="text-ocean"/> Recent activity</h2><ul className="mt-4 divide-y divide-[#e8ece5]">{recent.map((item,index)=><li key={index} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="capitalize text-[#475e53]">{item.action.replaceAll('_',' ')}</span><time className="shrink-0 text-xs text-[#89948a]">{item.createdAt.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</time></li>)}{!recent.length&&<li className="py-4 text-sm text-[#728277]">No recent activity yet.</li>}</ul></section></div>
    </div>
  </div>;
}