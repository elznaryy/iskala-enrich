import Link from 'next/link';
import { Home, ArrowLeft, Search, FileText, User } from 'lucide-react';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Logo variant="icon" size="lg" showText={true} href="/" />
        </div>

        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Sorry, we couldn't find the page you're looking for. It might have
            been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <Home className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Home
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <User className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Dashboard
            </span>
          </Link>

          <Link
            href="/pricing"
            className="flex items-center justify-center p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 group"
          >
            <FileText className="w-5 h-5 text-gray-600 group-hover:text-primary-600 mr-2" />
            <span className="font-medium text-gray-700 group-hover:text-primary-600">
              Pricing
            </span>
          </Link>
        </div>

        {/* Main CTA */}
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center btn-primary text-lg py-3 px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>

          <p className="text-sm text-gray-500">
            Or{' '}
            <Link
              href="/auth/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 mb-4">
            If you're looking for something specific, try these common pages:
          </p>
          <div className="space-y-2 text-sm">
            <Link
              href="/auth/login"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Create Account
            </Link>
            <Link
              href="/dashboard/individual"
              className="block text-primary-600 hover:text-primary-700"
            >
              → Individual Lookup
            </Link>
            <Link
              href="/dashboard/file"
              className="block text-primary-600 hover:text-primary-700"
            >
              → File Enrichment
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            If you believe this is an error, please{' '}
            <Link
              href="/dashboard/help"
              className="text-primary-600 hover:text-primary-700"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
