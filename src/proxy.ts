import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'node:crypto';
import { currentUser } from '@/lib/auth';
const privatePaths = ['/dashboard','/profile','/cvs','/admin','/uploads','/search','/public'];
export async function proxy(request:NextRequest){
  const nonce=randomBytes(16).toString('base64');
  const headers=new Headers(request.headers);
  const csp=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,"style-src 'self' 'unsafe-inline'","img-src 'self' data: blob:","font-src 'self' data:","connect-src 'self'","object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'","upgrade-insecure-requests"].join('; ');
  headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',csp);
  const path=request.nextUrl.pathname;
  // Middleware is defense-in-depth UX gating only. Every private route re-checks DB sessions and role/ownership.
  if(privatePaths.some(p=>path===p||path.startsWith(p+'/')) && !request.cookies.has(process.env.NODE_ENV==='production'?'__Host-cvvault-session':'cvvault-session')){
    return NextResponse.redirect(new URL('/login',request.url));
  }
  // Proxy enforces a preliminary server-side role check; APIs repeat every check
  // against the current (non-revoked, non-suspended) DB session.
  if (path==='/admin'||path.startsWith('/admin/')||path==='/search'||path.startsWith('/search/')||path==='/public'||path.startsWith('/public/')) {
    const raw=request.cookies.get(process.env.NODE_ENV==='production'?'__Host-cvvault-session':'cvvault-session')?.value;
    const user=await currentUser(raw);
    if (!user)return NextResponse.redirect(new URL('/login',request.url));
    if ((path==='/admin'||path.startsWith('/admin/'))&&user.role!=='admin')return new NextResponse('Forbidden',{status:403});
    if ((path==='/search'||path.startsWith('/search/')||path==='/public'||path.startsWith('/public/'))&&user.role==='user')return new NextResponse('Forbidden',{status:403});
  }
  const response=NextResponse.next({request:{headers}});
  response.headers.set('Content-Security-Policy',csp);
  response.headers.set('X-Frame-Options','DENY');
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
