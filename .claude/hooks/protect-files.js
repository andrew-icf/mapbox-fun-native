#!/usr/bin/env node
// PreToolUse hook: blocks edits to .env files and to the generated ios/ and android/ folders.
const path = require('path');

function readStdin() {
  try {
    return JSON.parse(require('fs').readFileSync(0, 'utf8'));
  } catch {
    return null;
  }
}

const input = readStdin();
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const abs = path.resolve(projectDir, filePath);
const rel = path.relative(projectDir, abs);
const base = path.basename(abs);
const topDir = rel.split(path.sep)[0];

// .env.example is meant to be committed with placeholder values, so it's the one exception.
const isEnvFile = (base === '.env' || base.startsWith('.env.')) && base !== '.env.example';

let reason = null;
if (isEnvFile) {
  reason =
    `Blocked: ${rel} is an environment file and may hold secrets like EXPO_PUBLIC_MAPBOX_TOKEN. ` +
    `AGENTS.md: "Never commit .env or secrets." Ask the user to edit it themselves.`;
} else if (!rel.startsWith('..') && (topDir === 'ios' || topDir === 'android')) {
  reason =
    `Blocked: ${rel} is inside the generated ${topDir}/ folder. ` +
    `AGENTS.md: "ios/ and android/ are generated and git-ignored. Never edit them by hand; ` +
    `configure native behavior in app.json plugins." Make the change in app.json, then run npx expo prebuild --clean.`;
}

if (reason) {
  process.stderr.write(reason + '\n');
  process.exit(2);
}
process.exit(0);
