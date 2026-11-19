'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {Eye,EyeOff,ArrowRight,ShieldCheck} from 'lucide-react';

export default function AuthForm({mode}:{mode:'login'|'register'}){
  const router=useRouter();const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
  const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setError('');setBusy(true);try{
    const res=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
    const data=await res.json();if(!res.ok)throw new Error(data.issues?.map((item:{message:string})=>item.message).join(', ')||data.error||'We could not complete your request.');
    router.push('/dashboard');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  const register=mode==='register';
  return <div className="grid min-h-[680px] overflow-hidden rounded-xl border border-[#dce2d8] bg-white lg:grid-cols-[.89fr_1.11fr]">
    <aside className="relative hidden flex-col justify-between overflow-hidden bg-pine px-10 py-12 text-white lg:flex"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#b9d6c0]">CVVault workspace</p><h2 className="section-title mt-16 max-w-sm text-[3.3rem]">Your next chapter starts with a clearer story.</h2><p className="mt-5 max-w-xs text-sm leading-8 text-[#d4e3d8]">Write at your own pace, save different versions, and share what you choose.</p></div><div className="relative"><div className="absolute bottom-[-8rem] right-[-8rem] h-72 w-72 rounded-full border border-white/15"/><div className="absolute bottom-[-5rem] right-[-5rem] h-56 w-56 rounded-full border border-white/15"/><p className="relative flex items-center gap-2 text-sm text-[#d4e3d8]"><ShieldCheck size={18}/> Your CVs start private.</p></div></aside>
    <div className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-16"><div className="w-full max-w-[420px]"><p className="eyebrow">{register?'Create your workspace':'Welcome back'}</p><h1 className="display-title mt-5 text-5xl sm:text-[3.5rem]">{register?'Start your CV.':'Sign in.'}</h1><p className="mt-4 text-sm leading-7 text-[#64756b]">{register?'Create an account to save and manage your CVs.':'Access your documents and continue where you left off.'}</p>
    <form onSubmit={submit} className="mt-9 space-y-5">{register&&<label className="block"><span className="form-label">Full name</span><input required autoComplete="name" minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"/></label>}
    <label className="block"><span className="form-label">Email address</span><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label className="block"><span className="form-label">Password</span><span className="relative block"><input type={visible?'text':'password'} required minLength={register?12:1} maxLength={128} autoComplete={register?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)} className="!pr-14"/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'} className="absolute right-4 top-3.5 rounded text-[#66776c]"><span className="sr-only">Toggle password visibility</span>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></span>{register&&<span className="field-help">At least 12 characters, including uppercase, lowercase, a number and a symbol.</span>}</label>
    {error&&<div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" aria-live="assertive">{error}</div>}
    <button disabled={busy} className="btn mt-2 w-full !py-4">{busy?'Please wait…':register?'Create account':'Sign in'}<ArrowRight size={17}/></button></form>
    <p className="mt-7 text-center text-sm text-[#67796d]">{register?<>Already have an account? <Link href="/login" className="font-semibold text-ocean hover:underline">Sign in</Link></>:<>New to CVVault? <Link href="/register" className="font-semibold text-ocean hover:underline">Create an account</Link></>}</p>
    {!register&&<p className="mt-4 text-center"><Link href="/forgot-password" className="text-sm font-medium text-ocean hover:underline">Forgot your password?</Link></p>}
    </div></div>
  </div>;
}