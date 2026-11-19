import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { currentUser } from '@/lib/auth';
import Brand from './Brand';
import MainNavigation from './MainNavigation';

export default async function Shell({children}:{children:React.ReactNode}){
  const user=await currentUser();
  return <>
    <header className="no-print sticky top-0 z-40 border-b border-[#dfe3dc] bg-[#fafbf7]/95 backdrop-blur-lg">
      <div className="relative mx-auto flex min-h-[76px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10"><Brand/><MainNavigation role={user?.role||null}/></div>
    </header>
    <main id="main-content" className="mx-auto min-h-[76vh] max-w-[1320px] px-5 py-8 sm:px-8 md:py-12 lg:px-10">{children}</main>
    <footer className="no-print mt-16 border-t border-[#dfe3dc] bg-[#eff1e9]"><div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 lg:px-10"><div className="flex flex-wrap items-start justify-between gap-7"><div><Brand compact/><p className="mt-3 max-w-xs text-sm leading-6 text-[#67766e]">A considered place to build, manage and share your career documents.</p></div><nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-medium text-ink"><Link href="/security" className="hover:text-ocean">Security</Link><Link href="/review" className="hover:text-ocean">Project review</Link><Link href="/cvs" className="inline-flex items-center gap-1 hover:text-ocean">CV builder <ArrowUpRight size={15}/></Link></nav></div><div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-[#d8ded4] pt-5 text-xs text-[#6f7b73]"><span>© {new Date().getFullYear()} CVVault</span><span>Private by default. Shared by choice.</span></div></div></footer>
  </>;
}