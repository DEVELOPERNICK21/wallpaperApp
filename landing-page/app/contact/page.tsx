'use client';

import {useState} from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({name: '', email: '', subject: '', message: ''});
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-slate-400 mb-12">
            Have a question or need help? We're here to assist you.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>📧</span> Email
                  </h3>
                  <a
                    href="mailto:support@wallpaperchat.com"
                    className="text-sky-400 hover:text-sky-300 underline">
                    support@wallpaperchat.com
                  </a>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>⏰</span> Response Time
                  </h3>
                  <p className="text-slate-300">
                    We typically respond within 24-48 hours during business days.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                    <span>💬</span> Support Hours
                  </h3>
                  <p className="text-slate-300">
                    Monday - Friday: 9:00 AM - 6:00 PM IST
                    <br />
                    Saturday - Sunday: Limited support
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mt-8">
                  <h3 className="text-lg font-semibold mb-3">Premium Support</h3>
                  <p className="text-slate-300 text-sm">
                    Premium and Pro subscribers receive priority support with faster response times
                    and dedicated assistance.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
              {submitted ? (
                <div className="bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">✓</div>
                  <p className="text-emerald-400 font-semibold">
                    Thank you! Your message has been sent.
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={e => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="refund">Refund Request</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Report a Bug</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={e => setFormData({...formData, message: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer text-slate-200">
                  How do I cancel my subscription?
                </summary>
                <p className="text-slate-300 mt-3 ml-4">
                  You can cancel your subscription anytime from your account settings or by
                  contacting our support team. Visit our{' '}
                  <a href="/refund" className="text-sky-400 hover:text-sky-300 underline">
                    Cancellation & Refund Policy
                  </a>{' '}
                  for more details.
                </p>
              </details>

              <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer text-slate-200">
                  How do I request a refund?
                </summary>
                <p className="text-slate-300 mt-3 ml-4">
                  We offer a 7-day money-back guarantee. Contact us within 7 days of your purchase
                  to request a refund. See our{' '}
                  <a href="/refund" className="text-sky-400 hover:text-sky-300 underline">
                    Refund Policy
                  </a>{' '}
                  for complete details.
                </p>
              </details>

              <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer text-slate-200">
                  I'm having trouble accessing premium features
                </summary>
                <p className="text-slate-300 mt-3 ml-4">
                  Premium features are activated instantly after payment. If you're experiencing
                  issues, try logging out and back in, or contact our support team for assistance.
                </p>
              </details>

              <details className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                <summary className="font-semibold cursor-pointer text-slate-200">
                  How do I download the app?
                </summary>
                <p className="text-slate-300 mt-3 ml-4">
                  Download links are available on our homepage. The app is delivered digitally with
                  instant access. See our{' '}
                  <a href="/shipping" className="text-sky-400 hover:text-sky-300 underline">
                    Shipping Policy
                  </a>{' '}
                  for more information.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

