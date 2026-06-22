---
description: Scaffold a defensive Laravel endpoint (Form Request + thin Controller + Service) following this repo's house rules
argument-hint: <feature description, e.g. "submit exercise and grade via Judge0">
allowed-tools: Read, Grep, Glob, Edit, Write
---

Build an endpoint for: $ARGUMENTS

Follow [.agents/backend.md](../../.agents/backend.md) strictly. Produce, in this order:

1. **Form Request** in `app/Http/Requests/` — all validation lives here, never inline.
2. **Thin Controller method** — validate (via the Form Request), call the Service,
   return the response. NO business logic in the controller.
3. **Service method** in `app/Services/` — all logic here, wrapped in the house
   defensive pattern (mirror `app/Services/Judge0Service.php`):
   - `try { ... return ['success' => true, ...]; }`
   - `catch (\Throwable $e)` → `Log::error('<action> failed', ['action'=>..., 'input'=>..., 'error'=>$e->getMessage()])`
     then return `['success' => false, ...]`. Never log secrets.
   - If it calls an external API (Gemini/Judge0), degrade gracefully when the key is missing.
4. **Route** in `routes/web.php` (or `api.php`) guarded with the correct
   `role:administrator` / `role:student` middleware.

Before writing, read one existing Service + Controller pair to match naming and
style. After writing, list the files changed and the test command to verify.
