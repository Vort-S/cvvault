import { test,expect } from '@playwright/test';
test('homepage and public security/review pages load with accessible headings',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Create your next opportunity/i})).toBeVisible();
 await page.goto('/security');await expect(page.getByRole('heading',{name:/personal information deserves/i})).toBeVisible();
 await page.goto('/review');await expect(page.getByRole('heading',{name:/Project review/i})).toBeVisible();
});
test('login, registration and password controls are accessible',async({page})=>{
 await page.goto('/register');await expect(page.getByLabel('Full name')).toBeVisible();await expect(page.getByLabel('Email address')).toBeVisible();await expect(page.getByLabel('Password',{exact:true})).toBeVisible();
 await page.goto('/login');await expect(page.getByRole('button',{name:'Log in'})).toBeVisible();
});
test('private dashboard requires a session',async({page})=>{await page.goto('/dashboard');await expect(page).toHaveURL(/\/login/);});
test('layout does not overflow narrow screens',async({page})=>{await page.goto('/');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);expect(overflow).toBe(false);});
