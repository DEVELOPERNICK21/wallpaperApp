import Link from 'next/link';

const appPreviews = [
  {
    title: 'Nature Collection',
    description: 'Stunning landscapes and natural beauty',
    screenContent: {
      time: '7:59',
      date: 'Wed Dec 31',
      preview: 'nature',
      wallpaperName: 'Mountain Sunset',
      category: 'Nature',
    },
  },
  {
    title: 'Minimalist Collection',
    description: 'Clean, simple, elegant designs',
    screenContent: {
      time: '8:00',
      date: 'Wed Dec 31',
      preview: 'minimalist',
      wallpaperName: 'Abstract Flow',
      category: 'Minimalist',
    },
  },
  {
    title: 'Dark Mode Collection',
    description: 'Perfect for OLED displays',
    screenContent: {
      time: '8:00',
      date: 'Wed Dec 31',
      preview: 'dark',
      wallpaperName: 'Deep Space',
      category: 'Dark Mode',
    },
  },
];

const features = [
  {
    icon: '📥',
    title: 'Easy Download',
    description: 'Download wallpapers directly to your gallery with one tap',
  },
  {
    icon: '🎨',
    title: 'Apply Instantly',
    description: 'Set as home screen, lock screen, or both - no extra steps',
  },
  {
    icon: '🔄',
    title: 'Regular Updates',
    description: 'New wallpapers added weekly to keep your phone fresh',
  },
  {
    icon: '📱',
    title: 'HD Quality',
    description: 'High-resolution wallpapers optimized for all devices',
  },
];

const testimonials = [
  {
    name: 'Priya Sharma',
    rating: 5,
    text: 'Love the wallpapers! The quality is amazing and I love how easy it is to apply them. My phone looks so much better now.',
  },
  {
    name: 'Rahul Patel',
    rating: 5,
    text: 'Best wallpaper app I\'ve used. The minimalist collection is exactly what I was looking for. Highly recommend!',
  },
  {
    name: 'Ananya Reddy',
    rating: 5,
    text: 'Beautiful wallpapers and super easy to use. The regular updates keep things interesting. Worth every rupee!',
  },
];

export default function WallpaperPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Limited Time Offer Banner */}
      <div className="bg-red-600 py-2 text-center">
        <p className="text-sm font-semibold text-white">
          ⚡ LIMITED TIME OFFER - Get Premium Wallpapers for Just ₹59! ⚡
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              Trusted Tools
            </span>
          </div>
          <nav className="hidden gap-6 sm:flex">
            <Link
              href="/wallpaper"
              className="text-sm font-medium text-slate-300 hover:text-white">
              Wallpapers
            </Link>
            <Link
              href="/private"
              className="text-sm font-medium text-slate-400 hover:text-slate-200">
              Privacy Features
            </Link>
            <Link
              href="/subscribe"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Buy Now
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">
              Minimalist wallpapers for mindful living.
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              Visualize your style or browse beautiful collections. Updated
              automatically on your lock screen.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                Buy Now
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-600 bg-slate-800 px-8 py-4 text-lg font-semibold text-white transition hover:border-slate-500 hover:bg-slate-700">
                <span className="text-slate-400 line-through">₹299</span>
                <span className="text-white">₹59</span>
              </Link>
            </div>
          </div>
        </section>

        {/* App Previews Section */}
        <section className="bg-slate-900 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              {appPreviews.map((preview, index) => (
                <div key={index} className="flex flex-col items-center">
                  {/* Phone Mockup */}
                  <div className="relative mb-4">
                    <div className="h-[600px] w-[300px] rounded-[2.5rem] border-[8px] border-slate-700 bg-slate-800 p-2 shadow-2xl">
                      {/* Status Bar */}
                      <div className="mb-2 flex items-center justify-between px-4 py-1 text-xs text-white">
                        <span>woo</span>
                        <div className="flex items-center gap-1">
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                          <div className="h-1 w-1 rounded-full bg-white" />
                        </div>
                        <span>100%</span>
                      </div>

                      {/* Lock Screen Content */}
                      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                        <p className="mb-2 text-sm text-slate-400">
                          {preview.screenContent.date}
                        </p>
                        <p className="mb-8 text-6xl font-light text-slate-300">
                          {preview.screenContent.time}
                        </p>

                        {/* Wallpaper Preview Area */}
                        <div className="mb-4 w-full rounded-lg bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 p-8">
                          <div className="mb-2 text-sm font-medium text-white">
                            {preview.screenContent.wallpaperName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {preview.screenContent.category}
                          </div>
                        </div>

                        {/* Bottom Icons */}
                        <div className="mt-auto flex w-full items-center justify-between px-8 pb-4">
                          <div className="h-8 w-8 rounded-full border border-slate-600" />
                          <div className="h-8 w-8 rounded-full border border-slate-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {preview.title}
                  </h3>
                  <p className="text-center text-sm text-slate-400">
                    {preview.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-slate-800 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Why Choose Wallpaper Chat?
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Everything you need for beautiful phone wallpapers
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(feature => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center transition hover:border-slate-600">
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <h3 className="mb-2 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Devices */}
        <section className="bg-slate-900 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                Supported Devices
              </h2>
              <p className="mt-4 text-lg text-slate-300">
                Works seamlessly on both Android and iPhone. Set it as your lock
                screen wallpaper and watch it update automatically.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
                <div className="mb-4 text-5xl">🤖</div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  Android
                </h3>
                <p className="text-sm text-slate-400">
                  Compatible with all Android devices. Easy setup, automatic
                  updates on your lock screen.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center">
                <div className="mb-4 text-5xl">🍎</div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  iPhone
                </h3>
                <p className="text-sm text-slate-400">
                  Works perfectly on all iPhone models. Beautiful display,
                  seamless integration with iOS.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-slate-800 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                5 Star Rated
              </h2>
              <div className="mt-2 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-2xl text-amber-400">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="mt-4 text-lg text-slate-300">
                See why our users love Wallpaper Chat
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                  <div className="mb-3 flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400">
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="mb-4 text-sm text-slate-300">
                    "{testimonial.text}"
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {testimonial.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hidden Feature Teaser */}
        <section className="bg-slate-900 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8">
              <div className="mb-4 text-4xl">🔒</div>
              <h2 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
                Plus: Secure Messaging Features Included
              </h2>
              <p className="mb-6 text-slate-300">
                Wallpaper Chat isn't just about wallpapers. It also includes
                secure, end-to-end encrypted messaging features for privacy-conscious
                users.
              </p>
              <Link
                href="/private"
                className="inline-flex items-center justify-center rounded-full border-2 border-emerald-600 bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-700">
                Learn About Privacy Features
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Phone?
            </h2>
            <p className="mb-8 text-lg text-slate-300">
              Download Wallpaper Chat now and get access to thousands of
              beautiful wallpapers, plus secure messaging features.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100">
                Buy Now
              </Link>
              <Link
                href="/subscribe"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-slate-600 bg-slate-800 px-8 py-4 text-lg font-semibold text-white transition hover:border-slate-500 hover:bg-slate-700">
                <span className="text-slate-400 line-through">₹299</span>
                <span className="text-white">₹59</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <p className="mb-2 text-base font-semibold text-white">
                Trusted Tools
              </p>
              <p className="text-xs uppercase tracking-wider text-slate-400">
                Premium wallpapers & secure messaging
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-sm text-slate-400 hover:text-white">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-sm text-slate-400 hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-slate-400 hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/private"
                    className="text-sm text-slate-400 hover:text-white">
                    Privacy Features
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-6 text-center">
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} The Ultimate Trusted Tools. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
