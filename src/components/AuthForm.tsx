'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye,EyeOff,LockKeyhole } from 'lucide-react';
export default function AuthForm({mode}:{mode:'login'|'register'}){
  const router=useRouter();const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');const [visible,setVisible]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e:FormEvent){e.preventDefault();setError('');setBusy(true);try{
    const r=await fetch(`/api/auth/${mode}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});const d=await r.json();if(!r.ok)throw new Error(d.issues?.map((x:{message:string})=>x.message).join(', ')||d.error||'Request failed');
    router.push('/dashboard');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Please try again');}finally{setBusy(false);}}
  return <div className="mx-auto max-w-md py-8"><div className="panel !p-8"><div className="mb-5 inline-flex rounded-xl bg-blue-50 p-3 text-ocean"><LockKeyhole/></div><h1 className="text-3xl font-extrabold">{mode==='login'?'Welcome back':'Create your account'}</h1><p className="mt-2 text-slate-500">{mode==='login'?'Sign in to manage your CVs securely.':'Build your professional future with control and privacy.'}</p>
    <form onSubmit={submit} className="mt-7 space-y-5">{mode==='register'&&<label className="block"><span className="form-label">Full name</span><input autoComplete="name" required minLength={2} maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>}
      <label className="block"><span className="form-label">Email address</span><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label>
      <label className="block"><span className="form-label">Password</span><span className="relative block"><input type={visible?'text':'password'} required minLength={mode==='register'?12:1} maxLength={128} autoComplete={mode==='register'?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'Hide password':'Show password'} className="absolute right-4 top-3.5 text-slate-500">{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></span>{mode==='register'&&<span className="mt-2 block text-xs text-slate-500">12+ characters, with uppercase, lowercase, a number and a symbol.</span>}</label>
      {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="btn w-full">{busy?'Working…':mode==='login'?'Log in':'Create account'}</button>
    </form><p className="mt-6 text-center text-sm text-slate-500">{mode==='login'?<>New here? <Link href="/register" className="font-semibold text-ocean">Create account</Link></>:<>Already have an account? <Link href="/login" className="font-semibold text-ocean">Log in</Link></>}</p>
    {mode==='login'&&<Link href="/forgot-password" className="mt-3 block text-center text-sm text-ocean">Forgot password?</Link>}
  </div></div>;
}
