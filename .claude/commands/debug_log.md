---
description: Harden risky code with the repo's defensive try-catch + structured logging, and report root cause →責任 → fix
argument-hint: <file path or error message to investigate>
allowed-tools: Read, Grep, Glob, Edit, Bash
---

Target: $ARGUMENTS

Apply the defense rules from [docs/BACKEND.md](../../docs/BACKEND.md):

1. Locate the risky operation (external call, DB write, file IO, parsing).
2. Wrap it in the house pattern: `try { ... } catch (\Throwable $e)` with
   `Log::error('<action> failed', ['action'=>..., 'input'=>..., 'error'=>$e->getMessage()])`.
   - Include action + relevant inputs + concrete error. NEVER log secrets/passwords/full payloads.
   - Return a graceful `['success' => false, ...]` payload instead of throwing a raw 500.
3. Do not change business behaviour — only add defense and traceability.

Then output a report in EXACTLY this structure:

```
根本原因 (Root cause): <what fails and why>
责任归属 (Where):       <file:line / layer>
修复代码 (Fix):         <the diff applied>
验证 (Verify):          <test/command to confirm>
```
