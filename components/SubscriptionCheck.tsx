'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface SubscriptionCheckProps {
  children: React.ReactNode;
}

export default function SubscriptionCheck({
  children,
}: SubscriptionCheckProps) {
  console.log('SubscriptionCheck: COMPONENT RENDERED');

  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [hasValidSubscription, setHasValidSubscription] = useState(false);

  // Check subscription and trial status
  useEffect(() => {
    console.log('SubscriptionCheck: Checking access - User:', user?.id);
    console.log('SubscriptionCheck: Checking access - Profile:', profile);

    // Only redirect after full validation in the main useEffect
    // This allows trial users who don't have current_period_end but have trial_ends_at
  }, [user, profile]);

  console.log('SubscriptionCheck: Render state:', {
    user: !!user,
    profile: !!profile,
    loading,
    pathname,
    profileData: profile,
  });

  // Pages that don't require subscription check
  const excludedPages = ['/dashboard/settings', '/dashboard/help', '/pricing'];
  const isExcludedPage = excludedPages.includes(pathname);

  // Clear redirect flag if user is on pricing page (they can access it)
  useEffect(() => {
    if (pathname === '/pricing') {
      sessionStorage.removeItem('subscription_redirect');
    }
  }, [pathname]);

  // Redirect users with valid subscriptions away from pricing page
  useEffect(() => {
    if (pathname === '/pricing' && user && profile && !loading) {
      const now = new Date();
      const currentPeriodEnd = profile.current_period_end
        ? new Date(profile.current_period_end * 1000) // Convert from Unix timestamp
        : null;

      const hasValidSubscription = currentPeriodEnd && currentPeriodEnd > now;

      if (hasValidSubscription) {
        console.log(
          'Subscription check: User has valid subscription, redirecting from pricing to dashboard'
        );
        router.replace('/dashboard');
      }
    }
  }, [pathname, user, profile, loading, router]);

  useEffect(() => {
    console.log('SubscriptionCheck: useEffect STARTED');
    if (loading) return;

    if (!user) {
      setIsChecking(false);
      return;
    }

    // Skip subscription check for excluded pages
    if (isExcludedPage) {
      setHasValidSubscription(true);
      setIsChecking(false);
      return;
    }

    // Wait for profile to be loaded before checking subscription
    if (!profile) {
      console.log('Subscription check: Waiting for profile to load...');
      return;
    }

    // Check subscription status
    const checkSubscription = () => {
      console.log(
        'Subscription check: FUNCTION CALLED - Profile data:',
        profile
      );

      if (!profile) {
        console.log(
          'Subscription check: No profile found, redirecting to pricing'
        );
        setHasValidSubscription(false);
        setIsChecking(false);
        return;
      }

      const now = new Date();
      const currentPeriodEnd = profile.current_period_end
        ? new Date(profile.current_period_end * 1000) // Convert from Unix timestamp
        : null;
      const trialEndsAt = profile.trial_ends_at
        ? new Date(profile.trial_ends_at)
        : null;

      console.log('Subscription check: Current time:', now);
      console.log('Subscription check: Current period end:', currentPeriodEnd);
      console.log('Subscription check: Trial ends at:', trialEndsAt);
      console.log(
        'Subscription check: Has current_period_end:',
        !!profile.current_period_end
      );
      console.log(
        'Subscription check: Has trial_ends_at:',
        !!profile.trial_ends_at
      );

      // Check if user has a valid subscription OR active trial
      const hasValidPeriodEnd = currentPeriodEnd && currentPeriodEnd > now;
      const hasActiveTrial = trialEndsAt && trialEndsAt > now;
      const isValid = hasValidPeriodEnd || hasActiveTrial;

      console.log(
        'Subscription check: Has valid period end:',
        hasValidPeriodEnd
      );
      console.log('Subscription check: Has active trial:', hasActiveTrial);
      console.log(
        'Subscription check: Is valid subscription or trial:',
        isValid
      );

      if (!isValid) {
        console.log('Subscription check: User has NO valid subscription');

        // Check if we've already redirected to prevent infinite loops
        const hasRedirected = sessionStorage.getItem('subscription_redirect');
        console.log('Subscription check: Has redirected flag:', hasRedirected);

        if (hasRedirected) {
          console.log(
            'Subscription check: Already redirected, allowing access'
          );
          setHasValidSubscription(true);
          setIsChecking(false);
          return;
        }

        console.log(
          'Subscription check: Setting redirect flag and redirecting to pricing'
        );
        sessionStorage.setItem('subscription_redirect', 'true');
        toast.error('Please subscribe to continue using the service');
        console.log('Subscription check: About to redirect to /pricing');
        window.location.href = '/pricing';
        return;
      }

      console.log('Subscription check: User has valid subscription');
      // Clear redirect flag if user has valid subscription
      sessionStorage.removeItem('subscription_redirect');
      setHasValidSubscription(true);
      setIsChecking(false);
    };

    console.log(
      'Subscription check: useEffect triggered, calling checkSubscription'
    );
    checkSubscription();
  }, [user, profile, loading, router, isExcludedPage, pathname]);

  // Show loading while checking subscription
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking subscription...</p>
        </div>
      </div>
    );
  }

  // If user has valid subscription, render children
  if (hasValidSubscription) {
    return <>{children}</>;
  }

  // If no valid subscription, show loading (will redirect to pricing)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to pricing...</p>
      </div>
    </div>
  );
}
