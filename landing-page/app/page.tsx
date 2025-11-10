import Link from 'next/link';
import {fetchUserCount} from '@/lib/userCount';
import {UserCounter} from '@/components/UserCounter';
import {UseCaseTabs} from '@/components/UseCaseTabs';

const featureColumns = [
  {
    title: 'Stealth Messaging ',
    description:
      'Chats sit behind a believable wallpaper experience. Switch to “disguise mode” in a tap and keep curious eyes guessing.',
    bullets: [
      'Launch into HD wallpapers before revealing chats',
      'On-device PIN lock and inactivity auto-lock',
      'No-app-name exposure: app title, icon, and copy stay wallpaper-themed',
    ],
  },
  {
    title: 'Disguised Notifications',
    description:
      'Push alerts never leak message content. Users see wallpaper updates while you keep end-to-end encrypted conversations flowing.',
    bullets: [
      'Randomized wallpaper headlines replace sender + message',
      'Works in foreground, background, and device-locked states',
      'Opt-in badges and notification toggles per user preference',
    ],
  },
  {
    title: 'Serious Privacy Controls',
    description:
      'Give communities granular control over what they share and with whom, without sacrificing a smooth messaging experience.',
    bullets: [
      'End-to-end encrypted 1:1 and group chats',
      'Granular read receipts, last seen, profile photo privacy',
      'Blocklists, group invite rules, and disguised presence',
    ],
  },
  {
    title: 'Built for Engagement',
    description:
      'Everything users expect from a modern messenger remains—just hidden in plain sight for safety-focused communities.',
    bullets: [
      'Pinned messages, replies, lightning-fast search',
      'Real-time online status + typing indicators',
      'Optimized Firestore usage for 95% fewer reads',
    ],
  },
];

const steps = [
  {
    title: 'Download & Disguise',
    copy: 'Users land on a premium wallpaper library that doubles as the app’s cover story.',
  },
  {
    title: 'Unlock Secure Chat',
    copy: 'Authenticate once. A PIN-protected inbox fades in behind the wallpaper gallery.',
  },
  {
    title: 'Communicate Freely',
    copy: 'Encrypted chats, groups, and media sharing—without a single exposed notification.',
  },
];

const proofPoints = [
  '95% reduction in Firestore reads for cost-efficient scale',
  'Cross-platform support (Android + iOS) with native-feeling UI',
  'Production-ready Firebase Auth, Firestore, Storage, FCM stack',
  'Battle-tested privacy guardrails documented and QA’d',
];

export default async function Home() {
  const baseline =
    Number.parseInt(process.env.NEXT_PUBLIC_USER_COUNT_BASELINE ?? '', 10) || 0;
  const userCount = await fetchUserCount({baseline});

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(148,_163,_184,_0.25),_rgba(15,_23,_42,_0.9))]" />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-20 sm:px-10 lg:px-12">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full bg-slate-800/60 px-4 py-1 text-sm font-medium uppercase tracking-widest text-slate-300">
              Private messaging in plain sight
            </span>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl sm:leading-tight">
              Wallpaper Chat keeps conversations{' '}
              <span className="text-sky-400">invisible</span> until you want
              them seen.
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              A privacy-first messenger disguised as a wallpaper app. Perfect
              for activists, journalists, and tight-knit communities that need
              secure, deniable communication without drawing attention.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="#download"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200">
                Download Android Build
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600">
                Request a Private Demo
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-[0_30px_80px_-40px_rgba(8,47,73,0.8)]">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              Trusted users
            </p>
            <UserCounter target={userCount} />
            <p className="mt-4 text-sm text-slate-400">
              Real-time count of people communicating safely with Wallpaper
              Chat. Syncs directly from your Firebase `Users` collection or
              optional env-based fallback.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <p className="font-semibold text-white">Stealth by default</p>
                <p className="mt-2 text-slate-400">
                  Wallpaper-first UX, disguised notifications, fake update logs.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                <p className="font-semibold text-white">Secure workflows</p>
                <p className="mt-2 text-slate-400">
                  E2EE messaging, granular privacy toggles, and screen lock.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Choose-your-cover use cases
            </h2>
            <p className="max-w-3xl text-base text-slate-300">
              Wallpaper Chat adapts to whatever cover story your team needs. Tap
              through the scenarios below to see how privacy tooling maps to
              different audiences.
            </p>
          </div>
          <UseCaseTabs />
        </section>

        <section className="grid gap-10 lg:grid-cols-2">
          {featureColumns.map(feature => (
            <article
              key={feature.title}
              className="flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 shadow-[0_18px_50px_-35px_rgba(14,116,144,0.7)] backdrop-blur">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {feature.title}
                </h2>
                <p className="mt-3 text-base text-slate-300">
                  {feature.description}
                </p>
              </div>
              <ul className="mt-2 space-y-2 text-sm text-slate-400">
                {feature.bullets.map(bullet => (
                  <li key={bullet} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-400" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] border border-slate-800 bg-slate-900/50 p-10 backdrop-blur">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-4">
              <h2 className="text-3xl font-semibold text-white">
                Seamless onboarding, zero learning curve
              </h2>
              <p className="text-base text-slate-300">
                Wallpaper Chat feels familiar from the first tap. The onboarding
                journey mirrors leading messengers while reinforcing the
                disguise narrative end-to-end.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 lg:gap-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {step.copy}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold text-white">
              Built on a production-ready privacy stack
            </h2>
            <p className="text-base text-slate-300">
              Wallpaper Chat is not a prototype. It ships with hardened
              workflows, QA’d edge cases, and documentation for every privacy
              feature—ready for regulated or high-risk audiences.
            </p>
            <ul className="space-y-3 text-sm text-slate-300">
              {proofPoints.map(point => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full bg-emerald-400" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/40 p-8">
            <h3 className="text-lg font-semibold text-white">
              Ready-to-market messaging kit
            </h3>
            <p className="mt-3 text-sm text-slate-400">
              Use the included marketing playbooks to launch: 90-day growth
              agenda, acquisition scripts, and audience positioning crafted for
              privacy-first products.
            </p>
            <div className="mt-6 grid gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="font-semibold text-white">
                  Core positioning angles
                </p>
                <p className="mt-1 text-slate-400">
                  Invisible messenger, threat-safe teamwork, whistleblower
                  collaboration, discreet personal sharing.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                <p className="font-semibold text-white">Platform playbooks</p>
                <p className="mt-1 text-slate-400">
                  Reddit, Telegram, X, and Product Hunt go-to-market assets
                  already prepared—no blank page syndrome.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="download"
          className="rounded-[32px] border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 p-10 text-center shadow-[0_30px_80px_-40px_rgba(8,47,73,0.9)]">
          <h2 className="text-3xl font-semibold text-white">
            Launch Wallpaper Chat in your community
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300">
            Deploy the React Native app on Android and iOS, or integrate the
            Next.js marketing site into your existing stack. Need help? We have
            detailed docs plus ready-to-run Firebase infrastructure.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="https://example.com/wallpaper-chat.apk"
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
              Get the latest APK
            </Link>
            <Link
              href="https://example.com/docs"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-base font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-600">
              Explore technical docs
            </Link>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="border-t border-slate-800/80 bg-slate-950/90 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-white">Wallpaper Chat</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">
              Discreet. Secure. Ready to deploy.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right sm:text-left">
            <Link
              href="mailto:founders@wallpaperchat.app"
              className="hover:text-slate-200">
              founders@wallpaperchat.app
            </Link>
            <p>Secure briefings available upon request.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
