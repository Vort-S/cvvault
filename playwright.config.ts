import { defineConfig,devices } from '@playwright/test';
export default defineConfig({testDir:'tests/e2e',timeout:30000,retries:process.env.CI?1:0,
 use:{baseURL:process.env.E2E_BASE_URL||'http://localhost:3000',trace:'retain-on-failure'},
 projects:[{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],browserName:'chromium'}},{name:'tablet',use:{viewport:{width:768,height:1024},browserName:'chromium'}}],
 webServer:process.env.E2E_BASE_URL?undefined:{command:'npm run dev',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:120000}
});
