'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Star } from 'lucide-react'
import { plans } from '@/lib/subscriptionPlans'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface SubscriptionPlansProps {
  showPopular?: boolean
  className?: string
  onPlanSelect?: (planId: string) => void
  redirectToSignup?: boolean  // New prop to control button behavior
}

export default function SubscriptionPlans({ 
  showPopular = true, 
  className = '',
  onPlanSelect,
  redirectToSignup = false
}: SubscriptionPlansProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const { user, profile } = useAuth()

  // Check if user is eligible for trial
  // For anonymous users (not logged in), show trial as available
  // For logged in users, check if they haven't used trial and never subscribed
  const canUseTrial = !user ? true : (profile && !profile.stripe_customer_id && !profile.trial_ends_at)

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      // Get plan details
      const plan = plans.find(p => p.id === planId)
      const isTrialStart = plan?.trial?.enabled && canUseTrial

      if (isTrialStart) {
        // Handle trial start
        console.log('Starting trial for plan:', planId)
        
        const response = await fetch('/api/trial/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user?.id
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to start trial')
        }

        console.log('Trial started successfully:', result)
        toast.success('🎉 Trial started! You now have 50 credits for 30 days.')
        
        // Call onPlanSelect callback if provided
        if (onPlanSelect) {
          onPlanSelect(planId)
        }

        // Redirect to dashboard after a short delay to show the toast
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
        return
      }

      // Handle regular subscription
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
        
        // Add prefilled email parameter if user is logged in
        let finalPaymentLink = paymentLink
        if (user?.email) {
          const separator = paymentLink.includes('?') ? '&' : '?'
          finalPaymentLink = `${paymentLink}${separator}prefilled_email=${encodeURIComponent(user.email)}`
        }
        
        console.log('Opening payment link with prefilled email:', finalPaymentLink)
        
        // Open payment link
        window.open(finalPaymentLink, '_blank')
      } else {
        console.error('Payment link not found for plan:', planId)
        toast.error('Payment link not available. Please try again later.')
      }
    } catch (error) {
      console.error('Error in handleSubscribe:', error)
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error(errorMessage)
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
              {plan.trial?.enabled && canUseTrial ? (
                <div>
                  <div className="text-sm text-green-600 font-semibold mb-1">
                    Free {plan.trial.days}-Day Trial
                  </div>
                  <div>
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/month after trial</span>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
              )}
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            
            {redirectToSignup ? (
              <Link
                href="/auth/signup"
                className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  plan.popular && showPopular
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-700 hover:to-accent-700 transform hover:-translate-y-1'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                {plan.trial?.enabled && canUseTrial ? 'Start Free Trial' : 'Get Started'}
              </Link>
            ) : (
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
                  plan.trial?.enabled && canUseTrial ? 'Start Free Trial' : 'Get Started'
                )}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
} 