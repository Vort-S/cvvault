import type { Metadata } from 'next';
import './globals.css';
import Shell from '@/components/Shell';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:{default:'CVVault — Your work, clearly presented',template:'%s | CVVault'},description:'Create a clear CV, keep tailored versions, and share your work with control over your personal details.',robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:p-4 focus:text-ink">Skip to content</a><Shell>{children}</Shell></body></html>;}