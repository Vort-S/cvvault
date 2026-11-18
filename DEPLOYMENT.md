# Deployment — Vercel + Neon PostgreSQL

## 1. Preconditions

- Node 22+, an accessible Git repository, Vercel project and Neon project.
- A **private** Vercel Blob store (`access: 'private'`). Public Blob is inappropriate for personal resumes.
- Access to Vercel environment-variable settings and Neon branch management.
- Node dependencies installed and a committed `package-lock.json` from `npm install`.
- Run security review, migration checks and functional tests before any deployment serving real personal data.

## 2. Neon setup

1. Create a Neon PostgreSQL project in a region near the expected Vercel Function region.
2. Keep `production` as a protected branch and create `development` and `test` branches. Do not seed real CV data into dev/test branches; use synthetic data.
3. Obtain the **pooled connection string** for each branch; require SSL with `?sslmode=require` (or append `&sslmode=require` if the URL already has a query).
4. Map `DATABASE_URL` per Vercel environment: Production -> production branch, Preview -> development or dedicated ephemeral test branch, Development -> development branch. Do not point Preview at production.
5. Set `TEST_DATABASE_URL` locally or in a restricted test job to the isolated test branch. **It must differ from `DATABASE_URL`.**
6. Run `npm run db:migrate` against each branch separately using the correct environment secret. The migration SQL is in `drizzle/0000_initial.sql`; `drizzle/meta/_journal.json` is the Drizzle journal. Use migration diffs and code review for future schema changes.
7. Verify tables, constraints, indexes and migration journal on the branch after migrating. Avoid running destructive migrations automatically on every app startup.

## 3. Environment variables

| Variable | Development | Preview | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | Neon development pooled URL | Dedicated preview/test branch | Neon production pooled URL |
| `SESSION_SECRET` | Random 32+ byte secret | Distinct random secret | Distinct random secret |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Exact preview origin | Exact production `https://…vercel.app` or custom domain |
| `BLOB_READ_WRITE_TOKEN` | Development private Blob store | Private test store | Private production store |
| `TEST_DATABASE_URL` | Isolated test branch | Usually unset | **Must be unset** |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | Only when seeding dev | Avoid | Never run sample seeder |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Reserved for future verified reset-email integration | Optional | Not used by current code |

`SESSION_SECRET` example generation:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Never paste real database URLs, secrets or token values into issue reports, README or console logs. Vercel can provide short-lived identity integration to Blob where supported; use least privilege.

## 4. Local validation

```sh
npm install
cp .env.example .env.local
# Fill values without committing .env.local
npm run db:migrate
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run dev
# in another terminal: npm run test:e2e
npm run build
```

Run authenticated E2E suites with throwaway identities by setting `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`. Set `TEST_DATABASE_URL` for Neon integration testing. Ensure no test user can delete real data.

## 5. Git -> Vercel

1. Push code and lockfile to a GitHub repository. Keep `main` protected; use pull requests for feature branches.
2. Vercel → Add New Project → import repository; select `cvvault` as the **Root Directory** if files are within a monorepo. Framework preset should identify Next.js.
3. Configure Environment Variables separately for Production, Preview, Development; production credentials must never go to a preview. Do not expose server-side secrets as `NEXT_PUBLIC_*`.
4. Preview branch push → unique preview deployment; test protected routes and uploads. Main branch → production deployment after reviewed checks.
5. Use GitHub Actions in `.github/workflows/quality.yml` for lint, typecheck, tests and build. Require passing checks before merging; do not grant real production secrets to unreviewed PR code. Replace `npm install` with `npm ci` after committing lockfile.
6. In Vercel, inspect Build logs, Function logs and errors. Check `GET /security`, registered/login flows, session cookies, admin access, DB connectivity and PDF/Blob storage in the live environment.
7. Vercel's default `.vercel.app` domain includes automatic HTTPS; **you do not need to buy a custom domain**. A custom domain may be added later in Project Settings → Domains, with DNS verified by Vercel.

## 6. Post-release functional checklist

- [ ] HTTPS and HSTS present; CSP scripts still load.
- [ ] Sign up, sign in, log out and login lockout work.
- [ ] A normal user cannot access `/api/admin/users`.
- [ ] User A cannot fetch, edit, export or delete User B's CV ID.
- [ ] Create CV, edit all sections, reorder, save, duplicate, restore revisions.
- [ ] PDF endpoint produces a valid PDF; print view is legible on A4.
- [ ] Upload valid PDF/DOCX to **private** Blob; another user cannot download it.
- [ ] Reject oversized, mismatched and executable-like files.
- [ ] Share link hides contact details; revoked/expired tokens return 404.
- [ ] Recruiter search respects discoverable-only setting.
- [ ] Phone/tablet/desktop views display without horizontal scrolling.
- [ ] Database migrations and indexes match schema.
- [ ] Logs have no credentials, tokens or CV content.

## 7. Backups and restore drill

Neon offers branching and point-in-time restoration subject to plan/history retention. Before a schema release:

1. Check your project's point-in-time restore retention and verify that backup/branch recovery is enabled.
2. Create a named recovery branch or snapshot before applying a risky migration.
3. For a drill, restore into a **new isolated branch**, never overwrite current production without an incident decision.
4. Verify constraints, expected row counts, a synthetic test account and CV read, then validate application against the recovery branch.
5. Plan cutover: update Vercel's `DATABASE_URL` only after validation, redeploy, and monitor live traffic. Rotate credentials if incident-related.
6. Remember DB restore will not automatically restore separately stored Blob objects. Maintain a separate Blob lifecycle/retention plan and test recovery of associated files.

## 8. Monitoring and rollback

Use Vercel Logs for Function errors and deployment diagnostics. Logs must contain only event codes and opaque IDs, never request bodies, credentials or CV content. Consider a privacy-configured Sentry integration for exceptions. Roll back an unhealthy Vercel deployment through the dashboard or CLI, but database schema changes must be assessed separately: reverting code does not reverse migrated data.

## 9. Current blockers

Source packaging did not have network access to fetch npm packages or credentials to run Neon migrations/Vercel deployment. The application is **not yet deployed or live-tested** as part of this deliverable. Password-reset mail integration remains a stub.
