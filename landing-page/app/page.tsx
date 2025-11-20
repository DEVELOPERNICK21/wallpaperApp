import Link from 'next/link';
import {headers} from 'next/headers';
import {fetchUserCount} from '@/lib/userCount';
import {fetchUsageStats} from '@/lib/usageStats';
import {UserCounter} from '@/components/UserCounter';
import {UsageStats} from '@/components/UsageStats';
import {UseCaseTabs} from '@/components/UseCaseTabs';
import {IPADownloadQR} from '@/components/IPADownloadQR';

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
const policyHighlights = [
  {
    title: 'Data minimization',
    copy: 'Only account basics + encrypted telemetry are retained; chats stay E2EE even under legal request.',
  },
  {
    title: 'Acceptable use',
    copy: 'Disguise is for lawful privacy. We suspend harassment, exploitation, or terror-related activity.',
  },
  {
    title: 'Abuse response',
    copy: '24h triage on credible reports plus cooperation with valid legal orders keeps you protected.',
  },
];

const pricingPlans = [
  {
    name: 'Basic',
    price: 'Free',
    priceSubtext: 'Forever',
    features: [
      'End-to-end encrypted messaging',
      '1-on-1 & group chats (up to 10 members)',
      '30-day message history',
      'Standard wallpaper library',
      'PIN lock & inactivity auto-lock',
      'Disguised notifications',
      'Basic privacy controls',
      'Message search (last 30 days)',
    ],
    limitations: [
      'Limited to 5 active chats',
      'Standard wallpapers only',
      '30-day message retention',
    ],
    ctaHref: '/subscribe',
    ctaLabel: 'Get Started Free',
    isPrimary: false,
    value: 'Perfect for trying out private messaging',
  },
  {
    name: 'Premium',
    price: '₹199',
    cadence: 'per month',
    originalPrice: '₹499',
    priceSubtext: 'Save ₹3,600/year',
    savings: '60% OFF',
    features: [
      'Everything in Basic',
      'Unlimited chats & group members',
      'Unlimited message history',
      'Premium HD wallpapers (exclusive collection)',
      'Cloud backup & sync',
      'Advanced search (full history)',
      'Message pinning & advanced features',
      'Priority customer support',
      'Early access to new features',
      'No ads or limitations',
    ],
    ctaHref: '/subscribe',
    ctaLabel: 'Start Premium Trial',
    isPrimary: true,
    value: 'Best value for privacy-conscious users',
    popular: true,
  },
  {
    name: 'Pro',
    price: '₹499',
    cadence: 'per month',
    originalPrice: '₹999',
    priceSubtext: 'Save ₹6,000/year',
    savings: '50% OFF',
    features: [
      'Everything in Premium',
      'Multi-device sync (up to 5 devices)',
      'Team collaboration tools',
      'Advanced admin controls',
      'Custom wallpaper uploads',
      'Bulk message management',
      'Export chat history',
      'Dedicated support channel',
      'Custom branding options',
      'API access (coming soon)',
    ],
    ctaHref: '#contact',
    ctaLabel: 'Contact Sales',
    isPrimary: false,
    value: 'For teams & power users',
  },
];

export default async function Home() {
  const baseline =
    Number.parseInt(process.env.NEXT_PUBLIC_USER_COUNT_BASELINE ?? '', 10) || 0;
  const userCount = await fetchUserCount({baseline});
  const usageStats = await fetchUsageStats();
  
  // IPA download URL - construct absolute URL for QR code
  // QR codes need absolute URLs to work when scanned from a phone
  let ipaDownloadUrl = process.env.NEXT_PUBLIC_IPA_DOWNLOAD_URL;
  
  if (!ipaDownloadUrl) {
    // Construct absolute URL from headers or Vercel env
    const headersList = await headers();
    const host = headersList.get('host') || process.env.VERCEL_URL || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' || process.env.VERCEL_URL ? 'https' : 'http';
    // Ensure host doesn't already include protocol
    const cleanHost = host.replace(/^https?:\/\//, '');
    ipaDownloadUrl = `${protocol}://${cleanHost}/wallpe.ipa`;
  }

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
                href="/wallpaper-chat.apk"
                download="wallpaper-chat.apk"
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

        <section className="space-y-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Growing community, active conversations
            </h2>
            <p className="max-w-2xl text-base text-slate-300">
              See how much activity is happening on Wallpaper Chat. Real-time
              statistics show the scale of secure communication happening right
              now.
            </p>
          </div>
          <UsageStats
            users={usageStats.users}
            chats={usageStats.chats}
            messages={usageStats.messages}
          />
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

        <section
          id="pricing"
          className="space-y-8 rounded-[32px] border border-slate-800/70 bg-slate-950/40 p-10 shadow-[0_40px_120px_-60px_rgba(56,189,248,0.5)]">
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              Choose Your Plan
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Subscribe to unlock all features of Wallpaper Chat
            </p>
          </div>
          
          {/* Limited Time Offer Banner */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-6 text-center">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-200">
                🎉 Launch Special
              </span>
              <p className="text-base font-semibold text-amber-100">
                Up to 60% OFF on Premium & Pro plans - Limited time only!
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {pricingPlans.map(plan => (
              <article
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 text-left transition-all ${
                  plan.isPrimary
                    ? 'border-purple-500/60 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-slate-900/70 shadow-[0_20px_60px_-30px_rgba(147,51,234,0.6)] scale-105 z-10'
                    : 'border-slate-700/70 bg-slate-900/70 hover:border-slate-600 hover:scale-102'
                }`}>
                {/* Badge */}
                {(plan.isPrimary || plan.popular) && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-purple-500 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
                      Recommended
                    </span>
                  </div>
                )}

                {/* Savings Badge */}
                {plan.savings && (
                  <div className="absolute -top-3 -right-3">
                    <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      {plan.savings}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white">
                    {plan.name}
                  </h3>
                  
                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      {plan.originalPrice ? (
                        <span className="text-lg text-slate-500 line-through">
                          {plan.originalPrice}
                        </span>
                      ) : null}
                      <span className="text-4xl font-bold text-white">
                        {plan.price}
                      </span>
                      {plan.cadence ? (
                        <span className="text-base text-slate-400">/{plan.cadence.replace('per ', '')}</span>
                      ) : null}
                    </div>
                    {plan.priceSubtext && (
                      <p className="text-xs text-emerald-400 font-medium">
                        {plan.priceSubtext}
                      </p>
                    )}
                  </div>

                  {/* Value Proposition */}
                  {plan.value && (
                    <p className="text-sm text-slate-400 italic">
                      {plan.value}
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-3">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Limitations (for Free tier) */}
                {plan.limitations && plan.limitations.length > 0 && (
                  <div className="mt-4 rounded-lg border border-slate-700/50 bg-slate-950/50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Limitations
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {plan.limitations.map(limitation => (
                        <li key={limitation} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-600" />
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <div className="mt-8">
                  <Link
                    href={plan.ctaHref}
                    className={`block w-full rounded-lg px-6 py-3 text-center text-base font-semibold transition-all focus:outline-none focus-visible:ring-2 ${
                      plan.isPrimary
                        ? 'bg-purple-500 text-white hover:bg-purple-600 hover:shadow-lg hover:shadow-purple-500/50 focus-visible:ring-purple-400'
                        : 'border border-slate-600 bg-slate-800/50 text-slate-200 hover:border-slate-500 hover:bg-slate-800 focus-visible:ring-slate-600'
                    }`}>
                    {plan.ctaLabel || 'Subscribe'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
          
          {/* Trust & Guarantee Section */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
              <div className="mb-2 text-2xl">🔒</div>
              <p className="text-sm font-semibold text-white">7-Day Money Back</p>
              <p className="mt-1 text-xs text-slate-400">
                Not satisfied? Get full refund, no questions asked
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
              <div className="mb-2 text-2xl">⚡</div>
              <p className="text-sm font-semibold text-white">Cancel Anytime</p>
              <p className="mt-1 text-xs text-slate-400">
                No long-term contracts, cancel with one click
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-slate-900/50 p-4 text-center">
              <div className="mb-2 text-2xl">🛡️</div>
              <p className="text-sm font-semibold text-white">Secure & Private</p>
              <p className="mt-1 text-xs text-slate-400">
                End-to-end encryption, your data stays yours
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              All plans include encrypted messaging, privacy controls, and regular updates.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Need help choosing?{' '}
              <Link
                href="#contact"
                className="text-sky-400 hover:text-sky-300 underline">
                Contact us
              </Link>
            </p>
            <p className="mt-4 text-xs text-slate-500">
              *Prices shown are in Indian Rupees (INR). Launch pricing valid for limited time.
            </p>
          </div>
        </section>

        <section
          id="policy-overview"
          className="rounded-[32px] border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-10 shadow-[0_35px_90px_-60px_rgba(15,118,110,0.8)]">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm uppercase tracking-[0.4em] text-emerald-400/80">
              Privacy policy snapshot
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">
              Built for lawful secrecy, not bad actors
            </h2>
            <p className="mx-auto max-w-3xl text-base text-slate-300">
              Wallpaper Chat keeps hidden chats invisible while setting strict
              rules against illegal use. Every subscriber agrees to cooperate
              with our acceptable-use policy and understands we suspend misuse.
            </p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {policyHighlights.map(highlight => (
              <article
                key={highlight.title}
                className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 text-left">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">
                  {highlight.title}
                </p>
                <p className="mt-3 text-sm text-slate-300">{highlight.copy}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-full border border-emerald-400/60 px-6 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40">
              Read the full privacy policy
            </Link>
          </div>
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
          
          {/* Download Options */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {/* Android APK Download */}
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-6 backdrop-blur">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">
                  Download for Android
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  Get the latest APK file for Android devices
                </p>
              </div>
              
              {/* Android Icon Visual Element */}
            <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-600/5 p-8 border border-emerald-500/30 shadow-lg">
              <img
                src="/android-logo-svgrepo-com.svg"
                alt="Android download icon"
                loading="lazy"
                className="h-28 w-28 drop-shadow-md"
              />
              </div>
              
              <Link
                href="/wallpaper-chat.apk"
                download="wallpaper-chat.apk"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-slate-950">
                  <path
                    d="M12 15.577l-3.539-3.538 1.423-1.423L12 12.73l2.116-2.115 1.423 1.423L12 15.577zM21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5h2v5h14v-5h2z"
                    fill="currentColor"
                  />
                </svg>
                Download APK
              </Link>
            </div>

            {/* iOS IPA Download with QR Code */}
            <IPADownloadQR
              ipaUrl={ipaDownloadUrl}
              title="Install on iOS"
              description="Scan with your iPhone camera to install"
            />
          </div>

          {/* Additional Links */}
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/subscribe"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
              Subscribe Now
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
            <Link
              href="/privacy"
              className="text-xs text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-slate-200">
              Privacy Policy & Acceptable Use
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
