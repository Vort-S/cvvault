import { describe,it,expect } from 'vitest';
import { registerSchema,loginSchema,contentSchema,itemSchema,profileSchema,cvUpdateSchema,shareSchema } from '../../src/lib/validators';
import { emptyCV } from '../../src/db/schema';
const password='SecurePass123!';
const mk=(changes:Record<string,unknown>={})=>({id:'80e64f2f-1e9c-442e-8a2d-e80c706741b9',title:'Work',start:'2025-01',end:'2025-06',...changes});
describe('registration validation',()=>{
 it('accepts a strong password and normalizes email',()=>{expect(registerSchema.parse({name:'Alex Lee',email:'ALEX@EXAMPLE.COM',password}).email).toBe('alex@example.com');});
 it.each(['short','onlylowercasepassword','NOCAPSNONUMBERS!!','NoSymbol1234'])('rejects weak password %s',p=>{expect(registerSchema.safeParse({name:'Alex Lee',email:'alex@example.com',password:p}).success).toBe(false);});
 it('rejects invalid email',()=>expect(loginSchema.safeParse({email:'bad',password}).success).toBe(false));
});
describe('CV validation',()=>{
 it('accepts complete content',()=>expect(contentSchema.safeParse({...emptyCV,experience:[mk()]}).success).toBe(true));
 it('rejects end date earlier than start',()=>expect(itemSchema.safeParse(mk({end:'2024-01'})).success).toBe(false));
 it('rejects impossible date format',()=>expect(itemSchema.safeParse(mk({start:'yesterday'})).success).toBe(false));
 it('rejects empty entry title',()=>expect(itemSchema.safeParse(mk({title:''})).success).toBe(false));
 it('rejects overlong summary',()=>expect(contentSchema.safeParse({...emptyCV,summary:'x'.repeat(4001)}).success).toBe(false));
 it('rejects invalid template',()=>expect(cvUpdateSchema.safeParse({title:'CV',template:'injected',revision:1,publicDiscoverable:false,content:emptyCV}).success).toBe(false));
 it('rejects invalid phone',()=>expect(profileSchema.safeParse({name:'Alex',phone:'abc<script>',headline:'',location:'',showPhone:false,showEmail:false}).success).toBe(false));
 it('accepts XSS and injection as data, never as executable markup or SQL',()=>{
  const payload='<script>alert(1)</script> \' OR 1=1 --';
  const parsed=contentSchema.parse({...emptyCV,summary:payload});expect(parsed.summary).toBe(payload);
 });
 it('rejects invalid share expiry string',()=>expect(shareSchema.safeParse({expiresAt:'tomorrow',hideEmail:true,hidePhone:true}).success).toBe(false));
});
