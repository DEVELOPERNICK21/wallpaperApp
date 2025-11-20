import Link from 'next/link';

const sections = [
  {
    title: 'Purpose of Disguise',
    body: 'Wallpaper Chat (also called Disguise) hides an end-to-end encrypted messenger inside a premium wallpaper experience so vulnerable communities can coordinate safely. The disguise is built for lawful privacy—not to shield criminal behavior.',
  },
  {
    title: 'Data We Process',
    bullets: [
      'Account details: email, device identifiers, subscription tier, and billing metadata required by Razorpay/Stripe.',
      'Encrypted content: chats and media stay E2EE. We cannot decrypt your messages, even on legal request.',
      'Operational telemetry: crash logs and aggregated usage counts to keep the disguise stable and detect abuse.',
    ],
  },
  {
    title: 'How We Use Data',
    bullets: [
      'Authenticate users and maintain disguised sessions.',
      'Notify you about security updates, disguise packs, or critical incidents.',
      'Detect fraud or illegal use by monitoring payment anomalies and serious user reports.',
    ],
  },
  {
    title: 'What We Never Do',
    bullets: [
      'Sell or rent personal data to advertisers.',
      'Expose message contents in notifications or share them with third parties.',
      'Ignore valid law-enforcement requests—we respond when the request is lawful and scoped.',
    ],
  },
  {
    title: 'Acceptable Use',
    body: 'You may not use Wallpaper Chat for harassment, exploitation, terrorism, spam, or any illegal act. We reserve the right to suspend or delete accounts that violate these rules and to cooperate with authorities when we receive a lawful order.',
  },
  {
    title: 'User Responsibilities',
    bullets: [
      'Only on-board contacts you trust and report suspicious accounts immediately.',
      'Enable PIN + inactivity lock to protect the hidden inbox on lost devices.',
      'Keep proof that your communications are lawful in your jurisdiction.',
    ],
  },
  {
    title: 'Reporting & Contact',
    body: 'Email founders@wallpaperchat.app with evidence (timestamps, user IDs, screenshots) if you believe someone is abusing the platform. We triage urgent cases within 24 hours.',
  },
];

export const metadata = {
  title: 'Privacy Policy • Wallpaper Chat',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto w-full max-w-4xl px-6 py-16 sm:px-10">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Privacy & acceptable use
          </p>
          <h1 className="text-4xl font-semibold text-white">
            Wallpaper Chat Privacy Policy
          </h1>
          <p className="text-base text-slate-300">
            Updated November 2025. This document explains how we operate the
            disguised messenger, what data we retain, and how we respond to
            abuse.
          </p>
        </div>

        <div className="mt-12 space-y-6">
          {sections.map(section => (
            <section
              key={section.title}
              className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-8 shadow-[0_25px_80px_-60px_rgba(59,130,246,0.6)]">
              <h2 className="text-2xl font-semibold text-white">
                {section.title}
              </h2>
              {section.body ? (
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {section.body}
                </p>
              ) : null}
              {section.bullets ? (
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {section.bullets.map(point => (
                    <li key={point} className="flex gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <div className="mt-12 text-sm text-slate-400">
          <p>
            By installing or subscribing to Wallpaper Chat you agree to this
            policy and our acceptable-use rules. We may update the document as
            laws change—check back regularly.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center text-sky-400 underline decoration-sky-500/60 underline-offset-4 hover:text-sky-300">
            ← Back to landing page
          </Link>
        </div>
      </main>
    </div>
  );
}

