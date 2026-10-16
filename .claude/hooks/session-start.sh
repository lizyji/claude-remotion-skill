#!/bin/bash
# SessionStart hook for Claude Code on the web: installs the Remotion project's
# dependencies so Claude can render videos right away.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR/videos"
npm install --no-audit --no-fund
