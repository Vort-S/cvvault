import PublicCVView from '@/components/PublicCVView';
export default async function Page({params}:{params:Promise<{id:string}>}){return <PublicCVView id={(await params).id}/>;}
