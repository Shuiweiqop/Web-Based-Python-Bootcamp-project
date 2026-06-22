# frontend.md — React + Inertia rules

Scope: `resources/js/`. You are here for UI, pages, Inertia, Tailwind.
**MUST NOT** also read `backend.md` / `database.md` / `testing.md` for this task.
Root law: [../AGENTS.md](../AGENTS.md).

## 1. Architecture — the one flow

A controller's `Inertia::render('X/Y', $props)` MUST map to `resources/js/Pages/X/Y.jsx`.
Props come from the server; there is **NO** client-side data store or REST fetching for page data.

Per-area prohibitions:

- **Pages** (`Pages/Admin|Student|Auth|Lessons|Profile`) — receive props, compose Components.
  Heavy logic in a Page is discouraged → extract a Hook (`Hooks/`) or Component.
- **Navigation** — MUST use Inertia (`<Link>`, `router.visit`) with the Ziggy `route()` helper.
  Hardcoding URL strings is **FORBIDDEN** (routes change; `route()` stays correct).
- **Shared UI** — reuse from `resources/js/Components/` before writing a new component.

## 2. Conventions

| Need | Use | NEVER |
| --- | --- | --- |
| Class composition | `clsx` + `tailwind-merge` | hand-concatenated class strings |
| Icons | `@heroicons/react`, `lucide-react` | inline SVG dumps |
| Overlays/menus | `@headlessui/react` | bespoke focus-trap code |
| Code editor | `@monaco-editor/react` | a second editor lib |
| Rendering data as HTML | sanitize with `dompurify` first | raw `dangerouslySetInnerHTML` |

- React 19 + Tailwind 3.
- **NEVER** put secrets or API keys in frontend code — call the Laravel backend.
- **NEVER** edit `ziggy-routes.js` (generated).

## 3. Done

`npm run test:unit` (Vitest). Run `npm run build` only to verify production assets — it is slow.
Full DoD: [testing.md](testing.md).
