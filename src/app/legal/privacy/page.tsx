import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - ShopMatch Pro',
  description: 'Privacy Policy for ShopMatch Pro job board platform',
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
          >
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: October 20, 2025</p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                ShopMatch Pro (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you use our job board platform 
                (&quot;Service&quot;, &quot;Platform&quot;).
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                By using the Service, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">2.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed">
                We collect information you voluntarily provide when using our Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                <li><strong>Profile Information:</strong> Job title, company name, bio, profile picture</li>
                <li><strong>Job Postings:</strong> Job descriptions, requirements, salary ranges, company information</li>
                <li><strong>Applications:</strong> Cover letters, contact information, application responses</li>
                <li><strong>Payment Information:</strong> Billing details (processed securely through Stripe)</li>
                <li><strong>Communications:</strong> Messages sent through our platform or to our support team</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">2.2 Information Automatically Collected</h3>
              <p className="text-gray-700 leading-relaxed">
                We automatically collect certain information when you use the Service:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Location Data:</strong> General location based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Session cookies, preferences, analytics data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Authentication Providers:</strong> Google OAuth (name, email, profile picture)</li>
                <li><strong>Payment Processors:</strong> Stripe (payment status, subscription information)</li>
                <li><strong>Analytics Services:</strong> Usage patterns and aggregated statistics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">We use your information to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Provide the Service:</strong> Enable job posting, applications, and account management</li>
                <li><strong>Process Payments:</strong> Handle subscriptions and billing</li>
                <li><strong>Improve the Service:</strong> Analyze usage patterns and optimize features</li>
                <li><strong>Communicate:</strong> Send notifications, updates, and customer support responses</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security threats</li>
                <li><strong>Legal Compliance:</strong> Comply with laws, regulations, and legal processes</li>
                <li><strong>Marketing:</strong> Send promotional content (with your consent, opt-out available)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Share Your Information</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.1 With Other Users</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Employers:</strong> See job seeker applications and contact information when applying</li>
                <li><strong>Job Seekers:</strong> See employer job postings and company information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.2 With Service Providers</h3>
              <p className="text-gray-700 leading-relaxed">We share information with trusted third-party service providers:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Firebase/Firestore:</strong> Database hosting and authentication</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Vercel:</strong> Hosting and deployment</li>
                <li><strong>Sentry:</strong> Error tracking and monitoring</li>
                <li><strong>Analytics Providers:</strong> Usage analytics and performance monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.3 For Legal Reasons</h3>
              <p className="text-gray-700 leading-relaxed">We may disclose your information if required by law or to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Comply with legal obligations, court orders, or government requests</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate fraud, security, or technical issues</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the 
                acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Encryption:</strong> Data transmitted over HTTPS/TLS</li>
                <li><strong>Authentication:</strong> Firebase Authentication with secure password hashing</li>
                <li><strong>Access Controls:</strong> Firestore security rules limiting data access</li>
                <li><strong>Monitoring:</strong> Sentry error tracking and security monitoring</li>
                <li><strong>Payment Security:</strong> PCI DSS compliant payment processing through Stripe</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your information for as long as necessary to provide the Service and comply with legal obligations:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days; some data retained for legal compliance</li>
                <li><strong>Job Postings:</strong> Archived after expiration, deleted after 90 days</li>
                <li><strong>Applications:</strong> Retained until deleted by user or employer</li>
                <li><strong>Payment Records:</strong> Retained for 7 years for tax and accounting purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">Depending on your location, you may have the following rights:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">7.1 Access and Portability</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Request a copy of your personal data</li>
                <li>Export your data in a machine-readable format</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">7.2 Correction and Deletion</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Update or correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">7.3 Opt-Out and Restriction</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Unsubscribe from marketing emails</li>
                <li>Disable cookies through browser settings</li>
                <li>Restrict processing of your data</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">7.4 Object to Processing</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Object to data processing for marketing purposes</li>
                <li>Withdraw consent for optional data collection</li>
              </ul>

              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, contact us at <strong>privacy@shopmatchpro.com</strong>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking technologies to improve your experience:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">8.1 Types of Cookies</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Essential Cookies:</strong> Required for authentication and basic functionality</li>
                <li><strong>Performance Cookies:</strong> Measure usage and optimize performance</li>
                <li><strong>Functional Cookies:</strong> Remember preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Track usage patterns (Google Analytics, Vercel Analytics)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">8.2 Managing Cookies</h3>
              <p className="text-gray-700 leading-relaxed">
                You can control cookies through your browser settings. Note that disabling cookies may affect Service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and stored on servers located outside your country. We ensure appropriate 
                safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Standard contractual clauses</li>
                <li>Privacy Shield certification (where applicable)</li>
                <li>Adequate data protection measures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information 
                from children. If we become aware that a child has provided us with personal information, we will delete it 
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Third-Party Links</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of 
                these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. California Privacy Rights (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion of personal information</li>
                <li>Right to non-discrimination for exercising CCPA rights</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-3">
                <strong>Note:</strong> We do not sell your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. European Privacy Rights (GDPR)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are in the European Economic Area (EEA), you have rights under the General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. Changes will be effective immediately upon posting. 
                We will notify you of significant changes via email or prominent notice on the Service. Continued use of 
                the Service after changes constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about this Privacy Policy or to exercise your privacy rights, contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">
                  <strong>Privacy Team</strong><br />
                  <strong>Email:</strong> privacy@shopmatchpro.com<br />
                  <strong>Data Protection Officer:</strong> dpo@shopmatchpro.com<br />
                  <strong>Website:</strong> <Link href="/" className="text-blue-600 hover:text-blue-800">shopmatchpro.com</Link>
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
