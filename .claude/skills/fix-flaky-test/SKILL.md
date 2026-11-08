---
name: fix-flaky-test
description: Diagnoses and fixes a flaky test by finding its root cause, per AGENTS.md's flaky-test rules. Never fixes flakiness with retries, longer timeouts, or skipping. Use when a test fails intermittently, is reported as flaky, or passes/fails depending on run order, repetition, or isolation.
---

# Fix a flaky test

A flaky test is a failing test. The fix is never retries, longer timeouts, or skipping/deleting the test — find and fix the root cause, per `AGENTS.md`'s Testing rules. If no root cause can be found, stop and report findings instead of weakening the test.

## 1. Reproduce

- Run the test at least 10 times, counting failures: `fails=0; for i in $(seq 10); do npm test -- <path> -t "<test name>" || fails=$((fails+1)); done; echo "$fails/10 failed"`.
- Run it alone (`npm test -- <path>`), inside the full suite (`npm test`), and serially (`npm test -- --runInBand`).
- Record, for each mode: the failure rate (e.g. 3/10) and the exact error or stack trace. Flakiness that only appears in one mode (e.g. only in the full suite, not alone) is itself a clue — note which mode(s) reproduce it.

## 2. Identify the likely cause

Match the error signature to a category:

- **Timing** — fixed delays/sleeps, a `setTimeout`/`setInterval` race.
- **Async** — unawaited `render`, `fireEvent`, `unmount`, or `renderHook`; "overlapping act()" warnings; state updates after the test has finished.
- **Shared state** — mocks not reset between tests, a cached/shared Apollo client, a module-level singleton leaking state across tests.
- **Brittle locators** — querying by text or position that shifts, or a query that matches more than one element.
- **Environment** — time zone, locale, or CI-only failures; leftover timers or intervals from a prior test.
- **A bug in the code itself** — e.g. async work started with no cleanup (an unresolved promise, an uncancelled subscription, a listener never removed on unmount) that only surfaces as a race under test.

## 3. Isolate

Narrow to the smallest failing case: strip the test down to the minimal steps that still reproduce it, and binary-search by removing other tests, mocks, or setup until the cause is unambiguous. Remove any temporary debug logging before moving to the fix.

## 4. Fix the root cause

The fix may live in the test or in the code:

- **Test-side fixes:** fake timers instead of real delays; `waitFor`/`findBy` instead of fixed waits; `await` every RNTL call (`render`, `renderHook`, `unmount`, `fireEvent`); a fresh Apollo client per test instead of a shared one; reset mocks between tests; target testIDs or roles instead of brittle text/position locators.
- **Code-side fixes:** if the root cause is a real bug (e.g. a missing cleanup on unmount, a dangling subscription or promise), fix the code — don't just paper over it in the test — and keep or add a test that specifically covers that bug, so a regression would be caught.
- If the failure mode wasn't covered by `AGENTS.md`'s flaky-test rules, propose an addition to the user and wait for their approval before editing `AGENTS.md` yourself.

## 5. Prove it

- Re-run the same 10+ repetitions from step 1, in the same modes (alone, full suite, serial). All runs must pass.
- Run the full suite (`npm test`) to confirm no regressions elsewhere.
- Report the before/after failure rate and what the root cause was.

## If it can't be fixed

Stop. Report: the reproduction steps and failure rate, the error signatures observed, the causes ruled out, and why a fix isn't in hand. Do not skip, delete, retry-wrap, or add a longer timeout to make it "pass" — flag it for the user instead, per `AGENTS.md`.
