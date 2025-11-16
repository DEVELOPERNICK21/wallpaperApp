#!/bin/bash
# Script to remove Firebase Admin SDK JSON from git history

echo "🔒 Removing Firebase Admin SDK JSON from git history..."

# Step 1: Make sure the file is deleted locally
rm -f landing-page/public/wallpemsg-firebase-adminsdk-fbsvc-0b7323047a.json

# Step 2: Remove from git index
git rm --cached landing-page/public/wallpemsg-firebase-adminsdk-fbsvc-0b7323047a.json 2>/dev/null || echo "File already removed from index"

# Step 3: Use git filter-repo (recommended) or filter-branch
if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo..."
    git filter-repo --path landing-page/public/wallpemsg-firebase-adminsdk-fbsvc-0b7323047a.json --invert-paths --force
else
    echo "Using git filter-branch (slower, but works)..."
    FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force --index-filter \
        'git rm --cached --ignore-unmatch landing-page/public/wallpemsg-firebase-adminsdk-fbsvc-0b7323047a.json' \
        --prune-empty --tag-name-filter cat -- --all
fi

echo "✅ Done! The file has been removed from git history."
echo ""
echo "⚠️  IMPORTANT: You need to force push to update the remote:"
echo "   git push --force-with-lease origin main"
echo ""
echo "⚠️  SECURITY: After pushing, you should:"
echo "   1. Regenerate the Firebase Admin SDK key in Firebase Console"
echo "   2. Update your .env.local with the new key"
echo "   3. The old key is compromised and should be revoked"

