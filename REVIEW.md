# CVVault — Project Review & Evaluation

Project title: **Building Web Applications: Web Application Security, Testing, Deployment and Review**.

## Executive summary

CVVault is a security-first resume-management web application built with Next.js App Router, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM, Vercel Blob and server-rendered PDF export. Job seekers create professional CVs and maintain several tailored versions. Recruiters can search CVs that their owners have explicitly marked discoverable, while administrators handle users, auditing and moderation. The application includes a visible `/security` page and this `/review` page.

## Functional coverage

- Public home, login, registration, dashboard, profile and document storage.
- Sections: personal summary, work experience, education, skills, projects, certifications, languages and references. Each array section supports create/edit/delete/reordering.
- Multiple CVs, duplication, version history and restore; classic, modern and minimal templates; live preview, print view and server PDF export.
- Share token created from 256-bit randomness, hash-only database storage, optional expiry and explicit revoke. Contact details hidden by default on share links.
- User title search plus admin/recruiter discoverability-filtered public search by title, skill, location and education. Public search returns metadata, not email or phone.
- Admin user roles, suspend/activate, deletion, summary metrics, metadata review, audit logs and flagged content status.

## Security threat model and controls

**Assets:** passwords, private CVs, contact details, documents, session/share secrets, and administrative privileges.

**Threats / defenses:**

| Threat | Implementation | Review status |
| --- | --- | --- |
| Password theft | Salted bcrypt hashes with work factor 12; no password/API token logging | Requires live review |
| Session hijacking | Random bearer token stored as SHA-256 hash; HttpOnly/SameSite, Secure in production, expiry/revocation | Requires cookie checks |
| Credential stuffing | HMAC-keyed persisted rate limiting, login backoff, generic invalid-credential messages | Concurrency tests pending |
| Broken role checks | Roles enforced by `requireAdmin`; domain-layer ownership in `ownedCV` and direct record-scoped predicates | E2E adversarial tests pending |
| IDOR | Owners compare both user ID and CV ID for sensitive endpoints; private Blob uses ID+owner checks | Two-user test pending |
| SQL injection | Drizzle parameterized queries; dynamic input values do not become SQL syntax | Payload tests pending |
| XSS | Zod fields, plain text-only CV, React output encoding, nonce CSP; no dangerous HTML rendering | Browser test pending |
| CSRF | Reject cross-site and missing Origin on mutation; SameSite cookies | Preview-origin config needed |
| Upload abuse | 5 MB PDF/DOCX allowlist, size/header/signature checks; random private paths; authenticated downloads | Antimalware scanning not included |
| Link guessing | 256-bit bearer tokens, token-hash lookup, revoke/expiry | 404 verification pending |
| Privacy leakage | Search public/discoverable only, contacts excluded; share fields masked; user deletion | Data lifecycle audit needed |
| Blind admin actions | Audits for login events, role changes, CV creation/deletion and share operations | Audit retention procedure needed |

### Design trade-offs and gaps

1. **Email verification/password recovery:** password reset token creation and single-use consumption are implemented, but no email provider sends a secure reset link. A real deployment must integrate verified mail delivery before advertising working password recovery.
2. **Doc import:** uploaded PDF/DOCX documents are securely stored, not automatically parsed into CV sections. Automatic import would require safe document parsing, data normalization and user confirmation.
3. **Malware scanning:** MIME/magic-byte allowlisting is a baseline, not an antivirus scanner; a production deployment needs content scanning, file quarantine and abuse controls.
4. **Public discovery performance:** skill and education filters currently refine a limited batch of public CVs in application code. PostgreSQL JSONB indexes / search vectors and complete DB-side pagination are needed at scale.
5. **Version writes:** optimistic revisions prevent stale browser overwrites, but the CV update and new version insert are separate writes. Use a transaction/outbox or enforce revision+snapshot together for strict atomic consistency at scale.
6. **Audit trail:** logs deliberately exclude sensitive details; a scalable audited deployment needs an append-only retention and review policy.
7. **Blob deletion:** account/user deletion invokes Blob delete before database deletion; production reconciliation is needed if individual storage operations partially fail.
8. **CSP:** nonce-based scripts limit injection; `style-src 'unsafe-inline'` is retained for framework compatibility and should be tightened after integration tests.
9. **Accessibility:** HTML labels, accessible buttons and responsive layouts were implemented; comprehensive keyboard/screen-reader/contrast testing remains required.
10. **Operational security:** no independent penetration test, formal privacy impact assessment, key rotation drill or disaster recovery drill has been completed.

## Testing and actual results

The only completed automated check in the packaging environment was a TypeScript AST syntax parse (**zero syntax errors**). Dependencies, Neon access and browser engines were unavailable, so no claim is made that the Next production build, Vitest, Playwright, migration or PDF render passed. Detailed expected vs actual results are reported in `TESTING.md` and must be updated after execution.

## Performance

No Lighthouse scores, network timing data, latency distributions or PDF render benchmarks were measured. Record separate desktop/mobile Lighthouse scores and p50/p95 PDF time on a Vercel Preview deployment with representative synthetic CVs before final project submission.

## Development challenges

- Distinguishing public CV discovery from private owner-only data.
- Keeping sessions revocable with hashed tokens rather than self-contained bearer cookies.
- Enforcing same-origin and role checks at **each** mutation/API entry point.
- Handling PDF and DOCX without executing uploaded content, and serving Blob through authenticated streams.
- Preserving section order in JSON while maintaining historical snapshots.
- Planning environment-isolated database migrations and tests without exposing production data.

## Future improvements

Integrate verified password-reset mail, optional email verification and MFA; full AV scanning/content disarm; transactional audit/version writes; Postgres FTS and JSONB indexes; richer public profiles and recruiter invitation permissions; template customization; CI dependency scanning and security regression tests; Vercel + Neon restore drill, and measured accessibility/performance audits.

## Reproducibility & deployment status

This deliverable is a **codebase, not a confirmed live deployment**. Local syntax parsing succeeded; runtime testing, database seeding, migration, production deployment and app-specific security verification remain open. Follow `DEPLOYMENT.md` and `TESTING.md` before presenting a live application or handling real records.
