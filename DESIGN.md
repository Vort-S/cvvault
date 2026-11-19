# CVVault visual identity and UX refresh

## Identity

**Name:** CVVault (retained to avoid disrupting existing users)

**Promise:** Your work, clearly presented.

**Mark:** Custom document/CV monogram built with inline SVG (`src/components/Brand.tsx`) and the matching app icon (`src/app/icon.svg`). Original vector paths; no third-party logo assets or external fonts.

## Visual language

| Token | Value | Purpose |
|---|---|---|
| Pine | `#123B32` | Emphasized surfaces |
| Ocean | `#195D4E` | Primary actions and links |
| Ink | `#1C302C` | Body text and titles |
| Cloud | `#F7F7F2` | Background |
| Mint | `#B5D0BF` | Secondary accent |
| Sand | `#E9E9DF` | Warm neutral |

System Arial is used for UI and Georgia for editorial headlines; no external font requests. Shared controls and focus states are defined in `src/app/globals.css`. `prefers-reduced-motion` is respected.

## Information architecture

Top-level signed-in navigation groups Overview, My CVs, Profile, Documents and role-gated Discover/Admin. Small screens use a toggleable menu. Destructive account/CV deletion uses in-app confirmation dialogs. The editor groups tools into Content, Design, Share and History, keeping a live preview visible.

## Privacy and accuracy

The homepage uses an explicitly labelled **example layout**, not fabricated testimonials or user metrics. Counts shown in the signed-in dashboard come from real database queries. Shared-link settings are explicit and editable only after saving the CV. No schema or authentication-policy changes were required for this visual update.

## Preview review checklist

- [ ] Confirm desktop and mobile public routes, navigation and forms
- [ ] Sign in with a test user on isolated preview database
- [ ] Create, save, duplicate, preview, share and export a CV
- [ ] Check private file upload/download ownership
- [ ] Validate role-gated Admin and Discover navigation with appropriate test roles
- [ ] Inspect accessibility, performance and logging on the preview

**Production remains unchanged until the pull request is approved and merged.**