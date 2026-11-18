import ShareView from '@/components/ShareView';
export const metadata={title:'Shared CV'};
export default async function Page({params}:{params:Promise<{token:string}>}){return <ShareView token={(await params).token}/>;}
