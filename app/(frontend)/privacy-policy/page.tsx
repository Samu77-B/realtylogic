import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Realty Logic UK',
}

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: 8 August 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <p>
            Welcome to RealtyLogic (&quot;we,&quot; &quot;our,&quot; &quot;us&quot;). We are committed to
            protecting your privacy and ensuring that your personal information is handled safely and
            responsibly. This Privacy Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website, realtylogic.co.uk (the &quot;Website&quot;).
          </p>
          <p>
            By using our Website, you consent to the practices described in this Privacy Policy. If you do
            not agree with our policies and practices, please do not use our Website.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">1. Information We Collect</h2>
          <p>We may collect and process the following types of information:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Personal Information:</strong> Name, email address, phone number, and payment details
              (for subscriptions or transactions).
            </li>
            <li>
              <strong>Property Information:</strong> Details about properties you list, manage, or inquire
              about.
            </li>
            <li>
              <strong>Account Information:</strong> Login credentials and user preferences.
            </li>
            <li>
              <strong>Technical Data:</strong> IP address, browser type, operating system, and device
              information.
            </li>
            <li>
              <strong>Usage Data:</strong> Pages visited, time spent on the Website, and interactions with
              features.
            </li>
            <li>
              <strong>Cookies and Tracking Technologies:</strong> Information collected through cookies and
              similar technologies (see our{' '}
              <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                Cookie Policy
              </Link>{' '}
              for more details).
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">2. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>To provide, operate, and maintain the Website and our services.</li>
            <li>To process transactions and manage payments securely.</li>
            <li>To personalize your experience and improve our services.</li>
            <li>To communicate with you about your account, property listings, or inquiries.</li>
            <li>To detect, prevent, and address security and technical issues.</li>
            <li>To comply with legal obligations and enforce our Terms of Service.</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">3. How We Share Your Information</h2>
          <p>
            We do not sell your personal information. However, we may share your information in the
            following circumstances:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Service Providers:</strong> We may share data with third-party service providers that
              help us operate our business, such as payment processors, hosting providers, and customer
              support platforms.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We may disclose information if required by law or to
              protect our legal rights.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger, sale, or acquisition, your
              information may be transferred to a new entity.
            </li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-900">4. Data Security</h2>
          <p>
            We take appropriate technical and organizational measures to protect your personal data from
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
            over the internet is completely secure, and we cannot guarantee absolute security.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">5. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Access &amp; Correction:</strong> Request access to or correction of your data.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your personal data.
            </li>
            <li>
              <strong>Opt-Out:</strong> Object to certain processing activities, including marketing
              communications.
            </li>
            <li>
              <strong>Data Portability:</strong> Request a copy of your data in a structured format.
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us at{' '}
            <a href="mailto:contact@realtylogic.co.uk" className="text-blue-600 hover:underline">
              contact@realtylogic.co.uk
            </a>
            .
          </p>

          <h2 className="text-xl font-semibold text-gray-900">6. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar technologies to improve user experience, analyze website traffic, and
            personalize content. For more details, refer to our{' '}
            <Link href="/cookie-policy" className="text-blue-600 hover:underline">
              Cookie Policy
            </Link>
            .
          </p>

          <h2 className="text-xl font-semibold text-gray-900">7. Third-Party Links</h2>
          <p>
            Our Website may contain links to third-party websites. We are not responsible for their privacy
            practices, and we encourage you to review their policies before providing any personal
            information.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with
            an updated &quot;Last Updated&quot; date. Your continued use of the Website after changes are
            made constitutes acceptance of the revised policy.
          </p>

          <h2 className="text-xl font-semibold text-gray-900">9. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy, please contact us at:</p>
          <p>
            RealtyLogic
            <br />
            Website:{' '}
            <a href="https://realtylogic.co.uk" className="text-blue-600 hover:underline">
              realtylogic.co.uk
            </a>
            <br />
            Email:{' '}
            <a href="mailto:contact@realtylogic.co.uk" className="text-blue-600 hover:underline">
              contact@realtylogic.co.uk
            </a>
          </p>
          <p>This Privacy Policy is effective as of the date mentioned above.</p>
        </div>
      </div>
    </div>
  )
}
