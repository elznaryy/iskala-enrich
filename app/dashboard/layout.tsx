'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  User,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Zap,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserCredits } from '@/lib/database';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import SubscriptionCheck from '@/components/SubscriptionCheck';
import Logo from '@/components/Logo';

type NavigationItem = {
  name: string;
  href: string;
  icon: any;
  action?: string;
};

const baseNavigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Individual Lookup', href: '/dashboard/individual', icon: User },
  { name: 'File Enrichment', href: '/dashboard/file', icon: FileText },
];

const bottomNavigation: NavigationItem[] = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help & Support', href: '/dashboard/help', icon: HelpCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, profile, signOut, loading, error, retryAuth } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [credits, setCredits] = useState({ total: 50, used: 0 });
  const pathname = usePathname();

  // Create dynamic navigation based on user status
  const getNavigation = () => {
    const nav = [...baseNavigation];

    if (profile?.stripe_customer_id) {
      // User has subscription - show subscription management
      nav.push({
        name: 'Subscription',
        href: '#',
        icon: CreditCard,
        action: 'portal',
      });
    } else if (
      profile?.trial_ends_at &&
      new Date(profile.trial_ends_at) > new Date()
    ) {
      // User is on active trial - show upgrade option
      nav.push({ name: 'Upgrade Plan', href: '/pricing', icon: CreditCard });
    } else {
      // User needs subscription or trial - show pricing
      nav.push({ name: 'Get Plan', href: '/pricing', icon: CreditCard });
    }

    return nav;
  };

  const navigation = getNavigation();

  useEffect(() => {
    // Redirect to login if no user and not loading
    if (!loading && !user) {
      console.log('Dashboard: No user found, redirecting to login');
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  // Fetch credits when user is available
  useEffect(() => {
    if (user && !loading) {
      fetchCredits();
    }
  }, [user, loading]);

  // Refresh credits periodically
  useEffect(() => {
    if (!user || loading) return;

    const interval = setInterval(() => {
      fetchCredits();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [user, loading]);

  const fetchCredits = async () => {
    if (!user) return;
    try {
      const { data, error } = await getUserCredits(user.id);
      if (!error && data) {
        setCredits({ total: data.total_credits, used: data.used_credits });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.replace('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const handleCustomerPortal = async () => {
    try {
      if (!profile?.stripe_customer_id) {
        toast.error('No subscription found. Please subscribe to a plan first.');
        return;
      }

      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
          returnUrl: window.location.origin + '/dashboard',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open subscription portal');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">
            {user ? 'Loading your profile...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <div className="space-y-2">
            <button onClick={retryAuth} className="btn-primary w-full">
              Try Again
            </button>
            <button
              onClick={() => router.replace('/auth/login')}
              className="btn-secondary w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if no user (shouldn't happen with proper loading/error handling)
  if (!user) {
    return null;
  }

  return (
    <SubscriptionCheck>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:static lg:inset-0 lg:flex-shrink-0`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Logo variant="icon" size="sm" showText={true} href="/dashboard" />
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
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.first_name
                    ? profile.first_name
                    : user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user.email}
                </div>
                {profile?.company && (
                  <div className="text-xs text-gray-400 truncate">
                    {profile.company}
                  </div>
                )}
              </div>
            </div>

            {/* Credits display */}
            <div className="mt-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className="w-4 h-4 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Credits
                  </span>
                </div>
                <span className="text-lg font-bold text-primary-600">
                  {credits.total - credits.used}
                </span>
              </div>
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (credits.used / credits.total) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item: NavigationItem) => {
              const isActive = pathname === item.href;

              if (item.action === 'portal') {
                return (
                  <button
                    key={item.name}
                    onClick={handleCustomerPortal}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                  >
                    <item.icon className="mr-3 w-5 h-5 text-gray-400" />
                    {item.name}
                  </button>
                );
              }

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
                  <item.icon
                    className={`mr-3 w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {bottomNavigation.map((item: NavigationItem) => {
              const isActive = pathname === item.href;
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
                  <item.icon
                    className={`mr-3 w-5 h-5 ${
                      isActive ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
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
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SubscriptionCheck>
  );
}
