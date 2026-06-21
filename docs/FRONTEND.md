# FRONTEND — React + Inertia rules

Strict rules for `resources/js/`. Back to router: [../Agent.md](../Agent.md).

## Architecture (non-negotiable)

- Pages are Inertia components in `resources/js/Pages/` (`Admin/`, `Student/`,
  `Auth/`, `Lessons/`, `Profile/`). A controller's `Inertia::render('X/Y', ...)`
  **MUST** map to `resources/js/Pages/X/Y.jsx`.
- There is **NO** client-side router. Navigation **MUST** use Inertia
  (`<Link>`, `router.visit`) with the Ziggy `route()` helper — **NEVER**
  hardcode URL strings.
- Shared UI **MUST** be reused from `resources/js/Components/` before writing new
  components.

## Conventions

- React 19 + Tailwind 3. Compose classes with `clsx` + `tailwind-merge`;
  icons from `@heroicons/react` or `lucide-react`; overlays from `@headlessui/react`.
- Code editor is `@monaco-editor/react`.
- Any HTML rendered from data **MUST** be sanitized with `dompurify` — injecting
  raw HTML is FORBIDDEN.
- **NEVER** put secrets or API keys in frontend code; talk to the Laravel backend.

## After changes

`npm run test:unit` (Vitest). Run `npm run build` only to verify production
assets — it is slow.
