'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  User, 
  FileText, 
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Zap
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserCredits } from '@/lib/database'
import toast from 'react-hot-toast'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Individual Lookup', href: '/dashboard/individual', icon: User },
  { name: 'File Enrichment', href: '/dashboard/file', icon: FileText },
]

const bottomNavigation = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [credits, setCredits] = useState({ total: 50, used: 0 })
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  // Add error handling for missing environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Supabase environment variables are not configured')
      toast.error('Application configuration error. Please check environment variables.')
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchCredits()
    }
  }, [user])

  // Refresh credits every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchCredits()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [user])

  // Refresh credits more frequently if there are pending requests
  useEffect(() => {
    if (!user) return

    // Check if there are any pending requests by looking at credits usage
    const hasPendingRequests = credits.used > 0 && credits.used < credits.total

    if (hasPendingRequests) {
      const interval = setInterval(() => {
        fetchCredits()
      }, 10000) // Refresh every 10 seconds if there are pending requests

      return () => clearInterval(interval)
    }
  }, [user, credits])

  const fetchCredits = async () => {
    if (!user) return
    try {
      const { data, error } = await getUserCredits(user.id)
      if (!error && data) {
        setCredits({ total: data.total_credits, used: data.used_credits })
      }
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
      router.replace('/')
    } catch (error) {
      toast.error('Error signing out')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0 lg:flex-shrink-0`}>
        
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">i</span>
            </div>
            <span className="text-xl font-bold text-gray-900">iSkala Enrich</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {profile?.first_name && profile?.last_name 
                  ? `${profile.first_name} ${profile.last_name}`
                  : user.email?.split('@')[0] || 'User'
                }
              </div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
          
          {/* Credits display */}
          <div className="mt-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="w-4 h-4 text-primary-600 mr-2" />
                <span className="text-sm font-medium text-gray-900">Credits</span>
              </div>
              <span className="text-lg font-bold text-primary-600">{credits.total - credits.used}</span>
            </div>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((credits.used / credits.total) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className={`mr-3 w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            )
          })}
          
          {/* Logout */}
          <button 
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 w-5 h-5 text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4 ml-auto">
            {/* Quick actions */}
            <Link href="/dashboard/individual" className="btn-primary">
              Quick Lookup
            </Link>
            <Link href="/dashboard/file" className="btn-secondary">
              Upload File
            </Link>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 