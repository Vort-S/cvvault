'use client';
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}){return <div className="mx-auto max-w-xl py-24 text-center"><h1 className="text-3xl font-bold">Something went wrong</h1><p className="muted mt-3">We could not complete your request. Sensitive details are not displayed.</p><button className="btn mt-6" onClick={reset}>Try again</button></div>}
