export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Terms and Conditions</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                By accessing and using Wallpaper Chat (Disguise), you accept and agree to be bound
                by the terms and provision of this agreement. If you do not agree to abide by the
                above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Wallpaper Chat is a private messaging application disguised as a wallpaper app. The
                service provides:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>End-to-end encrypted messaging</li>
                <li>Private chat rooms and group conversations</li>
                <li>Wallpaper customization features</li>
                <li>Subscription-based premium features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To use certain features of the service, you must register for an account. You agree
                to:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all responsibility for activities under your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-slate-300 leading-relaxed mb-4">You agree NOT to use the service to:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Violate any laws or regulations</li>
                <li>Transmit harmful, threatening, abusive, or illegal content</li>
                <li>Infringe on intellectual property rights</li>
                <li>Spam, harass, or harm other users</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Use the service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Subscription and Payments</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Our service offers subscription plans with different features:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Subscriptions are billed monthly in advance</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You can cancel your subscription at any time</li>
                <li>Cancellation takes effect at the end of the current billing period</li>
                <li>We reserve the right to change pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-slate-300 leading-relaxed">
                The service and its original content, features, and functionality are owned by
                Wallpaper Chat and are protected by international copyright, trademark, patent,
                trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
              <p className="text-slate-300 leading-relaxed">
                Your use of the service is also governed by our Privacy Policy. Please review our
                Privacy Policy to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                We may terminate or suspend your account and access to the service immediately,
                without prior notice, for conduct that we believe violates these Terms or is harmful
                to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Disclaimer of Warranties</h2>
              <p className="text-slate-300 leading-relaxed">
                The service is provided "as is" and "as available" without any warranties of any
                kind, either express or implied. We do not warrant that the service will be
                uninterrupted, timely, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-300 leading-relaxed">
                In no event shall Wallpaper Chat be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any
                material changes by posting the new Terms on this page and updating the "Last
                updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any questions about these Terms, please contact us through our{' '}
                <a href="/contact" className="text-sky-400 hover:text-sky-300 underline">
                  Contact Us
                </a>{' '}
                page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

