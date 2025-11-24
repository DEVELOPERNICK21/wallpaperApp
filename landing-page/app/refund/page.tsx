export default function RefundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Cancellation & Refund Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Subscription Cancellation</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                You may cancel your subscription at any time. Cancellation can be done through:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your account settings within the app</li>
                <li>Contacting our support team</li>
                <li>Emailing us at support@wallpaperchat.com</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                When you cancel your subscription, you will continue to have access to premium
                features until the end of your current billing period. After that, your account
                will revert to the free plan.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Refund Policy</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold mb-3 text-emerald-400">
                  7-Day Money-Back Guarantee
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  We offer a 7-day money-back guarantee for all new subscriptions. If you are not
                  satisfied with our service within the first 7 days of your subscription, you can
                  request a full refund.
                </p>
              </div>

              <h3 className="text-xl font-semibold mb-3 mt-6">Refund Eligibility</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Refunds are available under the following circumstances:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Within 7 days:</strong> Full refund for any reason (money-back guarantee)
                </li>
                <li>
                  <strong>Technical issues:</strong> If the service is unavailable for more than 48
                  hours due to our technical issues
                </li>
                <li>
                  <strong>Billing errors:</strong> If you were charged incorrectly or multiple times
                </li>
                <li>
                  <strong>Unauthorized charges:</strong> If your account was charged without your
                  authorization
                </li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Non-Refundable Situations</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Refunds will NOT be provided for:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Subscriptions cancelled after 7 days from the initial purchase</li>
                <li>Partial months of service</li>
                <li>Unused portions of your subscription</li>
                <li>Violation of our Terms of Service resulting in account termination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How to Request a Refund</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To request a refund, please contact us through:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  Email: <a href="mailto:support@wallpaperchat.com" className="text-sky-400 hover:text-sky-300 underline">support@wallpaperchat.com</a>
                </li>
                <li>
                  Contact form: <a href="/contact" className="text-sky-400 hover:text-sky-300 underline">Contact Us page</a>
                </li>
                <li>In-app support chat (for premium users)</li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Please include the following information in your refund request:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Your account email address</li>
                <li>Transaction ID or payment receipt</li>
                <li>Reason for refund request</li>
                <li>Date of purchase</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Refund Processing</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Once your refund request is approved:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Refunds will be processed within 5-10 business days</li>
                <li>Refunds will be issued to the original payment method</li>
                <li>You will receive an email confirmation once the refund is processed</li>
                <li>Bank processing times may vary (typically 3-5 business days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Automatic Renewal</h2>
              <p className="text-slate-300 leading-relaxed">
                Subscriptions automatically renew at the end of each billing period unless cancelled
                before the renewal date. You will be charged the subscription fee on the renewal
                date. To avoid being charged, cancel your subscription at least 24 hours before the
                renewal date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Changes to Pricing</h2>
              <p className="text-slate-300 leading-relaxed">
                We reserve the right to modify subscription prices. If we increase the price of your
                subscription, we will notify you at least 30 days in advance. You may cancel your
                subscription before the price change takes effect to avoid the new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Disputes</h2>
              <p className="text-slate-300 leading-relaxed">
                If you have any disputes regarding charges or refunds, please contact us first. We
                will work with you to resolve any issues. If we cannot resolve the dispute, you may
                contact your payment provider or bank for assistance.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                For questions about cancellations or refunds, please visit our{' '}
                <a href="/contact" className="text-sky-400 hover:text-sky-300 underline">
                  Contact Us
                </a>{' '}
                page or email us at{' '}
                <a href="mailto:support@wallpaperchat.com" className="text-sky-400 hover:text-sky-300 underline">
                  support@wallpaperchat.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

