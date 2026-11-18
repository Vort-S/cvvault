import { createHash, createHmac, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
export const hashToken=(raw:string)=>createHash('sha256').update(raw).digest('hex');
export const token=()=>randomBytes(32).toString('base64url');
export const sessionCookie=()=>process.env.NODE_ENV==='production'?'__Host-cvvault-session':'cvvault-session';
export function sessionKey(){const key=process.env.SESSION_SECRET;if(!key||key.length<32)throw new Error('SESSION_SECRET too short');return key;}
export function opaqueKey(value:string){return createHmac('sha256',sessionKey()).update(value).digest('hex');}
export class HttpError extends Error { constructor(public status:number,message:string){super(message);} }
export function checkOrigin(req:NextRequest){
  // Reject cross-site *and origin-less* browser mutations; cookie SameSite is defense-in-depth.
  const origin=req.headers.get('origin');
  const host=new URL(req.url).origin;
  const allowed=process.env.NEXT_PUBLIC_APP_URL?new URL(process.env.NEXT_PUBLIC_APP_URL).origin:host;
  if(!origin || (origin!==allowed && !(process.env.NODE_ENV!=='production'&&origin===host))) throw new HttpError(403,'Invalid request origin');
}
export async function jsonBody(req:NextRequest){
  const text=await req.text();if(text.length>180_000)throw new HttpError(413,'Request too large');
  try{return JSON.parse(text) as unknown;}catch{throw new HttpError(400,'Invalid JSON');}
}
export function respondError(err:unknown){
  if(err instanceof ZodError)return NextResponse.json({error:'Invalid form data',issues:err.issues.map(i=>({path:i.path.join('.'),message:i.message}))},{status:400});
  if(err instanceof HttpError)return NextResponse.json({error:err.message},{status:err.status});
  // Do not log request bodies, credentials, tokens or PII.
  console.error(JSON.stringify({event:'request_failure',kind:err instanceof Error?err.name:'unknown'}));
  return NextResponse.json({error:'A server error occurred'},{status:500});
}
export function privateResponse(data:unknown,status=200){const res=NextResponse.json(data,{status});res.headers.set('Cache-Control','private, no-store');return res;}
export function assertUuid(value:string){if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))throw new HttpError(404,'Not found');return value;}
export function sanitizeText(s:string){return s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'').trim();}
