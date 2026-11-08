#!/usr/bin/env bash
# Tests for the Claude Code hooks in .claude/hooks/. Run: npm run test:hooks
set -u
cd "$(dirname "$0")/.."
export CLAUDE_PROJECT_DIR="$PWD"

PROTECT=.claude/hooks/protect-files.js
LINT=.claude/hooks/lint-edited-file.js
ERR_FIXTURE="src/__hook_test_error__.ts"
WARN_FIXTURE="src/__hook_test_warning__.ts"
CLEAN_FIXTURE="src/__hook_test_clean__.ts"
trap 'rm -f "$ERR_FIXTURE" "$WARN_FIXTURE" "$CLEAN_FIXTURE"' EXIT

pass=0; fail=0
payload() { printf '{"tool_input":{"file_path":"%s"}}' "$1"; }

# expect <name> <expected-exit> <script> <stdin> [stderr-substring]
expect() {
  local name=$1 want=$2 script=$3 input=$4 needle=${5:-}
  local err got
  err=$(printf '%s' "$input" | node "$script" 2>&1 >/dev/null); got=$?
  if [[ $got -ne $want ]]; then
    echo "FAIL: $name (exit $got, expected $want)"; echo "$err" | sed 's/^/    /'; fail=$((fail+1)); return
  fi
  if [[ -n $needle && $err != *"$needle"* ]]; then
    echo "FAIL: $name (stderr missing \"$needle\")"; echo "$err" | sed 's/^/    /'; fail=$((fail+1)); return
  fi
  echo "ok:   $name"; pass=$((pass+1))
}

# protect-files
expect "blocks .env"                 2 $PROTECT "$(payload "$PWD/.env")" "AGENTS.md"
expect "blocks .env.local"           2 $PROTECT "$(payload "$PWD/.env.local")" "AGENTS.md"
expect "blocks .env.production"      2 $PROTECT "$(payload "$PWD/.env.production")"
expect "allows .env.example"         0 $PROTECT "$(payload "$PWD/.env.example")"
expect "blocks ios/"                 2 $PROTECT "$(payload "$PWD/ios/Podfile")" "AGENTS.md"
expect "blocks android/"             2 $PROTECT "$(payload "$PWD/android/build.gradle")" "AGENTS.md"
expect "allows nested android dir"   0 $PROTECT "$(payload "$PWD/src/android/foo.ts")"
expect "allows src file"             0 $PROTECT "$(payload "$PWD/src/apollo.ts")"
expect "ignores malformed input"     0 $PROTECT "not json"

# lint-edited-file
printf 'var x = 1;\nexport default x;\n' > "$ERR_FIXTURE"
printf 'const unused = 1;\nexport {};\n' > "$WARN_FIXTURE"
printf 'export const ok = 1;\n' > "$CLEAN_FIXTURE"
expect "clean file passes"           0 $LINT "$(payload "$PWD/$CLEAN_FIXTURE")"
expect "skips non-JS files"          0 $LINT "$(payload "$PWD/README.md")"
expect "lint error blocks"           2 $LINT "$(payload "$PWD/$ERR_FIXTURE")" "no-var"
expect "lint warning does not block" 0 $LINT "$(payload "$PWD/$WARN_FIXTURE")"
expect "ignores malformed input"     0 $LINT "not json"

echo; echo "$pass passed, $fail failed"
[[ $fail -eq 0 ]]
