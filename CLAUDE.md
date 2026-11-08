# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- Use plan mode for anything bigger than a one-line change, and wait for approval before editing files.
- Skills and hooks live in `.claude/`.

### Hooks

Configured in `.claude/settings.json`; scripts in `.claude/hooks/`. Tests: `npm run test:hooks`.

- **protect-files** (PreToolUse on Edit/MultiEdit/Write): blocks edits to `.env` and `.env.*` (except `.env.example`) and to anything in `ios/` or `android/`, per AGENTS.md.
- **lint-edited-file** (PostToolUse on Edit/MultiEdit/Write): runs ESLint on the edited `.ts`/`.tsx`/`.js`/`.jsx` file. Errors are sent back to Claude to fix; warnings don't block.