'use client';

import {useEffect, useState, Suspense} from 'react';
import {useSearchParams, useRouter} from 'next/navigation';
import Script from 'next/script';

interface PlanDetails {
  name: string;
  price: number;
  originalPrice: number;
  savings: string;
  features: string[];
}

const plans: Record<string, PlanDetails> = {
  basic: {
    name: 'Basic',
    price: 300, // Amount in paise (₹3)
    originalPrice: 300,
    savings: '',
    features: [
      'End-to-end encrypted messaging',
      '1-on-1 & group chats (up to 10 members)',
      '30-day message history',
      'Standard wallpaper library',
      'PIN lock & inactivity auto-lock',
      'Disguised notifications',
      'Basic privacy controls',
      'Message search (last 30 days)',
    ],
  },
  premium: {
    name: 'Premium',
    price: 19900, // Amount in paise (₹199)
    originalPrice: 49900,
    savings: '60% OFF',
    features: [
      'Everything in Basic',
      'Unlimited chats & group members',
      'Unlimited message history',
      'Premium HD wallpapers (exclusive)',
      'Cloud backup & sync',
      'Advanced search (full history)',
      'Message pinning & advanced features',
      'Priority customer support',
      'Early access to new features',
      'No ads or limitations',
    ],
  },
  pro: {
    name: 'Pro',
    price: 49900, // Amount in paise (₹499)
    originalPrice: 99900,
    savings: '50% OFF',
    features: [
      'Everything in Premium',
      'Multi-device sync (up to 5 devices)',
      'Team collaboration tools',
      'Advanced admin controls',
      'Custom wallpaper uploads',
      'Bulk message management',
      'Export chat history',
      'Dedicated support channel',
      'Custom branding options',
      'API access (coming soon)',
    ],
  },
};

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const planType = searchParams.get('plan') || 'premium';
  const plan = plans[planType as keyof typeof plans];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<'userId' | 'phone'>('userId');

  useEffect(() => {
    // Get user ID from URL params or localStorage
    const urlUserId = searchParams.get('userId');
    const storedUserId =
      typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    const storedPhone =
      typeof window !== 'undefined' ? localStorage.getItem('userPhone') : null;
    const storedEmail =
      typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;
    const storedIdentifierType =
      typeof window !== 'undefined'
        ? (localStorage.getItem('identifierType') as 'userId' | 'phone' | null)
        : null;

    if (urlUserId) {
      setUserId(urlUserId);
      setIdentifierType('userId');
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', urlUserId);
        localStorage.setItem('identifierType', 'userId');
      }
    } else if (storedUserId) {
      setUserId(storedUserId);
      setIdentifierType('userId');
    } else if (storedPhone) {
      setUserPhone(storedPhone);
      setIdentifierType('phone');
    }

    if (storedIdentifierType) {
      setIdentifierType(storedIdentifierType);
    }

    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, [searchParams]);

  // Normalize phone number (remove spaces, dashes, parentheses)
  const normalizePhoneNumber = (phone: string): string => {
    return phone.replace(/[\s\-()]/g, '').trim();
  };

  const handlePayment = async () => {
    // Validate email
    if (!userEmail || !userEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    // Validate identifier (either userId or phone)
    let finalUserId: string | null = null;
    let phoneNumber: string | null = null;

    if (identifierType === 'userId') {
      const trimmedUserId = userId.trim();
      if (!trimmedUserId) {
        setError(
          'Please enter your Wallpaper Chat User ID so we can apply the plan to the correct account.',
        );
        return;
      }
      finalUserId = trimmedUserId;
    } else {
      const trimmedPhone = userPhone.trim();
      if (!trimmedPhone) {
        setError(
          'Please enter your mobile number so we can apply the plan to the correct account.',
        );
        return;
      }
      // Basic phone validation (at least 10 digits)
      const normalizedPhone = normalizePhoneNumber(trimmedPhone);
      if (normalizedPhone.length < 10 || !/^\d+$/.test(normalizedPhone)) {
        setError('Please enter a valid mobile number (at least 10 digits).');
        return;
      }
      phoneNumber = normalizedPhone;
    }

    if (typeof window !== 'undefined') {
      if (finalUserId) {
        localStorage.setItem('userId', finalUserId);
      }
      if (phoneNumber) {
        localStorage.setItem('userPhone', phoneNumber);
      }
      localStorage.setItem('userEmail', userEmail);
      localStorage.setItem('identifierType', identifierType);
    }

    setLoading(true);
    setError(null);

    try {
      // Create order on server
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: plan.price,
          currency: 'INR',
          planType: planType,
          userId: finalUserId || null,
          userPhone: phoneNumber || null,
          userEmail: userEmail,
        }),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(
          'Server returned an invalid response. Please check your API configuration.',
        );
      }

      const data = await response.json();

      if (!response.ok) {
        // Show more detailed error message
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}` 
          : data.error || 'Failed to create order';
        console.error('Order creation failed:', data);
        throw new Error(errorMessage);
      }

      const {orderId, amount, currency} = data;

      // Store identifiers in variables accessible to handler
      const paymentUserId = finalUserId;
      const paymentPhone = phoneNumber;

      // Check if Razorpay key is configured
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error(
          'Payment gateway not configured. Please contact support.',
        );
      }

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: amount,
        currency: currency,
        name: 'Wallpaper Chat',
        description: `${plan.name} Plan Subscription`,
        order_id: orderId,
        prefill: {
          email: userEmail,
        },
        theme: {
          color: '#a855f7',
        },
        handler: async function (response: any) {
          // Verify payment on server
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId: paymentUserId || null,
                userPhone: paymentPhone || null,
                planType: planType,
              }),
            });

            // Check if response is JSON
            const verifyContentType =
              verifyResponse.headers.get('content-type');
            if (
              !verifyContentType ||
              !verifyContentType.includes('application/json')
            ) {
              const text = await verifyResponse.text();
              console.error('Non-JSON response:', text);
              throw new Error(
                'Payment verification failed. Please contact support.',
              );
            }

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              // Redirect to success page or app
              router.push(
                `/payment/success?paymentId=${response.razorpay_payment_id}&plan=${planType}`,
              );
            } else {
              throw new Error(
                verifyData.error || 'Payment verification failed',
              );
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            router.push(
              `/payment/failed?error=${encodeURIComponent(error.message)}`,
            );
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      // Show detailed error message to user
      const errorMessage = error.message || 'Failed to initiate payment';
      setError(errorMessage);
      setLoading(false);
      
      // Log additional details for debugging
      if (error.message?.includes('gateway not configured')) {
        console.error('⚠️ Razorpay keys may not be configured correctly. Check environment variables.');
      }
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Plan</h1>
          <p className="text-slate-400 mb-6">
            The selected plan is not available.
          </p>
          <a
            href="/subscribe"
            className="inline-block px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
            Go Back to Plans
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => console.log('Razorpay script loaded')}
      />
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <a
                href="/subscribe"
                className="text-sky-400 hover:text-sky-300 inline-flex items-center gap-2">
                ← Back to Plans
              </a>
            </div>

            <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-8">
              <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
              <p className="text-slate-400 mb-8">
                Review your plan details and proceed to payment
              </p>

              {/* Plan Summary */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {plan.name} Plan
                    </h2>
                    {plan.savings && (
                      <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">
                        {plan.savings}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg text-slate-500 line-through">
                        ₹{plan.originalPrice / 100}
                      </span>
                      <span className="text-3xl font-bold text-white">
                        ₹{plan.price / 100}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">per month</p>
                  </div>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    What's included:
                  </h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-slate-300">
                        <svg
                          className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400"
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
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* User Email Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => {
                    setUserEmail(e.target.value);
                    setError(null); // Clear error when user types
                  }}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Identifier Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Identify Your Account <span className="text-red-400">*</span>
                </label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="identifierType"
                      value="userId"
                      checked={identifierType === 'userId'}
                      onChange={e => {
                        setIdentifierType('userId');
                        setError(null);
                      }}
                      className="mr-2 accent-purple-500"
                    />
                    <span className="text-sm text-slate-300">User ID</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="identifierType"
                      value="phone"
                      checked={identifierType === 'phone'}
                      onChange={e => {
                        setIdentifierType('phone');
                        setError(null);
                      }}
                      className="mr-2 accent-purple-500"
                    />
                    <span className="text-sm text-slate-300">Mobile Number</span>
                  </label>
                </div>
              </div>

              {/* User ID Input */}
              {identifierType === 'userId' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Wallpaper Chat User ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={e => {
                      setUserId(e.target.value);
                      setError(null);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('userId', e.target.value);
                      }
                    }}
                    placeholder="e.g. uid_xxxxxxxx (Profile → Subscription section)"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoComplete="off"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Find this inside the mobile app under Profile → Subscription.
                    If you tapped a plan from the app, it will be pre-filled automatically.
                  </p>
                </div>
              )}

              {/* Phone Number Input */}
              {identifierType === 'phone' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mobile Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={e => {
                      setUserPhone(e.target.value);
                      setError(null);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('userPhone', e.target.value);
                      }
                    }}
                    placeholder="e.g. +91 9876543210 or 9876543210"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoComplete="tel"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Enter the mobile number associated with your Wallpaper Chat account.
                    This should match the number in your Profile settings.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm font-semibold mb-2">⚠️ Error</p>
                  <p className="text-red-300 text-sm">{error}</p>
                  {error.includes('gateway not configured') && (
                    <p className="text-red-300 text-xs mt-2">
                      Please check that Razorpay keys are properly configured in environment variables.
                    </p>
                  )}
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={
                  loading ||
                  !userEmail ||
                  !userEmail.includes('@') ||
                  (identifierType === 'userId' && !userId.trim()) ||
                  (identifierType === 'phone' && !userPhone.trim())
                }
                className="w-full bg-purple-500 text-white py-4 rounded-lg font-semibold text-lg hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed transition-all">
                {loading ? 'Processing...' : `Pay ₹${plan.price / 100}`}
              </button>

              {/* Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-500">
                  🔒 Secure payment powered by Razorpay. Your payment
                  information is encrypted and secure.
                </p>
                {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('test') ? (
                  <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                    <p className="text-xs text-amber-400 font-semibold mb-2">
                      🧪 Test Mode Active
                    </p>
                    <p className="text-xs text-amber-300">
                      Use test card:{' '}
                      <code className="bg-slate-800 px-2 py-1 rounded">
                        4111 1111 1111 1111
                      </code>
                    </p>
                    <p className="text-xs text-amber-300 mt-1">
                      Any CVV and future expiry date will work.
                    </p>
                  </div>
                ) : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes(
                    'live',
                  ) ? (
                  <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                    <p className="text-xs text-emerald-400 font-semibold mb-2">
                      ✅ Live Mode Active
                    </p>
                    <p className="text-xs text-emerald-300">
                      Real payments will be processed. All transactions are
                      secure and encrypted.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                    <p className="text-xs text-red-400 font-semibold mb-2">
                      ⚠️ Payment Gateway Not Configured
                    </p>
                    <p className="text-xs text-red-300">
                      Please configure Razorpay keys in environment variables.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-slate-400">Secure Payment</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <p className="text-xs text-slate-400">Instant Activation</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-xs text-slate-400">7-Day Money Back</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PaymentPage() {
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
      <PaymentPageContent />
    </Suspense>
  );
}
