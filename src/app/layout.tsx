import type { Metadata } from 'next';
import './globals.css';
import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'CVVault — Secure CV Management',template:'%s | CVVault'},description:'Create, manage and securely share professional CVs.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a><Shell>{children}</Shell></body></html>;}
