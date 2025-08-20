'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Home,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Bug,
  Shield,
} from 'lucide-react';
import Logo from '@/components/Logo';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  const getErrorType = (error: Error) => {
    if (error.message.includes('fetch')) return 'network';
    if (error.message.includes('database')) return 'database';
    if (error.message.includes('auth')) return 'authentication';
    return 'general';
  };

  const errorType = getErrorType(error);

  const getErrorContent = (type: string) => {
    switch (type) {
      case 'network':
        return {
          title: 'Connection Error',
          description:
            "We're having trouble connecting to our servers. Please check your internet connection and try again.",
          icon: <RefreshCw className="w-12 h-12 text-red-500" />,
        };
      case 'database':
        return {
          title: 'Database Error',
          description:
            "We're experiencing issues with our database. Our team has been notified and is working to fix this.",
          icon: <Bug className="w-12 h-12 text-red-500" />,
        };
      case 'authentication':
        return {
          title: 'Authentication Error',
          description:
            'There was an issue with your login session. Please sign in again to continue.',
          icon: <Shield className="w-12 h-12 text-red-500" />,
        };
      default:
        return {
          title: 'Something Went Wrong',
          description:
            'An unexpected error occurred. Our team has been notified and is working to fix this issue.',
          icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
        };
    }
  };

  const errorContent = getErrorContent(errorType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Logo variant="icon" size="lg" showText={true} href="/" />
        </div>

        {/* Error Icon */}
        <div className="mb-8">
          <div className="flex justify-center mb-4">{errorContent.icon}</div>
          <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {errorContent.title}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {errorContent.description}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Error Details:
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <button
            onClick={reset}
            className="w-full btn-primary text-lg py-3 px-8 flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center btn-secondary text-lg py-3 px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <Home className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Dashboard
            </span>
          </Link>

          <Link
            href="/auth/login"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <Shield className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Sign In
            </span>
          </Link>

          <Link
            href="/dashboard/help"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <AlertTriangle className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Get Help
            </span>
          </Link>
        </div>

        {/* Help Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Still Having Issues?
          </h3>
          <p className="text-gray-600 mb-4">
            If the problem persists, try these troubleshooting steps:
          </p>
          <div className="space-y-2 text-sm text-left">
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span className="text-gray-700">
                Refresh the page and try again
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span className="text-gray-700">
                Clear your browser cache and cookies
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span className="text-gray-700">
                Try using a different browser
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              <span className="text-gray-700">Contact our support team</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Error ID: {error.digest || 'unknown'} •{' '}
            <Link
              href="/dashboard/help"
              className="text-primary-600 hover:text-primary-700"
            >
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
