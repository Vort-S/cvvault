import {test,expect} from '@playwright/test';

test('homepage, security and project-review pages have clear headings',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Make your work speak for itself/i})).toBeVisible();
 await page.goto('/security');await expect(page.getByRole('heading',{name:/Your information\. Your call/i})).toBeVisible();
 await page.goto('/review');await expect(page.getByRole('heading',{name:/How CVVault was built/i})).toBeVisible();
});
test('registration and login forms have accessible labels and controls',async({page})=>{
 await page.goto('/register');await expect(page.getByLabel('Full name')).toBeVisible();await expect(page.getByLabel('Email address')).toBeVisible();await expect(page.getByLabel('Password',{exact:true})).toBeVisible();
 await page.goto('/login');await expect(page.getByRole('button',{name:'Sign in'})).toBeVisible();
});
test('dashboard requires authentication',async({page})=>{await page.goto('/dashboard');await expect(page).toHaveURL(/\/login/);});
test('mobile navigation is usable and no content overflows viewport',async({page,isMobile})=>{
 await page.goto('/');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);expect(overflow).toBe(false);
 if(isMobile||await page.getByRole('button',{name:'Open navigation'}).isVisible()){
   await page.getByRole('button',{name:'Open navigation'}).click();
   await expect(page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Security'})).toBeVisible();
   await page.getByRole('button',{name:'Close navigation'}).click();
   await expect(page.getByRole('navigation',{name:'Mobile navigation'})).toHaveCount(0);
 }
});