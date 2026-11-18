import Link from 'next/link';
export default function NotFound(){return <div className="mx-auto max-w-xl py-24 text-center"><p className="text-7xl font-black text-ocean">404</p><h1 className="mt-4 text-2xl font-bold">Page not found</h1><p className="muted mt-3">The resource may have moved, expired or be private.</p><Link className="btn mt-6" href="/">Go home</Link></div>}
