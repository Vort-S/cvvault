# CVVault — Security-Focused CV/Resume Management System

Semester project: **Building Web Applications: Web Application Security, Testing, Deployment and Review**.

CVVault is a Next.js (App Router) + TypeScript + Tailwind CSS application backed by Neon PostgreSQL with Drizzle ORM, a private Vercel Blob store, and server-generated PDFs. Two roles are required (`user`, `admin`); `recruiter` is a third read-only public-CV search role.

> **Release status:** Source-code project. This package has been syntax-parsed locally, but dependency installation, `next build`, database migrations, Vitest and Playwright could not be run in the packaging environment. **Do not treat it as a verified production deployment.** Complete the procedures below and the security review in `REVIEW.md` before storing real personal information.

## Installation

Requirements: Node.js 22+, npm, Neon PostgreSQL database, private Vercel Blob store and Vercel account.

```sh
npm install
cp .env.example .env.local
# Fill .env.local with actual values (do not commit secrets)
npm run db:migrate
npm run dev
```

Open http://localhost:3000. Generate a strong secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Create a **private** Blob store and set `BLOB_READ_WRITE_TOKEN`. All database connections must contain `sslmode=require`.

Seed demo data only in disposable development databases:

```sh
SEED_ADMIN_EMAIL=admin@example.edu SEED_ADMIN_PASSWORD='your-strong-password' npm run db:seed
```

The sample accounts use the same provided seed password and must not be used in live production. The admin account's email/password must be replaced by securely provisioned credentials for real operation.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production compile |
| `npm start` | Production server |
| `npm run typecheck` | TypeScript validation |
| `npm run lint` | ESLint |
| `npm test` | Vitest tests |
| `npm run test:e2e` | Playwright desktop, mobile, tablet |
| `npm run db:generate` | Generate migrations from schema (after baseline setup) |
| `npm run db:migrate` | Apply Drizzle migration scripts |
| `npm run db:seed` | Seed admin, demo users, sample CVs |

After installing, commit `package-lock.json` and change CI to `npm ci` for reproducible installs.

## Folder map

```text
src/
  app/
    api/auth/[action]/           registration, login, logout, reset-token endpoints
    api/profile/                 profile CRUD and profile photo
    api/account/                 account deletion
    api/cvs/                     CV CRUD, duplicate, versions, PDF, sharing
    api/share/                   public share reader + revoke
    api/uploads/                 private file upload/download/delete
    api/search/                  public discoverable CV search + read-only view
    api/admin/                   user controls, stats, audit and moderation
    (pages)                     homepage, dashboard, editor, security, review, admin
  components/                    reusable editor, preview, navigation and admin UI
  db/schema.ts                   PostgreSQL tables, foreign keys, indexes
  db/index.ts                    Neon + Drizzle parameterized connection
  lib/                           authentication, authorization, validation, PDF, uploads
  proxy.ts                       route pre-gate and per-request CSP

drizzle/                         initial SQL migration + Drizzle journal
scripts/seed.ts                  explicit-password development seeder
tests/                          Vitest unit/integration and Playwright E2E
.github/workflows/quality.yml   pull-request build/test workflow
```

## Database entities

- `users`, `profiles` — account roles, password hashes, public privacy defaults and account details
- `sessions` — hashed bearer tokens with expiry and revocation
- `cvs` — owner ID, title, template, JSONB CV sections and revision counter
- `cv_versions` — immutable snapshots per revision
- `share_links` — hashed high-entropy tokens, expiry, revocation and contact-field masking
- `uploads` — authenticated private Blob path metadata, file type, size
- `reset_tokens` — single-use expiring password-reset tokens (email delivery not implemented)
- `rate_limits` — atomic request buckets
- `audits` — action category, actor and target IDs only
- `flags` — reported CVs and moderation status

All user-specific records have foreign keys; related CV records and sessions cascade on account deletion. Audit rows preserve events with a nullable actor reference.

## Main pages

| Path | Access | What it does |
| --- | --- | --- |
| `/` | Public | Marketing / introduction |
| `/register`, `/login`, `/forgot-password` | Public | Signup, sign-in and reset-request stub |
| `/dashboard` | Signed-in | Completeness, CV count, audit activity and actions |
| `/profile` | Signed-in | Personal data, contact visibility, photo and deletion |
| `/cvs` | Signed-in | Multiple CVs, search, create, duplicate, delete |
| `/cvs/[id]` | Owner | CV builder, ordering, versions, template preview, sharing |
| `/cvs/[id]/print` | Owner | Print-friendly CV |
| `/uploads` | Signed-in | Secure storage for existing DOCX/PDF files |
| `/share/[token]` | Anyone with valid token | Read-only limited share view |
| `/search`, `/public/[id]` | Admin/recruiter | Filter/read explicitly discoverable CVs |
| `/admin` | Admin | User controls, CV metadata, audit logs, moderation, stats |
| `/security` | Public | Explains implemented protections |
| `/review` | Public | Review, challenges, limitations and roadmap |

## Security implementation

- `src/lib/auth.ts`: secure session issuance; hashed token lookup; server-side database role and ownership checks; session revocation.
- `src/app/api/auth/[action]/route.ts`: bcrypt password hashing at work factor 12; generic invalid-login response; lockout; reset-token single-use consumption. Email delivery is not yet configured, so resets do not reach users.
- `src/lib/validators.ts`: common Zod schemas used by route handlers; client fields mirror length/format constraints. User input remains plain text.
- `src/db/index.ts`, API query handlers: Drizzle binds all user-supplied data in parameterized operations. Do not replace with concatenated SQL.
- `src/proxy.ts`, `next.config.ts`: request-specific nonce CSP, HSTS, frame-ancestors, no-sniff, referrer and permissions policies. Proxy session-cookie check is only a UX pre-gate; routes re-check the DB.
- `src/lib/security.ts`: same-origin mutation verification, secure errors and sanitized logs.
- `src/lib/limits.ts`: HMAC-keyed persisted rate-limit counters.
- `src/lib/uploads.ts`, `src/app/api/uploads`: file size, extension, MIME and magic-byte checks; randomized private storage paths; authenticated streaming downloads. No malware scanner is included.
- `src/app/api/cvs/[id]`: owner-ID in database predicate prevents IDOR on writes; revision counter protects against stale saves.
- `src/app/api/share/[token]`: revocation/expiry and field masking; no contact information by default.
- `src/app/api/admin`: role authorization repeated on every route; self-demotion and self-deletion blocked.

**Important limitations:** profile photos and document uploads use basic signature checks, not content disarm or malware scanning; password-reset outbound email is missing; role changes and deletions require real production testing; shared links are bearer links and may be forwarded. An application handling real staff/job-seeker records requires additional adversarial testing.

## Data handling

No credentials or CV content should be logged. Account deletion removes the relational records and requests deletion of linked private blobs. Avoid backing up raw production data into developer laptops. Review backup/retention policies for Neon branches, snapshots and Vercel Blob separately.

## Testing and deployment

See `TESTING.md`, `DEPLOYMENT.md` and `REVIEW.md`. Run DB integration tests only with `TEST_DATABASE_URL` pointing to a separate migrated Neon test branch. The included tests are executable tests, **not proof they passed**.
