'use client';

import React from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started',
      features: [
        'Access to PiyRox-3.5',
        '40 messages per 3 hours',
        'Basic file uploads',
        'Community support',
      ],
      cta: 'Get started',
      highlighted: false,
    },
    {
      name: 'Plus',
      price: '$20',
      period: '/month',
      description: 'For regular users',
      features: [
        'Access to all models',
        'Unlimited messages',
        'Advanced file uploads',
        'Priority support',
        'Custom instructions',
        'Faster response times',
      ],
      cta: 'Upgrade to Plus',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: '$200',
      period: '/month',
      description: 'For power users',
      features: [
        'Everything in Plus',
        'Advanced data analysis',
        'Custom model fine-tuning',
        'API access',
        'Dedicated support',
        'Advanced security',
      ],
      cta: 'Upgrade to Pro',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for annual plans.',
    },
    {
      question: 'Is there a free trial for Plus?',
      answer: 'Yes, we offer a 7-day free trial for Plus plan. No credit card required.',
    },
    {
      question: 'What happens if I exceed my message limit?',
      answer: 'On the Free plan, you can wait for the limit to reset. Plus and Pro plans have unlimited messages.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the plan that works best for you
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors mb-8 ${
                  plan.highlighted
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently asked questions</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
