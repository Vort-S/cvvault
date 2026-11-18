import Link from 'next/link';
import { BriefcaseBusiness, LayoutDashboard, Files, UserRound, ShieldCheck, ClipboardList, Search, UploadCloud, LockKeyhole } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import Logout from './Logout';
export default async function Shell({children}:{children:React.ReactNode}){
  const u=await currentUser();
  return <><header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4">
    <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-ink"><span className="rounded-xl bg-ocean p-2 text-white"><BriefcaseBusiness size={20}/></span>CV<span className="text-ocean">Vault</span></Link>
    <nav aria-label="Main navigation" className="flex flex-wrap items-center justify-end gap-2 text-sm md:gap-4">
      {u?<><Link href="/dashboard" className="hover:text-ocean"><LayoutDashboard className="mr-1 inline" size={15}/> Dashboard</Link><Link href="/cvs" className="hover:text-ocean"><Files className="mr-1 inline" size={15}/> My CVs</Link><Link href="/profile" className="hover:text-ocean"><UserRound className="mr-1 inline" size={15}/> Profile</Link>
      <Link href="/uploads" className="hidden hover:text-ocean md:inline"><UploadCloud className="mr-1 inline" size={15}/> Files</Link>
      {(u.role==='admin'||u.role==='recruiter')&&<Link href="/search" className="hover:text-ocean"><Search className="mr-1 inline" size={15}/> Search</Link>}
      {u.role==='admin'&&<Link href="/admin" className="hover:text-ocean"><ClipboardList className="mr-1 inline" size={15}/> Admin</Link>}
      <Logout/>
      </>:<><Link href="/security" className="hidden hover:text-ocean sm:inline"><ShieldCheck className="mr-1 inline" size={16}/> Security</Link><Link href="/login" className="hover:text-ocean">Log in</Link><Link href="/register" className="btn !py-2">Get started</Link></>}
    </nav>
  </div></header>
  <main id="main-content" className="mx-auto min-h-[76vh] max-w-7xl px-5 py-8 md:py-12">{children}</main>
  <footer className="no-print mt-12 border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-6 text-sm text-slate-500"><p>© {new Date().getFullYear()} CVVault · Your career, your data.</p><div className="flex gap-5"><Link href="/security" className="hover:text-ocean"><LockKeyhole size={15} className="mr-1 inline"/> Security</Link><Link href="/review" className="hover:text-ocean">Project review</Link></div></div></footer>
  </>;
}
