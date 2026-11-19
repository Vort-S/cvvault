import Link from 'next/link';

/** Original folded-document mark: two connected strokes form an abstract C and V. */
export function BrandMark({size=38}:{size?:number}){
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="48" height="48" rx="12" fill="#195D4E"/>
    <path d="M30.5 12H19a7 7 0 0 0-7 7v10a7 7 0 0 0 7 7h3" stroke="#F5F5EE" strokeWidth="3.3" strokeLinecap="round"/>
    <path d="m21 21 7.1 14L36 18" stroke="#E7D3AC" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M29 12v7h7" stroke="#F5F5EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
export default function Brand({compact=false}:{compact?:boolean}){
  return <Link href="/" className="inline-flex items-center gap-2.5 text-ink no-underline" aria-label="CVVault home"><BrandMark size={compact?34:38}/><span className="text-[20px] font-bold tracking-[-.055em]">CV<span className="text-ocean">Vault</span></span></Link>;
}