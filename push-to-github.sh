#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# ForThem — GitHub Push Script
# Run this ONCE from the ForThem project root:
#   chmod +x push-to-github.sh && ./push-to-github.sh
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit immediately on any error

# ── Config — change GITHUB_USERNAME to yours ─────────────────────────────────
GITHUB_USERNAME=""
REPO_NAME="ForThem"
# ─────────────────────────────────────────────────────────────────────────────

if [ -z "$GITHUB_USERNAME" ]; then
  echo ""
  echo "❌  Open push-to-github.sh and set GITHUB_USERNAME to your GitHub username."
  echo ""
  exit 1
fi

echo ""
echo "🚀  Creating GitHub repo and pushing ForThem..."
echo ""

# 1. Init git if needed
if [ ! -d ".git" ]; then
  git init
  echo "✅  Git initialized"
fi

# 2. Create the remote repo via GitHub API
echo "📦  Creating GitHub repository '$REPO_NAME'..."
echo "    (You'll be prompted for your GitHub Personal Access Token)"
echo "    Create one at: https://github.com/settings/tokens"
echo "    Required scope: repo"
echo ""
read -s -p "GitHub Personal Access Token: " GH_TOKEN
echo ""

HTTP_STATUS=$(curl -s -o /tmp/gh_response.json -w "%{http_code}" \
  -X POST \
  -H "Authorization: token $GH_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"Co-parenting mobile app — Phase 1 MVP\",
    \"private\": false,
    \"auto_init\": false
  }")

if [ "$HTTP_STATUS" = "201" ]; then
  echo "✅  Repository created: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
elif [ "$HTTP_STATUS" = "422" ]; then
  echo "ℹ️   Repository already exists, continuing with push..."
else
  echo "❌  Failed to create repo (HTTP $HTTP_STATUS)"
  cat /tmp/gh_response.json
  exit 1
fi

# 3. Stage all files
git add .

# 4. Commit
git commit -m "feat: Phase 1 — Expo TypeScript project foundation

- Expo React Native + TypeScript scaffolding
- React Navigation (Stack + Bottom Tabs)
- Supabase client with EXPO_PUBLIC_ env vars
- Screens: Login, Home, Calendar, Swaps, Expenses, Documents
- .env.example and README with full setup instructions"

# 5. Set remote
git remote remove origin 2>/dev/null || true
git remote add origin "https://$GITHUB_USERNAME:$GH_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# 6. Push
git branch -M main
git push -u origin main

echo ""
echo "✅  Done! Your repo is live:"
echo ""
echo "    🔗  https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "    Clone command:"
echo "    git clone https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""
