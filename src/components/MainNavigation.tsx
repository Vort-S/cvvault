'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useState} from 'react';
import {Menu, X, LayoutGrid, FileText, UserRound, FolderOpen, ShieldCheck, Search, Settings2} from 'lucide-react';
import Logout from './Logout';

type Role='user'|'admin'|'recruiter';
const paths=[{href:'/dashboard',label:'Overview',Icon:LayoutGrid},{href:'/cvs',label:'My CVs',Icon:FileText},{href:'/profile',label:'Profile',Icon:UserRound},{href:'/uploads',label:'Documents',Icon:FolderOpen}];
export default function MainNavigation({role}:{role:Role|null}){
  const pathname=usePathname();const [open,setOpen]=useState(false);
  const items=role?[...paths,...((role==='admin'||role==='recruiter')?[{href:'/search',label:'Discover',Icon:Search}]:[]),...(role==='admin'?[{href:'/admin',label:'Admin',Icon:Settings2}]:[])]:[{href:'/security',label:'Security',Icon:ShieldCheck}];
  const links=<>{items.map(item=>{const active=pathname===item.href||pathname.startsWith(item.href+'/');return <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} aria-current={active?'page':undefined} className={`nav-link ${active?'nav-link-active':''}`}><item.Icon size={16} strokeWidth={1.8}/>{item.label}</Link>;})}</>;
  return <div className="flex items-center gap-2">
    <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">{links}</nav>
    <div className="hidden items-center gap-3 border-l border-[#dfe3dc] pl-4 lg:flex">{role?<Logout/>:<><Link href="/login" className="nav-link">Sign in</Link><Link href="/register" className="btn !min-h-9 !px-4 !py-2">Create a CV</Link></>}</div>
    <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#dbe0d8] bg-white text-ink lg:hidden" aria-label={open?'Close navigation':'Open navigation'} aria-controls="mobile-menu" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={20}/>:<Menu size={20}/>}</button>
    {open&&<div id="mobile-menu" className="absolute left-0 right-0 top-full z-50 border-b border-[#dfe3dc] bg-[#fbfcf9] p-4 shadow-xl lg:hidden"><nav aria-label="Mobile navigation" className="flex flex-col gap-1">{links}<div className="mt-2 border-t border-[#dfe3dc] pt-3">{role?<Logout/>:<div className="flex gap-2"><Link href="/login" onClick={()=>setOpen(false)} className="btn-secondary">Sign in</Link><Link href="/register" onClick={()=>setOpen(false)} className="btn">Create a CV</Link></div>}</div></nav></div>}
  </div>;
}