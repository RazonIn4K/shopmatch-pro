import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - ShopMatch Pro',
  description: 'Terms of Service for ShopMatch Pro job board platform',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
          >
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: October 20, 2025</p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using ShopMatch Pro (&quot;Service&quot;, &quot;Platform&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). 
                If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                ShopMatch Pro is a job board platform that connects employers with job seekers. The Service allows:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Employers to post job listings and manage applications</li>
                <li>Job seekers to browse and apply for job opportunities</li>
                <li>Subscription-based access to premium features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">3.1 Account Registration</h3>
              <p className="text-gray-700 leading-relaxed">
                You must create an account to access certain features of the Service. You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Keep your password secure and confidential</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">3.2 Account Types</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li><strong>Employer Accounts:</strong> For posting job listings and managing applications</li>
                <li><strong>Job Seeker Accounts:</strong> For browsing jobs and submitting applications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">3.3 Account Responsibility</h3>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for all activities that occur under your account. We reserve the right to suspend or 
                terminate accounts that violate these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Subscription and Payments</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.1 Subscription Plans</h3>
              <p className="text-gray-700 leading-relaxed">
                Employers may subscribe to our Pro plan for $29 USD per month, which includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Unlimited job postings</li>
                <li>Access to applicant management tools</li>
                <li>Priority customer support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.2 Billing</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Subscriptions are billed monthly in advance</li>
                <li>Payments are processed through Stripe</li>
                <li>All fees are in USD and non-refundable except as required by law</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">4.3 Cancellation</h3>
              <p className="text-gray-700 leading-relaxed">
                You may cancel your subscription at any time through your account dashboard. Cancellations take effect at 
                the end of the current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content and Conduct</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">5.1 Content Ownership</h3>
              <p className="text-gray-700 leading-relaxed">
                You retain ownership of all content you post on the Service. By posting content, you grant us a worldwide, 
                non-exclusive, royalty-free license to use, display, and distribute your content in connection with the Service.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">5.2 Prohibited Content</h3>
              <p className="text-gray-700 leading-relaxed">You agree not to post content that:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Is false, misleading, or fraudulent</li>
                <li>Violates any law or regulation</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains discriminatory or harassing language</li>
                <li>Includes malware, spam, or phishing attempts</li>
                <li>Promotes illegal activities</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">5.3 Job Postings</h3>
              <p className="text-gray-700 leading-relaxed">Employers agree that all job postings must:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
                <li>Be for legitimate job opportunities</li>
                <li>Accurately describe the position and requirements</li>
                <li>Comply with equal opportunity employment laws</li>
                <li>Not require illegal activities or unethical practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service, including its design, features, and content (excluding user-generated content), is owned by 
                ShopMatch Pro and protected by copyright, trademark, and other intellectual property laws. You may not copy, 
                modify, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your use of the Service is also governed by our <Link href="/legal/privacy" className="text-blue-600 hover:text-blue-800">Privacy Policy</Link>. 
                We collect, use, and protect your data as described in the Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Disclaimers and Limitation of Liability</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">8.1 Service &quot;As Is&quot;</h3>
              <p className="text-gray-700 leading-relaxed">
                The Service is provided &quot;as is&quot; without warranties of any kind, either express or implied. We do not guarantee 
                that the Service will be uninterrupted, secure, or error-free.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">8.2 User Interactions</h3>
              <p className="text-gray-700 leading-relaxed">
                We are not responsible for interactions between employers and job seekers. We do not verify the accuracy of 
                job postings or user profiles. Users engage with each other at their own risk.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-3">8.3 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, ShopMatch Pro shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any 
                other reason at our sole discretion. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We may modify these Terms at any time. Changes will be effective immediately upon posting. Continued use of the 
                Service after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which ShopMatch 
                Pro operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@shopmatchpro.com<br />
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
    </div>
  );
}
