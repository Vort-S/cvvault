'use client';
import { useEffect,useState } from 'react';
import CVPreview from './CVPreview';
import type { CVContent } from '@/db/schema';
type Shared={cv:{title:string;template:string;content:CVContent};owner:{name:string;headline:string;location:string;phone?:string|null;email?:string|null}};
export default function ShareView({token}:{token:string}){const [data,setData]=useState<Shared|null>(null),[error,setError]=useState('');useEffect(()=>{void fetch(`/api/share/${token}`,{cache:'no-store'}).then(async r=>{const d=await r.json();if(r.ok)setData(d);else setError(d.error||'Not available');}).catch(()=>setError('Unable to load this CV'));},[token]);if(error)return <div className="mx-auto max-w-xl panel text-center"><h1 className="text-2xl font-bold">Link unavailable</h1><p className="muted mt-3">{error}. It may have expired or been revoked.</p></div>;if(!data)return <p role="status">Loading the shared CV…</p>;return <div className="mx-auto max-w-3xl"><p className="no-print mb-4 text-sm text-slate-500">Shared CV · Read-only</p><CVPreview {...data.cv} owner={data.owner}/></div>;}
