import Link from 'next/link';

export default function SubscribePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-slate-400 text-lg">
              Subscribe to unlock all features of Wallpaper Chat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Basic Plan */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h2 className="text-2xl font-bold mb-4">Basic</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-slate-300">
                <li>✓ All basic features</li>
                <li>✓ Standard wallpapers</li>
                <li>✓ 30-day message history</li>
                <li>✓ Basic privacy controls</li>
              </ul>
              <Link
                href="/payment?plan=basic"
                className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                Subscribe
              </Link>
            </div>

            {/* Premium Plan - Recommended */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 border-2 border-indigo-500 transform scale-105 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Recommended
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Premium</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹149</span>
                <span className="text-slate-300">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-slate-200">
                <li>✓ All basic features</li>
                <li>✓ Premium wallpapers (HD, exclusive)</li>
                <li>✓ 1-year message history</li>
                <li>✓ AI message features</li>
                <li>✓ Cloud backup</li>
                <li>✓ Priority support</li>
              </ul>
              <Link
                href="/payment?plan=premium"
                className="block w-full text-center bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg transition">
                Subscribe
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h2 className="text-2xl font-bold mb-4">Enterprise</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹499</span>
                <span className="text-slate-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-slate-300">
                <li>✓ Everything in Premium</li>
                <li>✓ Custom branding</li>
                <li>✓ Priority support</li>
                <li>✓ API access</li>
                <li>✓ White-label option</li>
                <li>✓ Dedicated account manager</li>
              </ul>
              <Link
                href="/payment?plan=enterprise"
                className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                Subscribe
              </Link>
            </div>
          </div>

          <div className="text-center text-slate-400">
            <p>All plans include encrypted messaging, privacy controls, and regular updates.</p>
            <p className="mt-2">
              Need help choosing?{' '}
              <Link href="#contact" className="text-indigo-400 hover:text-indigo-300">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

