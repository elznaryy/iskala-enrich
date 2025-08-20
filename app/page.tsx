'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  User,
  FileText,
  ArrowRight,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Star,
  ChevronRight,
  Mail,
  Phone,
  Users,
  BarChart3,
  Database,
  Lock,
  Globe,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import Logo from '@/components/Logo';
import SubscriptionPlans from '@/components/SubscriptionPlans';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo variant="full" size="md" />

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Product
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <Link href="/dashboard" className="btn-primary">
                      Go to Dashboard →
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        Login
                      </Link>
                      <Link href="/auth/signup" className="btn-primary">
                        Sign up now →
                      </Link>
                    </>
                  )}
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <nav className="space-y-2">
                  <a
                    href="#features"
                    className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Product
                  </a>
                  <a
                    href="#pricing"
                    className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Pricing
                  </a>
                </nav>

                {!loading && (
                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    {user ? (
                      <Link
                        href="/dashboard"
                        className="block w-full text-center btn-primary"
                      >
                        Go to Dashboard →
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="block py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          Login
                        </Link>
                        <Link
                          href="/auth/signup"
                          className="block w-full text-center btn-primary"
                        >
                          Sign up now →
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-ocean-50 via-white to-deep-50">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ocean-100 to-deep-100 rounded-full mb-6">
            <span className="text-deep-700 font-semibold text-sm">
              🚀 Trusted by 1,000+ Companies Worldwide
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Better B2B Data
            <br />
            <span className="bg-gradient-to-r from-deep-600 via-ocean-600 to-accent-600 bg-clip-text text-transparent">
              Coverage in the MENA Region
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            Access 20+ data providers from one platform to get email and mobile
            phone number enrichments
          </p>

          <div className="flex justify-center mb-8">
            {!loading && (
              <>
                {user ? (
                  <Link
                    href="/dashboard"
                    className="btn-primary flex items-center justify-center text-lg py-4 px-12"
                  >
                    <span className="text-2xl mr-3">🚀</span>
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/auth/signup"
                    className="btn-primary flex items-center justify-center text-lg py-4 px-12"
                  >
                    <span className="text-2xl mr-3">🚀</span>
                    Sign up now
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why iSkala Enrich
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The only data enrichment platform that guarantees quality while
              maximizing coverage
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Waterfall Enrichment
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sourcing from 20+ providers in sequence means you get better
                coverage and verified data every time.
              </p>
            </div>

            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Arabic Localization
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Auto-arabizes names and detects profile language to personalize
                outreach for MENA audiences.
              </p>
            </div>

            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-deep-500 to-ocean-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-shadow">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Mobile Contacts
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reach prospects directly with verified mobile numbers included
                in every plan.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-deep-600 mb-2">
                  +90%
                </div>
                <div className="text-gray-600">
                  Market coverage across MENA companies
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-ocean-600 mb-2">
                  20+
                </div>
                <div className="text-gray-600">
                  Data sources in our enrichment waterfall
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-600 mb-2">
                  2X
                </div>
                <div className="text-gray-600">
                  Higher reply rates with Arabic fields
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ocean-100 to-deep-100 rounded-full mb-8">
            <span className="text-deep-700 font-semibold text-sm">
              ⭐ What Our Customers Say
            </span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-16">
            Trusted by 1,000+ Sales Professionals Worldwide
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Primary testimonial */}
            <div className="md:col-span-2 bg-gradient-to-r from-ocean-50 to-deep-50 rounded-3xl p-10 border shadow-lg">
              <div className="flex items-center justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <blockquote className="text-2xl text-gray-700 mb-8 italic leading-relaxed">
                "iSkala Enrich transformed our outreach. We now reach 31% more
                prospects through cold calling and the response rates are
                incredible because these leads aren't oversaturated with
                outreach."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-ocean-200 to-deep-200 rounded-full mr-4 flex items-center justify-center">
                  <span className="text-deep-700 font-bold text-xl">ME</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-lg">
                    Michael Ewald
                  </div>
                  <div className="text-gray-600">Founder & CEO, Vangates</div>
                </div>
              </div>
            </div>

            {/* Secondary testimonial */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <blockquote className="text-lg text-gray-700 mb-6 italic">
                "The data quality is unmatched. We've eliminated bounce backs
                and our email deliverability improved by 40%."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-200 to-blue-200 rounded-full mr-3 flex items-center justify-center">
                  <span className="text-green-700 font-bold">SJ</span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Sarah Johnson
                  </div>
                  <div className="text-gray-600 text-sm">
                    VP Sales, TechFlow
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-12 text-gray-500">
            <div className="text-center">
              <div className="text-3xl font-bold text-deep-600">150K+</div>
              <div className="text-sm">Daily Enrichments</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-ocean-600">1,000+</div>
              <div className="text-sm">Active Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent-600">20+</div>
              <div className="text-sm">Data Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">99.5%</div>
              <div className="text-sm">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        id="features"
        className="py-24 bg-gradient-to-br from-ocean-50 via-white to-deep-50 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-100/20 to-deep-100/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-ocean-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-deep-200/30 to-transparent rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-ocean-100 to-deep-100 rounded-full mb-6">
              <span className="text-deep-700 font-semibold text-sm">
                ✨ How it Works
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              How To Maximize Contact Data
              <br />
              <span className="bg-gradient-to-r from-deep-600 via-ocean-600 to-accent-600 bg-clip-text text-transparent">
                Coverage & Quality
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Without Paying For Invalid Data
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            {[
              {
                step: '01',
                stepTitle: 'CONTACT IMPORT',
                title: 'Import leads individually or bulk via CSV/Excel',
                description:
                  'You can run a single request, just add first name, company name, Linkedin URL and iSkala will get the contact in a few minutes.',
                icon: <Database className="w-8 h-8 text-white" />,
                color: 'from-blue-500 to-blue-600',
                bgColor: 'from-blue-50 to-blue-100',
                borderColor: 'border-blue-200',
                features: [
                  'CSV/Excel Upload',
                  'Individual Requests',
                  'Quick Processing',
                  'Simple Workflow',
                ],
              },
              {
                step: '02',
                stepTitle: 'DATA SOURCES',
                title: 'Let iSkala find the right data source',
                description:
                  'Every data provider has its own strength. Our flow gives the best coverage in the MENA region based on our unique market-specific sequence.',
                icon: <Zap className="w-8 h-8 text-white" />,
                color: 'from-accent-500 to-accent-600',
                bgColor: 'from-accent-50 to-accent-100',
                borderColor: 'border-accent-200',
                features: [
                  'Smart Algorithm',
                  'Provider Analysis',
                  'Optimal Sequencing',
                  'AI-Powered Matching',
                ],
              },
              {
                step: '03',
                stepTitle: 'WATERFALL ENRICHMENT',
                title: 'Get data from over 20+ data providers',
                description:
                  'We source data to get the best match, so if we didn’t find the data you requested we will move to the other till we get the contact you requested.',
                icon: <BarChart3 className="w-8 h-8 text-white" />,
                color: 'from-green-500 to-green-600',
                bgColor: 'from-green-50 to-green-100',
                borderColor: 'border-green-200',
                features: [
                  'Waterfall Integrations',
                  'Sequential Search',
                  'Best Match Logic',
                  'Complete Coverage',
                ],
              },
              {
                step: '04',
                stepTitle: 'VERIFICATION',
                title: '2 Verification layers, you only pay for valid contacts',
                description:
                  'The contacts you get are getting double verified so you only pay for real contacts, less bounce and less wrong numbers.',
                icon: <Shield className="w-8 h-8 text-white" />,
                color: 'from-red-500 to-red-600',
                bgColor: 'from-red-50 to-red-100',
                borderColor: 'border-red-200',
                features: [
                  'Double Verification',
                  'Pay for Valid Only',
                  'Reduced Bounces',
                  'Quality Guarantee',
                ],
              },
            ].map((item, index) => (
              <div key={index} className="mb-16 last:mb-0">
                <div
                  className={`bg-gradient-to-br ${item.bgColor} rounded-3xl border ${item.borderColor} p-8 md:p-12 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
                >
                  <div className="grid lg:grid-cols-3 gap-8 items-center">
                    {/* Left side - Step number and icon */}
                    <div className="text-center lg:text-left">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg mb-6">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg`}
                        >
                          {item.icon}
                        </div>
                      </div>
                      <div className="text-6xl font-bold text-gray-300 mb-2">
                        {item.step}
                      </div>
                      <div className="text-sm font-semibold text-deep-600 uppercase tracking-wider">
                        {item.stepTitle}
                      </div>
                    </div>

                    {/* Center - Content */}
                    <div className="lg:col-span-2">
                      <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Features grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {item.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center space-x-2"
                          >
                            <div
                              className={`w-2 h-2 bg-gradient-to-r ${item.color} rounded-full flex-shrink-0`}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-deep-600 to-ocean-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <span className="text-2xl mr-3">🚀</span>
              <span className="text-lg font-semibold">
                Ready to get started?
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free, scale as you grow
            </p>
          </div>

          <SubscriptionPlans 
            showPopular={true}
            redirectToSignup={true}
            onPlanSelect={(planId) => {
              // Handle plan selection if needed
              console.log('Plan selected:', planId);
            }}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-deep-600 to-ocean-600 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-deep-800/20 to-ocean-800/20"></div>
        <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Start Enriching Your B2B Data
              <span className="block text-yellow-300">
                In The Next 10 Minutes
              </span>
            </h2>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join 1,000+ sales teams already using iSkala Enrich to unlock
              hidden revenue opportunities. Start enriching your leads
              instantly.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-10 text-white">
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="text-lg">Instant setup & access</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <span className="text-lg">GDPR & CCPA compliant</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              {!loading && (
                <>
                  {user ? (
                    <Link
                      href="/dashboard"
                      className="bg-white text-deep-600 hover:bg-gray-100 font-bold py-5 px-12 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center text-xl shadow-lg"
                    >
                      <span className="text-3xl mr-4">🚀</span>
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/auth/signup"
                      className="bg-white text-deep-600 hover:bg-gray-100 font-bold py-5 px-12 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center text-xl shadow-lg"
                    >
                      <span className="text-3xl mr-4">🚀</span>
                      Sign up now
                    </Link>
                  )}
                </>
              )}

              <Link
                href="#features"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-deep-600 font-semibold py-5 px-12 rounded-2xl transition-all duration-300 flex items-center justify-center text-lg"
              >
                <span className="mr-3">▶️</span>
                Watch Demo
              </Link>
            </div>

            <p className="text-white/80 mt-8 text-lg">
              ⚡ Setup takes less than 2 minutes • 🔒 Bank-level security • 📊
              Real-time results
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Logo variant="full" size="sm" white={true} className="mb-6" />
              <p className="text-gray-400 mb-4">
                iSkala Enrich aggregates 20+ data sources to find and verify any
                mobile phone number and email address.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Referral Program
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    DPA & CCPA
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 iSkala Enrich. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
