'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

/**
 * Cookie Consent Banner Component
 * 
 * Displays a banner for GDPR/CCPA compliance allowing users to accept cookies.
 * Tracks user consent in localStorage and only shows on first visit.
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timeoutId = window.setTimeout(() => setShowBanner(true), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:bottom-4 sm:left-auto sm:right-4 sm:max-w-xl">
      <div className="rounded-lg border border-[#d9ded4] bg-white shadow-xl">
        <div className="flex flex-col gap-4 p-4" role="region" aria-label="Cookie consent">
          <div className="flex-1">
            <div className="mb-1 text-sm font-semibold text-[#171a16]">
              We use cookies
            </div>
            <p className="text-sm text-[#4f584c]">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. 
              By clicking &quot;Accept&quot;, you consent to our use of cookies.{' '}
              <Link 
                href="/legal/privacy" 
                className="font-medium text-[#0f766e] underline hover:text-[#115e59]"
              >
                Learn more
              </Link>
            </p>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={declineCookies}
              className="flex-1 rounded-md bg-[#eef1eb] px-4 py-2 text-sm font-medium text-[#4f584c] transition-colors hover:bg-[#e1e7dd] sm:flex-none"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="flex-1 rounded-md bg-[#0f766e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#115e59] sm:flex-none"
              aria-label="Accept cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
