#!/usr/bin/env node
// PostToolUse hook: runs ESLint on the edited file. Errors are sent back to Claude (exit 2); warnings are ignored.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const LINTABLE = new Set(['.ts', '.tsx', '.js', '.jsx']);

let input;
try {
  input = JSON.parse(fs.readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
const filePath = input?.tool_input?.file_path;
if (!filePath || !LINTABLE.has(path.extname(filePath))) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const abs = path.resolve(projectDir, filePath);
if (path.relative(projectDir, abs).startsWith('..') || !fs.existsSync(abs)) process.exit(0);

const eslint = path.join(projectDir, 'node_modules', '.bin', 'eslint');
if (!fs.existsSync(eslint)) process.exit(0); // deps not installed; skip silently

const result = spawnSync(eslint, ['--quiet', '--no-warn-ignored', abs], {
  cwd: projectDir,
  encoding: 'utf8',
});

if (result.status === 1) {
  // ESLint found errors (--quiet already filtered out warnings).
  process.stderr.write(
    `ESLint errors in ${path.relative(projectDir, abs)}. Fix them before continuing:\n${result.stdout}`,
  );
  process.exit(2);
}
if (result.status !== 0) {
  // Exit 2 or a crash means ESLint itself broke (bad config, etc.), not a lint error.
  // Exit 1 shows the message to the user without blocking Claude.
  process.stderr.write(`ESLint hook could not run: ${result.stderr || result.error}\n`);
  process.exit(1);
}
process.exit(0);
