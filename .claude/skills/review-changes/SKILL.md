---
name: review-changes
description: Reviews uncommitted changes or a branch's changes against this project's AGENTS.md standards before committing. Review only — never edits files unless the user separately asks. Use when the user wants a pre-commit review, a second look at a diff, or to check a branch is ready to commit/merge.
---

# Review changes

This is a review, not an implementation task. Do not edit, fix, or stage any files during this skill — only report findings. If the user wants fixes applied, that's a separate, explicit follow-up request.

## 1. Gather the changes

- Run `git status` to see tracked and untracked changes.
- Run `git diff` for unstaged changes and `git diff --staged` for staged changes. Include untracked files' content too (e.g. `git diff --no-index /dev/null <file>` or just read them directly).
- If reviewing a whole branch instead of working-tree changes, use `git diff main...HEAD` (merge-base diff, not `main..HEAD`) to see only what the branch actually adds.
- Read every changed file in full (not just the diff hunks) to get real context — a diff line can look fine in isolation and still be wrong given the surrounding function.

## 2. Run the checks

Run, and report the results of, each of:

- `npm run lint`
- `npm run typecheck`
- `npm test` (narrow to affected files with e.g. `npx jest <path>` if the full suite is slow, but note that you narrowed it)

Report pass/fail and paste relevant failure output. Don't fix failures yourself — that's a finding, not a task.

## 3. Review against the AGENTS.md checklist

Group findings under these categories, checking only what's relevant to the actual diff:

**Tests**
- Every behavioral change ships with a test.
- Assertions are meaningful: no tautologies (asserting a value the test itself set, or that a mock returns what the test told it to return).
- No test relies on snapshot assertions alone, and no test exists solely to assert styling (colors, padding, fonts) rather than state.
- React Native Testing Library calls (`render`, `renderHook`, `unmount`, `fireEvent`) are `await`ed.
- Fixtures use `makeLoad(overrides)` / `withTypenames()` from `src/test/loadFactory.ts`, not hand-rolled objects missing `__typename`.
- Integration tests against the local schema use a fresh Apollo client per test, not a shared/cached one.
- Fake timers or `waitFor`/`findBy` are used for async/timing, not fixed delays or sleeps.

**Conventions**
- Feature-based folder placement; business logic in pure functions/hooks, not components.
- `colors` and `spacing` from `src/shared/theme.ts` used instead of literal values (outside `DrawMap`'s pre-existing literals).
- PascalCase components, camelCase utilities/hooks, hooks prefixed `use`.
- Date-only strings parsed by parts, never `new Date('YYYY-MM-DD')`.
- GeoJSON coordinates are `[longitude, latitude]`.

**Contracts**
- Maestro testIDs are preserved, not renamed or removed — cross-check the list in `AGENTS.md`'s Testing section against `.maestro/*.yaml` and flag any testID the diff touches that isn't documented in either place.
- Type changes stay consistent with the schema (`MockLoad` as `Omit<Load, 'ratePerMile'>`, computed fields stay resolver-only, not duplicated onto raw data).
- Any new query added to the public Countries API is added to the `ApolloLink.split` rule in `src/apollo.ts` — a new query that should hit the public API but doesn't get added here will silently resolve against the local schema instead and fail.

**Native and config**
- New dependencies were added via `npx expo install`, not `npm install`.
- No hand edits to `ios/` or `android/` — native behavior changes go through `app.json` plugins.
- Call out whether `app.json` or native dependency changes in this diff require a rebuild (`npx expo prebuild --clean && npx expo run:ios`).

**Safety and scope**
- No secrets, tokens, or `.env` contents committed.
- No leftover debugging code (`console.log`, commented-out blocks, temporary test shortcuts).
- No unrelated changes mixed into the diff (formatting-only churn on untouched lines, unrelated file edits).

## 4. Report findings

Group findings by severity:

- **Must fix** — breaks a hard rule above, a failing check, or a real bug.
- **Should fix** — a real gap (missing test, convention violation) that isn't blocking but should be addressed.
- **Consider** — a suggestion or judgment call, not a rule violation.

For each finding, give: file, line (or line range), and a suggested fix (described, not applied).

End with a verdict: **ready to commit** or **not ready**, and a one- or two-sentence reason tied to the findings above (e.g. "Not ready — one must-fix: the `GetFleetStatus` query isn't in the `apollo.ts` split rule, so it will resolve against the local `SchemaLink` and throw a GraphQL error instead of reaching the public API.").
