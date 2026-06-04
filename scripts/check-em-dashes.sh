#!/usr/bin/env bash
# Fail the commit when any passed file contains U+2014 (em-dash).
# Invoked by lint-staged on staged *.md files; the staged file paths arrive as positional args.
# Policy: project memory feedback_no_em_dashes.md forbids em-dashes in user-facing prose.
# Override: `git commit --no-verify` (per JTBD-103 maintainer persona escape hatch).
# See: docs/problems/known-error/008-no-automated-em-dash-detection.md

set -u

if [ "$#" -eq 0 ]; then
  exit 0
fi

EM_DASH=$'\xe2\x80\x94'

matched=0
for file in "$@"; do
  if [ ! -f "$file" ]; then
    continue
  fi
  # README-history.md is the forward-chronology archive of displaced README.md
  # line 3 fragments per P134 / wr-itil:manage-problem SKILL "Last-reviewed
  # line discipline". Historical entries must be preserved verbatim, including
  # legacy em-dashes from before this hook existed.
  case "$file" in
    */README-history.md|README-history.md) continue ;;
    # docs/decisions/README.md is the auto-generated ADR compendium
    # (wr-architect-generate-decisions-compendium per ADR-077). The generator
    # emits U+2014 mechanically. Skip ONLY this generated file - hand-authored
    # ADR bodies under docs/decisions/ are still checked. See P016.
    docs/decisions/README.md|*/docs/decisions/README.md) continue ;;
  esac
  if matches=$(grep -nF -- "$EM_DASH" "$file"); then
    while IFS= read -r line; do
      printf '%s:%s\n' "$file" "$line" >&2
    done <<<"$matches"
    matched=1
  fi
done

if [ "$matched" -ne 0 ]; then
  printf '\nerror: em-dash (U+2014) found in the files above. Replace with a hyphen, comma, semicolon, or rephrase.\nOverride with `git commit --no-verify` if intentional.\n' >&2
  exit 1
fi

exit 0
