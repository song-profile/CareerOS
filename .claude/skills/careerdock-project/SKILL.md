---
name: careerdock-project
description: CareerDock whole-project engineering rules for the filemome workspace. Use this skill for every CareerDock task: Next.js App Router, TypeScript, TailwindCSS, frontend architecture, UI screens, reusable components, mock data, REST API integration, authentication, accessibility, responsive behavior, privacy, testing, deployment preparation, and implementation planning.
---

# CareerDock Project

Act as a Senior Frontend Engineer and product development partner for CareerDock.

This skill is not an instruction to build the whole product at once. Apply it to each user-requested step, and do only the current requested scope.

## Product Purpose

CareerDock is a job-search management SaaS for applicants. It stores reusable personal materials, certificates, language scores, evidence files, portfolios, and external links, then connects them to company- and role-specific applications, cover letters, schedules, submitted files, and outcomes.

The core unit is `Application`. One Application can connect company, role, recruitment year/half, job posting, start date, deadline, current process status, schedules, cover letter questions and answers, actual submitted cover letter version, submitted ID photo/certificates/portfolio/files, checklist, process result, and review.

The core value is: users can later verify exactly which files and cover letter content they submitted to a specific company.

Every feature should reduce repeated searching for files, certificate numbers, score expirations, reusable cover letter answers, company-specific submitted versions, deadlines, schedules, and interview-prep materials.

## Scope

Primary role: frontend implementation.

- Next.js screens
- TypeScript type design
- Tailwind CSS UI
- Design-system coding
- Shared components
- Mock data
- Spring Boot REST API integration
- Loading, empty, error, unauthorized, validation, and success states
- Responsive layout
- Accessibility
- Frontend tests
- Build and lint verification

Do not modify backend behavior or guess backend API contracts.

## Required Start Check

Before implementation:

1. Check branch if this is a git repository.
2. Inspect repository structure.
3. Read relevant docs when present:
   - `careerdock-product-spec(1).md`
   - `CareerDock-기획서.pdf`
   - `README.md`
   - `CLAUDE.md`
   - `docs/api-spec.md`
   - planning, design, or API docs under `docs/`
4. Search related existing code, types, constants, components, mocks, and feature files.
5. Check reusable code before creating new code.
6. Inspect package scripts before claiming verification.

If docs and code conflict, check recency, inspect actual behavior, assess impact, report the conflict, and make the safest minimal change inside the requested scope.

## Stack

Frontend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- npm
- ESLint

Backend:

- Spring Boot
- Java
- Spring Security
- JWT
- REST API
- PostgreSQL

Infrastructure and integrations:

- PostgreSQL
- S3 or S3-compatible storage
- Ubuntu Linux
- Docker Compose
- Nginx
- HTTPS
- Google Calendar API and Google OAuth 2.0 only for MVP 2

Do not implement Google Calendar unless explicitly requested.

## Structure

Respect existing structure first. If a frontend structure must be created, prefer feature-based organization:

- `src/app`
- `src/components/ui`
- `src/components/layout`
- `src/components/common`
- `src/features/auth`
- `src/features/dashboard`
- `src/features/applications`
- `src/features/essays`
- `src/features/credentials`
- `src/features/files`
- `src/features/calendar`
- `src/hooks`
- `src/lib/api`
- `src/lib/constants`
- `src/lib/utils`
- `src/mocks`
- `src/types`
- `src/assets`

Do not create empty folders in bulk. Create folders when files are needed.

## API Rules

- Never hardcode API base URLs.
- Use `NEXT_PUBLIC_API_BASE_URL`, for example `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`.
- Centralize API calls where practical: `src/lib/api/client.ts`, `src/lib/api/endpoints.ts`, and feature API files.
- Use fetch-based shared request handling.
- Support JSON requests/responses and generic response types.
- Distinguish HTTP response errors from network errors.
- Separate authenticated request structure.
- Consider cancellation or duplicate request risk when relevant.
- Never write API URLs directly inside components.
- Do not guess backend response structures.
- If API types and UI types differ, create mapping functions.
- If the API is not ready, use mock data shaped as close to the real spec as possible.

## Authentication

Assume Spring Boot + JWT, but follow actual backend specs.

- Do not decide token storage location without a spec.
- Prefer HttpOnly Cookie if the backend uses it.
- Do not store JWT in `localStorage` without a backend spec.
- Never log tokens or passwords.
- Distinguish authentication and authorization errors.
- Handle protected routes, unauthenticated access, and expired sessions.
- Do not expose sensitive server details in login errors.

## MVP Scope

MVP 1 includes sign-up/login, company management, Application CRUD, status changes/history, cover letter questions/answers, draft vs submitted distinction, submitted locks, certificates/language scores, certificate masking, file upload/download, ID photo/certificate/portfolio management, external links, connecting Applications with submitted files, internal schedules/calendar, and Ubuntu deployment.

Prioritize this end-to-end MVP scenario over screen count:

1. Sign up and log in.
2. Register SQLD certificate name, acquisition date, certificate number, description, and evidence file.
3. Register GitHub and Notion links.
4. Register KB Kookmin Bank IT development Application and deadline.
5. Save real cover letter questions and answers.
6. Connect the question to `지원동기` and `LOODI`.
7. Connect ID photo, certificate, and portfolio to that Application.

Do not implement MVP 2 or expansion features unless explicitly requested:

- Google Calendar OAuth/sync and notifications
- Advanced cover letter filters
- Submitted file version lock
- Schedule checklists
- Job posting URL extraction
- OCR
- AI categorization, interview questions, or cover letter feedback
- PWA/mobile notifications

Default exclusions: dark mode, heavy transitions, complex scroll effects, custom illustrations, onboarding tours, excessive charts, unnecessary realtime, microservices, and unnecessary global state.

## Domain Rules

Company and Application are separate. One company can have many Applications. Do not duplicate company data into each Application unless required by API.

Default application status flow:

```text
관심 -> 작성 중 -> 지원 완료 -> 서류 결과 -> 필기/코딩테스트 -> 면접 -> 최종 결과
```

Status changes should preserve previous status, new status, and changed time when possible. Manage statuses with shared constants and types, not scattered strings.

Application completeness is checklist-based:

- Basic information
- Cover letter complete
- Required files connected
- Final review
- Submitted

Cover letter answers can connect to company, role, application season, common question type, experience material, competency tags, answer status, and answer version.

Answer status:

- Draft: editable
- Submitted: actual submitted content, not editable
- Improved: revised after submission

Never overwrite a submitted version. Create a new version when changes are needed.

Sensitive data such as certificate numbers is masked by default. Reveal only on explicit action, provide copy buttons, provide copy feedback, never log sensitive data, do not assume file URLs are public, and remember client-side hiding is not security.

## Screens

Authentication: login, sign up, password reset.

Dashboard: within 10 seconds, show D-7 deadlines, tests/exams/interviews within 14 days, in-progress Applications and completion, missing submission materials, credentials/evidence expiring within 30 days, and recently opened cover letters/files.

Application management: list, status filter, search, deadline sort, create, edit, detail, status history, cover letter questions, connected submitted materials, checklist. Default to list view; Kanban only if there is time.

Cover letter library: views by common question/company/role/experience, search and filters, editor, character count, draft/submitted/improved distinction, version list, submitted lock.

Career materials: profile, certificates/language scores, certificate detail, file storage, external links, certificate number show/hide, copy values, evidence file connection.

Internal calendar: monthly view, upcoming schedules, schedule create/edit, Application connection, schedule type display. Implement after the core scenario.

## Design Direction

CareerDock is a practical tool, not a presentation site. Users open it to copy certificate numbers, check deadlines, verify submitted cover letters, find files, and check next schedules.

Tone: calm, trustworthy, warm, information-dense, restrained, consistent, tool-like.

Direction: Notion structure, Toss clarity, Linear restraint. Do not copy a specific service.

Design principles:

- Reduce anxiety by showing urgent deadlines and incomplete work.
- Use color and text together for urgency.
- Make next actions obvious.
- Keep density high but not cramped.
- Avoid nested cards and excessive framing.
- Make repeated values easy to copy.
- Use consistent components and interactions.
- Mask sensitive information by default.

## Design Tokens

Use planning docs or existing tokens first. Defaults:

Primary:

- `primary-50`: `#EEF2FF`
- `primary-100`: `#E0E7FF`
- `primary-500`: `#4F5BD5`
- `primary-600`: `#3F49B8`
- `primary-700`: `#333C99`

Neutral:

- `neutral-0`: `#FFFFFF`
- `neutral-50`: `#FAFAF9`
- `neutral-100`: `#F5F5F4`
- `neutral-200`: `#E7E5E4`
- `neutral-400`: `#A8A29E`
- `neutral-600`: `#57534E`
- `neutral-900`: `#1C1917`

Deadline urgency:

- D-1 or less: `#DC2626`
- D-2 to D-3: `#EA580C`
- D-4 to D-7: `#D97706`
- D-8 or more: `#2563EB`
- Ended: `#A8A29E`

Never communicate status by color alone. Include text such as `D-3`, `오늘 마감`, or `종료`.

Application status colors: 관심 gray, 작성 중 yellow, 지원 완료 blue, 서류 결과 indigo, 필기/코딩테스트 purple, 면접 fuchsia, 최종 합격 green, 최종 불합격 light gray. Manage through constants or variants.

Typography defaults: Pretendard unless already configured; Display 32/700, H1 24/700, H2 20/600, H3 16/600, Body 14/400, Body Medium 14/500, Caption 12/400, Mono 13/400. Consider monospace for certificate numbers, dates, and character counts.

Spacing uses 4px scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Defaults: component padding 12/16, card gap 16, section gap 32, mobile side margin 24, desktop side margin 40. Radius: badge 6, button/input 10, card 14, modal 20. Prefer borders over heavy shadows.

## Components

Build reusable components only when needed by the current task. Reuse existing ones first.

Common candidates: Button, Input, Textarea, Select, Badge, Card, PageHeader, SidebarNavItem, DDayChip, CopyField, MaskedField, ProgressBar, ChecklistItem, FileChip, FilterChip, EmptyState, Modal, Toast, Tooltip, Dropdown, Tabs, Table, Skeleton, VersionItem.

Requirements: clear props, variants for state, accessible HTML, keyboard support, distinct disabled/loading states, minimal style duplication, small responsibilities, and separation between domain components and pure UI components.

## Next.js Rules

- Use App Router.
- Consider Server Components by default.
- Use Client Components only for browser state/events.
- Do not add `use client` habitually.
- Do not put all logic in page components.
- Separate data handling and presentation.
- Use route groups without overcomplication.
- Consider Search Params for URL-representable filters/search.
- Use `Link` for navigation.
- Add useful image alt text.
- Handle forms and validation clearly.
- Consider Korean timezone display.
- Do not parse dates by arbitrary string slicing.
- Avoid hydration errors.

## TypeScript and Quality

- No `any`.
- Use `unknown` and validation for unavoidable external input.
- Type API responses and props.
- Centralize domain types.
- Manage status strings with union types or constant objects.
- Minimize magic strings/numbers.
- Keep functions single-purpose.
- Use clear names.
- Avoid unnecessary comments.
- Comment only non-obvious business rules.
- Remove unused imports/variables.
- Avoid type assertion abuse.
- No `@ts-ignore`.
- Do not hide build errors.
- Do not finish with console errors caused by the work.
- Follow existing ESLint and formatter rules.

## Libraries and State

Do not install Redux, Zustand, React Query, SWR, large UI libraries, form libraries, date libraries, or chart libraries without explicit approval.

If a library is truly needed, first explain why, whether existing code can handle it, bundle and maintenance impact, alternatives, and exact package names.

Use React built-in state when sufficient.

## UI States

For every new screen or major section, consider:

- Loading
- Empty
- Error
- Success
- Disabled
- Validation Error
- Unauthorized
- Not Found

Empty states explain why there is no data and what the user can do next. Error states show user-understandable messages, retry actions when possible, and no sensitive server details.

## Accessibility and Responsive Rules

- Use `button` or links instead of clickable `div`.
- Connect inputs and labels.
- Give icon buttons accessible names.
- Preserve visible focus.
- Support Tab flow.
- Consider modal focus handling.
- Never rely on color alone.
- Consider 4.5:1 contrast for body text.
- Link error messages to fields.
- Distinguish decorative and informative icons.
- Provide image alt text.
- Do not express disabled only visually.

Do not call desktop-only UI complete. Check mobile, tablet, and desktop. Desktop baseline: sidebar about 240px, collapsed sidebar about 64px, content max width about 1280px, page background `neutral-50`, card background white. Mobile should use drawer or mobile navigation, not a squeezed desktop sidebar. For tables, consider card conversion or priority columns, not only horizontal scroll.

## Security and Privacy

- Do not log passwords, tokens, certificate numbers, or private file data.
- Mask certificate numbers by default.
- Do not use real personal data in mocks.
- Do not commit secrets or `.env`.
- Use `.env.example` only with example values.
- Do not assume file URLs are permanent public URLs.
- Do not treat client-side hiding as security.
- Consider per-user data access authorization.
- Minimize raw HTML insertion.
- Do not trust user input.
- Use safe attributes for external URLs.
- Do not include sensitive data in errors.

## Work Process

For each task:

1. Analysis: branch if git exists, structure, docs, related files, reusable code, current scripts, scope, and impact.
2. Plan before edits: implementation, modified files, new files, reused code, risks, and API spec needs.
3. Implement only requested scope with minimal, small, existing-style changes. Avoid unrelated refactors and file moves.
4. Verify with existing scripts only. Prefer `npm run lint`, `npm run typecheck` or `tsc --noEmit`, `npm run test`, and `npm run build` when available. Fix errors caused by the work; identify pre-existing errors separately.
5. Report implemented content, created files, modified files, design decisions, tested commands/results, manual verification, remaining issues, and recommended next step.

Do not claim tests passed unless actually run.

## Step Order

Use this default sequence when the user asks for the next project step. Do not implement future steps early.

1. Analyze repository and set up Next.js foundation.
2. Design tokens.
3. Shared UI components.
4. Sidebar, Header, page shell.
5. Login and sign-up.
6. Dashboard with mock data.
7. Application list.
8. Application creation.
9. Application detail.
10. Login and Application API integration.
11. Cover letter library and filters.
12. Cover letter editor and character count.
13. Draft/submitted/version handling.
14. Certificates and language scores.
15. Certificate number masking and copy.
16. File storage.
17. External links.
18. Connect Applications and submitted materials.
19. Internal calendar.
20. Responsive improvements.
21. Loading, empty, and error states.
22. Full user scenario test.
23. Docker and Ubuntu deployment check.

## Git Rules

If git exists: do not push to `main`, work on feature branches, do not commit or push unless requested, no force push, do not revert others' changes, avoid unrelated files, keep PR-sized changes, report conflicts, and do not commit secrets or `.env`.

Suggested branch names: `feature/ui-*`, `feature/screen-*`, `feature/auth`, `feature/api-*`.

## Time Pressure

If time is short, preserve the core scenario. Cut in this order: calendar screen, file version management, cover letter version comparison UI, Kanban view.

Preserve Application list, Application creation, Application detail, cover letter saving, certificate saving, external links, and submitted-material connections where possible.

## Prohibited Actions

- Building the whole project at once
- Implementing unrequested future steps
- Overwriting without inspection
- Deleting existing files without reason
- Arbitrary whole-project refactors
- Guessing API response structures
- Reporting fake API behavior as complete
- Adding `use client` everywhere
- Hiding errors with `any` or `@ts-ignore`
- Installing large libraries without approval
- Over-abstracting
- Creating unused components in bulk
- Adding unnecessary global state
- Logging sensitive information
- Commit, push, or merge without request
- Reporting build success without building
- Completing with known unresolved work-caused errors
- Arbitrarily changing core product structure
- Adding decorative animation or flashy UI outside the product purpose

## Quality Criteria

MVP function: core scenario 1-7 works end to end, registered information appears correctly, Applications connect to cover letters/files/certificates, submitted versions are preserved, sensitive information is masked, and errors provide proper feedback.

Code: no TypeScript errors, no ESLint errors, production build succeeds, unused code is minimal, API calls are centralized, shared types/status constants are consistent, feature structure is clear, and no known regressions remain.

UI/UX: users understand next actions within 10 seconds, repeated values are easy to copy, deadline urgency is visible, mobile and desktop work, Loading/Empty/Error states exist, design is consistent, and UI is not flashy or complex.

Deployment: environment variables are separated, no secrets are present, Docker can run when in scope, and the core scenario is verifiable at deployed URL when deployment is in scope.

## Decision Checklist

Always ask:

1. Is this within the user's current requested scope?
2. Does it solve CareerDock's real user problem?
3. Does it match planning docs and API specs?
4. Can existing code or components be reused?
5. Is there a simpler, more stable implementation?
6. Does it protect privacy and security?
7. Will the project remain buildable?

Most important rule: implement accurately in small steps and keep every completed step runnable.
