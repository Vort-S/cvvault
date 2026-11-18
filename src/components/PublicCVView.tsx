'use client';
import { useEffect,useState } from 'react';
import CVPreview from './CVPreview';
import type { CVContent } from '@/db/schema';
type Data={cv:{title:string;template:string;content:CVContent};owner:{name:string;headline:string;location:string}};
export default function PublicCVView({id}:{id:string}){const [data,setData]=useState<Data|null>(null),[error,setError]=useState('');useEffect(()=>{void fetch(`/api/search/${id}`,{cache:'no-store'}).then(async r=>{const d=await r.json();if(r.ok)setData(d);else setError(d.error);}).catch(()=>setError('Unavailable'));},[id]);
 if(error)return <div className="panel">{error}</div>;if(!data)return <div role="status">Loading public CV…</div>;
 return <div className="mx-auto max-w-3xl"><p className="no-print mb-4 muted">Publicly discoverable CV · Contacts excluded</p><CVPreview title={data.cv.title} template={data.cv.template} content={data.cv.content} owner={data.owner}/></div>;
}
