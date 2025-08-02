'use client'

import { useState } from 'react'
import { CheckCircle, Star } from 'lucide-react'
import { plans } from '@/lib/subscriptionPlans'

interface SubscriptionPlansProps {
  showPopular?: boolean
  className?: string
  onPlanSelect?: (planId: string) => void
}

export default function SubscriptionPlans({ 
  showPopular = true, 
  className = '',
  onPlanSelect 
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      // Get payment link from environment variables
      const paymentLinks = {
        'starter': process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_STARTER,
        'pro': process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_PRO,
        'growth': process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK_GROWTH
      }
      
      const paymentLink = paymentLinks[planId as keyof typeof paymentLinks]
      
      if (paymentLink) {
        // Call onPlanSelect callback if provided
        if (onPlanSelect) {
          onPlanSelect(planId)
        }
        
        // Open payment link
        window.open(paymentLink, '_blank')
      } else {
        console.error('Payment link not found for plan:', planId)
        alert('Payment link not available. Please try again later.')
      }
    } catch (error) {
      console.error('Error opening payment link:', error)
      alert('Unable to open payment page. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className={`grid md:grid-cols-3 gap-8 max-w-5xl mx-auto ${className}`}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative bg-white rounded-2xl border-2 p-8 ${
            plan.popular && showPopular
              ? 'border-primary-500 shadow-xl scale-105' 
              : 'border-gray-200 hover:shadow-lg transition-shadow duration-300'
          }`}
        >
          {plan.popular && showPopular && (
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </span>
            </div>
          )}
          
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>{plan.credits.toLocaleString()} Credits</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>{plan.credits.toLocaleString()} Valid emails</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Phone verification</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>API access</span>
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={loading === plan.id}
              className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                plan.popular && showPopular
                  ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 transform hover:-translate-y-1'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading === plan.id ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Get Started'
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
} 