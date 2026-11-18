'use client';
import { useRouter } from 'next/navigation';
export default function Logout(){const router=useRouter();return <button type="button" onClick={async()=>{await fetch('/api/auth/logout',{method:'POST',headers:{Origin:window.location.origin}});router.push('/login');router.refresh();}} className="text-slate-500 hover:text-red-700">Log out</button>;}
