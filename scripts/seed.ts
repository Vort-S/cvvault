/** Use only after migration on a NON-production empty database. Requires explicit passwords. */
import { config } from 'dotenv';
config({path:'.env.local'});
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { userTable,profiles,cvs,cvVersions,emptyCV } from '../src/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
const run=async()=>{
 if(process.env.NODE_ENV==='production'&&!process.env.ALLOW_PRODUCTION_SEED)throw new Error('Production seed blocked');
 const email=z.email().parse(process.env.SEED_ADMIN_EMAIL||'admin@example.edu').toLowerCase();
 const secret=z.string().min(12).parse(process.env.SEED_ADMIN_PASSWORD);
 if(!process.env.DATABASE_URL?.includes('sslmode=require'))throw new Error('SSL DATABASE_URL required');
 const db=drizzle(neon(process.env.DATABASE_URL));const [admin]=await db.select({id:userTable.id}).from(userTable).where(eq(userTable.email,email));
 if(!admin){const [user]=await db.insert(userTable).values({email,passwordHash:await bcrypt.hash(secret,12),role:'admin'}).returning({id:userTable.id});await db.insert(profiles).values({userId:user.id,name:'Department Administrator'});}
 for(const [i,person] of ['alex@example.edu','jordan@example.edu'].entries()){
  const [exists]=await db.select({id:userTable.id}).from(userTable).where(eq(userTable.email,person));if(exists)continue;
  const [user]=await db.insert(userTable).values({email:person,passwordHash:await bcrypt.hash(secret,12),role:'user'}).returning({id:userTable.id});
  await db.insert(profiles).values({userId:user.id,name:i?'Jordan Lee':'Alex Morgan',location:'Lagos, Nigeria',headline:i?'Data Analyst':'Frontend Engineer'});
  const content={...emptyCV,summary:'Sample profile for semester project testing.',skills:[{id:crypto.randomUUID(),title:i?'SQL':'TypeScript'}]};
  const [cv]=await db.insert(cvs).values({userId:user.id,title:i?'Data Analyst CV':'Software Engineer CV',content,publicDiscoverable:true}).returning();
  await db.insert(cvVersions).values({cvId:cv.id,revision:1,title:cv.title,content,template:cv.template});
 }
 console.log('Seed complete. No passwords or tokens printed.');
};
run().catch(e=>{console.error('Seed failed:',e instanceof Error?e.name:'Error');process.exitCode=1;});
