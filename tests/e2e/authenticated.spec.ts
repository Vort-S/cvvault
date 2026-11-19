import { test,expect } from '@playwright/test';
const email=process.env.E2E_USER_EMAIL,password=process.env.E2E_USER_PASSWORD;
test.skip(!email||!password,'Supply E2E_USER_EMAIL and E2E_USER_PASSWORD for database-backed tests');
async function login(page:import('@playwright/test').Page){await page.goto('/login');await page.getByLabel('Email address').fill(email!);await page.getByLabel('Password',{exact:true}).fill(password!);await page.getByRole('button',{name:'Sign in'}).click();await expect(page).toHaveURL(/\/dashboard/);}
test('create, edit, export, and remove own CV',async({page})=>{
 await login(page);await page.goto('/cvs');await page.getByLabel('CV name').fill('E2E test CV');await page.getByRole('button',{name:'Create a CV'}).click();await expect(page).toHaveURL(/\/cvs\/[\w-]+$/);
 await page.getByLabel('CV name').fill('Updated E2E test CV');await page.getByRole('button',{name:/Save changes/}).click();await expect(page.getByRole('status')).toContainText('saved');
 const pdf=await page.context().request.get(new URL((await page.url())+'/pdf').toString().replace('/cvs/','/api/cvs/'));
 expect(pdf.status()).toBe(200);expect(pdf.headers()['content-type']).toContain('application/pdf');
});
test('IDOR and role protections on API',async({page})=>{await login(page);
 const res=await page.evaluate(async()=>fetch('/api/cvs/00000000-0000-4000-8000-000000000001'));expect(res.status).toBe(404);
 const admin=await page.evaluate(async()=>fetch('/api/admin/users'));expect(admin.status).toBe(403);
});
test('CSRF protection rejects foreign Origin mutations',async({page})=>{await login(page);const csrf=await page.context().request.post('/api/cvs',{headers:{origin:'https://attacker.invalid','content-type':'application/json'},data:{title:'Should fail'}});expect(csrf.status()).toBe(403);});
test('login rejects bad credentials generically',async({page})=>{await page.goto('/login');await page.getByLabel('Email address').fill(email!);await page.getByLabel('Password',{exact:true}).fill('WrongPassword1!');await page.getByRole('button',{name:'Sign in'}).click();await expect(page.getByRole('alert')).toContainText(/Invalid email or password/);});