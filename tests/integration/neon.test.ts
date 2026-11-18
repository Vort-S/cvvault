import { describe,it,expect } from 'vitest';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { userTable,profiles,cvs,cvVersions,emptyCV } from '../../src/db/schema';
// This test is deliberately opt-in and NEVER runs on the application/prod database.
const testUrl=process.env.TEST_DATABASE_URL;
const allowed=Boolean(testUrl&&testUrl.includes('sslmode=require')&&testUrl!==process.env.DATABASE_URL);
const test=allowed?it:it.skip;
describe('isolated Neon test branch (requires migrated TEST_DATABASE_URL)',()=>{
  test('enforces unique emails, FKs and cascading deletes',async()=>{
    const db=drizzle(neon(testUrl!));const email=`test-${crypto.randomUUID()}@example.edu`;
    const [u]=await db.insert(userTable).values({email,passwordHash:'not-a-real-password-hash'}).returning({id:userTable.id});
    try{
      await db.insert(profiles).values({userId:u.id,name:'Integration Test'});
      const [cv]=await db.insert(cvs).values({userId:u.id,title:'Test CV',content:emptyCV}).returning();
      await db.insert(cvVersions).values({cvId:cv.id,revision:1,title:cv.title,template:cv.template,content:emptyCV});
      await expect(db.insert(userTable).values({email,passwordHash:'another'})).rejects.toThrow();
      await expect(db.insert(profiles).values({userId:crypto.randomUUID(),name:'Orphan'})).rejects.toThrow();
      await db.delete(userTable).where(eq(userTable.id,u.id));
      expect((await db.select().from(cvs).where(eq(cvs.id,cv.id))).length).toBe(0);
      expect((await db.select().from(cvVersions).where(eq(cvVersions.cvId,cv.id))).length).toBe(0);
    }finally{await db.delete(userTable).where(eq(userTable.id,u.id));}
  });
});
