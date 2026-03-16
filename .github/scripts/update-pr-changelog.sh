#!/bin/bash
set -e

git fetch origin "$BASE_BRANCH"
commits=$(git log --pretty=format:"%s" "origin/$BASE_BRANCH..HEAD")

feat_commits=""
fix_commits=""
refactor_commits=""
docs_commits=""
test_commits=""
chore_commits=""
other_commits=""


while IFS= read -r commit; do

  [[ "$commit" =~ ^Merge ]] && continue

  [[ "$commit" =~ ^(WIP|wip|tmp|fixup|Fixup) ]] && continue

  [[ -z "$commit" ]] && continue

  if [[ "$commit" =~ ^feat ]]; then
    feat_commits+="- $commit"$'\n'
  elif [[ "$commit" =~ ^fix ]]; then
    fix_commits+="- $commit"$'\n'
  elif [[ "$commit" =~ ^refactor ]]; then
    refactor_commits+="- $commit"$'\n'
  elif [[ "$commit" =~ ^docs ]]; then
    docs_commits+="- $commit"$'\n'
  elif [[ "$commit" =~ ^test ]]; then
    test_commits+="- $commit"$'\n'
  elif [[ "$commit" =~ ^chore ]]; then
    chore_commits+="- $commit"$'\n'
  else
    other_commits+="- $commit"$'\n'
  fi
done <<< "$commits"

changelog=""

[[ -n "$feat_commits" ]] && changelog+="### Features"$'\n'"$feat_commits"$'\n'
[[ -n "$fix_commits" ]] && changelog+="### Bug Fixes"$'\n'"$fix_commits"$'\n'
[[ -n "$refactor_commits" ]] && changelog+="### Refactoring"$'\n'"$refactor_commits"$'\n'
[[ -n "$docs_commits" ]] && changelog+="### Documentation"$'\n'"$docs_commits"$'\n'
[[ -n "$test_commits" ]] && changelog+="### Tests"$'\n'"$test_commits"$'\n'
[[ -n "$chore_commits" ]] && changelog+="### Chores"$'\n'"$chore_commits"$'\n'
[[ -n "$other_commits" ]] && changelog+="### Other Changes"$'\n'"$other_commits"$'\n'

if [[ -z "$changelog" ]]; then
  echo "No commits to add"
  exit 0
fi

current_body=$(gh pr view "$PR_NUMBER" --json body -q .body)

if echo "$current_body" | grep -q "## Changes"; then
  echo "$current_body" > /tmp/pr_body.md

  changes_line=$(grep -n "## Changes" /tmp/pr_body.md | cut -d: -f1)

  if [[ -n "$changes_line" ]]; then
    next_section_line=$(tail -n +$((changes_line + 1)) /tmp/pr_body.md | grep -n "^## " | head -1 | cut -d: -f1)

    # Build new body: everything before Changes + new changelog + everything after old changelog
    {
      head -n "$changes_line" /tmp/pr_body.md
      echo ""
      echo "$changelog"
      
      if [[ -n "$next_section_line" ]]; then
        # Skip old changelog content and include next section onwards
        tail -n +$((changes_line + next_section_line)) /tmp/pr_body.md
      fi
    } > /tmp/pr_body_new.md

    new_body=$(cat /tmp/pr_body_new.md)
  else
    new_body="$current_body"
  fi
else
  new_body="$current_body"$'\n\n'"## Changes"$'\n\n'"$changelog"
fi

gh pr edit "$PR_NUMBER" --body "$new_body"

echo "✅ PR description updated with commits"
