'use client';

import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const plan = searchParams.get('plan');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirect to app or home
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-slate-400">
            Your {plan ? `${plan.charAt(0).toUpperCase() + plan.slice(1)}` : ''} subscription has
            been activated.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-700 rounded-xl p-6 mb-6">
          {paymentId && (
            <div className="mb-4">
              <p className="text-sm text-slate-400 mb-1">Payment ID</p>
              <p className="text-sm text-slate-300 font-mono">{paymentId}</p>
            </div>
          )}
          <p className="text-sm text-slate-400">
            Your subscription is now active. You can start using all premium features immediately.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-all">
            Go to Home
          </Link>
          <p className="text-xs text-slate-500">
            Redirecting automatically in {countdown} seconds...
          </p>
        </div>
      </div>
    </div>
  );
}

