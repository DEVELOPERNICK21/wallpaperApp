'use client';

import {Suspense} from 'react';
import {useSearchParams} from 'next/navigation';
import Link from 'next/link';

function PaymentFailedPageContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
          <p className="text-slate-400">
            We couldn't process your payment. Please try again.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <Link
            href="/subscribe"
            className="block w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all">
            Try Again
          </Link>
          <Link
            href="/"
            className="block w-full border border-slate-700 text-slate-300 py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all">
            Go to Home
          </Link>
        </div>

        <div className="mt-8 text-sm text-slate-500">
          <p>Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      }>
      <PaymentFailedPageContent />
    </Suspense>
  );
}

