import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wallpaper — HD Wallpapers & Year Progress on iPhone & Android',
  description:
    'Transform your phone with thousands of HD wallpapers and year progress. Dynamic Island & Lock Screen on iPhone; home screen & lock screen widgets on Android. One-tap set, weekly new drops. Get Premium.',
  openGraph: {
    title: 'Wallpaper — Beautiful wallpapers & year progress on iPhone & Android',
    description: 'HD wallpapers, Dynamic Island (iPhone), widgets (Android). One app.',
    url: '/wallpaper',
  },
};

const appPreviews = [
  {
    title: 'Nature',
    description: 'Landscapes and natural beauty',
    badge: 'Popular',
    gradient: 'from-emerald-900/80 via-teal-900/60 to-slate-900',
  },
  {
    title: 'Minimalist',
    description: 'Clean, elegant designs',
    badge: null,
    gradient: 'from-stone-700 via-neutral-800 to-slate-900',
  },
  {
    title: 'Dynamic Island & Widgets',
    description: 'Year progress on iPhone (Dynamic Island) and Android (widgets)',
    badge: 'New',
    gradient: 'from-amber-950/80 via-orange-950/50 to-slate-950',
  },
];

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
    title: 'HD wallpapers',
    description: 'High-resolution wallpapers for home and lock screen. Set with one tap.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: 'Year progress',
    description: 'iPhone: Dynamic Island & Lock Screen. Android: home screen & lock screen widgets. Days passed, days left.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: 'Live Activities & widgets',
    description: 'iPhone: Live Activities on Dynamic Island and Lock Screen. Android: always-on widgets. No opening the app.',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    title: 'Weekly drops',
    description: 'New wallpapers added regularly. Nature, minimalist, anime, and more.',
  },
];

const testimonials = [
  {
    name: 'Priya S.',
    role: 'iPhone user',
    rating: 5,
    text: 'The Dynamic Island year progress is so satisfying. Plus the wallpapers are actually HD. Finally an app that does both well.',
  },
  {
    name: 'Rahul P.',
    role: 'Android user',
    rating: 5,
    text: "The home screen widget shows my year progress at a glance. I wanted something that made me aware of time without being depressing. This is it.",
  },
  {
    name: 'Ananya R.',
    role: 'Design lover',
    rating: 5,
    text: 'Minimalist collection is exactly my taste. One-tap set as wallpaper and it just works. Worth every rupee for Premium.',
  },
];

export default function WallpaperPage() {
  return (
    <div className="min-h-screen bg-[#0c0a09] text-white">
      {/* Urgency strip — warm amber, subtle */}
      <div className="bg-gradient-to-r from-amber-600/90 to-amber-500/90 py-2.5 text-center">
        <p className="text-sm font-semibold text-amber-950 tracking-wide">
          Intro price — Premium ₹99 (was ₹299). One-time, no subscription. iPhone & Android. Widgets & all wallpapers.
        </p>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0c0a09]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <span className="text-xl font-bold tracking-tight text-white">Wallpaper</span>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/wallpaper#features"
              className="text-sm font-medium text-stone-400 hover:text-amber-400 transition"
            >
              Features
            </Link>
            <Link
              href="/subscribe"
              className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-400"
            >
              Get Premium
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-16 sm:pt-20 pb-20 sm:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.12),transparent)] pointer-events-none" />
          <div className="relative mx-auto max-w-3xl text-center space-y-6">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400/90">
              Wallpapers + Year Progress
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Transform your phone with wallpapers that matter
            </h1>
            <p className="text-lg text-stone-400 sm:text-xl max-w-2xl mx-auto">
              Thousands of HD wallpapers. Year progress on Dynamic Island & Lock Screen (iPhone) and home screen & lock screen widgets (Android). One app, beautifully done.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/subscribe"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-amber-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#0c0a09]"
              >
                Unlock Premium — ₹99
              </Link>
              <Link
                href="/subscribe"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-stone-600 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 hover:border-stone-500"
              >
                <span className="text-stone-500 line-through">₹299</span>
                <span className="text-amber-400">Save 67%</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Previews — 3 pillars */}
        <section className="border-y border-white/5 bg-stone-950/50 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              {appPreviews.map((preview, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="relative mb-5">
                    <div className={`h-[520px] w-[260px] rounded-[2.25rem] border-[6px] border-stone-700 bg-stone-900 overflow-hidden shadow-2xl ${preview.gradient}`}>
                      <div className="flex h-full flex-col p-4">
                        <div className="flex items-center justify-between text-xs text-white/80 mb-2">
                          <span>9:41</span>
                          <div className="flex gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                            <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                          {preview.badge && (
                            <span className={`mb-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${preview.badge === 'New' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {preview.badge}
                            </span>
                          )}
                          <p className="text-lg font-semibold text-white">{preview.title}</p>
                          <p className="text-sm text-white/60 mt-1">{preview.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{preview.title}</h3>
                  <p className="mt-1 text-sm text-stone-400">{preview.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — Why choose */}
        <section id="features" className="py-16 sm:py-24 bg-[#0c0a09]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Why people choose Wallpaper
              </h2>
              <p className="mt-3 text-lg text-stone-400 max-w-xl mx-auto">
                Beautiful wallpapers and time awareness, without opening the app.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/10 bg-stone-900/60 p-6 transition hover:border-amber-500/30 hover:bg-stone-900/80"
                >
                  <div className="mb-4 text-amber-400">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm text-stone-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="py-16 sm:py-24 border-t border-white/5 bg-stone-950/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Loved by people who care about design and time
              </h2>
              <div className="mt-3 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400" aria-hidden>★</span>
                ))}
                <span className="ml-2 text-sm text-stone-400">5.0</span>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-stone-900/40 p-6"
                >
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} aria-hidden>★</span>
                    ))}
                  </div>
                  <p className="text-stone-300 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                  <p className="mt-4 text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-stone-500">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Premium CTA block */}
        <section className="py-16 sm:py-24 bg-[#0c0a09]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/40 to-stone-950 p-10 sm:p-14">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Unlock widgets & all wallpapers on iPhone & Android
              </h2>
              <p className="mt-3 text-stone-400 max-w-lg mx-auto">
                One-time purchase. No subscription. Free updates included.
              </p>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm text-stone-400">
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> iPhone: Dynamic Island & Lock Screen
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> Android: home & lock screen widgets
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> Full HD wallpaper library
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-amber-400">✓</span> Year progress & countdown
                </li>
              </ul>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/subscribe"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-amber-950 hover:bg-amber-400 transition"
                >
                  Get Premium — ₹99
                </Link>
                <span className="text-sm text-stone-500">
                  <span className="line-through">₹299</span> · Save 67%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Soft privacy teaser */}
        <section className="py-12 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <p className="text-sm text-stone-500">
              Plus: secure messaging features for privacy-conscious users.{' '}
              <Link href="/private" className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2">
                Learn more
              </Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-stone-950">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to make your phone look and feel better?
            </h2>
            <p className="mt-3 text-stone-400">
              Download on iPhone or Android. Unlock Premium once and enjoy everything.
            </p>
            <div className="mt-8">
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-amber-950 hover:bg-amber-400 transition"
              >
                Get Premium — ₹99
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#0c0a09] py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-semibold text-white">Wallpaper</p>
              <p className="text-xs text-stone-500 mt-0.5">Premium wallpapers & year progress</p>
            </div>
            <div className="flex gap-6">
              <Link href="/terms" className="text-sm text-stone-500 hover:text-stone-300">Terms</Link>
              <Link href="/privacy" className="text-sm text-stone-500 hover:text-stone-300">Privacy</Link>
              <Link href="/contact" className="text-sm text-stone-500 hover:text-stone-300">Contact</Link>
              <Link href="/private" className="text-sm text-stone-500 hover:text-stone-300">Privacy features</Link>
            </div>
          </div>
          <p className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-stone-600">
            © {new Date().getFullYear()} Wallpaper. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
