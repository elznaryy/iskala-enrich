'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  User, 
  FileText, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Mail,
  Phone,
  Target,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserStats, getUserEnrichmentRequests, getUserResults } from '@/lib/database'

interface DashboardStats {
  totalRequests: number
  completedRequests: number
  pendingRequests: number
  totalCredits: number
  usedCredits: number
  remainingCredits: number
}

interface RecentActivity {
  id: string
  type: 'individual' | 'file'
  contact: string
  result: string
  status: string
  timestamp: string
  request_id: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  // Refresh dashboard data every 30 seconds to show updated stats
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchDashboardData()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Refresh more frequently if there are pending requests
  useEffect(() => {
    if (!user) return

    // Check if there are any pending requests
    const hasPendingRequests = recentActivity.some(activity => 
      activity.status === 'pending' || activity.status === 'processing'
    )

    if (hasPendingRequests) {
      const interval = setInterval(() => {
        fetchDashboardData()
      }, 10000) // Refresh every 10 seconds if there are pending requests

      return () => clearInterval(interval)
    }
  }, [user, recentActivity])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch user stats
      const { data: userStats } = await getUserStats(user.id)
      if (userStats) {
        setStats(userStats)
      }

      // Fetch recent requests
      const { data: requests } = await getUserEnrichmentRequests(user.id)
      if (requests) {
        const activity: RecentActivity[] = requests.slice(0, 5).map(request => ({
          id: request.id,
          type: request.request_type,
          contact: getContactDisplayName(request),
          result: getResultDisplay(request),
          status: request.status,
          timestamp: formatTimestamp(request.created_at),
          request_id: request.request_id
        }))
        setRecentActivity(activity)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getContactDisplayName = (request: any) => {
    if (request.request_type === 'individual') {
      const inputData = request.input_data?.data?.[0]
      if (inputData) {
        return `${inputData.first_name || 'Unknown'} ${inputData.last_name || ''} - ${inputData.company || 'Unknown Company'}`
      }
      return 'Individual Lookup'
    } else {
      return `File Upload (${request.input_data?.data?.length || 0} contacts)`
    }
  }

  const getResultDisplay = (request: any) => {
    switch (request.status) {
      case 'completed':
        return 'Done'
      case 'processing':
        return 'Processing...'
      case 'pending':
        return 'Pending...'
      case 'failed':
        return 'Failed'
      default:
        return 'Unknown status'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return `${Math.floor(diffInMinutes / 1440)} days ago`
  }

  const dashboardStats = [
    {
      name: 'Total Requests',
      value: stats?.totalRequests?.toString() || '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: Target,
      color: 'from-primary-500 to-primary-600'
    },
    {
      name: 'Credits Used',
      value: stats?.usedCredits?.toString() || '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: Zap,
      color: 'from-accent-500 to-accent-600'
    },
    {
      name: 'Completed',
      value: stats?.completedRequests?.toString() || '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'from-success-500 to-success-600'
    },
    {
      name: 'Remaining Credits',
      value: stats?.remainingCredits?.toString() || '0',
      change: '+0%',
      changeType: 'positive' as const,
      icon: BarChart3,
      color: 'from-warning-500 to-warning-600'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your enrichments.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="btn-secondary flex items-center"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/individual" className="group">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="w-8 h-8" />
              </div>
              <ArrowRight className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Individual Lookup</h3>
            <p className="opacity-90">Enrich single contacts instantly with email and phone data</p>
          </div>
        </Link>

        <Link href="/dashboard/file" className="group">
          <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-2xl p-8 text-white hover:from-accent-600 hover:to-accent-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <FileText className="w-8 h-8" />
              </div>
              <ArrowRight className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">File Enrichment</h3>
            <p className="opacity-90">Upload CSV/Excel files for bulk contact enrichment</p>
          </div>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.name}</p>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading recent activity...</p>
                </div>
              ) : recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mr-4">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'individual' 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-accent-100 text-accent-600'
                      }`}>
                        {activity.type === 'individual' ? (
                          <User className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{activity.contact}</h4>
                      <p className="text-sm text-gray-600">{activity.result}</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center ${
                        activity.status === 'completed' 
                          ? 'text-green-600' 
                          : 'text-yellow-600'
                      }`}>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        ) : (
                          <Clock className="w-4 h-4 mr-1" />
                        )}
                        <span className="text-xs font-medium capitalize">
                          {activity.status === 'completed' ? 'Done' : activity.status}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{activity.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-6">
          {/* Usage this month */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Usage This Month</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Credits Used</span>
                  <span className="text-sm font-medium">{stats?.usedCredits || 0} / {stats?.totalCredits || 50}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" 
                    style={{ width: `${stats ? Math.min((stats.usedCredits / stats.totalCredits) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Completed Requests</span>
                  <span className="text-sm font-medium">{stats?.completedRequests || 0} / {stats?.totalRequests || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-success-500 to-warning-500 h-2 rounded-full" 
                    style={{ width: `${stats && stats.totalRequests > 0 ? (stats.completedRequests / stats.totalRequests) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="block mt-4 text-center">
              <span className="text-sm text-gray-500">Plan management coming soon</span>
            </div>
          </div>

          {/* Quick tips */}
          <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl border border-primary-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💡 Quick Tips</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">Upload files with LinkedIn URLs for higher phone number match rates.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-accent-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">Include company domain for better email accuracy.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-success-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">Check our API docs for advanced integration options.</p>
              </div>
            </div>
            
            <Link href="/dashboard/help" className="block mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm">
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 