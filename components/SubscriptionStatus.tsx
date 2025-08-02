'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Calendar, Zap, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionStatusProps {
  className?: string
}

export default function SubscriptionStatus({ className = '' }: SubscriptionStatusProps) {
  const { user } = useAuth()
  const [subscriptionData, setSubscriptionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchSubscriptionData()
    }
  }, [user])

  const fetchSubscriptionData = async () => {
    try {
      // Fetch user profile with subscription data
      const response = await fetch(`/api/user/subscription?userId=${user?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setSubscriptionData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCustomerPortal = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href })
      })
      
      const data = await response.json()
      
      if (data.portalUrl) {
        window.open(data.portalUrl, '_blank')
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      alert('Unable to open subscription management. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!subscriptionData) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Subscription</h3>
          <p className="text-gray-600 mb-4">
            Subscribe to a plan to start enriching leads
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="btn-primary"
          >
            View Plans
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getPlanName = (planType: string) => {
    const plans: Record<string, string> = {
      'starter': 'Starter',
      'pro': 'Pro',
      'growth': 'Growth'
    }
    return plans[planType] || 'Unknown'
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Status</h3>
        <button
          onClick={openCustomerPortal}
          className="flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          <Settings className="w-4 h-4 mr-1" />
          Manage
        </button>
      </div>

      <div className="space-y-4">
        {/* Current Plan */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-gray-600">Current Plan</span>
          </div>
          <span className="font-semibold text-gray-900">
            {getPlanName(subscriptionData.plan_type)}
          </span>
        </div>

        {/* Credits */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Zap className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-gray-600">Credits Remaining</span>
          </div>
          <span className="font-semibold text-gray-900">
            {subscriptionData.remaining_credits?.toLocaleString() || '0'}
          </span>
        </div>

        {/* Billing Period */}
        {subscriptionData.current_period_end && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <span className="text-gray-600">Next Billing</span>
            </div>
            <span className="font-semibold text-gray-900">
              {formatDate(subscriptionData.current_period_end)}
            </span>
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Status</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            subscriptionData.status === 'active' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscriptionData.status === 'active' ? 'Active' : 'Past Due'}
          </span>
        </div>
      </div>
    </div>
  )
} 