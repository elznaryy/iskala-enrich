'use client'

import SubscriptionPlans from '@/components/SubscriptionPlans'
import SubscriptionCheck from '@/components/SubscriptionCheck'

export default function PricingPage() {
  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start with our free tier and scale as you grow. All plans include phone verification, 
              API access, and only charge for valid data.
            </p>
          </div>

          {/* Pricing Plans */}
          <SubscriptionPlans />
        </div>
      </div>
    </SubscriptionCheck>
  )
} 