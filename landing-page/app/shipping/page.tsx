export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Digital Service Delivery</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Wallpaper Chat is a digital service application. As such, there are no physical
                products to ship. All services are delivered digitally through:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Mobile application download (iOS and Android)</li>
                <li>Instant access to premium features upon subscription activation</li>
                <li>Cloud-based service delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Activation</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                Upon successful payment and subscription activation:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Instant Activation:</strong> Premium features are activated immediately
                  after payment confirmation
                </li>
                <li>
                  <strong>Email Confirmation:</strong> You will receive an email confirmation with
                  your subscription details
                </li>
                <li>
                  <strong>Account Access:</strong> Your account will be upgraded automatically
                  within the app
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. App Download and Installation</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                The Wallpaper Chat mobile application can be downloaded from:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>
                  <strong>Android:</strong> Direct APK download from our website or authorized
                  distribution channels
                </li>
                <li>
                  <strong>iOS:</strong> Direct IPA download or through authorized distribution
                  methods
                </li>
              </ul>
              <p className="text-slate-300 leading-relaxed mt-4">
                Download links are provided immediately upon account creation. No shipping or
                delivery time is required as the app is delivered digitally.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Delivery Time</h2>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <p className="text-slate-300 leading-relaxed">
                  <strong>Digital Services:</strong> All services are delivered instantly upon
                  payment confirmation. There is no shipping time or delivery delay for digital
                  products and services.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Geographic Availability</h2>
              <p className="text-slate-300 leading-relaxed">
                Wallpaper Chat is available worldwide. Since our service is digital, there are no
                geographic restrictions or shipping limitations. The service can be accessed from
                any location with internet connectivity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. System Requirements</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                To use our service, you need:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>A compatible mobile device (iOS or Android)</li>
                <li>Internet connection for app download and service access</li>
                <li>Sufficient storage space on your device for the app</li>
                <li>Appropriate permissions for app installation (for direct downloads)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Updates and Upgrades</h2>
              <p className="text-slate-300 leading-relaxed">
                App updates and feature upgrades are delivered automatically through the app or
                available for download from our website. No additional shipping or delivery process
                is required for updates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Access Issues</h2>
              <p className="text-slate-300 leading-relaxed mb-4">
                If you experience any issues accessing the service after subscription:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2 ml-4">
                <li>Check your internet connection</li>
                <li>Ensure you have the latest version of the app installed</li>
                <li>Log out and log back into your account</li>
                <li>Contact our support team for assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. No Physical Products</h2>
              <p className="text-slate-300 leading-relaxed">
                Please note that Wallpaper Chat does not sell or ship any physical products. All
                our offerings are digital services delivered through the mobile application and
                cloud infrastructure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-slate-300 leading-relaxed">
                For questions about service delivery or access, please visit our{' '}
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

