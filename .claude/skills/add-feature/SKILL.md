---
name: add-feature
description: Workflow for building a new feature in this app, from a fresh branch through scoped planning, checkpointed implementation with tests, and manual verification. Use when the user asks to add or build a feature.
---

# Add a feature

Follow these steps in order. Work autonomously between checkpoints, but always stop at each checkpoint and whenever a "Stop early" condition applies.

## 1. Start a feature branch

- Run `git status` to confirm the working tree is clean. If it isn't, stop and ask how to handle the in-progress changes.
- Switch to `main`, pull the latest, and create a branch: `git checkout main && git pull && git checkout -b feature/<short-kebab-name>`.

## 2. Restate the feature and clarify scope

- Restate the feature in 1–3 sentences.
- Ask about scope: what's in, what's explicitly out, edge cases, affected screens and flows, and UI expectations. Use `AskUserQuestion` for concrete choices.
- Don't explore until scope is reasonably clear.

## 3. Explore the codebase

- Follow `AGENTS.md` for architecture, conventions, and testing rules.
- Find relevant code: feature folders in `src/features/`, shared code in `src/utils/` and `src/shared/`, the local schema in `src/graphql/`, and existing tests for the area.
- Prefer reusing existing hooks, formatters, and resolvers over writing new ones.
- For any Expo or React Native API, check the pinned SDK version and fetch the matching docs, per `AGENTS.md`.

## 4. Propose a plan (Checkpoint 0)

- Group the plan by the checkpoints below, listing the files and tests for each.
- Wait for explicit approval before writing any code.

## 5. Implement by checkpoint

Within each checkpoint, write code and tests together, and run `npm run lint`, `npm run typecheck`, and `npm test` as you go. Tests are written within each checkpoint, never deferred to the end.

1. **Checkpoint 1: Data and shared logic.** Types, GraphQL schema, resolvers, queries, and pure functions in shared files, each with unit tests.
2. **Checkpoint 2: Component.** The `.tsx` component with component tests, testIDs, and accessibility.
3. **Checkpoint 3: Integration.** Wiring into screens or navigation, and Maestro flow updates.

At each checkpoint:

- Make sure lint, typecheck, and all tests pass. Never stop at a checkpoint with failing checks.
- Summarize what changed and why.
- Suggest a commit message, and wait for approval before continuing.

## Stop early if

- The work needs to deviate from the approved plan
- A new dependency is needed
- An existing type, schema field, or testID would change
- A test is flaky, or requirements are ambiguous

## 6. Wrap up: manual verification

List anything automated tests don't cover:

- Maestro flows to run (`npm run test:e2e` or specific `.maestro/*.yaml` files)
- Behavior to check in the iOS Simulator, like gestures, map interaction, persistence, and layout
- Native or config changes (`app.json`, native dependencies) that need `npx expo prebuild --clean` and a rebuild

Don't claim the feature is done. Report that implementation and automated checks are complete, and list what's left to confirm by hand.
