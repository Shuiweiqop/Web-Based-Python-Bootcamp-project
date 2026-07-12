# frontend.md — React + Inertia (`resources/js/`)

You're here for UI: pages, Inertia props, Tailwind, navigation.
Root law: [../AGENTS.md](../AGENTS.md). If the task also adds/changes a backend route or
controller, read [backend.md](backend.md) too — page data comes from there.

## How data reaches a page (there's no client store)

A controller's `Inertia::render('X/Y', $props)` renders `resources/js/Pages/X/Y.jsx`, and
those `$props` **are** the page's data. There is no Redux/REST layer fetching page data on the
client — if a page needs different data, the controller's props change, not a client fetch.

- **Pages** (`Pages/Admin|Student|Auth|Lessons|Profile`) receive props and compose components.
  Push heavy logic into a `Hooks/` hook or a component rather than fattening the page.
- **Navigation** goes through Inertia (`<Link>`, `router.visit`) with the Ziggy `route()`
  helper. Don't hardcode URL strings — routes get renamed, and `route('name')` stays correct
  while a literal `/admin/rewards` silently rots.
- **Reuse before you build** — check `resources/js/Components/` for an existing component first.

## Conventions (what's already installed, so use it)

| Need | Use | Instead of |
| --- | --- | --- |
| Conditional classes | `clsx` + `tailwind-merge` | hand-concatenated class strings |
| Icons | `@heroicons/react`, `lucide-react` | pasting raw SVG |
| Menus / modals / overlays | `@headlessui/react` | writing your own focus trap |
| Code editor | `@monaco-editor/react` | a second editor library |
| Rendering server HTML | run it through `dompurify` first | raw `dangerouslySetInnerHTML` |

Stack is React 19 + Tailwind 3. Never put an API key or secret in frontend code — it ships to
the browser; call the Laravel backend instead. Never edit `ziggy-routes.js` (generated).

## The nav allowlist trap

Desktop student nav uses a **hardcoded allowlist** in
[../resources/js/Layouts/StudentLayout.jsx](../resources/js/Layouts/StudentLayout.jsx)
(`desktopPrimaryNavItems` / `desktopOverflowNavItems`). Adding an item to `mainNavItems`
alone won't make it appear on desktop — you also have to add its route to one of those
allowlists. This has bitten before; it's why nav items sometimes "don't show up."

## New route added? Reload the whole page

Ziggy routes are injected at full page load via the `@routes` Blade directive. After adding a
route, an Inertia SPA navigation won't see it in `route('name')` — do a full browser reload.

## When you're done

`npm run test:unit` (Vitest; specs live beside the code). Run `npm run build` only to verify
production assets compile — it's slow, not a routine check. Full checklist: [testing.md](testing.md).
