import Link from 'next/link';

const pricingPlans = [
  {
    name: 'Basic',
    price: '₹3',
    cadence: 'per month',
    priceSubtext: 'Affordable entry plan',
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
    ctaHref: '/payment?plan=basic',
    ctaLabel: 'Subscribe to Basic',
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
    ctaHref: '/payment?plan=premium',
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
    ctaHref: '/payment?plan=pro',
    ctaLabel: 'Contact Sales',
    isPrimary: false,
    value: 'For teams & power users',
  },
];

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 sm:text-5xl">Choose Your Plan</h1>
            <p className="text-slate-300 text-lg">
              Subscribe to unlock all features of Wallpaper Chat
            </p>
          </div>

          {/* Limited Time Offer Banner */}
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent p-6 text-center mb-8">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-200">
                🎉 Launch Special
              </span>
              <p className="text-base font-semibold text-amber-100">
                Up to 60% OFF on Premium & Pro plans - Limited time only!
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {pricingPlans.map(plan => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl border p-8 text-left transition-all ${
                  plan.isPrimary
                    ? 'border-purple-500/60 bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-slate-900/70 shadow-[0_20px_60px_-30px_rgba(147,51,234,0.6)] scale-105 z-10'
                    : 'border-slate-700/70 bg-slate-900/70 hover:border-slate-600'
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
                  <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                  
                  {/* Pricing */}
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      {plan.originalPrice ? (
                        <span className="text-lg text-slate-500 line-through">
                          {plan.originalPrice}
                        </span>
                      ) : null}
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
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
                    <p className="text-sm text-slate-400 italic">{plan.value}</p>
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
              </div>
            ))}
          </div>

          {/* Trust & Guarantee Section */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
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

          <div className="text-center text-slate-400">
            <p>All plans include encrypted messaging, privacy controls, and regular updates.</p>
            <p className="mt-2">
              Need help choosing?{' '}
              <Link href="#contact" className="text-sky-400 hover:text-sky-300 underline">
                Contact us
              </Link>
            </p>
            <p className="mt-4 text-xs text-slate-500">
              *Prices shown are in Indian Rupees (INR). Launch pricing valid for limited time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

