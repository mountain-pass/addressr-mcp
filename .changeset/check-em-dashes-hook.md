---
'@mountainpass/addressr-mcp': patch
---

Add pre-commit `scripts/check-em-dashes.sh` wired into `lint-staged` `*.md` block. Greps each staged markdown file for U+2014 (em-dash), prints `<file>:<lineno>:<content>` to stderr per match, and fails the commit with exit 1 when any match is found. Override with `git commit --no-verify` when intentional (e.g., quoted external text). `docs/problems/README-history.md` is skipped to preserve the forward-chronology archive of pre-hook prose. Closes P008.
