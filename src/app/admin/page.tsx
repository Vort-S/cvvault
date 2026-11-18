import { currentUser } from '@/lib/auth';
import { notFound,redirect } from 'next/navigation';
import AdminPanel from '@/components/AdminPanel';
export const metadata={title:'Administration'};
export default async function Page(){const u=await currentUser();if(!u)redirect('/login');if(u.role!=='admin')notFound();return <AdminPanel/>;}
