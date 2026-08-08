import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy - Realty Logic UK',
}

export default function CookiePolicyPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Cookie Policy</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: 8 August 2026</p>

        <div className="space-y-8 text-gray-700">
          <p className="leading-relaxed">
            This Cookie Policy explains how Realty Logic (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;)
            uses cookies and similar technologies when you visit realtylogic.co.uk (the
            &quot;Website&quot;). It should be read alongside our{' '}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">1. What are cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help
              the site work properly, remember preferences, and understand how visitors use the site.
              Similar technologies include local storage and pixels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">2. How we use cookies</h2>
            <p className="leading-relaxed">We may use cookies to:</p>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed">
              <li>Make the Website function securely and reliably</li>
              <li>Remember choices you make (such as cookie preferences)</li>
              <li>Understand how the Website is used so we can improve it</li>
              <li>Support essential features such as forms and account access</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">3. Types of cookies we use</h2>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-900">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">Essential</td>
                    <td className="px-4 py-3 leading-relaxed">
                      Required for core site functions, security, and remembering your cookie
                      choices. These cannot be switched off in our systems.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">Analytics</td>
                    <td className="px-4 py-3 leading-relaxed">
                      Help us understand how visitors use the Website (for example pages viewed and
                      traffic sources) so we can improve content and performance.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900 align-top">Functionality</td>
                    <td className="px-4 py-3 leading-relaxed">
                      Remember preferences and improve features such as forms and browsing
                      experience.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">4. Third-party cookies</h2>
            <p className="leading-relaxed">
              Some cookies may be set by trusted third parties that help us run the Website — for
              example hosting, analytics, or email delivery providers. Those providers process data
              under their own policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">5. Managing cookies</h2>
            <p className="leading-relaxed">
              You can control cookies through your browser settings. Most browsers let you block or
              delete cookies. If you disable essential cookies, parts of the Website may not work
              correctly.
            </p>
            <p className="leading-relaxed">
              You can also use browser tools or industry opt-out mechanisms for some analytics and
              advertising cookies where available.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">6. Changes to this policy</h2>
            <p className="leading-relaxed">
              We may update this Cookie Policy from time to time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">7. Contact us</h2>
            <p className="leading-relaxed">
              If you have questions about our use of cookies, contact us at:
            </p>
            <p className="leading-relaxed">
              Realty Logic
              <br />
              167-169 Great Portland St, London W1W 5PF
              <br />
              <a href="mailto:contact@realtylogic.co.uk" className="text-blue-600 hover:underline">
                contact@realtylogic.co.uk
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
