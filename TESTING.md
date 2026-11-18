# Testing report — CVVault

**Report date:** 2026-11-18. **Environment:** source packaging container, Node.js 22, global TypeScript parser, no npm package network access, no Neon branch or Vercel Blob credentials. **Result policy:** planned assertions are not called *passed* unless actually executed. Do not use this document as evidence of an external penetration test or a live production smoke test.

## Test execution status

A dependency-independent TypeScript AST **syntax parse** was executed over the created TypeScript/TSX source files. The parser reported **0 syntax errors**. `npm install`, `next build`, `tsc --noEmit`, Vitest and Playwright have **not** run because dependencies and connected test services were unavailable in this environment. Database migrations and seed have **not** been applied to Neon.

| Test | Expected Result | Actual Result | Status |
| --- | --- | --- | --- |
| TypeScript/TSX AST syntax parse | All source files parse without syntax errors | Ran; zero parser diagnostics | **PASS (syntax only)** |
| `npm install` | All dependencies resolve | Not executed; an npm registry connectivity check timed out | **NOT RUN** |
| `npm run typecheck` | No TypeScript errors | Not run; dependencies missing | **NOT RUN** |
| `npm run lint` | No lint errors | Not run; dependencies missing | **NOT RUN** |
| `npm run build` | Production Next.js build succeeds | Not run; dependencies missing | **NOT RUN** |
| Registration: strong password | Account created with bcrypt hash | Unit/E2E test written; not executed | **NOT RUN** |
| Registration: weak password | Reject 12-character/policy failure | Vitest assertions written; not executed | **NOT RUN** |
| Duplicate email | Generic conflict, DB uniqueness | DB integration test written; not executed | **NOT RUN** |
| Login: valid / invalid | Create secure session / generic 401 | E2E coverage written; not executed | **NOT RUN** |
| Password reset | Expiring, single-use token; no reuse | Handler implemented; email delivery not wired | **PARTIAL** |
| Profile CRUD/privacy | Update fields; reject invalid phone; no public leakage | API and client implemented; not E2E-tested | **NOT RUN** |
| CV CRUD and duplication | Owner can create/edit/delete/duplicate | E2E scaffolding written; not executed | **NOT RUN** |
| CV sections and ordering | Edit and reorder all 8 CV sections | Builder implemented; manual verification pending | **NOT RUN** |
| 3 templates and preview | Classic/modern/minimal update immediately | UI built; browser verification pending | **NOT RUN** |
| PDF export and print | Valid, readable A4 output | Endpoint implemented; PDF rendering not verified | **NOT RUN** |
| Own-CV search/filter | Title query and pagination | API implemented; integration pending | **NOT RUN** |
| Recruiter search/filter | Only discoverable CVs by job title, skill, location, education | API implemented, at-most-100-row scan; tests pending | **NOT RUN** |
| SQL injection payloads | ORM parameter binding, no query alteration | Validation accepts payload as text; DB tests pending | **NOT RUN** |
| XSS in CV fields | Markup displayed as literal text | Plain text React rendering; browser test pending | **NOT RUN** |
| Upload: valid PDF/DOCX | Valid signature accepted to private store | Signature logic and tests written; store not exercised | **NOT RUN** |
| Upload: wrong MIME/type, double extension, oversized | Reject 413/415; no Blob write | Vitest cases written; not run | **NOT RUN** |
| Unauthorized admin access | 403 for non-admin | E2E assertion written; not executed | **NOT RUN** |
| IDOR: other user's CV | 404, no access/read/write/export | Server owner predicate implemented; test against two users pending | **NOT RUN** |
| Expired/revoked share link | 404 with no CV content | Route predicate implemented; integration pending | **NOT RUN** |
| CSRF from other Origin | 403, no mutation | E2E assertion written; not executed | **NOT RUN** |
| Brute-force rate limit and lockout | 429 and backoff after configured thresholds | Code implemented; concurrency/security tests pending | **NOT RUN** |
| 404, error and API failures | Safe error pages and no sensitive debug data | UI present; runtime testing pending | **NOT RUN** |
| DB migration, unique/FK/cascade | Constraints enforced | SQL migration and isolated-branch test written; not executed | **NOT RUN** |
| Desktop/mobile/tablet | Responsive navigation, no overflows | Playwright viewport projects configured; not executed | **NOT RUN** |
| Accessibility audit | Keyboard, contrast, form labels and readable errors | Semantic markup exists; automated/manual audit pending | **NOT RUN** |
| Performance / Lighthouse | Repeatable scores and timings | No measurements collected | **NOT MEASURED** |

## How to run and fill real results

1. `npm install && npm run typecheck && npm run lint && npm test && npm run build`
2. Create and migrate a **separate Neon test branch**. Set `TEST_DATABASE_URL` (different from application `DATABASE_URL`) and rerun `npm test` for FK/unique/cascade coverage.
3. For Playwright, `npx playwright install chromium` and `npm run test:e2e`. With an isolated database, export `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` for authenticated cases. Ensure your test account cannot touch production.
4. Add a test for real wrong-owner IDs using two newly created test accounts, concurrent update race conflicts, share expiry/revoke and rate-limiting across separate requests. These are critical release gates.
5. Run E2E against a protected Vercel Preview by setting `E2E_BASE_URL` and appropriate preview authentication configuration. Confirm no real personal data are used.
6. Record each actual test result, timestamp, browser version, Neon branch and measured outcome in this table. Do **not** replace `NOT RUN` with `PASS` unless a real test was observed.
7. Run Lighthouse accessibility, SEO and performance; record desktop/mobile scores and PDF generation timing (p50/p95) after live measurement.

## Testing limitations

- Unit coverage targets validation, token hashing and upload signatures; integration coverage targets Neon uniqueness, FKs and cascade deletion. Authentication, sharing, rate limiting and full end-to-end ownership require additional database-backed test coverage for release.
- Playwright includes public smoke tests at desktop, mobile and tablet and a basic authenticated CV scenario; test credentials must be provided securely.
- UI-only checks are **never** sufficient to establish authorization or resistance to IDOR/CSRF.
- The sample tests are deliberately non-destructive outside a test environment; destructive admin moderation/deletion needs an isolated test branch and cleanup.
