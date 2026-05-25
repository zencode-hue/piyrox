'use client';

import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For casual users and those trying out our service.',
      features: [
        'Access to PiyRox-3.5',
        '20 messages per day',
        'Standard response speed',
        'Community support',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Plus',
      price: '$20',
      period: '/month',
      description: 'For users who need more power and features.',
      features: [
        'Access to all models (PiyRox-4, 4o, 3.5, Jarvis-V3)',
        'Unlimited messages',
        'Faster response times',
        'Priority support',
        'Access to new features first',
      ],
      cta: 'Upgrade to Plus',
      highlighted: true,
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards and PayPal.',
    },
    {
      question: 'Is there a free trial for the Plus plan?',
      answer: 'We do not offer a free trial at this time, but you can use the Free plan to get a feel for our service.',
    },
    {
      question: 'What happens if I exceed my message limit on the Free plan?',
      answer: 'You will have to wait until the next day for your message limit to reset. To get unlimited messages, you can upgrade to the Plus plan.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Pricing Plans</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose a plan that fits your needs. Get started for free.
          </p>
        </div>
      </header>

      {/* Pricing Cards */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg border transition-all ${
                plan.highlighted
                  ? 'border-green-500 dark:border-green-400 shadow-lg dark:shadow-green-900/20 scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              } p-8`}
            >
              {plan.highlighted && (
                <div className="mb-4 inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
              </div>

              <Link href={plan.name === 'Free' ? '/signup' : '/signup?plan=plus'}>
                <button
                  className={`w-full py-3 rounded-lg font-medium transition-colors mb-8 ${
                    plan.highlighted
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* FAQ */}
      <section className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
