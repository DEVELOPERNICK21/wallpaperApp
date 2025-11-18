## Wallpaper Chat Landing Page

A marketing-ready landing site for the Wallpaper Chat product. Built with Next.js (App Router), TypeScript, and Tailwind CSS.

### Key Sections

- Hero with positioning, CTAs, and a live user counter
- Feature grid focused on disguise, notifications, privacy, and engagement
- “How it works” onboarding walkthrough
- Proof points pulled from the mobile app documentation
- Deployment CTA and contact footer

### Environment Variables

Create a `.env.local` file before running the project:

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
# Keep the key on one line – replace actual newlines with \n
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
# Optional fallbacks/baselines when Firestore is unavailable
NEXT_PUBLIC_SEEDED_USER_COUNT=2500
NEXT_PUBLIC_USER_COUNT_BASELINE=0
# iOS IPA download URL for QR code
NEXT_PUBLIC_IPA_DOWNLOAD_URL=https://your-domain.com/wallpaper-chat.ipa
```

- `fetchUserCount` queries the Firestore `Users` collection using the Admin SDK.
- If credentials are missing or Firestore is unreachable, the counter falls back to the seeded values.

### Getting Started

```bash
npm install
npm run dev
```

The site runs at [http://localhost:3000](http://localhost:3000).

### Deployment

- Works out-of-the-box on Vercel (`npm run build && npm start`)
- Set the same environment variables in your hosting provider
- Swap placeholder download/doc links in `app/page.tsx` before launch

### Download Setup

- **Android APK**: See `APK_DOWNLOAD_SETUP.md` for APK download setup
- **iOS IPA**: See `IPA_DOWNLOAD_SETUP.md` for iOS QR code setup

### Related Repos

- Mobile app: `../` (React Native project)
- Marketing assets and positioning docs live in the repository root (`MARKETING_*.md`)
